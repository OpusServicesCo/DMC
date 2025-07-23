import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Sparkles, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Target,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { useBrowserSpeech } from '@/hooks/useBrowserSpeech';

interface SmartNutritionAssistantProps {
  patientInfo?: any;
  onAnalysisComplete?: (analysis: any) => void;
  initialData?: string;
}

export function SmartNutritionAssistant({ 
  patientInfo, 
  onAnalysisComplete,
  initialData = ''
}: SmartNutritionAssistantProps) {
  const [journalText, setJournalText] = useState(initialData);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stopRecording, setStopRecording] = useState<(() => void) | null>(null);
  
  const { toast } = useToast();
  
  const { 
    extractConsultationData, 
    suggestNutritionPlan,
    analyzePatientRisk,
    isProcessing,
    transcribeAudio,
    isTranscribing 
  } = useAIAssistant();
  
  const { 
    startListening, 
    isListening, 
    speak, 
    isSpeaking,
    isSupported: speechSupported 
  } = useBrowserSpeech();

  const analysisSteps = [
    { id: 1, label: "Analyse du journal alimentaire", icon: <Activity className="h-4 w-4" /> },
    { id: 2, label: "Identification des carences", icon: <AlertTriangle className="h-4 w-4" /> },
    { id: 3, label: "Évaluation des habitudes", icon: <TrendingUp className="h-4 w-4" /> },
    { id: 4, label: "Génération du plan", icon: <Target className="h-4 w-4" /> },
    { id: 5, label: "Analyse des risques", icon: <Brain className="h-4 w-4" /> }
  ];

  // Transcription vocale pour le journal alimentaire
  const handleVoiceInput = async () => {
    if (isListening) {
      if (stopRecording) {
        stopRecording();
        setStopRecording(null);
      }
      return;
    }

    const stopFn = await startListening((transcript) => {
      if (transcript) {
        setJournalText(prev => prev + (prev ? '\n' : '') + transcript);
        toast({
          title: "🎤 Transcription ajoutée",
          description: "Journal alimentaire mis à jour avec la saisie vocale",
        });
      }
    });

    if (stopFn) {
      setStopRecording(() => stopFn);
    }
  };

  // Analyse IA complète du journal alimentaire
  const performNutritionAnalysis = async () => {
    if (!journalText.trim()) {
      toast({
        title: "Journal vide",
        description: "Veuillez saisir ou dicter un journal alimentaire",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(0);
    
    try {
      // Étape 1: Extraction des données alimentaires
      setAnalysisStep(1);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const extractedData = await extractConsultationData(
        `Journal alimentaire détaillé: ${journalText}`, 
        patientInfo
      );

      if (!extractedData) {
        throw new Error("Impossible d'analyser le journal alimentaire");
      }

      // Étape 2: Génération du plan nutritionnel
      setAnalysisStep(2);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const nutritionPlan = await suggestNutritionPlan(journalText, {
        ...patientInfo,
        extracted_data: extractedData
      });

      // Étape 3: Analyse des risques
      setAnalysisStep(3);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const riskAnalysis = await analyzePatientRisk({
        ...patientInfo,
        journal_alimentaire: journalText,
        nutrition_data: extractedData
      });

      // Étape 4: Compilation de l'analyse finale
      setAnalysisStep(4);
      await new Promise(resolve => setTimeout(resolve, 500));

      const finalAnalysis = {
        journal_analysé: journalText,
        données_extraites: extractedData,
        plan_nutritionnel: nutritionPlan,
        analyse_risques: riskAnalysis,
        carences_identifiées: identifyDeficiencies(journalText),
        recommandations_prioritaires: generatePriorityRecommendations(extractedData, nutritionPlan),
        score_qualite_alimentaire: calculateNutritionScore(journalText),
        alertes_nutritionnelles: generateNutritionalAlerts(extractedData, journalText)
      };

      setAnalysisStep(5);
      setAnalysis(finalAnalysis);
      onAnalysisComplete?.(finalAnalysis);

      toast({
        title: "✨ Analyse nutritionnelle terminée",
        description: "Bilan complet et recommandations générés avec succès",
      });

      // Lecture vocale du résumé
      if (speechSupported && finalAnalysis.recommandations_prioritaires?.length > 0) {
        const summary = `Analyse terminée. ${finalAnalysis.recommandations_prioritaires.length} recommandations prioritaires identifiées.`;
        speak(summary);
      }

    } catch (error: any) {
      console.error('Erreur analyse nutritionnelle:', error);
      toast({
        title: "Erreur d'analyse",
        description: error.message || "Service temporairement indisponible",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  // Fonctions d'analyse locale
  const identifyDeficiencies = (text: string) => {
    const deficiencies = [];
    const lowerText = text.toLowerCase();
    
    if (!lowerText.includes('fruits') && !lowerText.includes('légumes')) {
      deficiencies.push({
        type: "Fibres et vitamines",
        sévérité: "élevée",
        description: "Apport insuffisant en fruits et légumes"
      });
    }
    
    if (!lowerText.includes('poisson') && !lowerText.includes('saumon') && !lowerText.includes('sardine')) {
      deficiencies.push({
        type: "Oméga-3",
        sévérité: "modérée", 
        description: "Manque probable d'acides gras essentiels"
      });
    }
    
    if (!lowerText.includes('eau') && !lowerText.includes('hydratation')) {
      deficiencies.push({
        type: "Hydratation",
        sévérité: "modérée",
        description: "Apport hydrique non documenté"
      });
    }

    return deficiencies;
  };

  const generatePriorityRecommendations = (data: any, plan: any) => {
    const recommendations = [];
    
    recommendations.push({
      priorité: "haute",
      action: "Augmenter la consommation de légumes verts",
      justification: "Amélioration de l'apport en fibres et micronutriments"
    });
    
    if (data?.constantes?.imc && data.constantes.imc > 25) {
      recommendations.push({
        priorité: "haute",
        action: "Réduction progressive des portions",
        justification: "Gestion du surpoids identifié"
      });
    }
    
    recommendations.push({
      priorité: "moyenne",
      action: "Hydratation optimisée (1.5-2L/jour)",
      justification: "Support métabolique et détoxification"
    });

    return recommendations;
  };

  const calculateNutritionScore = (text: string) => {
    let score = 50; // Score de base
    const lowerText = text.toLowerCase();
    
    // Points positifs
    if (lowerText.includes('légumes')) score += 15;
    if (lowerText.includes('fruits')) score += 10;
    if (lowerText.includes('poisson')) score += 10;
    if (lowerText.includes('eau')) score += 5;
    if (lowerText.includes('complets') || lowerText.includes('céréales')) score += 5;
    
    // Points négatifs
    if (lowerText.includes('sucre') || lowerText.includes('sodas')) score -= 10;
    if (lowerText.includes('frit') || lowerText.includes('fast')) score -= 15;
    if (lowerText.includes('alcool')) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  };

  const generateNutritionalAlerts = (data: any, text: string) => {
    const alerts = [];
    
    if (data?.constantes?.glycemie && data.constantes.glycemie > 1.26) {
      alerts.push({
        type: "critique",
        message: "Glycémie élevée détectée",
        action: "Contrôle urgent recommandé"
      });
    }
    
    const score = calculateNutritionScore(text);
    if (score < 40) {
      alerts.push({
        type: "attention",
        message: "Qualité nutritionnelle faible",
        action: "Rééquilibrage alimentaire nécessaire"
      });
    }

    return alerts;
  };

  return (
    <div className="space-y-6">
      {/* Saisie du journal alimentaire */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-medical-600" />
            Assistant IA Nutrition Spécialisé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Journal alimentaire détaillé</label>
              <div className="flex gap-2">
                {speechSupported && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleVoiceInput}
                    disabled={isTranscribing || isAnalyzing}
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
                    variant="outline"
                    size="sm"
                    disabled
                    className="flex items-center gap-2"
                  >
                    <Volume2 className="h-4 w-4 animate-pulse text-blue-500" />
                    Lecture
                  </Button>
                )}
              </div>
            </div>
            <Textarea
              placeholder="Décrivez en détail l'alimentation du patient sur les derniers jours : repas, quantités, horaires, grignotages, boissons... Plus c'est détaillé, plus l'analyse sera précise."
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              className="min-h-[150px]"
              disabled={isAnalyzing}
            />
            {isListening && (
              <p className="text-sm text-blue-600 mt-2 animate-pulse">
                🎤 Dictée en cours... Décrivez l'alimentation du patient
              </p>
            )}
          </div>

          <Button
            onClick={performNutritionAnalysis}
            disabled={isAnalyzing || isProcessing || !journalText.trim()}
            className="w-full"
            size="lg"
          >
            <Brain className={`h-5 w-5 mr-2 ${isAnalyzing || isProcessing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyse en cours...' : '🧠 Analyser et générer le bilan nutritionnel'}
          </Button>
        </CardContent>
      </Card>

      {/* Progression de l'analyse */}
      {isAnalyzing && (
        <Card className="border-medical-200">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Analyse IA en cours</h4>
                <Badge variant="outline" className="animate-pulse">
                  Étape {analysisStep}/5
                </Badge>
              </div>
              <Progress value={(analysisStep / 5) * 100} className="h-2" />
              <div className="space-y-2">
                {analysisSteps.map((step, index) => (
                  <div 
                    key={step.id}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      analysisStep > index ? 'bg-green-50 text-green-700' :
                      analysisStep === index + 1 ? 'bg-blue-50 text-blue-700 animate-pulse' :
                      'text-gray-400'
                    }`}
                  >
                    {analysisStep > index ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step.icon
                    )}
                    <span className="text-sm">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats de l'analyse */}
      {analysis && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Bilan nutritionnel IA généré
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Score nutritionnel */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg">
              <div>
                <h4 className="font-medium">Score de qualité nutritionnelle</h4>
                <p className="text-sm text-gray-600">Évaluation globale du régime alimentaire</p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  analysis.score_qualite_alimentaire >= 70 ? 'text-green-600' :
                  analysis.score_qualite_alimentaire >= 50 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {analysis.score_qualite_alimentaire}/100
                </div>
              </div>
            </div>

            {/* Carences identifiées */}
            {analysis.carences_identifiées?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Carences identifiées</h4>
                <div className="space-y-2">
                  {analysis.carences_identifiées.map((carence: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <AlertTriangle className={`h-4 w-4 ${
                        carence.sévérité === 'élevée' ? 'text-red-500' : 'text-orange-500'
                      }`} />
                      <div className="flex-1">
                        <div className="font-medium">{carence.type}</div>
                        <div className="text-sm text-gray-600">{carence.description}</div>
                      </div>
                      <Badge variant={carence.sévérité === 'élevée' ? 'destructive' : 'outline'}>
                        {carence.sévérité}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommandations prioritaires */}
            {analysis.recommandations_prioritaires?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Recommandations prioritaires</h4>
                <div className="space-y-2">
                  {analysis.recommandations_prioritaires.map((rec: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <Target className={`h-4 w-4 mt-0.5 ${
                        rec.priorité === 'haute' ? 'text-red-500' : 'text-orange-500'
                      }`} />
                      <div className="flex-1">
                        <div className="font-medium">{rec.action}</div>
                        <div className="text-sm text-gray-600">{rec.justification}</div>
                      </div>
                      <Badge variant={rec.priorité === 'haute' ? 'destructive' : 'outline'}>
                        {rec.priorité}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alertes */}
            {analysis.alertes_nutritionnelles?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Alertes nutritionnelles</h4>
                <div className="space-y-2">
                  {analysis.alertes_nutritionnelles.map((alert: any, index: number) => (
                    <div key={index} className={`p-3 rounded-lg border-l-4 ${
                      alert.type === 'critique' ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-500'
                    }`}>
                      <div className="font-medium">{alert.message}</div>
                      <div className="text-sm text-gray-600">{alert.action}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
