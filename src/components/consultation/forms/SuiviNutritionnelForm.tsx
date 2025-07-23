
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TrendingUp, Target, AlertTriangle, CheckCircle } from "lucide-react";

interface SuiviNutritionnelFormProps {
  onDataChange: (data: any) => void;
  patientInfo: any;
  initialData?: any;
}

export function SuiviNutritionnelForm({ onDataChange, patientInfo, initialData }: SuiviNutritionnelFormProps) {
  const [formData, setFormData] = useState({
    poids_precedent: initialData?.poids_precedent || patientInfo?.dernierPoids || patientInfo?.poids || 70,
    poids_actuel: initialData?.poids_actuel || 0,
    imc_actuel: initialData?.imc_actuel || 0,
    respect_plan: initialData?.respect_plan || false,
    remarques_respect: initialData?.remarques_respect || '',
    difficultes_rencontrees: initialData?.difficultes_rencontrees || '',
    ressenti_patient: initialData?.ressenti_patient || '',
    evolution_positive: initialData?.evolution_positive || false,
    stagnation: initialData?.stagnation || false,
    regression: initialData?.regression || false,
    adaptations_proposees: initialData?.adaptations_proposees || '',
    nouveaux_conseils: initialData?.nouveaux_conseils || ''
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
    
    // Auto-calcul évolution et IMC
    if (field === 'poids_actuel') {
      const evolution = value - formData.poids_precedent;
      newData.evolution_positive = evolution < 0; // Perte = positif pour amaigrissement
      newData.stagnation = Math.abs(evolution) < 0.5;
      newData.regression = evolution > 1;
      
      // Auto-calcul IMC si taille disponible
      if (patientInfo?.taille && value > 0) {
        const imcCalcule = value / Math.pow(patientInfo.taille / 100, 2);
        newData.imc_actuel = Math.round(imcCalcule * 10) / 10;
      }
    }
    
    setFormData(newData);
    onDataChange(newData);
  };

  const calculerEvolution = () => {
    const evolution = formData.poids_actuel - formData.poids_precedent;
    return {
      difference: evolution,
      pourcentage: formData.poids_precedent > 0 ? (evolution / formData.poids_precedent * 100).toFixed(1) : 0
    };
  };

  const evolution = calculerEvolution();

  return (
    <div className="space-y-6">
      <Card className="border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <TrendingUp className="h-5 w-5" />
            Évolution des Mesures
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="precedent">Poids précédent (kg)</Label>
                <Input
                  id="precedent"
                  type="number"
                  step="0.1"
                  value={formData.poids_precedent}
                  onChange={(e) => handleChange('poids_precedent', parseFloat(e.target.value) || 0)}
                  className="border-green-200"
                />
              </div>
              <div>
                <Label htmlFor="actuel">Poids actuel (kg)</Label>
                <Input
                  id="actuel"
                  type="number"
                  step="0.1"
                  value={formData.poids_actuel || ''}
                  onChange={(e) => handleChange('poids_actuel', parseFloat(e.target.value) || 0)}
                  className="border-green-200"
                />
              </div>
              <div>
                <Label htmlFor="imc">IMC actuel</Label>
                <Input
                  id="imc"
                  type="number"
                  step="0.1"
                  value={formData.imc_actuel || ''}
                  onChange={(e) => handleChange('imc_actuel', parseFloat(e.target.value) || 0)}
                  className="border-green-200 bg-gray-50"
                  readOnly
                  placeholder="Calculé automatiquement"
                />
              </div>
            </div>
            
            {formData.poids_actuel > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Évolution automatique :</h4>
                <div className={`text-lg font-semibold ${evolution.difference < 0 ? 'text-green-600' : evolution.difference > 0 ? 'text-red-600' : 'text-orange-600'}`}>
                  {evolution.difference > 0 ? '+' : ''}{evolution.difference.toFixed(1)} kg
                  ({evolution.difference > 0 ? '+' : ''}{evolution.pourcentage}%)
                </div>
                <div className="flex gap-2 mt-2">
                  {evolution.difference < -0.5 && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">✅ Progression positive</span>}
                  {Math.abs(evolution.difference) < 0.5 && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">⚡ Stagnation</span>}
                  {evolution.difference > 1 && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">⚠️ Régression</span>}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Target className="h-5 w-5" />
            Respect du Plan Nutritionnel
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="respect"
                checked={formData.respect_plan}
                onCheckedChange={(checked) => handleChange('respect_plan', checked)}
              />
              <Label htmlFor="respect" className="font-medium">
                Le patient a respecté le plan nutritionnel
              </Label>
            </div>
            <div>
              <Label htmlFor="remarques_respect">Remarques sur le respect</Label>
              <Textarea
                id="remarques_respect"
                value={formData.remarques_respect}
                onChange={(e) => handleChange('remarques_respect', e.target.value)}
                placeholder="Écarts constatés, difficultés d'application..."
                className="border-blue-200"
              />
            </div>
            <div>
              <Label htmlFor="difficultes">Difficultés rencontrées</Label>
              <Textarea
                id="difficultes"
                value={formData.difficultes_rencontrees}
                onChange={(e) => handleChange('difficultes_rencontrees', e.target.value)}
                placeholder="Problèmes pratiques, contraintes sociales, manque de temps..."
                className="border-blue-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200">
        <CardHeader className="bg-purple-50">
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <CheckCircle className="h-5 w-5" />
            Ressenti & Adaptations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="ressenti">Ressenti du patient sur sa progression</Label>
              <Select onValueChange={(value) => handleChange('ressenti_patient', value)}>
                <SelectTrigger className="border-purple-200">
                  <SelectValue placeholder="Évaluer le ressenti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tres_satisfait">Très satisfait</SelectItem>
                  <SelectItem value="satisfait">Satisfait</SelectItem>
                  <SelectItem value="mitige">Mitigé</SelectItem>
                  <SelectItem value="decu">Déçu</SelectItem>
                  <SelectItem value="decourage">Découragé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="adaptations">Adaptations proposées</Label>
              <Textarea
                id="adaptations"
                value={formData.adaptations_proposees}
                onChange={(e) => handleChange('adaptations_proposees', e.target.value)}
                placeholder="Modifications du plan, nouveaux objectifs..."
                className="border-purple-200"
              />
            </div>
            <div>
              <Label htmlFor="conseils">Nouveaux conseils</Label>
              <Textarea
                id="conseils"
                value={formData.nouveaux_conseils}
                onChange={(e) => handleChange('nouveaux_conseils', e.target.value)}
                placeholder="Conseils supplémentaires, encouragements..."
                className="border-purple-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
