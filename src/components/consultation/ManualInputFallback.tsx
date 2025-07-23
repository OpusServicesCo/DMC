import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Edit3, Send, Brain, AlertCircle, CheckCircle } from "lucide-react";

interface ManualInputFallbackProps {
  onTextSubmit: (text: string) => void;
  isProcessing?: boolean;
  placeholder?: string;
  title?: string;
}

export function ManualInputFallback({ 
  onTextSubmit, 
  isProcessing = false,
  placeholder = "Saisissez le journal alimentaire du patient...",
  title = "Saisie manuelle - Journal alimentaire"
}: ManualInputFallbackProps) {
  const [text, setText] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = () => {
    if (text.trim()) {
      onTextSubmit(text);
      setHasSubmitted(true);
    }
  };

  const handleTextChange = (value: string) => {
    setText(value);
    if (hasSubmitted) setHasSubmitted(false);
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Edit3 className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            La reconnaissance vocale n'est pas disponible. Utilisez la saisie manuelle pour décrire l'alimentation du patient.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={placeholder}
            rows={6}
            className="border-blue-200 focus:border-blue-400"
          />
          
          <div className="text-xs text-gray-600 bg-white p-2 rounded border">
            <strong>💡 Conseil :</strong> Soyez précis pour une meilleure analyse IA :
            <ul className="mt-1 ml-4 list-disc text-xs">
              <li>Mentionnez les horaires des repas</li>
              <li>Décrivez les quantités et types d'aliments</li>
              <li>Incluez les boissons et grignotages</li>
              <li>Notez les pathologies (diabète, hypertension, etc.)</li>
            </ul>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isProcessing || !text.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Brain className="mr-2 h-4 w-4 animate-spin" />
                🤖 Analyse IA en cours...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                👆 Analyser avec l'IA
              </>
            )}
          </Button>

          {hasSubmitted && !isProcessing && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Texte soumis pour analyse IA. Le formulaire va se remplir automatiquement.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center p-2 bg-white rounded border">
          <strong>Exemple de saisie :</strong><br />
          "Patient diabétique, 65 ans. Petit-déjeuner : café + pain beurre à 8h. 
          Déjeuner : riz + poisson + légumes à 13h. Dîner : soupe + viande à 19h. 
          Grignotage sucré l'après-midi. Boit 1L d'eau/jour. Glycémie ce matin : 1.4g/L."
        </div>
      </CardContent>
    </Card>
  );
}
