
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Brain, MessageSquare, Volume2, VolumeX, AlertCircle, Wifi, WifiOff, Keyboard, RefreshCw } from 'lucide-react';
import { useBrowserSpeech } from '@/hooks/useBrowserSpeech';
import { Textarea } from '@/components/ui/textarea';

interface VoiceInterfaceProps {
  onDataExtracted: (data: any) => void;
  onNutritionSuggested: (data: any) => void;
  patientInfo?: any;
  className?: string;
}

export function VoiceInterface({ 
  onDataExtracted, 
  onNutritionSuggested, 
  patientInfo,
  className = ""
}: VoiceInterfaceProps) {
  const [transcription, setTranscription] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [manualMode, setManualMode] = useState(false);
  const stopListeningRef = useRef<(() => void) | null>(null);
  
  const {
    isListening,
    isProcessing,
    isSpeaking,
    isSupported,
    startListening,
    speak,
    processWithLocalAI
  } = useBrowserSpeech();

  // Test de connectivité réseau
  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      setConnectionStatus('online');
    } catch {
      setConnectionStatus('offline');
    }
  };

  // Vérifier le statut de connexion
  useEffect(() => {
    const updateConnectionStatus = () => {
      if (navigator.onLine) {
        checkConnection();
      } else {
        setConnectionStatus('offline');
      }
    };

    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', () => setConnectionStatus('offline'));
    updateConnectionStatus();

    return () => {
      window.removeEventListener('online', updateConnectionStatus);
      window.removeEventListener('offline', () => setConnectionStatus('offline'));
      if (stopListeningRef.current) {
        stopListeningRef.current();
      }
    };
  }, []);

  const handleStartListening = async () => {
    const stopFunction = await startListening((text) => {
      setTranscription(prev => prev + (prev ? ' ' : '') + text);
    });
    if (stopFunction) {
      stopListeningRef.current = stopFunction;
    }
  };

  const handleStopListening = () => {
    if (stopListeningRef.current) {
      stopListeningRef.current();
      stopListeningRef.current = null;
    }
  };

  const handleExtractData = async () => {
    if (!transcription.trim()) return;
    
    const extractedData = await processWithLocalAI(transcription, 'extract');
    if (extractedData) {
      onDataExtracted(extractedData);
    }
  };

  const handleSuggestNutrition = async () => {
    if (!transcription.trim()) return;
    
    const nutritionData = await processWithLocalAI(transcription, 'nutrition');
    if (nutritionData) {
      onNutritionSuggested(nutritionData);
    }
  };

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    
    const response = await processWithLocalAI(aiQuestion, 'question');
    if (response && typeof response === 'string') {
      speak(response);
    }
  };

  const clearTranscription = () => {
    setTranscription('');
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Assistant vocal non supporté par ce navigateur</p>
            <p className="text-sm">Utilisez Chrome, Firefox ou Safari récent</p>
            <Button 
              onClick={() => setManualMode(true)} 
              variant="outline" 
              className="mt-3"
            >
              <Keyboard className="h-4 w-4 mr-2" />
              Mode saisie manuelle
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-medical-600" />
            Assistant IA Vocal (Local)
          </h3>
          <div className="flex gap-2">
            {connectionStatus === 'checking' && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Test...
              </Badge>
            )}
            {connectionStatus === 'offline' && (
              <Badge variant="destructive" className="animate-pulse">
                <WifiOff className="h-3 w-3 mr-1" />
                Hors ligne
              </Badge>
            )}
            {connectionStatus === 'online' && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Wifi className="h-3 w-3 mr-1" />
                Connecté
              </Badge>
            )}
            {isListening && (
              <Badge variant="secondary" className="bg-red-100 text-red-800 animate-pulse">
                <Mic className="h-3 w-3 mr-1" />
                Écoute...
              </Badge>
            )}
            {isProcessing && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Analyse...
              </Badge>
            )}
            {isSpeaking && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Volume2 className="h-3 w-3 mr-1" />
                Vocal
              </Badge>
            )}
          </div>
        </div>

        {/* Alertes de statut */}
        {connectionStatus === 'offline' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Mode hors ligne</p>
                <p className="text-xs">La reconnaissance vocale nécessite une connexion internet. Utilisez la saisie manuelle.</p>
                <Button 
                  onClick={checkConnection} 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Tester la connexion
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Boutons de contrôle */}
        <div className="flex gap-2 items-center">
          <Button
            onClick={() => setManualMode(!manualMode)}
            variant="outline"
            size="sm"
          >
            <Keyboard className="h-4 w-4 mr-2" />
            {manualMode ? 'Mode vocal' : 'Mode saisie'}
          </Button>
          
          {!manualMode && connectionStatus === 'online' && (
            <>
              <Button
                onClick={isListening ? handleStopListening : handleStartListening}
                variant={isListening ? "destructive" : "default"}
                size="lg"
                className="flex-1"
                disabled={isProcessing}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Arrêter l'écoute
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Commencer l'écoute
                  </>
                )}
              </Button>
              
              {isSpeaking && (
                <Button
                  onClick={stopSpeaking}
                  variant="outline"
                  size="lg"
                >
                  <VolumeX className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>

        {/* Zone de transcription/saisie */}
        <div className="space-y-3">
          {manualMode || connectionStatus === 'offline' ? (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Saisissez votre texte:</p>
              <Textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                placeholder="Décrivez les symptômes, constantes vitales, ou posez une question médicale..."
                className="min-h-[120px]"
              />
            </div>
          ) : transcription ? (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Transcription:</p>
              <p className="text-gray-900">{transcription}</p>
            </div>
          ) : null}

          {transcription && (
            <>
              <div className="flex gap-2">
                <Button
                  onClick={clearTranscription}
                  variant="outline"
                  size="sm"
                >
                  Effacer
                </Button>
              </div>

              {/* Actions IA */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleExtractData}
                  variant="outline"
                  disabled={isProcessing}
                  className="text-sm"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Extraire les données
                </Button>
                
                <Button
                  onClick={handleSuggestNutrition}
                  variant="outline"
                  disabled={isProcessing}
                  className="text-sm"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Plan nutritionnel
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Interface de question à l'IA */}
        <div className="space-y-2 border-t pt-4">
          <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Poser une question à l'IA:
          </p>
          <div className="flex gap-2">
            <Textarea
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="Ex: Quels sont les signes de diabète de type 2 ?"
              className="flex-1 min-h-0 h-10"
              rows={1}
            />
            <Button
              onClick={handleAskAI}
              disabled={!aiQuestion.trim() || isProcessing}
              size="sm"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Info sur les technologies utilisées */}
        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
          💡 <strong>IA Locale:</strong> Reconnaissance vocale navigateur + traitement local
          {connectionStatus === 'offline' && (
            <div className="mt-1 text-red-600">
              ⚠️ Mode hors ligne - Saisie manuelle disponible
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
