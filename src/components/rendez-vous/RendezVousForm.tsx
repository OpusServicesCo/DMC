
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PatientSelect } from "./form/PatientSelect";
import { DateTimeInput } from "./form/DateTimeInput";
import { MotifInput } from "./form/MotifInput";
import { ConsultationFields } from "./form/ConsultationFields";

interface RendezVousFormProps {
  patients: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type VisiteType = 'rendez_vous' | 'consultation';
type StatutRendezVous = 'en_attente' | 'effectué' | 'annulé';

export const RendezVousForm = ({ patients, open, onOpenChange, onSuccess }: RendezVousFormProps) => {
  const { toast } = useToast();
  const [newRdv, setNewRdv] = useState({
    patient_id: "",
    date: "",
    motif: "",
    observations: "",
    diagnostic: "",
    type_visite: "rendez_vous" as VisiteType,
    montant: 0,
  });

  const validateRdv = () => {
    if (!newRdv.patient_id) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un patient",
        variant: "destructive",
      });
      return false;
    }

    if (!newRdv.date) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date",
        variant: "destructive",
      });
      return false;
    }

    if (!newRdv.motif.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un motif",
        variant: "destructive",
      });
      return false;
    }

    const selectedDate = new Date(newRdv.date);
    const now = new Date();

    if (selectedDate < now) {
      toast({
        title: "Erreur",
        description: "Impossible de prendre un rendez-vous dans le passé",
        variant: "destructive",
      });
      return false;
    }

    if (newRdv.type_visite === "consultation" && (!newRdv.montant || newRdv.montant <= 0)) {
      toast({
        title: "Erreur",
        description: "Le montant de la consultation doit être supérieur à 0 FCFA",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRdv()) {
      return;
    }

    try {
      const consultationData: {
        patient_id: string;
        date: string;
        motif: string;
        type_visite: VisiteType;
        montant: number;
        statut_rendez_vous?: StatutRendezVous;
        observations?: string;
        diagnostic?: string;
      } = {
        patient_id: newRdv.patient_id,
        date: newRdv.date,
        motif: newRdv.motif,
        type_visite: newRdv.type_visite,
        montant: newRdv.type_visite === "consultation" ? newRdv.montant : 0,
      };

      if (newRdv.type_visite === "rendez_vous") {
        consultationData.statut_rendez_vous = "en_attente";
      }

      if (newRdv.type_visite === "consultation") {
        consultationData.observations = newRdv.observations;
        consultationData.diagnostic = newRdv.diagnostic;
      }

      const { error } = await supabase
        .from("consultations")
        .insert(consultationData);

      if (error) {
        throw error;
      }

      toast({
        title: "Succès",
        description: newRdv.type_visite === "rendez_vous" 
          ? "Le rendez-vous a été planifié avec succès"
          : "La consultation a été enregistrée avec succès",
      });

      // Configurer le rappel 5 minutes avant le rendez-vous
      if (newRdv.type_visite === "rendez_vous") {
        const rdvTime = new Date(newRdv.date).getTime();
        const reminderTime = rdvTime - (5 * 60 * 1000); // 5 minutes avant
        const now = new Date().getTime();
        const timeUntilReminder = reminderTime - now;

        if (timeUntilReminder > 0) {
          setTimeout(() => {
            toast({
              title: "Rappel de rendez-vous",
              description: `Votre rendez-vous commence dans 5 minutes !`,
            });
          }, timeUntilReminder);
        }
      }

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-medical-700 mb-4">
            {newRdv.type_visite === "rendez_vous" ? "Nouveau rendez-vous" : "Nouvelle consultation"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PatientSelect
            patients={patients}
            value={newRdv.patient_id}
            onChange={(value) => setNewRdv({ ...newRdv, patient_id: value })}
          />
          <DateTimeInput
            value={newRdv.date}
            onChange={(value) => setNewRdv({ ...newRdv, date: value })}
          />
          <MotifInput
            value={newRdv.motif}
            onChange={(value) => setNewRdv({ ...newRdv, motif: value })}
          />
          {newRdv.type_visite === "consultation" && (
            <ConsultationFields
              montant={newRdv.montant}
              observations={newRdv.observations}
              diagnostic={newRdv.diagnostic}
              onMontantChange={(value) => setNewRdv({ ...newRdv, montant: value })}
              onObservationsChange={(value) => setNewRdv({ ...newRdv, observations: value })}
              onDiagnosticChange={(value) => setNewRdv({ ...newRdv, diagnostic: value })}
            />
          )}
          <Button type="submit" className="w-full bg-medical-600 hover:bg-medical-700 text-white">
            {newRdv.type_visite === "rendez_vous" ? "Planifier le rendez-vous" : "Enregistrer la consultation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

