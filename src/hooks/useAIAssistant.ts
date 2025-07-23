
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAIAssistant = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const handleAPIError = (error: any, action: string) => {
    console.error(`${action} error:`, error);
    
    let title = `Erreur ${action}`;
    let description = error.message || `Impossible de ${action}`;
    
    // Détection spécifique des erreurs OpenAI
    if (error.message?.includes('quota') || error.message?.includes('insufficient_quota')) {
      title = "Quota OpenAI dépassé";
      description = "Votre quota OpenAI est insuffisant. Veuillez vérifier votre compte OpenAI et ajouter du crédit.";
    } else if (error.message?.includes('non-2xx status code')) {
      title = "Erreur de service";
      description = "Service temporairement indisponible. Veuillez réessayer dans quelques minutes.";
    } else if (error.message?.includes('rate_limit')) {
      title = "Limite de taux atteinte";
      description = "Trop de requêtes. Veuillez patienter quelques secondes avant de réessayer.";
    }
    
    toast({
      title,
      description,
      variant: "destructive",
    });
  };

  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    setIsTranscribing(true);
    try {
      console.log('🎤 Transcription audio - Taille:', audioBlob.size, 'bytes');
      
      // Optimisation : réduire la taille si nécessaire
      let processedBlob = audioBlob;
      if (audioBlob.size > 25 * 1024 * 1024) { // Si > 25MB
        toast({
          title: "Fichier trop volumineux",
          description: "Le fichier audio est trop grand. Veuillez enregistrer un message plus court.",
          variant: "destructive",
        });
        return '';
      }

      // Convert blob to base64
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(processedBlob);
      });

      const { data, error } = await supabase.functions.invoke('voice-transcription', {
        body: { 
          audio: base64Audio,
          model: 'whisper-1',
          language: 'fr',
          prompt: 'Ceci est une consultation médicale en français avec du vocabulaire médical et nutritionnel.'
        }
      });

      if (error) throw error;
      
      console.log('✅ Transcription réussie:', data.text?.substring(0, 100) + '...');
      return data.text || '';
    } catch (error: any) {
      handleAPIError(error, 'de transcription');
      return '';
    } finally {
      setIsTranscribing(false);
    }
  };

  const extractConsultationData = async (transcription: string, patientInfo?: any) => {
    setIsProcessing(true);
    try {
      console.log('🧠 Analyse IA - Extraction des données:', transcription.substring(0, 100) + '...');
      
      const { data, error } = await supabase.functions.invoke('ai-consultation-assistant', {
        body: { 
          transcription, 
          patientInfo,
          action: 'extract_data',
          model: 'gpt-4o', // Modèle plus puissant pour l'extraction
          temperature: 0.1, // Plus de précision
          context: {
            previousData: patientInfo,
            medicalSpecialty: 'nutrition',
            language: 'fr'
          }
        }
      });

      if (error) throw error;
      
      console.log('✅ Données extraites avec succès');
      return data.result;
    } catch (error: any) {
      handleAPIError(error, "d'analyse IA");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const suggestNutritionPlan = async (transcription: string, patientInfo?: any) => {
    setIsProcessing(true);
    try {
      console.log('🍎 Génération plan nutritionnel IA');
      
      const { data, error } = await supabase.functions.invoke('ai-consultation-assistant', {
        body: { 
          transcription, 
          patientInfo,
          action: 'suggest_nutrition',
          model: 'gpt-4o',
          temperature: 0.3, // Balance entre créativité et précision
          context: {
            medicalHistory: patientInfo?.antecedents || '',
            currentWeight: patientInfo?.poids || null,
            currentHeight: patientInfo?.taille || null,
            age: patientInfo?.age || null,
            sex: patientInfo?.sexe || null,
            specialty: 'nutritionist'
          }
        }
      });

      if (error) throw error;
      
      console.log('✅ Plan nutritionnel généré');
      return data.result;
    } catch (error: any) {
      handleAPIError(error, "de suggestion nutritionnelle");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const getVoiceResponse = async (question: string, context?: any) => {
    setIsProcessing(true);
    try {
      console.log('🗣️ Génération réponse vocale IA');
      
      const { data, error } = await supabase.functions.invoke('ai-consultation-assistant', {
        body: { 
          transcription: question,
          action: 'voice_response',
          model: 'gpt-4o',
          temperature: 0.7, // Plus naturel pour la conversation
          context: {
            conversationHistory: context?.history || [],
            currentPatient: context?.patient || null,
            medicalContext: context?.medical || null,
            responseStyle: 'professional_friendly'
          }
        }
      });

      if (error) throw error;
      
      console.log('✅ Réponse vocale générée');
      return data.result;
    } catch (error: any) {
      handleAPIError(error, "de réponse vocale");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = async (text: string, voice: string = 'alloy') => {
    setIsSpeaking(true);
    try {
      console.log('🔊 Synthèse vocale TTS - Texte:', text.substring(0, 50) + '...');
      
      if (text.length > 4000) {
        // Diviser le texte en segments plus petits
        const segments = text.match(/.{1,3000}(?:\s|$)/g) || [text];
        
        for (const segment of segments) {
          const { data, error } = await supabase.functions.invoke('text-to-speech', {
            body: { 
              text: segment.trim(), 
              voice,
              model: 'tts-1-hd', // Meilleure qualité
              speed: 0.9 // Légèrement plus lent pour la clarté
            }
          });

          if (error) throw error;
          
          // Play the audio segment
          const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
          await new Promise((resolve, reject) => {
            audio.onended = resolve;
            audio.onerror = reject;
            audio.play();
          });
        }
      } else {
        const { data, error } = await supabase.functions.invoke('text-to-speech', {
          body: { 
            text, 
            voice,
            model: 'tts-1-hd',
            speed: 0.9
          }
        });

        if (error) throw error;
        
        // Play the audio
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        await new Promise((resolve, reject) => {
          audio.onended = resolve;
          audio.onerror = reject;
          audio.play();
        });
      }
      
      console.log('✅ Synthèse vocale terminée');
    } catch (error: any) {
      handleAPIError(error, "de synthèse vocale");
    } finally {
      setIsSpeaking(false);
    }
  };

  const generateMedicalSummary = async (consultationData: any) => {
    setIsProcessing(true);
    try {
      console.log('📋 Génération résumé médical');
      
      const { data, error } = await supabase.functions.invoke('ai-consultation-assistant', {
        body: { 
          transcription: JSON.stringify(consultationData),
          action: 'generate_summary',
          model: 'gpt-4o',
          temperature: 0.2,
          context: {
            summaryType: 'medical_consultation',
            includeRecommendations: true,
            language: 'fr'
          }
        }
      });

      if (error) throw error;
      
      return data.result;
    } catch (error: any) {
      handleAPIError(error, "de génération de résumé");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzePatientRisk = async (patientData: any) => {
    setIsProcessing(true);
    try {
      console.log('⚡ Analyse des risques patient');
      
      const { data, error } = await supabase.functions.invoke('ai-consultation-assistant', {
        body: { 
          transcription: JSON.stringify(patientData),
          action: 'risk_analysis',
          model: 'gpt-4o',
          temperature: 0.1,
          context: {
            analysisType: 'nutritional_risk_assessment',
            includePreventiveMeasures: true
          }
        }
      });

      if (error) throw error;
      
      return data.result;
    } catch (error: any) {
      handleAPIError(error, "d'analyse des risques");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    isTranscribing,
    isSpeaking,
    transcribeAudio,
    extractConsultationData,
    suggestNutritionPlan,
    getVoiceResponse,
    speakText,
    generateMedicalSummary,
    analyzePatientRisk
  };
};
