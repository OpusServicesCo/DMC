
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useBrowserSpeech = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  // Vérifier si la reconnaissance vocale est supportée
  const isSupported = useCallback(() => {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }, []);

  // Test de connectivité réseau amélioré
  const testNetworkConnectivity = useCallback(async () => {
    try {
      // Test simple avec un endpoint fiable
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      return true;
    } catch {
      try {
        // Fallback avec Google DNS
        const response = await fetch('https://8.8.8.8', {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache'
        });
        return true;
      } catch {
        return false;
      }
    }
  }, []);

  // Vérifier les permissions du microphone
  const checkMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Erreur de permission microphone:', error);
      return false;
    }
  }, []);

  // Reconnaissance vocale avec gestion d'erreur simplifiée
  const startListening = useCallback(async (onResult: (text: string) => void) => {
    if (!isSupported()) {
      toast({
        title: "Non supporté",
        description: "Utilisez Chrome, Firefox ou Safari pour la reconnaissance vocale",
        variant: "destructive",
      });
      return null;
    }

    // Vérifier la connectivité avant de commencer
    const isConnected = await testNetworkConnectivity();
    if (!isConnected) {
      toast({
        title: "Connexion requise",
        description: "La reconnaissance vocale nécessite une connexion internet. Utilisez la saisie manuelle.",
        variant: "destructive",
      });
      return null;
    }

    // Vérifier les permissions du microphone
    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) {
      toast({
        title: "Microphone requis",
        description: "Autorisez l'accès au microphone pour utiliser la reconnaissance vocale",
        variant: "destructive",
      });
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Configuration simple et robuste
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'fr-FR';
    recognition.maxAlternatives = 1;

    let isActive = true;

    recognition.onstart = () => {
      setIsListening(true);
      console.log('🎤 Reconnaissance vocale active');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (event.results && event.results.length > 0) {
        const transcript = event.results[0][0].transcript;
        if (transcript.trim()) {
          onResult(transcript.trim());
          console.log('📝 Transcription:', transcript);
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('❌ Erreur reconnaissance:', event.error);
      setIsListening(false);
      
      if (!isActive) return;

      // Gestion simplifiée des erreurs
      if (event.error === 'network') {
        toast({
          title: "Problème de réseau",
          description: "Service de reconnaissance temporairement indisponible. Utilisez la saisie manuelle.",
          variant: "destructive",
        });
      } else if (event.error === 'not-allowed') {
        toast({
          title: "Permission refusée",
          description: "Autorisez le microphone dans les paramètres du navigateur.",
          variant: "destructive",
        });
      } else if (event.error === 'no-speech') {
        toast({
          title: "Aucune voix détectée",
          description: "Parlez plus fort ou rapprochez-vous du microphone.",
          variant: "destructive",
        });
      } else if (event.error !== 'aborted') {
        toast({
          title: "Erreur de reconnaissance",
          description: "Utilisez la saisie manuelle ou réessayez plus tard.",
          variant: "destructive",
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('🔇 Reconnaissance terminée');
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Erreur démarrage:', error);
      setIsListening(false);
      toast({
        title: "Erreur de démarrage",
        description: "Impossible de démarrer la reconnaissance vocale. Utilisez la saisie manuelle.",
        variant: "destructive",
      });
      return null;
    }

    // Retourner une fonction pour arrêter la reconnaissance
    return () => {
      isActive = false;
      if (recognition) {
        recognition.stop();
      }
      setIsListening(false);
    };
  }, [isSupported, testNetworkConnectivity, checkMicrophonePermission, toast]);

  // Synthèse vocale
  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: "Non supporté",
        description: "La synthèse vocale n'est pas supportée par ce navigateur",
        variant: "destructive",
      });
      return;
    }

    setIsSpeaking(true);
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      toast({
        title: "Erreur de synthèse",
        description: "Impossible de lire le texte",
        variant: "destructive",
      });
    };

    window.speechSynthesis.speak(utterance);
  }, [toast]);

  // IA locale simple
  const processWithLocalAI = useCallback(async (transcription: string, type: 'extract' | 'nutrition' | 'question') => {
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (type === 'extract') {
        return extractMedicalData(transcription);
      } else if (type === 'nutrition') {
        return generateNutritionPlan(transcription);
      } else if (type === 'question') {
        return generateMedicalResponse(transcription);
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
    isListening,
    isProcessing,
    isSpeaking,
    isSupported: isSupported(),
    startListening,
    speak,
    processWithLocalAI
  };
};

// Fonctions d'IA locale simple
function extractMedicalData(text: string) {
  const lowerText = text.toLowerCase();
  
  const constantes: any = {};
  const diagnostic: any = {};
  const plan_nutritionnel: any = {};

  // Poids
  const poidsMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo|kilogramme)/);
  if (poidsMatch) constantes.poids = parseFloat(poidsMatch[1]);

  // Taille
  const tailleMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:cm|centimètre|mètre)/);
  if (tailleMatch) constantes.taille = parseFloat(tailleMatch[1]);

  // Diagnostic simple
  if (lowerText.includes('diabète') || lowerText.includes('diabétique')) {
    diagnostic.diabete_type2 = true;
  }
  if (lowerText.includes('surpoids') || lowerText.includes('obèse')) {
    diagnostic.surpoids = true;
  }
  if (lowerText.includes('hypertension') || lowerText.includes('tension')) {
    diagnostic.hypertension = true;
  }

  // Plan nutritionnel basique
  if (lowerText.includes('perte de poids') || lowerText.includes('maigrir')) {
    plan_nutritionnel.objectif = 'Perte de poids progressive';
    plan_nutritionnel.conseils_alimentaires = 'Réduire les portions, privilégier les légumes et protéines maigres';
  }

  return {
    constantes: Object.keys(constantes).length > 0 ? constantes : null,
    diagnostic: Object.keys(diagnostic).length > 0 ? diagnostic : null,
    plan_nutritionnel: Object.keys(plan_nutritionnel).length > 0 ? plan_nutritionnel : null
  };
}

