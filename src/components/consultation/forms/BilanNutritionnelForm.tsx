
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ChartBar, Droplets, Clock, TestTube } from "lucide-react";

interface BilanNutritionnelFormProps {
  onDataChange: (data: any) => void;
  initialData?: any;
}

export function BilanNutritionnelForm({ onDataChange, initialData }: BilanNutritionnelFormProps) {
  const [formData, setFormData] = useState({
    rappel_alimentaire_24h: initialData?.rappel_alimentaire_24h || '',
    aliments_dominants: initialData?.aliments_dominants || '',
    frequence_repas: initialData?.frequence_repas || '',
    eau_quotidienne: initialData?.eau_quotidienne || 0,
    comportements_alimentaires: initialData?.comportements_alimentaires || '',
    tests_biologiques: initialData?.tests_biologiques || '',
    cholesterol: initialData?.cholesterol || '',
    glycemie: initialData?.glycemie || '',
    score_nutritionnel: initialData?.score_nutritionnel || 5,
    synthese_carences: initialData?.synthese_carences || ''
  });

  // Mettre à jour le formulaire quand les données IA arrivent
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Clock className="h-5 w-5" />
            Rappel Alimentaire 24h
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="rappel">Journal alimentaire détaillé</Label>
              <Textarea
                id="rappel"
                value={formData.rappel_alimentaire_24h}
                onChange={(e) => handleChange('rappel_alimentaire_24h', e.target.value)}
                placeholder="Petit-déjeuner: 7h - Pain + café + sucre&#10;Déjeuner: 13h - Riz + poisson + légumes&#10;Dîner: 19h - ..."
                className="min-h-[150px] border-green-200"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dominants">Types d'aliments dominants</Label>
                <Select onValueChange={(value) => handleChange('aliments_dominants', value)}>
                  <SelectTrigger className="border-green-200">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feculents">Féculents dominants</SelectItem>
                    <SelectItem value="sucres">Sucrés dominants</SelectItem>
                    <SelectItem value="gras">Gras dominants</SelectItem>
                    <SelectItem value="proteines">Protéines dominantes</SelectItem>
                    <SelectItem value="equilibre">Relativement équilibré</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="frequence">Fréquence des repas</Label>
                <Input
                  id="frequence"
                  value={formData.frequence_repas}
                  onChange={(e) => handleChange('frequence_repas', e.target.value)}
                  placeholder="3 repas + 2 collations"
                  className="border-green-200"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Droplets className="h-5 w-5" />
            Hydratation & Comportements
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="eau">Eau bue quotidiennement (litres)</Label>
              <div className="mt-2">
                <Slider
                  value={[formData.eau_quotidienne]}
                  onValueChange={(value) => handleChange('eau_quotidienne', value[0])}
                  max={4}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>0L</span>
                  <span className="font-medium text-blue-600">{formData.eau_quotidienne}L</span>
                  <span>4L</span>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="comportements">Comportements alimentaires</Label>
              <Textarea
                id="comportements"
                value={formData.comportements_alimentaires}
                onChange={(e) => handleChange('comportements_alimentaires', e.target.value)}
                placeholder="Grignotage, compulsions, stress eating, horaires irréguliers..."
                className="border-blue-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200">
        <CardHeader className="bg-purple-50">
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <TestTube className="h-5 w-5" />
            Tests Biologiques
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="tests">Tests disponibles</Label>
              <Textarea
                id="tests"
                value={formData.tests_biologiques}
                onChange={(e) => handleChange('tests_biologiques', e.target.value)}
                placeholder="Bilan sanguin, analyses récentes..."
                className="border-purple-200"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cholesterol">Cholestérol (mg/dl)</Label>
                <Input
                  id="cholesterol"
                  type="number"
                  value={formData.cholesterol}
                  onChange={(e) => handleChange('cholesterol', e.target.value)}
                  placeholder="200"
                  className="border-purple-200"
                />
              </div>
              <div>
                <Label htmlFor="glycemie">Glycémie (mg/dl)</Label>
                <Input
                  id="glycemie"
                  type="number"
                  value={formData.glycemie}
                  onChange={(e) => handleChange('glycemie', e.target.value)}
                  placeholder="90"
                  className="border-purple-200"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200">
        <CardHeader className="bg-orange-50">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <ChartBar className="h-5 w-5" />
            Évaluation Nutritionnelle
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="score">Score nutritionnel global (0-10)</Label>
              <div className="mt-2">
                <Slider
                  value={[formData.score_nutritionnel]}
                  onValueChange={(value) => handleChange('score_nutritionnel', value[0])}
                  max={10}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Très déséquilibré</span>
                  <span className="font-medium text-orange-600">{formData.score_nutritionnel}/10</span>
                  <span>Parfaitement équilibré</span>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="synthese">Synthèse des carences/déséquilibres</Label>
              <Textarea
                id="synthese"
                value={formData.synthese_carences}
                onChange={(e) => handleChange('synthese_carences', e.target.value)}
                placeholder="Carences identifiées, excès constatés, recommandations prioritaires..."
                className="border-orange-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
