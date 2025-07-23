
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Target, Activity, FileText } from "lucide-react";

interface ConsultationInitialeFormProps {
  onDataChange: (data: any) => void;
  patientInfo: any;
  initialData?: any;
}

export function ConsultationInitialeForm({ onDataChange, patientInfo, initialData }: ConsultationInitialeFormProps) {
  const [formData, setFormData] = useState({
    objectif_nutritionnel: initialData?.objectif_nutritionnel || '',
    antecedents_medicaux: initialData?.antecedents_medicaux || patientInfo?.antecedents || '',
    habitudes_alimentaires: initialData?.habitudes_alimentaires || '',
    nombre_repas: initialData?.nombre_repas || '',
    aliments_frequents: initialData?.aliments_frequents || '',
    activite_physique: initialData?.activite_physique || '',
    frequence_activite: initialData?.frequence_activite || '',
    symptomes_associes: initialData?.symptomes_associes || '',
    diagnostic_initial: initialData?.diagnostic_initial || '',
    remarques_complementaires: initialData?.remarques_complementaires || ''
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

  const handleChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Target className="h-5 w-5" />
            Objectif Nutritionnel
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="objectif">Objectif principal</Label>
              <Select onValueChange={(value) => handleChange('objectif_nutritionnel', value)}>
                <SelectTrigger className="border-blue-200">
                  <SelectValue placeholder="Sélectionner l'objectif" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perte_poids">Perte de poids</SelectItem>
                  <SelectItem value="stabilisation">Stabilisation du poids</SelectItem>
                  <SelectItem value="prise_poids">Prise de poids</SelectItem>
                  <SelectItem value="equilibre_nutritionnel">Équilibrage nutritionnel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="antecedents">Antécédents médicaux</Label>
              <Textarea
                id="antecedents"
                value={formData.antecedents_medicaux}
                onChange={(e) => handleChange('antecedents_medicaux', e.target.value)}
                placeholder="Pathologies connues, traitements en cours..."
                className="border-blue-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <FileText className="h-5 w-5" />
            Habitudes Alimentaires
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="repas">Nombre de repas/jour</Label>
                <Select onValueChange={(value) => handleChange('nombre_repas', value)}>
                  <SelectTrigger className="border-green-200">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2">1-2 repas</SelectItem>
                    <SelectItem value="3">3 repas</SelectItem>
                    <SelectItem value="4-5">4-5 repas</SelectItem>
                    <SelectItem value="plus_5">Plus de 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="aliments">Aliments les plus fréquents</Label>
                <Input
                  id="aliments"
                  value={formData.aliments_frequents}
                  onChange={(e) => handleChange('aliments_frequents', e.target.value)}
                  placeholder="Riz, pain, viande..."
                  className="border-green-200"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="habitudes">Description des habitudes</Label>
              <Textarea
                id="habitudes"
                value={formData.habitudes_alimentaires}
                onChange={(e) => handleChange('habitudes_alimentaires', e.target.value)}
                placeholder="Horaires des repas, grignotage, préférences..."
                className="border-green-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200">
        <CardHeader className="bg-purple-50">
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Activity className="h-5 w-5" />
            Activité Physique & Symptômes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="activite">Type d'activité physique</Label>
                <Input
                  id="activite"
                  value={formData.activite_physique}
                  onChange={(e) => handleChange('activite_physique', e.target.value)}
                  placeholder="Marche, sport, gym..."
                  className="border-purple-200"
                />
              </div>
              <div>
                <Label htmlFor="frequence">Fréquence par semaine</Label>
                <Select onValueChange={(value) => handleChange('frequence_activite', value)}>
                  <SelectTrigger className="border-purple-200">
                    <SelectValue placeholder="Fréquence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aucune">Aucune</SelectItem>
                    <SelectItem value="1-2">1-2 fois</SelectItem>
                    <SelectItem value="3-4">3-4 fois</SelectItem>
                    <SelectItem value="quotidienne">Quotidienne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="symptomes">Symptômes associés</Label>
              <Textarea
                id="symptomes"
                value={formData.symptomes_associes}
                onChange={(e) => handleChange('symptomes_associes', e.target.value)}
                placeholder="Ballonnements, fatigue, troubles digestifs..."
                className="border-purple-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200">
        <CardHeader className="bg-orange-50">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Calculator className="h-5 w-5" />
            Diagnostic & Remarques
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="diagnostic">Diagnostic nutritionnel initial</Label>
              <Textarea
                id="diagnostic"
                value={formData.diagnostic_initial}
                onChange={(e) => handleChange('diagnostic_initial', e.target.value)}
                placeholder="Surpoids, déséquilibre alimentaire, carences..."
                className="border-orange-200"
              />
            </div>
            <div>
              <Label htmlFor="remarques">Remarques complémentaires</Label>
              <Textarea
                id="remarques"
                value={formData.remarques_complementaires}
                onChange={(e) => handleChange('remarques_complementaires', e.target.value)}
                placeholder="Observations particulières du médecin..."
                className="border-orange-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
