
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AssuranceFormProps {
  open: boolean;
  onClose: () => void;
  patientId: string | null;
  onSuccess: () => void;
}

interface Patient {
  id: string;
  nom: string;
  prenom: string;
}

export function AssuranceForm({
  open,
  onClose,
  patientId,
  onSuccess,
}: AssuranceFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nom_assurance: "",
    numero_assure: "",
    type_assurance: "",
    patient_id: "",
  });
  
  const [currentAssurance, setCurrentAssurance] = useState<any>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("patients")
          .select("id, nom, prenom")
          .order("nom");
          
        if (error) throw error;
        setPatients(data || []);
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les patients: " + error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchPatients();
      
      // Si un ID de patient est spécifié, remplir le formulaire avec ses données
      if (patientId) {
        fetchAssurance(patientId);
      } else {
        resetForm();
      }
    }
  }, [open, patientId]);

  const fetchAssurance = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("assurances")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setCurrentAssurance(data);
        setFormData({
          nom_assurance: data.nom_assurance || "",
          numero_assure: data.numero_assure || "",
          type_assurance: data.type_assurance || "",
          patient_id: data.patient_id || "",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger l'assurance: " + error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nom_assurance: "",
      numero_assure: "",
      type_assurance: "",
      patient_id: "",
    });
    setCurrentAssurance(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Valider que les champs obligatoires sont remplis
      if (!formData.nom_assurance || !formData.patient_id) {
        throw new Error("Veuillez remplir tous les champs obligatoires");
      }

      let response;
      
      if (currentAssurance) {
        // Mise à jour d'une assurance existante
        response = await supabase
          .from("assurances")
          .update({
            nom_assurance: formData.nom_assurance,
            numero_assure: formData.numero_assure || null,
            type_assurance: formData.type_assurance || null,
            patient_id: formData.patient_id,
          })
          .eq("id", currentAssurance.id);
      } else {
        // Création d'une nouvelle assurance
        response = await supabase
          .from("assurances")
          .insert([
            {
              nom_assurance: formData.nom_assurance,
              numero_assure: formData.numero_assure || null,
              type_assurance: formData.type_assurance || null,
              patient_id: formData.patient_id,
            },
          ]);
      }

      if (response.error) throw response.error;
      
      onSuccess();
      resetForm();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {currentAssurance ? "Modifier l'assurance" : "Nouvelle assurance"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient_id">Patient <span className="text-red-500">*</span></Label>
              <Select
                name="patient_id"
                value={formData.patient_id}
                onValueChange={(value) => handleSelectChange("patient_id", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.nom} {patient.prenom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nom_assurance">Nom de l'assurance <span className="text-red-500">*</span></Label>
              <Input
                id="nom_assurance"
                name="nom_assurance"
                value={formData.nom_assurance}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_assure">Numéro assuré</Label>
              <Input
                id="numero_assure"
                name="numero_assure"
                value={formData.numero_assure}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type_assurance">Type d'assurance</Label>
              <Select
                name="type_assurance"
                value={formData.type_assurance}
                onValueChange={(value) => handleSelectChange("type_assurance", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Assurance Maladie">Assurance Maladie</SelectItem>
                  <SelectItem value="Mutuelle">Mutuelle</SelectItem>
                  <SelectItem value="Complémentaire Santé">Complémentaire Santé</SelectItem>
                  <SelectItem value="Assurance Hospitalisation">Assurance Hospitalisation</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : currentAssurance ? "Mettre à jour" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
