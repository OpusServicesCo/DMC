import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Bot, Send, Brain, Volume2, Edit3 } from "lucide-react";
import { Patient } from "@/types/models";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { useBrowserSpeech } from "@/hooks/useBrowserSpeech";
import { useToast } from "@/hooks/use-toast";
import { ManualInputFallback } from "./ManualInputFallback";

interface SimpleVoiceInterfaceProps {
  onDataExtracted: (data: any) => void;
  onNutritionSuggested: () => void;
  onAIAnalysis?: (analysis: any) => void;
  patientInfo: Patient;
  consultationType?: string;
  className?: string;
}

export function SimpleVoiceInterface({ 
  onDataExtracted, 
  onNutritionSuggested, 
  onAIAnalysis,
  patientInfo, 
  consultationType = "consultation_initiale",
  className = "" 
}: SimpleVoiceInterfaceProps) {
  const [transcription, setTranscription] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [stopRecording, setStopRecording] = useState<(() => void) | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [voiceError, setVoiceError] = useState(false);
  const [useManualFallback, setUseManualFallback] = useState(false);
  
  const { toast } = useToast();
  
  // Hooks pour IA et transcription
  const { 
    extractConsultationData, 
    isProcessing, 
    analyzePatientRisk 
  } = useAIAssistant();
  
  const { 
    startListening, 
    isListening, 
    speak, 
    isSpeaking,
    isSupported: speechSupported 
  } = useBrowserSpeech();

  const getSpecializedPrompt = (type: string) => {
    switch (type) {
      case 'consultation_initiale':
        return "🩺 IA spécialisée en CONSULTATION INITIALE : Je peux vous aider avec l'évaluation initiale, le calcul d'IMC et les objectifs nutritionnels de base.";
      case 'bilan_nutritionnel':
        return "📊 IA spécialisée en BILAN NUTRITIONNEL : Je peux analyser les journaux alimentaires, identifier les carences et proposer des corrections.";
      case 'suivi_nutritionnel':
        return "📈 IA spécialisée en SUIVI : Je peux évaluer les progrès, analyser les évolutions et ajuster les plans nutritionnels.";
      case 'dietetique_pathologie':
        return "🏥 IA spécialisée en DIÉTÉTIQUE PATHOLOGIQUE : Je peux adapter l'alimentation aux pathologies et vérifier les interactions.";
      case 'trouble_comportement_alimentaire':
        return "🧠 IA spécialisée en TROUBLES ALIMENTAIRES : Je peux identifier les déclencheurs émotionnels et proposer des stratégies comportementales.";
      default:
        return "🤖 Assistant IA nutritionnel général";
    }
  };

  // Transcription vocale réelle avec fallback manuel
  const handleStartRecording = async () => {
    if (isListening) {
      if (stopRecording) {
        stopRecording();
        setStopRecording(null);
      }
      return;
    }

    try {
      setVoiceError(false);
      const stopFn = await startListening((transcript) => {
        if (transcript) {
          setTranscription(prev => prev + (prev ? ' ' : '') + transcript);
          setShowManualInput(true); // Assurer que la zone de saisie est visible
          toast({
            title: "🎤 Transcription réussie",
            description: "Journal alimentaire mis à jour",
          });
        }
      });

      if (stopFn) {
        setStopRecording(() => stopFn);
      } else {
        // Si la reconnaissance vocale échoue, afficher la saisie manuelle
        setVoiceError(true);
        setShowManualInput(true);
      }
    } catch (error) {
      setVoiceError(true);
      setShowManualInput(true);
      toast({
        title: "Erreur de reconnaissance vocale",
        description: "Saisie manuelle activée. Tapez votre texte ci-dessous.",
        variant: "default"
      });
    }
  };

  // Bouton pour activer manuellement la saisie
  const handleShowManualInput = () => {
    setShowManualInput(true);
    setVoiceError(false);
  };

  // Activer le mode saisie manuelle complète
  const handleUseManualFallback = () => {
    setUseManualFallback(true);
    setVoiceError(false);
    setShowManualInput(false);
  };

  // Gestion de la soumission manuelle
  const handleManualSubmit = (text: string) => {
    setTranscription(text);
    handleProcessWithAI();
  };

  // Fonction utilitaire pour calculer le score nutritionnel
  const calculateNutritionScore = (text: string) => {
    let score = 5; // Score de base sur 10
    const lowerText = text.toLowerCase();
    
    // Points positifs
    if (lowerText.includes('légumes')) score += 1;
    if (lowerText.includes('fruits')) score += 1;
    if (lowerText.includes('poisson')) score += 1;
    if (lowerText.includes('eau')) score += 0.5;
    if (lowerText.includes('complets') || lowerText.includes('céréales')) score += 0.5;
    
    // Points négatifs
    if (lowerText.includes('sucre') || lowerText.includes('sodas')) score -= 1;
    if (lowerText.includes('frit') || lowerText.includes('fast')) score -= 1.5;
    if (lowerText.includes('grignotage')) score -= 0.5;
    
    return Math.max(0, Math.min(10, Math.round(score)));
  };

  // Génération des alertes
  const generateAlerts = (data: any) => {
    const alerts = [];
    
    if (data.constantes?.glycemie && data.constantes.glycemie > 1.26) {
      alerts.push("⚠️ Glycémie élevée détectée");
    }
    
    if (data.constantes?.imc && data.constantes.imc > 30) {
      alerts.push("⚠️ Obésité - prise en charge prioritaire");
    }
    
    if (data.constantes?.tension_systolique && data.constantes.tension_systolique > 140) {
      alerts.push("⚠️ Hypertension artérielle");
    }

    return alerts;
  };

  // Analyse IA réelle avec remplissage automatique des champs
  const handleProcessWithAI = async () => {
    if (!transcription.trim()) {
      toast({
        title: "Transcription vide",
        description: "Veuillez d'abord enregistrer ou saisir du texte",
        variant: "destructive"
      });
      return;
    }

    try {
      // Extraction des données structurées par l'IA
      const extractedData = await extractConsultationData(transcription, {
        ...patientInfo,
        consultation_type: consultationType
      });

      if (!extractedData) {
        throw new Error("Échec de l'extraction des données");
      }

      // Analyse des risques si nécessaire
      const riskAnalysis = await analyzePatientRisk({
        ...patientInfo,
        transcription,
        extracted_data: extractedData
      });

      // Préparation des données pour remplir automatiquement le formulaire
      const formData = {
        // Données extraites par l'IA
        ...extractedData,
        risk_analysis: riskAnalysis,
        
        // Spécifique au bilan nutritionnel
        rappel_alimentaire_24h: transcription,
        synthese_carences: extractedData.diagnostic ? 
          Object.entries(extractedData.diagnostic)
            .filter(([_, value]) => value === true)
            .map(([key, _]) => key.replace(/_/g, ' '))
            .join(', ') : '',
        
        // Mapping des constantes
        ...(extractedData.constantes && {
          poids: extractedData.constantes.poids,
          taille: extractedData.constantes.taille,
          cholesterol: extractedData.constantes.cholesterol_total,
          glycemie: extractedData.constantes.glycemie,
          eau_quotidienne: extractedData.plan_nutritionnel?.hydratation_objectif || 1.5
        }),

        // Comportements alimentaires basés sur l'analyse
        comportements_alimentaires: extractedData.plan_nutritionnel?.conseils_alimentaires || '',
        
        // Score nutritionnel calculé
        score_nutritionnel: calculateNutritionScore(transcription),
        
        // Aliments dominants basés sur l'analyse
        aliments_dominants: extractedData.plan_nutritionnel?.aliments_privilégier?.[0] || 'equilibre',
        
        // Fréquence des repas
        frequence_repas: extractedData.plan_nutritionnel?.frequence_repas?.toString() || '3 repas + 2 collations',
        
        // Tests biologiques
        tests_biologiques: extractedData.constantes ? 
          `Glycémie: ${extractedData.constantes.glycemie || 'NR'} g/L, Cholestérol: ${extractedData.constantes.cholesterol_total || 'NR'} mg/dL` : ''
      };

      // Remplir automatiquement les champs du formulaire
      onDataExtracted(formData);
      
      // Déclencher l'analyse complète si le callback existe
      if (onAIAnalysis) {
        onAIAnalysis({
          ...extractedData,
          form_data: formData,
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
            
          alertes: generateAlerts(extractedData)
        });
      }

      setAiResponse("✅ Analyse IA terminée - Formulaire rempli automatiquement");
      
      // Lecture vocale du résumé
      if (speechSupported && formData.synthese_carences) {
        speak(`Analyse terminée. Principales observations: ${formData.synthese_carences}`);
      }

      toast({
        title: "🧠 IA activée",
        description: "Formulaire rempli automatiquement par l'IA",
      });

    } catch (error: any) {
      console.error('Erreur analyse IA:', error);
      setAiResponse("❌ Erreur lors de l'analyse IA");
      toast({
        title: "Erreur d'analyse IA",
        description: error.message || "Service temporairement indisponible",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className={`border-purple-200 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Bot className="h-5 w-5" />
          {getSpecializedPrompt(consultationType)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={handleStartRecording}
            disabled={isProcessing}
            className={`flex-1 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            {isListening ? (
              <>
                <MicOff className="mr-2 h-4 w-4" />
                🎤 Enregistrement...
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                👆 Cliquez ici pour parler
              </>
            )}
          </Button>
          
          <Button
            onClick={handleShowManualInput}
            variant="outline"
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            ✏️ Saisie rapide
          </Button>
          
          <Button
            onClick={handleUseManualFallback}
            variant="secondary"
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Mode manuel
          </Button>
          
          {isSpeaking && (
            <Button
              variant="outline"
              disabled
              className="flex items-center gap-2"
            >
              <Volume2 className="h-4 w-4 animate-pulse text-blue-500" />
              Lecture...
            </Button>
          )}
        </div>

        {voiceError && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              ⚠️ Reconnaissance vocale indisponible. Utilisez la saisie manuelle ci-dessous.
            </p>
          </div>
        )}

        {(transcription || isListening || showManualInput) && (
          <div className="space-y-2">
            <Textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              placeholder={voiceError ? 
                "Saisissez manuellement le journal alimentaire du patient..." : 
                "Dictez ou saisissez le journal alimentaire du patient..."
              }
              rows={4}
            />
            {isListening && (
              <p className="text-sm text-blue-600 animate-pulse">
                🎤 Écoute en cours... Décrivez l'alimentation du patient
              </p>
            )}
            <Button
              onClick={handleProcessWithAI}
              disabled={isProcessing || !transcription.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-spin" />
                  🤖 IA en cours d'analyse...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  👆 Cliquez ici pour analyser avec l'IA
                </>
              )}
            </Button>
          </div>
        )}

        {/* Mode manuel complet avec guide */}
        {useManualFallback && (
          <ManualInputFallback
            onTextSubmit={handleManualSubmit}
            isProcessing={isProcessing}
            placeholder="Décrivez en détail l'alimentation du patient..."
            title="📝 Saisie manuelle guidée"
          />
        )}

        {aiResponse && (
          <div className={`p-3 rounded-lg border ${
            aiResponse.includes('✅') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <p className={`text-sm ${
              aiResponse.includes('✅') ? 'text-green-800' : 'text-red-800'
            }`}>
              {aiResponse}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
