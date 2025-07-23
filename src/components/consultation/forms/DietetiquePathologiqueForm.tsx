
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Pill, AlertTriangle, FileText } from "lucide-react";

interface DietetiquePathologiqueFormProps {
  onDataChange: (data: any) => void;
}

export function DietetiquePathologiqueForm({ onDataChange }: DietetiquePathologiqueFormProps) {
  const [formData, setFormData] = useState({
    type_pathologie: '',
    pathologie_autre: '',
    traitements_cours: '',
    restrictions_alimentaires: '',
    habitudes_vs_recommandations: '',
    glycemie_actuelle: '',
    tension_actuelle: '',
    cholesterol_actuel: '',
    autres_constantes: '',
    plan_alimentaire_personnalise: '',
    medicaments_compatibles: true,
    suivi_medical_regulier: false,
    remarques_medecin: ''
  });

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
  };

  const pathologies = [
    { value: 'diabete_type1', label: 'Diabète Type 1' },
    { value: 'diabete_type2', label: 'Diabète Type 2' },
    { value: 'hypertension', label: 'Hypertension artérielle' },
    { value: 'hypercholesterolemie', label: 'Hypercholestérolémie' },
    { value: 'insuffisance_renale', label: 'Insuffisance rénale' },
    { value: 'maladie_cardiovasculaire', label: 'Maladie cardiovasculaire' },
    { value: 'hepatite', label: 'Hépatite/Problème hépatique' },
    { value: 'autre', label: 'Autre pathologie' }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center gap-2 text-red-800">
            <Heart className="h-5 w-5" />
            Pathologie Diagnostiquée
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="pathologie">Type de pathologie</Label>
              <Select onValueChange={(value) => handleChange('type_pathologie', value)}>
                <SelectTrigger className="border-red-200">
                  <SelectValue placeholder="Sélectionner la pathologie" />
                </SelectTrigger>
                <SelectContent>
                  {pathologies.map((path) => (
                    <SelectItem key={path.value} value={path.value}>
                      {path.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {formData.type_pathologie === 'autre' && (
              <div>
                <Label htmlFor="autre">Spécifier la pathologie</Label>
                <Input
                  id="autre"
                  value={formData.pathologie_autre}
                  onChange={(e) => handleChange('pathologie_autre', e.target.value)}
                  placeholder="Préciser la pathologie..."
                  className="border-red-200"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="traitements">Traitements en cours</Label>
              <Textarea
                id="traitements"
                value={formData.traitements_cours}
                onChange={(e) => handleChange('traitements_cours', e.target.value)}
                placeholder="Médicaments, posologies, durée de traitement..."
                className="border-red-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200">
        <CardHeader className="bg-orange-50">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-5 w-5" />
            Restrictions & Recommandations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="restrictions">Restrictions alimentaires recommandées</Label>
              <Textarea
                id="restrictions"
                value={formData.restrictions_alimentaires}
                onChange={(e) => handleChange('restrictions_alimentaires', e.target.value)}
                placeholder="Aliments interdits, limitations de sel, sucre, graisses..."
                className="border-orange-200"
              />
            </div>
            <div>
              <Label htmlFor="habitudes">Habitudes actuelles VS recommandations</Label>
              <Textarea
                id="habitudes"
                value={formData.habitudes_vs_recommandations}
                onChange={(e) => handleChange('habitudes_vs_recommandations', e.target.value)}
                placeholder="Écarts constatés entre les habitudes du patient et les recommandations médicales..."
                className="border-orange-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Pill className="h-5 w-5" />
            Suivi des Constantes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="glycemie">Glycémie actuelle (mg/dl)</Label>
                <Input
                  id="glycemie"
                  type="number"
                  value={formData.glycemie_actuelle}
                  onChange={(e) => handleChange('glycemie_actuelle', e.target.value)}
                  placeholder="90"
                  className="border-blue-200"
                />
              </div>
              <div>
                <Label htmlFor="tension">Tension artérielle</Label>
                <Input
                  id="tension"
                  value={formData.tension_actuelle}
                  onChange={(e) => handleChange('tension_actuelle', e.target.value)}
                  placeholder="120/80"
                  className="border-blue-200"
                />
              </div>
              <div>
                <Label htmlFor="cholesterol">Cholestérol total (mg/dl)</Label>
                <Input
                  id="cholesterol"
                  type="number"
                  value={formData.cholesterol_actuel}
                  onChange={(e) => handleChange('cholesterol_actuel', e.target.value)}
                  placeholder="200"
                  className="border-blue-200"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="autres_constantes">Autres constantes</Label>
              <Textarea
                id="autres_constantes"
                value={formData.autres_constantes}
                onChange={(e) => handleChange('autres_constantes', e.target.value)}
                placeholder="Créatinine, HbA1c, autres paramètres spécifiques..."
                className="border-blue-200"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="medicaments"
                  checked={formData.medicaments_compatibles}
                  onCheckedChange={(checked) => handleChange('medicaments_compatibles', checked)}
                />
                <Label htmlFor="medicaments">
                  Les recommandations nutritionnelles sont compatibles avec les médicaments
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="suivi"
                  checked={formData.suivi_medical_regulier}
                  onCheckedChange={(checked) => handleChange('suivi_medical_regulier', checked)}
                />
                <Label htmlFor="suivi">
                  Patient sous suivi médical régulier
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <FileText className="h-5 w-5" />
            Plan Alimentaire Personnalisé
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="plan">Élaboration du plan alimentaire</Label>
              <Textarea
                id="plan"
                value={formData.plan_alimentaire_personnalise}
                onChange={(e) => handleChange('plan_alimentaire_personnalise', e.target.value)}
                placeholder="Menu type adapté à la pathologie, horaires, quantités, alternatives..."
                className="min-h-[120px] border-green-200"
              />
            </div>
            <div>
              <Label htmlFor="remarques">Remarques du médecin</Label>
              <Textarea
                id="remarques"
                value={formData.remarques_medecin}
                onChange={(e) => handleChange('remarques_medecin', e.target.value)}
                placeholder="Observations particulières, points d'attention, coordination avec autres spécialistes..."
                className="border-green-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
