
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useLocalSpeech = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  // Vérifier si la synthèse vocale est supportée
  const isSpeechSynthesisSupported = useCallback(() => {
    return 'speechSynthesis' in window;
  }, []);

  // Obtenir la meilleure voix française disponible
  const getBestFrenchVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    
    // Priorité 1: Voix françaises natives de qualité
    const preferredVoices = [
      'Microsoft Hortense - French (France)',
      'Google français',
      'Amélie',
      'Thomas',
      'Virginie'
    ];
    
    for (const preferred of preferredVoices) {
      const voice = voices.find(v => v.name.includes(preferred) || v.name === preferred);
      if (voice) return voice;
    }
    
    // Priorité 2: Toute voix française
    const frenchVoice = voices.find(voice => 
      voice.lang.startsWith('fr') && voice.localService
    );
    if (frenchVoice) return frenchVoice;
    
    // Priorité 3: Toute voix française (même en ligne)
    const anyFrenchVoice = voices.find(voice => voice.lang.startsWith('fr'));
    if (anyFrenchVoice) return anyFrenchVoice;
    
    // Fallback: voix par défaut
    return voices[0];
  }, []);

  // Synthèse vocale améliorée
  const speak = useCallback((text: string) => {
    if (!isSpeechSynthesisSupported()) {
      toast({
        title: "Non supporté",
        description: "La synthèse vocale n'est pas supportée par ce navigateur",
        variant: "destructive",
      });
      return;
    }

    setIsSpeaking(true);
    window.speechSynthesis.cancel();

    // Attendre que les voix soient chargées
    const speakWithVoice = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = getBestFrenchVoice();
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = 'fr-FR';
      }
      
      // Paramètres optimisés pour une voix plus naturelle
      utterance.rate = 0.85;        // Vitesse légèrement réduite
      utterance.pitch = 1.1;        // Tonalité légèrement plus élevée
      utterance.volume = 0.9;       // Volume élevé
      
      // Ajouter des pauses naturelles
      const naturalText = text
        .replace(/\./g, '. ')
        .replace(/,/g, ', ')
        .replace(/:/g, ': ')
        .replace(/;/g, '; ')
        .replace(/\?/g, ' ? ')
        .replace(/!/g, ' ! ');
      
      utterance.text = naturalText;

      utterance.onstart = () => {
        console.log('Début de la synthèse vocale');
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        console.log('Fin de la synthèse vocale');
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        console.error('Erreur synthèse vocale:', event);
        toast({
          title: "Erreur de lecture",
          description: "Impossible de lire le texte",
          variant: "destructive",
        });
      };

      window.speechSynthesis.speak(utterance);
    };

    // Si les voix ne sont pas encore chargées, attendre
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        speakWithVoice();
      };
    } else {
      speakWithVoice();
    }
  }, [toast, getBestFrenchVoice, isSpeechSynthesisSupported]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // IA locale simple pour traitement des données
  const processWithLocalAI = useCallback(async (text: string, type: 'extract' | 'nutrition' | 'question') => {
    setIsProcessing(true);
    
    // Simulation de traitement local
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      if (type === 'extract') {
        return extractMedicalData(text);
      } else if (type === 'nutrition') {
        return generateNutritionPlan(text);
      } else if (type === 'question') {
        return generateMedicalResponse(text);
      }
    } catch (error) {
      toast({
        title: "Erreur de traitement",
        description: "Impossible de traiter la demande",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  return {
    isListening: false, // Pas de reconnaissance vocale
    isProcessing,
    isSpeaking,
    isSupported: isSpeechSynthesisSupported(),
    speak,
    stopSpeaking,
    processWithLocalAI
  };
};

// Fonctions d'IA locale simplifiées
function extractMedicalData(text: string) {
  const lowerText = text.toLowerCase();
  
  const constantes: any = {};
  const diagnostic: any = {};
  const plan_nutritionnel: any = {};

  // Extraction de poids
  const poidsRegex = /(\d+(?:\.\d+)?)\s*(?:kg|kilo|kilogramme)/;
  const poidsMatch = lowerText.match(poidsRegex);
  if (poidsMatch) constantes.poids = parseFloat(poidsMatch[1]);

  // Extraction de taille
  const tailleRegex = /(\d+(?:\.\d+)?)\s*(?:cm|centimètre)/;
  const tailleMatch = lowerText.match(tailleRegex);
  if (tailleMatch) constantes.taille = parseFloat(tailleMatch[1]);

  // Diagnostic basique
  if (lowerText.includes('diabète') || lowerText.includes('diabétique')) {
    diagnostic.diabete_type2 = true;
  }
  if (lowerText.includes('surpoids') || lowerText.includes('obèse')) {
    diagnostic.surpoids = true;
  }
  if (lowerText.includes('hypertension') || lowerText.includes('tension élevée')) {
    diagnostic.hypertension = true;
  }

  return {
    constantes: Object.keys(constantes).length > 0 ? constantes : null,
    diagnostic: Object.keys(diagnostic).length > 0 ? diagnostic : null,
    plan_nutritionnel: Object.keys(plan_nutritionnel).length > 0 ? plan_nutritionnel : null
  };
}

function generateNutritionPlan(text: string) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('diabète')) {
    return {
      objectif_principal: 'Contrôle glycémique optimal',
      conseils_detailles: 'Privilégier les aliments à index glycémique bas, fractionner les repas en 5-6 prises par jour',
      interdictions: 'Éviter sucres rapides, sodas, pâtisseries industrielles',
      activite_physique: 'Marche quotidienne 30 minutes après les repas'
    };
  } else if (lowerText.includes('perte de poids') || lowerText.includes('maigrir')) {
    return {
      objectif_principal: 'Perte de poids progressive et durable',
      conseils_detailles: 'Déficit calorique modéré, augmentation des légumes verts, protéines à chaque repas',
      interdictions: 'Limiter aliments ultra-transformés, boissons sucrées',
      activite_physique: 'Combinaison cardio et musculation 3-4x/semaine'
    };
  } else {
    return {
      objectif_principal: 'Équilibre nutritionnel général',
      conseils_detailles: 'Alimentation variée et équilibrée selon les recommandations PNNS',
      activite_physique: 'Activité physique régulière adaptée'
    };
  }
}

function generateMedicalResponse(question: string): string {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('diabète')) {
    return 'Le diabète est une maladie chronique caractérisée par un taux de glucose élevé dans le sang, appelé hyperglycémie. Il existe principalement deux types : le diabète de type 1, où le pancréas ne produit pas d\'insuline, et le diabète de type 2, plus fréquent, où l\'organisme résiste à l\'insuline ou n\'en produit pas suffisamment. Les symptômes incluent une soif excessive, des urines fréquentes, une fatigue importante, une vision floue, et une cicatrisation lente des plaies. Un suivi médical régulier avec contrôle de la glycémie, une alimentation équilibrée et une activité physique adaptée sont essentiels pour la prise en charge.';
  } else if (lowerQuestion.includes('hypertension')) {
    return 'L\'hypertension artérielle, ou tension élevée, est une condition où la pression du sang contre les parois des artères est constamment trop élevée. Elle est souvent appelée "le tueur silencieux" car elle présente généralement peu ou pas de symptômes, mais augmente considérablement les risques d\'accidents cardiovasculaires, d\'accidents vasculaires cérébraux et de problèmes rénaux. La prise en charge associe des mesures hygiéno-diététiques comme la réduction du sel, l\'activité physique régulière, et si nécessaire, des traitements médicamenteux prescrits par un médecin.';
  } else if (lowerQuestion.includes('nutrition') || lowerQuestion.includes('alimentation')) {
    return 'Une alimentation équilibrée est la base d\'une bonne santé. Elle doit comprendre au minimum cinq portions de fruits et légumes par jour, des féculents complets pour l\'énergie, des protéines variées comme les légumineuses, poissons, œufs et viandes maigres, des produits laitiers pour le calcium, tout en limitant les sucres ajoutés, les graisses saturées et le sel. L\'hydratation est également essentielle avec au moins 1,5 litre d\'eau par jour. Chaque personne ayant des besoins spécifiques, il est recommandé de consulter un professionnel de santé pour un conseil personnalisé.';
  } else {
    return 'Pour toute question médicale spécifique et pour une évaluation personnalisée adaptée à votre situation particulière, je vous recommande vivement de consulter un professionnel de santé qualifié qui pourra vous fournir des conseils médicaux appropriés et établir un diagnostic précis si nécessaire.';
  }
}
