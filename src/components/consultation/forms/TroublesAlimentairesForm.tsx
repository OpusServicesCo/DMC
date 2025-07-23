
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Brain, AlertCircle, Target, Lock } from "lucide-react";

interface TroublesAlimentairesFormProps {
  onDataChange: (data: any) => void;
}

export function TroublesAlimentairesForm({ onDataChange }: TroublesAlimentairesFormProps) {
  const [formData, setFormData] = useState({
    type_trouble: '',
    trouble_autre: '',
    frequence_crises: '',
    declencheurs_emotionnels: '',
    perception_corporelle: '',
    niveau_anxiete: 5,
    objectifs_therapeutiques: '',
    strategies_coping: '',
    suivi_emotionnel: '',
    support_familial: '',
    remarques_confidentielles: ''
  });

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
  };

  const typesProblemes = [
    { value: 'anorexie', label: 'Anorexie mentale' },
    { value: 'boulimie', label: 'Boulimie' },
    { value: 'compulsions', label: 'Compulsions alimentaires' },
    { value: 'grignotage', label: 'Grignotage compulsif' },
    { value: 'orthorexie', label: 'Orthorexie' },
    { value: 'trouble_mixte', label: 'Trouble mixte' },
    { value: 'autre', label: 'Autre trouble' }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-pink-200">
        <CardHeader className="bg-pink-50">
          <CardTitle className="flex items-center gap-2 text-pink-800">
            <Brain className="h-5 w-5" />
            Type de Trouble Alimentaire
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Type de trouble identifié</Label>
              <Select onValueChange={(value) => handleChange('type_trouble', value)}>
                <SelectTrigger className="border-pink-200">
                  <SelectValue placeholder="Sélectionner le type de trouble" />
                </SelectTrigger>
                <SelectContent>
                  {typesProblemes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {formData.type_trouble === 'autre' && (
              <div>
                <Label htmlFor="autre">Spécifier le trouble</Label>
                <Input
                  id="autre"
                  value={formData.trouble_autre}
                  onChange={(e) => handleChange('trouble_autre', e.target.value)}
                  placeholder="Décrire le trouble spécifique..."
                  className="border-pink-200"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="frequence">Fréquence des crises/épisodes</Label>
              <Select onValueChange={(value) => handleChange('frequence_crises', value)}>
                <SelectTrigger className="border-pink-200">
                  <SelectValue placeholder="Évaluer la fréquence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quotidienne">Quotidienne</SelectItem>
                  <SelectItem value="plusieurs_semaine">Plusieurs fois par semaine</SelectItem>
                  <SelectItem value="hebdomadaire">Hebdomadaire</SelectItem>
                  <SelectItem value="mensuelle">Mensuelle</SelectItem>
                  <SelectItem value="rare">Rare/ponctuelle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200">
        <CardHeader className="bg-orange-50">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="h-5 w-5" />
            Déclencheurs & Perception
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="declencheurs">Déclencheurs émotionnels identifiés</Label>
              <Textarea
                id="declencheurs"
                value={formData.declencheurs_emotionnels}
                onChange={(e) => handleChange('declencheurs_emotionnels', e.target.value)}
                placeholder="Stress, anxiété, conflits familiaux, échecs, solitude..."
                className="border-orange-200"
              />
            </div>
            <div>
              <Label htmlFor="perception">Perception du corps / Image corporelle</Label>
              <Textarea
                id="perception"
                value={formData.perception_corporelle}
                onChange={(e) => handleChange('perception_corporelle', e.target.value)}
                placeholder="Rapport au corps, estime de soi, distorsions perceptuelles..."
                className="border-orange-200"
              />
            </div>
            <div>
              <Label htmlFor="anxiete">Niveau d'anxiété général (0-10)</Label>
              <div className="mt-2">
                <Slider
                  value={[formData.niveau_anxiete]}
                  onValueChange={(value) => handleChange('niveau_anxiete', value[0])}
                  max={10}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Très calme</span>
                  <span className="font-medium text-orange-600">{formData.niveau_anxiete}/10</span>
                  <span>Très anxieux</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Target className="h-5 w-5" />
            Objectifs Thérapeutiques
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="objectifs">Objectifs thérapeutiques définis</Label>
              <Textarea
                id="objectifs"
                value={formData.objectifs_therapeutiques}
                onChange={(e) => handleChange('objectifs_therapeutiques', e.target.value)}
                placeholder="Stabilisation alimentaire, gestion émotionnelle, amélioration de l'estime de soi..."
                className="border-green-200"
              />
            </div>
            <div>
              <Label htmlFor="strategies">Stratégies de gestion proposées</Label>
              <Textarea
                id="strategies"
                value={formData.strategies_coping}
                onChange={(e) => handleChange('strategies_coping', e.target.value)}
                placeholder="Techniques de relaxation, journaling, activités alternatives..."
                className="border-green-200"
              />
            </div>
            <div>
              <Label htmlFor="suivi">Plan de suivi émotionnel</Label>
              <Textarea
                id="suivi"
                value={formData.suivi_emotionnel}
                onChange={(e) => handleChange('suivi_emotionnel', e.target.value)}
                placeholder="Fréquence des consultations, indicateurs de progrès, outils de monitoring..."
                className="border-green-200"
              />
            </div>
            <div>
              <Label htmlFor="support">Support familial/social</Label>
              <Textarea
                id="support"
                value={formData.support_familial}
                onChange={(e) => handleChange('support_familial', e.target.value)}
                placeholder="Implication de la famille, groupes de soutien, réseau social..."
                className="border-green-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center gap-2 text-red-800">
            <Lock className="h-5 w-5" />
            Notes Confidentielles
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-800 text-sm">
              🔒 <strong>Confidentialité renforcée :</strong> Ces remarques ne seront visibles que par le médecin traitant.
            </p>
          </div>
          <div>
            <Label htmlFor="confidentielles">Remarques confidentielles</Label>
            <Textarea
              id="confidentielles"
              value={formData.remarques_confidentielles}
              onChange={(e) => handleChange('remarques_confidentielles', e.target.value)}
              placeholder="Observations sensibles, historique traumatique, éléments privés importants pour le suivi..."
              className="min-h-[120px] border-red-200"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
