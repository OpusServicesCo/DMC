
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, Activity, Target, AlertTriangle, Mic, MicOff, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { useBrowserSpeech } from '@/hooks/useBrowserSpeech';

interface ConsultationNutritionnelleFormProps {
  patientInfo?: any;
  onDataExtracted?: (data: any) => void;
  onAIAnalysis?: (analysis: any) => void;
}

export function ConsultationNutritionnelleForm({ 
  patientInfo, 
  onDataExtracted, 
  onAIAnalysis 
}: ConsultationNutritionnelleFormProps) {
  const [formData, setFormData] = useState({
    type_consultation: '',
    objectif_consultation: '',
    pathologie_ciblee: '',
    poids: '',
    taille: '',
    tour_taille: '',
    tension_systolique: '',
    tension_diastolique: '',
    glycemie: '',
    cholesterol: '',
    observations: '',
    progression_notes: ''
  });

  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stopRecording, setStopRecording] = useState<(() => void) | null>(null);
  const { toast } = useToast();
  
  // Hooks pour IA et transcription
  const { 
    extractConsultationData, 
    isProcessing, 
    transcribeAudio, 
    isTranscribing,
    analyzePatientRisk 
  } = useAIAssistant();
  
  const { 
    startListening, 
    isListening, 
    speak, 
    isSpeaking,
    isSupported: speechSupported 
  } = useBrowserSpeech();

  const consultationTypes = [
    { value: 'consultation_initiale', label: 'Consultation initiale', description: 'Premier rendez-vous, évaluation complète' },
    { value: 'bilan_nutritionnel', label: 'Bilan nutritionnel', description: 'Évaluation approfondie des habitudes alimentaires' },
    { value: 'suivi_nutritionnel', label: 'Suivi nutritionnel', description: 'Suivi de l\'évolution et ajustements' },
    { value: 'dietetique_pathologie', label: 'Diététique pathologique', description: 'Nutrition adaptée à une pathologie spécifique' },
    { value: 'trouble_comportement_alimentaire', label: 'Troubles alimentaires', description: 'Prise en charge des troubles du comportement alimentaire' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

const calculateIMC = () => {
  const poids = parseFloat(formData.poids);
  const taille = parseFloat(formData.taille); // taille en mètre, PAS en cm

  if (isNaN(poids) || isNaN(taille) || taille <= 0) {
    return null;
  }

  const imcValue = poids / (taille * taille);
  return Math.round(imcValue * 10) / 10;
};

  // Transcription vocale pour les observations
  const handleVoiceInput = async (field: string) => {
    if (isListening) {
      if (stopRecording) {
        stopRecording();
        setStopRecording(null);
      }
      return;
    }

    const stopFn = await startListening((transcript) => {
      if (transcript) {
        handleInputChange(field, formData[field as keyof typeof formData] + ' ' + transcript);
        toast({
          title: "🎤 Transcription réussie",
          description: `Texte ajouté au champ ${field === 'observations' ? 'observations' : 'progression'}`,
        });
      }
    });

    if (stopFn) {
      setStopRecording(() => stopFn);
    }
  };

  // IA pour analyser les données de consultation
  const handleAIAnalysis = async () => {
    if (!formData.observations.trim()) {
      toast({
        title: "Observations manquantes",
        description: "Veuillez saisir des observations pour déclencher l'analyse IA.",
        variant: "destructive"
      });
      return;
    }

    try {
      setAiAnalyzing(true);
      
      // Construction des données patient complètes
      const consultationText = `
Type de consultation: ${formData.type_consultation}
Objectif: ${formData.objectif_consultation}
Pathologie ciblée: ${formData.pathologie_ciblee}
Poids: ${formData.poids} kg
Taille: ${formData.taille} cm
Tour de taille: ${formData.tour_taille} cm
Tension: ${formData.tension_systolique}/${formData.tension_diastolique} mmHg
Glycémie: ${formData.glycemie} g/L
Cholestérol: ${formData.cholesterol}
Observations cliniques: ${formData.observations}
Notes de progression: ${formData.progression_notes}
      `.trim();

      // Extraction des données structurées
      const extractedData = await extractConsultationData(consultationText, {
        ...patientInfo,
        ...formData
      });

      if (!extractedData) {
        throw new Error("Échec de l'extraction des données");
      }

      // Analyse des risques
      const riskAnalysis = await analyzePatientRisk({
        ...patientInfo,
        ...formData,
        extracted_data: extractedData
      });

      // Compilation du résultat final
      const analysis = {
        ...extractedData,
        risk_analysis: riskAnalysis,
        diagnostic_sugere: extractedData.diagnostic ? 
          Object.entries(extractedData.diagnostic)
            .filter(([_, value]) => value === true)
            .map(([key, _]) => key.replace(/_/g, ' '))
            .join(', ') : 'Évaluation en cours',
        
        recommandations: extractedData.plan_nutritionnel?.conseils_alimentaires ? 
          [extractedData.plan_nutritionnel.conseils_alimentaires] : 
          ["Consultation approfondie recommandée"],
          
        objectifs_smart: extractedData.suivi?.objectifs_court_terme || 
          ["Objectifs à définir lors du suivi"],
          
        alertes: []
      };

      // Alertes basées sur les constantes
      if (formData.glycemie && parseFloat(formData.glycemie) > 1.26) {
        analysis.alertes.push("⚠️ Glycémie élevée - surveillance rapprochée");
      }
      if (formData.tension_systolique && parseInt(formData.tension_systolique) > 140) {
        analysis.alertes.push("⚠️ Tension artérielle élevée");
      }
      
      const imc = calculateIMC();
      if (imc && imc > 30) {
        analysis.alertes.push("⚠️ Obésité - prise en charge nutritionnelle prioritaire");
      }

      onAIAnalysis?.(analysis);
      onDataExtracted?.(formData);
      
      toast({
        title: "✨ Analyse IA terminée",
        description: "Diagnostic et recommandations générés avec succès.",
      });

      // Lecture vocale du diagnostic si disponible
      if (analysis.diagnostic_sugere && speechSupported) {
        speak(`Diagnostic suggéré: ${analysis.diagnostic_sugere}`);
      }

    } catch (error: any) {
      console.error('Erreur analyse IA:', error);
      toast({
        title: "Erreur d'analyse IA",
        description: error.message || "Service temporairement indisponible. Vérifiez votre connexion.",
        variant: "destructive"
      });
    } finally {
      setAiAnalyzing(false);
    }
  };

  const imc = calculateIMC();

  return (
    <div className="space-y-6">
      {/* Type de consultation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-medical-600" />
            Type de consultation nutritionnelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={formData.type_consultation} onValueChange={(value) => handleInputChange('type_consultation', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez le type de consultation" />
            </SelectTrigger>
            <SelectContent>
              {consultationTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Objectifs et pathologie */}
      <Card>
        <CardHeader>
          <CardTitle>Objectifs et contexte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="objectif">Objectif de la consultation</Label>
            <Textarea
              id="objectif"
              placeholder="Ex: Perte de poids, amélioration glycémie, rééquilibrage alimentaire..."
              value={formData.objectif_consultation}
              onChange={(e) => handleInputChange('objectif_consultation', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="pathologie">Pathologie ciblée (si applicable)</Label>
            <Input
              id="pathologie"
              placeholder="Ex: Diabète type 2, hypertension, cholestérol..."
              value={formData.pathologie_ciblee}
              onChange={(e) => handleInputChange('pathologie_ciblee', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Mesures anthropométriques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-medical-600" />
            Mesures et constantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="poids">Poids (kg)</Label>
              <Input
                id="poids"
                type="number"
                step="0.1"
                value={formData.poids}
                onChange={(e) => handleInputChange('poids', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="taille">Taille (cm)</Label>
              <Input
                id="taille"
                type="number"
                value={formData.taille}
                onChange={(e) => handleInputChange('taille', e.target.value)}
              />
            </div>
            <div>
              <Label>IMC calculé</Label>
              <div className="p-2 bg-gray-50 rounded border text-center font-medium">
                {imc ? (
                  <span className={`${parseFloat(imc) > 25 ? 'text-orange-600' : parseFloat(imc) < 18.5 ? 'text-blue-600' : 'text-green-600'}`}>
                    {imc}
                  </span>
                ) : '- -'}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tour_taille">Tour de taille (cm)</Label>
              <Input
                id="tour_taille"
                type="number"
                value={formData.tour_taille}
                onChange={(e) => handleInputChange('tour_taille', e.target.value)}
              />
            </div>
            <div>
              <Label>Tension artérielle</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Systolique"
                  type="number"
                  value={formData.tension_systolique}
                  onChange={(e) => handleInputChange('tension_systolique', e.target.value)}
                />
                <span className="self-center">/</span>
                <Input
                  placeholder="Diastolique"
                  type="number"
                  value={formData.tension_diastolique}
                  onChange={(e) => handleInputChange('tension_diastolique', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="glycemie">Glycémie (g/L)</Label>
              <Input
                id="glycemie"
                type="number"
                step="0.01"
                value={formData.glycemie}
                onChange={(e) => handleInputChange('glycemie', e.target.value)}
              />
              {formData.glycemie && parseFloat(formData.glycemie) > 1.26 && (
                <Badge variant="destructive" className="mt-1 text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Glycémie élevée
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observations cliniques */}
      <Card>
        <CardHeader>
          <CardTitle>Observations cliniques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="observations">Observations générales</Label>
              <div className="flex gap-2">
                {speechSupported && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleVoiceInput('observations')}
                    disabled={isTranscribing}
                    className="flex items-center gap-2"
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4 text-red-500" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                    {isListening ? 'Arrêter' : 'Dicter'}
                  </Button>
                )}
                {isSpeaking && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled
                    className="flex items-center gap-2"
                  >
                    <Volume2 className="h-4 w-4 animate-pulse text-blue-500" />
                    En cours...
                  </Button>
                )}
              </div>
            </div>
            <Textarea
              id="observations"
              placeholder="Décrivez les symptômes, habitudes alimentaires, mode de vie... Ou utilisez le bouton 'Dicter' pour saisir vocalement."
              value={formData.observations}
              onChange={(e) => handleInputChange('observations', e.target.value)}
              className="min-h-[120px]"
            />
            {isListening && (
              <p className="text-sm text-blue-600 mt-1 animate-pulse">
                🎤 Écoute en cours... Parlez maintenant
              </p>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="progression">Notes de progression (suivi)</Label>
              {speechSupported && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleVoiceInput('progression_notes')}
                  disabled={isTranscribing}
                  className="flex items-center gap-2"
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4 text-red-500" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                  {isListening ? 'Arrêter' : 'Dicter'}
                </Button>
              )}
            </div>
            <Textarea
              id="progression"
              placeholder="Évolution depuis la dernière consultation, difficultés rencontrées... Ou utilisez le bouton 'Dicter'."
              value={formData.progression_notes}
              onChange={(e) => handleInputChange('progression_notes', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bouton d'analyse IA */}
      <Card className="border-medical-200">
        <CardContent className="pt-6">
          <Button 
            onClick={handleAIAnalysis}
            disabled={aiAnalyzing || isProcessing || !formData.observations.trim()}
            className="w-full"
            size="lg"
          >
            <Brain className={`h-5 w-5 mr-2 ${(aiAnalyzing || isProcessing) ? 'animate-spin' : ''}`} />
            {(aiAnalyzing || isProcessing) ? 'Analyse IA en cours...' : '🧠 Analyse IA nutritionnelle complète'}
          </Button>
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              L'IA analysera vos observations pour générer un diagnostic et des recommandations personnalisées
            </p>
            {(aiAnalyzing || isProcessing) && (
              <p className="text-xs text-blue-600 animate-pulse">
                🔍 Analyse des données • Extraction • Diagnostic • Recommandations • Analyse des risques
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
