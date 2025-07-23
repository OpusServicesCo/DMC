
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ConsultationNutritionnelleForm } from '@/components/consultation/ConsultationNutritionnelleForm';
import { AIAnalysisResults } from '@/components/consultation/AIAnalysisResults';
import { NutritionPlanGenerator } from '@/components/consultation/NutritionPlanGenerator';
import { SmartNutritionAssistant } from '@/components/consultation/SmartNutritionAssistant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Calendar, FileText, Brain } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ConsultationNutritionnellePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patient');
  
  const [currentStep, setCurrentStep] = useState<'form' | 'analysis' | 'plan'>('form');
  const [consultationData, setConsultationData] = useState<any>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('consultation');

  // Mock patient data - en production, récupérer depuis l'API
  const patientInfo = {
    id: patientId,
    nom: 'Dupont',
    prenom: 'Marie',
    age: 35,
    sexe: 'F',
    poids: 75,
    taille: 165
  };

  const handleAnalysisComplete = (analysis: any) => {
    setAnalysisResults(analysis);
    setCurrentStep('analysis');
    setActiveTab('analysis');
  };

  const handleGenerateNutritionPlan = () => {
    setCurrentStep('plan');
    setActiveTab('plan');
  };

  const handleSaveConsultation = () => {
    // Logique de sauvegarde
    console.log('Sauvegarde consultation:', { consultationData, analysisResults });
    navigate('/consultations');
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Consultation nutritionnelle</h1>
              <div className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  {patientInfo.prenom} {patientInfo.nom}
                </span>
                <Badge variant="outline">{patientInfo.age} ans</Badge>
                <Badge variant="outline">{patientInfo.sexe === 'F' ? 'Femme' : 'Homme'}</Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        {/* Navigation par onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="consultation" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Consultation
            </TabsTrigger>
            <TabsTrigger value="ia-nutrition" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              IA Nutrition
            </TabsTrigger>
            <TabsTrigger 
              value="analysis" 
              disabled={!analysisResults}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Analyse IA
            </TabsTrigger>
            <TabsTrigger 
              value="plan" 
              disabled={currentStep !== 'plan'}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Plan nutritionnel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consultation" className="mt-6">
            <ConsultationNutritionnelleForm
              patientInfo={patientInfo}
              onDataExtracted={setConsultationData}
              onAIAnalysis={handleAnalysisComplete}
            />
          </TabsContent>

          <TabsContent value="ia-nutrition" className="mt-6">
            <SmartNutritionAssistant
              patientInfo={patientInfo}
              onAnalysisComplete={handleAnalysisComplete}
              initialData=""
            />
          </TabsContent>

          <TabsContent value="analysis" className="mt-6">
            {analysisResults && (
              <AIAnalysisResults
                analysis={analysisResults}
                onGenerateNutritionPlan={handleGenerateNutritionPlan}
                onSaveConsultation={handleSaveConsultation}
              />
            )}
          </TabsContent>

          <TabsContent value="plan" className="mt-6">
            <NutritionPlanGenerator
              patientInfo={patientInfo}
              analysisData={analysisResults}
              onPlanGenerated={(plan) => console.log('Plan généré:', plan)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
