
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Activity, TrendingUp, Heart, Brain } from 'lucide-react';

interface ConsultationTypeSelectorProps {
  onTypeSelected: (type: string) => void;
  onBack: () => void;
}

export function ConsultationTypeSelector({ onTypeSelected, onBack }: ConsultationTypeSelectorProps) {
  const consultationTypes = [
    {
      id: 'consultation_initiale',
      title: 'Consultation initiale',
      description: 'Évaluation complète du patient',
      details: 'Première consultation avec prise de mesures complètes, évaluation des habitudes alimentaires et diagnostic nutritionnel de base.',
      icon: User,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      badge: 'Nouveau patient'
    },
    {
      id: 'bilan_nutritionnel',
      title: 'Bilan nutritionnel',
      description: 'Analyse approfondie des habitudes',
      details: 'Évaluation détaillée du comportement alimentaire, des carences et des déséquilibres nutritionnels.',
      icon: Activity,
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
      badge: 'Analyse complète'
    },
    {
      id: 'suivi_nutritionnel',
      title: 'Suivi nutritionnel',
      description: 'Contrôle de l\'évolution',
      details: 'Suivi des progrès, ajustement du plan alimentaire et renforcement des conseils personnalisés.',
      icon: TrendingUp,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      badge: 'Suivi'
    },
    {
      id: 'dietetique_pathologie',
      title: 'Diététique pathologique',
      description: 'Nutrition adaptée aux maladies',
      details: 'Nutrition thérapeutique pour diabète, hypertension, cholestérol, maladies cardiovasculaires, etc.',
      icon: Heart,
      color: 'bg-red-50 hover:bg-red-100 border-red-200',
      badge: 'Médical'
    },
    {
      id: 'trouble_comportement_alimentaire',
      title: 'Troubles alimentaires',
      description: 'Prise en charge spécialisée',
      details: 'Accompagnement pour anorexie, boulimie, grignotage compulsif et autres troubles du comportement alimentaire.',
      icon: Brain,
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
      badge: 'Spécialisé'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Type de consultation nutritionnelle</h2>
          <p className="text-gray-600 mt-1">Choisissez le type de consultation adapté au patient</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {consultationTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${type.color}`}
              onClick={() => onTypeSelected(type.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <Icon className="h-8 w-8 text-gray-700" />
                  <Badge variant="secondary" className="text-xs">
                    {type.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{type.title}</CardTitle>
                <p className="text-sm text-gray-600 font-medium">{type.description}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {type.details}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 rounded-full p-2">
            <Brain className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-blue-900">Assistant IA intégré</h3>
            <p className="text-sm text-blue-700 mt-1">
              L'IA vous aidera automatiquement pendant la consultation avec des suggestions personnalisées, 
              l'analyse des données et la génération de plans nutritionnels adaptés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
