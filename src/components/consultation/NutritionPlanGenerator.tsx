
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Apple, Clock, ChefHat, Info, Download, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NutritionPlanGeneratorProps {
  patientInfo?: any;
  analysisData?: any;
  onPlanGenerated?: (plan: any) => void;
}

export function NutritionPlanGenerator({ 
  patientInfo, 
  analysisData, 
  onPlanGenerated 
}: NutritionPlanGeneratorProps) {
  const [planGenerated, setPlanGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const [nutritionPlan] = useState({
    objectif_principal: "Perte de poids progressive et rééquilibrage alimentaire",
    duree_programme: "3 mois",
    objectif_calorique: "1800 kcal/jour",
    repartition_macros: {
      glucides: "45%",
      proteines: "25%", 
      lipides: "30%"
    },
    plan_hebdomadaire: {
      petit_dejeuner: [
        "Flocons d'avoine (50g) + lait écrémé (200ml) + fruits rouges (80g)",
        "Pain complet (2 tranches) + avocat (1/2) + œuf poché",
        "Yaourt grec nature + muesli sans sucre + banane"
      ],
      dejeuner: [
        "Salade quinoa + légumes + poisson blanc (120g) + vinaigrette olive",
        "Riz brun + légumes vapeur + poulet grillé (100g)",
        "Lentilles + légumes verts + fromage de chèvre"
      ],
      diner: [
        "Soupe de légumes + omelette aux herbes + salade verte",
        "Poisson gras (saumon 100g) + brocolis + patate douce",
        "Tofu sauté + légumes asiatiques + quinoa"
      ],
      collations: [
        "Pomme + amandes (15g)",
        "Yaourt nature + fruits",
        "Carotte + houmous"
      ]
    },
    conseils_specifiques: [
      "Boire 1.5L d'eau minimum par jour",
      "Éviter les sucres raffinés et boissons sucrées",
      "Privilégier les cuissons vapeur, grillées ou en papillote",
      "Manger lentement et mastiquer correctement",
      "Fractionner en 5-6 prises alimentaires"
    ],
    suivi_recommande: "Consultation de suivi dans 3 semaines"
  });

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      // Simulation génération IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPlanGenerated(true);
      onPlanGenerated?.(nutritionPlan);
      
      toast({
        title: "✨ Plan nutritionnel généré",
        description: "Plan personnalisé créé avec succès !",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le plan.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  if (!planGenerated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-green-600" />
            Génération du plan nutritionnel
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Apple className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Plan nutritionnel personnalisé</h3>
          <p className="text-gray-600 mb-6">
            L'IA va créer un plan alimentaire adapté au diagnostic et aux objectifs du patient
          </p>
          <Button 
            onClick={handleGeneratePlan}
            disabled={generating}
            size="lg"
          >
            <ChefHat className={`h-5 w-5 mr-2 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Génération en cours...' : 'Générer le plan nutritionnel'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête du plan */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <ChefHat className="h-5 w-5" />
            Plan nutritionnel personnalisé
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{nutritionPlan.objectif_calorique}</Badge>
            <Badge variant="outline">{nutritionPlan.duree_programme}</Badge>
            <Badge variant="outline">Suivi: {nutritionPlan.suivi_recommande}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-green-700 text-lg">{nutritionPlan.objectif_principal}</p>
        </CardContent>
      </Card>

      {/* Répartition des macronutriments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Répartition nutritionnelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{nutritionPlan.repartition_macros.glucides}</div>
              <div className="text-sm text-gray-600">Glucides</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{nutritionPlan.repartition_macros.proteines}</div>
              <div className="text-sm text-gray-600">Protéines</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{nutritionPlan.repartition_macros.lipides}</div>
              <div className="text-sm text-gray-600">Lipides</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan alimentaire détaillé */}
      <Card>
        <CardHeader>
          <CardTitle>Plan alimentaire hebdomadaire</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="petit-dejeuner" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="petit-dejeuner">Petit-déj</TabsTrigger>
              <TabsTrigger value="dejeuner">Déjeuner</TabsTrigger>
              <TabsTrigger value="diner">Dîner</TabsTrigger>
              <TabsTrigger value="collations">Collations</TabsTrigger>
            </TabsList>

            <TabsContent value="petit-dejeuner" className="mt-4">
              <div className="space-y-3">
                {nutritionPlan.plan_hebdomadaire.petit_dejeuner.map((meal, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Option {index + 1}</span>
                    </div>
                    <p className="text-sm">{meal}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="dejeuner" className="mt-4">
              <div className="space-y-3">
                {nutritionPlan.plan_hebdomadaire.dejeuner.map((meal, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Option {index + 1}</span>
                    </div>
                    <p className="text-sm">{meal}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="diner" className="mt-4">
              <div className="space-y-3">
                {nutritionPlan.plan_hebdomadaire.diner.map((meal, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Option {index + 1}</span>
                    </div>
                    <p className="text-sm">{meal}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="collations" className="mt-4">
              <div className="space-y-3">
                {nutritionPlan.plan_hebdomadaire.collations.map((snack, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Apple className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Collation {index + 1}</span>
                    </div>
                    <p className="text-sm">{snack}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Conseils spécifiques */}
      <Card>
        <CardHeader>
          <CardTitle>Conseils personnalisés</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {nutritionPlan.conseils_specifiques.map((conseil, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">{conseil}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Télécharger le plan
        </Button>
        <Button variant="outline" className="flex-1">
          <Share className="h-4 w-4 mr-2" />
          Partager avec le patient
        </Button>
      </div>
    </div>
  );
}
