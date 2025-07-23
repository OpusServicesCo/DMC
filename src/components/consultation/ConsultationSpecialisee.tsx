
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, Heart, Stethoscope, Bot, User, Info } from "lucide-react";
import { Patient } from "@/types/models";
import { ConstantesVitales } from "@/types/consultation";
import { SimpleVoiceInterface } from "./SimpleVoiceInterface";
import { FastWorkingAI } from "./FastWorkingAI";
import { useToast } from "@/hooks/use-toast";

// Import des formulaires spécialisés
import { ConsultationInitialeForm } from "./forms/ConsultationInitialeForm";
import { BilanNutritionnelForm } from "./forms/BilanNutritionnelForm";
import { SuiviNutritionnelForm } from "./forms/SuiviNutritionnelForm";
import { DietetiquePathologiqueForm } from "./forms/DietetiquePathologiqueForm";
import { TroublesAlimentairesForm } from "./forms/TroublesAlimentairesForm";

interface ConsultationSpecialiseeProps {
  patient: Patient;
  consultationType: string;
  onNext: (data: any) => void;
  onBack: () => void;
}

export function ConsultationSpecialisee({ patient, consultationType, onNext, onBack }: ConsultationSpecialiseeProps) {
  const [constantes, setConstantes] = useState<ConstantesVitales>({
    poids: patient.poids || 0,
    taille: patient.taille || 0,
    imc: 0,
    tension_systolique: 0,
    tension_diastolique: 0,
    glycemie: 0,
    glycemie_type: 'a_jeun',
    cholesterol: 0,
  });

  const [donneesSpecifiques, setDonneesSpecifiques] = useState<any>({});
  const [aiExtractedData, setAiExtractedData] = useState<any>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const { toast } = useToast();

  // Calculer l'IMC automatiquement
  useEffect(() => {
    if (constantes.poids > 0 && constantes.taille > 0) {
      const taille_m = constantes.taille / 100;
      const imc = constantes.poids / Math.pow(taille_m, 2);
      setConstantes(prev => ({ ...prev, imc: Number(imc.toFixed(1)) }));
    }
  }, [constantes.poids, constantes.taille]);

  function getConsultationTypeLabel(type: string): string {
    switch (type) {
      case 'consultation_initiale': return 'Consultation Initiale';
      case 'bilan_nutritionnel': return 'Bilan Nutritionnel Approfondi';
      case 'suivi_nutritionnel': return 'Suivi Nutritionnel';
      case 'dietetique_pathologie': return 'Diététique Pathologique';
      case 'trouble_comportement_alimentaire': return 'Troubles Alimentaires';
      default: return 'Consultation Nutritionnelle';
    }
  }

  function getTarif(type: string): number {
    switch (type) {
      case 'consultation_initiale': return 15000;
      case 'bilan_nutritionnel': return 20000;
      case 'suivi_nutritionnel': return 10000;
      case 'dietetique_pathologie': return 30000;
      case 'trouble_comportement_alimentaire': return 30000;
      default: return 15000;
    }
  }

  function getAIPromptForType(type: string): string {
    switch (type) {
      case 'consultation_initiale':
        return "Je suis en consultation initiale. Aidez-moi avec le diagnostic nutritionnel de base, l'évaluation de l'IMC et les objectifs de poids réalistes.";
      case 'bilan_nutritionnel':
        return "Je réalise un bilan nutritionnel approfondi. Analysez les habitudes alimentaires, identifiez les carences et proposez des corrections alimentaires.";
      case 'suivi_nutritionnel':
        return "C'est un suivi nutritionnel. Évaluez l'évolution du patient, analysez les progrès et ajustez le plan nutritionnel.";
      case 'dietetique_pathologie':
        return "Consultation de diététique pathologique. Adaptez la nutrition à la pathologie du patient et vérifiez les interactions avec les traitements.";
      case 'trouble_comportement_alimentaire':
        return "Prise en charge de troubles alimentaires. Identifiez les déclencheurs émotionnels et proposez des stratégies comportementales.";
      default:
        return "Consultation nutritionnelle générale.";
    }
  }

  const handleAIDataExtracted = (aiData: any) => {
    console.log('AI extracted data:', aiData);
    
    // Stocker les données complètes de l'IA
    setAiExtractedData(aiData);
    
    if (aiData.constantes) {
      setConstantes(prev => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(aiData.constantes).filter(([_, value]) => value !== null)
        )
      }));
    }

    // Intégrer toutes les données spécifiques extraites par l'IA
    setDonneesSpecifiques(prev => ({
      ...prev,
      ...aiData,
      // Garder les données spécifiques existantes
      ...(aiData.donnees_specifiques || {})
    }));

    toast({
      title: "IA activée",
      description: "Formulaire rempli automatiquement par l'IA",
    });
  };

  const renderFormulaireSpecifique = () => {
    switch (consultationType) {
      case 'consultation_initiale':
        return <ConsultationInitialeForm onDataChange={setDonneesSpecifiques} patientInfo={patient} initialData={aiExtractedData} />;
      case 'bilan_nutritionnel':
        return <BilanNutritionnelForm onDataChange={setDonneesSpecifiques} initialData={aiExtractedData} />;
      case 'suivi_nutritionnel':
        return <SuiviNutritionnelForm onDataChange={setDonneesSpecifiques} patientInfo={patient} initialData={aiExtractedData} />;
      case 'dietetique_pathologie':
        return <DietetiquePathologiqueForm onDataChange={setDonneesSpecifiques} />;
      case 'trouble_comportement_alimentaire':
        return <TroublesAlimentairesForm onDataChange={setDonneesSpecifiques} />;
      default:
        return <div className="text-center py-8 text-gray-500">Formulaire non disponible</div>;
    }
  };

  const handleSubmit = () => {
    const consultationData = {
      patient_id: patient.id,
      date: new Date().toISOString(),
      constantes,
      donnees_specifiques: donneesSpecifiques,
      type_consultation: consultationType,
      tarif: getTarif(consultationType),
      objectif_consultation: donneesSpecifiques.objectif_nutritionnel || donneesSpecifiques.objectifs_therapeutiques || 'Consultation nutritionnelle spécialisée',
      pathologie_ciblee: donneesSpecifiques.type_pathologie || ''
    };
    onNext(consultationData);
  };

  const getIMCStatus = (imc: number) => {
    if (imc < 18.5) return { label: "Insuffisance pondérale", color: "bg-blue-100 text-blue-800" };
    if (imc < 25) return { label: "Poids normal", color: "bg-green-100 text-green-800" };
    if (imc < 30) return { label: "Surpoids", color: "bg-orange-100 text-orange-800" };
    return { label: "Obésité", color: "bg-red-100 text-red-800" };
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-medical-700 to-medical-500 bg-clip-text text-transparent">
            {getConsultationTypeLabel(consultationType)}
          </h2>
          <p className="text-gray-600 mt-1">
            Session avec {patient.nom} {patient.prenom}
          </p>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="text-sm px-3 py-1">
            {getTarif(consultationType).toLocaleString()} FCFA
          </Badge>
          <Button 
            variant={showAIAssistant ? "default" : "outline"}
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className="flex items-center gap-2"
          >
            <Bot className="h-4 w-4" />
            {showAIAssistant ? "Masquer l'IA" : "Cliquez ici pour l'IA"}
          </Button>
          <Button variant="outline" onClick={onBack} className="hover:bg-gray-50">
            Retour
          </Button>
        </div>
      </div>

      {/* Type de consultation badge */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {getConsultationTypeLabel(consultationType)}
        </Badge>
        <Badge variant="outline" className="text-sm px-3 py-1">
          {new Date().toLocaleDateString('fr-FR')}
        </Badge>
      </div>

      {/* Informations Patient (lecture seule) */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <User className="h-5 w-5" />
            Informations Patient
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <Label className="text-blue-700 font-medium">Âge</Label>
              <p className="text-blue-900">{calculateAge(patient.date_naissance)} ans</p>
            </div>
            <div>
              <Label className="text-blue-700 font-medium">Sexe</Label>
              <p className="text-blue-900">{patient.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
            </div>
            <div>
              <Label className="text-blue-700 font-medium">Groupe sanguin</Label>
              <p className="text-blue-900">{patient.groupe_sanguin || 'Non renseigné'}</p>
            </div>
            <div>
              <Label className="text-blue-700 font-medium">Téléphone</Label>
              <p className="text-blue-900">{patient.telephone || 'Non renseigné'}</p>
            </div>
          </div>
          {patient.antecedents && (
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <Label className="text-blue-700 font-medium">Antécédents médicaux</Label>
              <p className="text-blue-900 text-sm mt-1">{patient.antecedents}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assistant IA Simplifié et Rapide */}
      {showAIAssistant && (
        <FastWorkingAI
          onFormDataFilled={handleAIDataExtracted}
          patientInfo={patient}
          consultationType={consultationType}
        />
      )}

      {/* Constantes vitales */}
      <Card className="border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Stethoscope className="h-5 w-5" />
            Constantes Vitales & Mesures
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="poids" className="font-medium">Poids actuel (kg)</Label>
              <Input
                id="poids"
                type="number"
                step="0.1"
                value={constantes.poids || ''}
                onChange={(e) => setConstantes(prev => ({ ...prev, poids: parseFloat(e.target.value) || 0 }))}
                className="border-green-200 focus:border-green-400"
              />
              {patient.poids && constantes.poids !== patient.poids && (
                <p className="text-xs text-gray-500">
                  <Info className="inline h-3 w-3 mr-1" />
                  Poids précédent: {patient.poids} kg
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="taille" className="font-medium">Taille (cm)</Label>
              <Input
                id="taille"
                type="number"
                value={constantes.taille || ''}
                onChange={(e) => setConstantes(prev => ({ ...prev, taille: parseFloat(e.target.value) || 0 }))}
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imc" className="font-medium">IMC (kg/m²)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="imc"
                  type="number"
                  step="0.1"
                  value={constantes.imc || ''}
                  readOnly
                  className="bg-gray-50 border-gray-200"
                />
                <Calculator className="h-4 w-4 text-gray-400" />
              </div>
              {constantes.imc > 0 && (
                <Badge className={getIMCStatus(constantes.imc).color}>
                  {getIMCStatus(constantes.imc).label}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire spécifique au type de consultation */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Formulaire spécialisé - {getConsultationTypeLabel(consultationType)}
        </h3>
        {renderFormulaireSpecifique()}
      </div>

      <div className="flex justify-between items-center pt-6">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <div className="text-right">
          <p className="text-sm text-gray-600 mb-2">Tarif de la consultation :</p>
          <p className="text-2xl font-bold text-medical-600">
            {getTarif(consultationType).toLocaleString()} FCFA
          </p>
        </div>
        <Button 
          onClick={handleSubmit} 
          size="lg"
          className="bg-gradient-to-r from-medical-600 to-medical-700 hover:from-medical-700 hover:to-medical-800 text-white px-8 py-3 text-lg font-medium"
        >
          👆 Cliquez ici pour clôturer
        </Button>
      </div>
    </div>
  );
}
