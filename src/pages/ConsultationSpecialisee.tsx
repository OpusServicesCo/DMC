
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AccueilPatient } from "@/components/consultation/AccueilPatient";
import { PatientForm } from "@/components/patients/PatientForm";
import { ConsultationSpecialisee } from "@/components/consultation/ConsultationSpecialisee";
import { ConsultationTypeSelector } from "@/components/consultation/ConsultationTypeSelector";
import { Patient } from "@/types/models";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, User } from "lucide-react";

type EtapeWorkflow = 'accueil' | 'nouveau_patient' | 'selection_type' | 'consultation' | 'termine';

export default function ConsultationSpecialiseePage() {
  const [etapeActuelle, setEtapeActuelle] = useState<EtapeWorkflow>('accueil');
  const [patientSelectionne, setPatientSelectionne] = useState<Patient | null>(null);
  const [typeConsultation, setTypeConsultation] = useState<string>('');
  const [donneesConsultation, setDonneesConsultation] = useState<any>(null);
  const { toast } = useToast();

  const handlePatientSelected = (patient: Patient) => {
    setPatientSelectionne(patient);
    setEtapeActuelle('selection_type');
  };

  const handleNouveauPatient = () => {
    setEtapeActuelle('nouveau_patient');
  };

  const handlePatientCree = () => {
    setEtapeActuelle('accueil');
    toast({
      title: "Patient créé",
      description: "Le nouveau patient a été créé avec succès",
    });
  };

  const handleTypeConsultationSelected = (type: string) => {
    setTypeConsultation(type);
    setEtapeActuelle('consultation');
  };

  const handleConsultationTerminee = (data: any) => {
    setDonneesConsultation(data);
    terminerConsultation(data);
  };

  const getTarif = (type: string): number => {
    switch (type) {
      case 'consultation_initiale': return 15000;
      case 'bilan_nutritionnel': return 20000;
      case 'suivi_nutritionnel': return 10000;
      case 'dietetique_pathologie': return 30000;
      case 'trouble_comportement_alimentaire': return 30000;
      default: return 15000;
    }
  };

  const terminerConsultation = async (data: any) => {
    try {
      const tarifBase = getTarif(typeConsultation);
      
      // Enregistrer la consultation avec le statut "effectué"
      const consultationData = {
        patient_id: data.patient_id,
        date: data.date,
        motif: getMotifFromType(typeConsultation),
        montant: tarifBase,
        statut_rendez_vous: 'effectué' as const,
        type_visite: 'consultation',
        type_consultation_nutritionnelle: typeConsultation as "consultation_initiale" | "bilan_nutritionnel" | "suivi_nutritionnel" | "dietetique_pathologie" | "trouble_comportement_alimentaire",
        diagnostic: JSON.stringify(data.diagnostic),
        observations: JSON.stringify({
          constantes: data.constantes,
          plan_nutritionnel: data.plan_nutritionnel
        }),
        objectif_consultation: data.objectif_consultation || '',
        pathologie_ciblee: data.pathologie_ciblee || ''
      };

      const { data: consultation, error: consultationError } = await supabase
        .from('consultations')
        .insert([consultationData])
        .select()
        .single();

      if (consultationError) throw consultationError;

      // Enregistrer les mesures dans l'historique
      if (data.constantes) {
        const { error: mesuresError } = await supabase
          .from('historique_mesures')
          .insert([{
            patient_id: data.patient_id,
            consultation_id: consultation.id,
            poids: data.constantes.poids,
            taille: data.constantes.taille,
            imc: data.constantes.imc,
            tension_systolique: data.constantes.tension_systolique,
            tension_diastolique: data.constantes.tension_diastolique,
            glycemie: data.constantes.glycemie,
            cholesterol_total: data.constantes.cholesterol
          }]);

        if (mesuresError) throw mesuresError;
      }

      // Créer automatiquement la facture
      const { data: facture, error: factureError } = await supabase
        .from('factures')
        .insert([{
          consultation_id: consultation.id,
          date_emission: new Date().toISOString(),
          montant_total: tarifBase,
          statut: 'impayée'
        }])
        .select()
        .single();

      if (factureError) throw factureError;

      // Créer une notification pour la secrétaire
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          message: `Nouvelle consultation à payer - ${patientSelectionne?.nom} ${patientSelectionne?.prenom} - ${getMotifFromType(typeConsultation)} - ${tarifBase.toLocaleString()} FCFA`,
          type: 'paiement_en_attente',
          date: new Date().toISOString()
        }]);

      if (notificationError) throw notificationError;

      toast({
        title: "✅ Consultation terminée",
        description: "La consultation a été enregistrée et la secrétaire notifiée",
      });

      setEtapeActuelle('termine');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement: " + error.message,
        variant: "destructive",
      });
    }
  };

  const getMotifFromType = (type: string) => {
    switch (type) {
      case 'consultation_initiale':
        return 'Consultation initiale - Évaluation complète';
      case 'bilan_nutritionnel':
        return 'Bilan nutritionnel - Analyse approfondie';
      case 'suivi_nutritionnel':
        return 'Suivi nutritionnel - Contrôle évolution';
      case 'dietetique_pathologie':
        return 'Diététique pathologique - Nutrition médicale';
      case 'trouble_comportement_alimentaire':
        return 'Troubles alimentaires - Prise en charge spécialisée';
      default:
        return 'Consultation nutritionnelle';
    }
  };

  const retourAccueil = () => {
    setEtapeActuelle('accueil');
    setPatientSelectionne(null);
    setTypeConsultation('');
    setDonneesConsultation(null);
  };

  const retourSelectionType = () => {
    setEtapeActuelle('selection_type');
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        {etapeActuelle === 'accueil' && (
          <AccueilPatient
            onPatientSelected={handlePatientSelected}
            onNouveauPatient={handleNouveauPatient}
          />
        )}

        {etapeActuelle === 'nouveau_patient' && (
          <PatientForm
            onClose={handlePatientCree}
          />
        )}

        {etapeActuelle === 'selection_type' && (
          <ConsultationTypeSelector
            onTypeSelected={handleTypeConsultationSelected}
            onBack={retourAccueil}
          />
        )}

        {etapeActuelle === 'consultation' && patientSelectionne && (
          <ConsultationSpecialisee
            patient={patientSelectionne}
            consultationType={typeConsultation}
            onNext={handleConsultationTerminee}
            onBack={retourSelectionType}
          />
        )}

        {etapeActuelle === 'termine' && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-green-100 rounded-full">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-green-800 mb-4">
                  ✅ Consultation Terminée et Enregistrée
                </h2>
                
                <div className="bg-white p-6 rounded-lg border mb-6">
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Patient</p>
                        <p className="font-medium">{patientSelectionne?.nom} {patientSelectionne?.prenom}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Type</p>
                        <p className="font-medium">{getMotifFromType(typeConsultation)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Montant:</span>
                      <span className="text-xl font-bold text-green-600">
                        {getTarif(typeConsultation).toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                  <p className="text-blue-800 text-sm">
                    💡 La secrétaire a été automatiquement notifiée pour traiter le paiement de cette consultation.
                  </p>
                </div>
                
                <Button
                  onClick={retourAccueil}
                  className="w-full bg-medical-600 text-white hover:bg-medical-700"
                  size="lg"
                >
                  Nouvelle Consultation
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