function generateNutritionPlan(text: string) {
  const lowerText = text.toLowerCase();
  
  let plan = {
    objectif_principal: '',
    conseils_detailles: '',
    interdictions: '',
    complements: '',
    activite_physique: ''
  };

  if (lowerText.includes('diabète')) {
    plan.objectif_principal = 'Contrôle glycémique';
    plan.conseils_detailles = 'Éviter les sucres rapides, privilégier les féculents complets, fractionner les repas';
    plan.interdictions = 'Sucre blanc, sodas, pâtisseries';
    plan.activite_physique = 'Marche 30 min/jour';
  } else if (lowerText.includes('perte de poids')) {
    plan.objectif_principal = 'Perte de poids progressive';
    plan.conseils_detailles = 'Réduction calorique modérée, augmentation des légumes, portions contrôlées';
    plan.interdictions = 'Aliments frits, fast-food, sodas';
    plan.activite_physique = 'Cardio 3x/semaine + renforcement';
  } else {
    plan.objectif_principal = 'Équilibre nutritionnel';
    plan.conseils_detailles = 'Alimentation variée et équilibrée, 5 fruits et légumes par jour';
    plan.activite_physique = 'Activité physique régulière';
  }

  return plan;
}

function generateMedicalResponse(question: string): string {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('diabète')) {
    return 'Le diabète se caractérise par une glycémie élevée. Les signes incluent: soif excessive, mictions fréquentes, fatigue, vision floue. Un suivi médical régulier est essentiel.';
  } else if (lowerQuestion.includes('hypertension')) {
    return 'L\'hypertension est une pression artérielle élevée. Elle peut être asymptomatique mais augmente les risques cardiovasculaires. Le contrôle se fait par l\'alimentation, l\'exercice et parfois des médicaments.';
  } else if (lowerQuestion.includes('nutrition')) {
    return 'Une bonne nutrition comprend: 5 fruits et légumes par jour, féculents complets, protéines variées, limitation des sucres et graisses saturées, hydratation suffisante.';
  } else {
    return 'Je vous recommande de consulter un professionnel de santé pour une évaluation personnalisée de votre situation.';
  }
}
