
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Brain, Target, AlertTriangle, CheckCircle, FileText, Printer } from 'lucide-react';

interface AIAnalysisResultsProps {
  analysis: {
    diagnostic_sugere: string;
    recommandations: string[];
    objectifs_smart: string[];
    alertes: string[];
  };
  onGenerateNutritionPlan?: () => void;
  onSaveConsultation?: () => void;
}

export function AIAnalysisResults({ 
  analysis, 
  onGenerateNutritionPlan, 
  onSaveConsultation 
}: AIAnalysisResultsProps) {
  
  return (
    <div className="space-y-4">
      {/* Diagnostic suggéré */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Brain className="h-5 w-5" />
            Diagnostic nutritionnel suggéré
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700">{analysis.diagnostic_sugere}</p>
        </CardContent>
      </Card>

      {/* Alertes */}
      {analysis.alertes.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Alertes importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.alertes.map((alerte, index) => (
                <li key={index} className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  {alerte}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommandations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Recommandations nutritionnelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.recommandations.map((recommandation, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{recommandation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Objectifs SMART */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Objectifs SMART
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.objectifs_smart.map((objectif, index) => (
              <Badge key={index} variant="outline" className="mr-2 mb-2 p-2 h-auto">
                {objectif}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={onGenerateNutritionPlan}
          className="flex-1"
          variant="default"
        >
          <FileText className="h-4 w-4 mr-2" />
          Générer le plan nutritionnel
        </Button>
        
        <Button 
          onClick={onSaveConsultation}
          className="flex-1"
          variant="outline"
        >
          <Printer className="h-4 w-4 mr-2" />
          Sauvegarder et imprimer
        </Button>
      </div>
    </div>
  );
}
