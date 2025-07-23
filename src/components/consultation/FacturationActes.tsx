
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, CreditCard, Plus, AlertTriangle } from "lucide-react";
import { ActeMedical } from "@/types/consultation";
import { useToast } from "@/hooks/use-toast";

interface FacturationActesProps {
  consultationData: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export function FacturationActes({ consultationData, onNext, onBack }: FacturationActesProps) {
  const { toast } = useToast();
  const [actesMedicaux, setActesMedicaux] = useState<ActeMedical[]>([
    { id: '1', nom: 'Consultation nutritionnelle', prix: 5000, realise: false },
    { id: '2', nom: 'Test de glycémie capillaire', prix: 2000, realise: false },
    { id: '3', nom: 'Suivi de routine', prix: 3000, realise: false },
    { id: '4', nom: 'Conseils diététiques', prix: 4000, realise: false },
    { id: '5', nom: 'Mesure tension, IMC, poids', prix: 1000, realise: false },
  ]);

  const [actePersonnalise, setActePersonnalise] = useState({ nom: '', prix: 0 });
  const [montantPaye, setMontantPaye] = useState(0);
  const [methodePaiement, setMethodePaiement] = useState<'especes' | 'mobile_money' | 'carte' | 'assurance'>('especes');

  const montantTotal = actesMedicaux
    .filter(acte => acte.realise)
    .reduce((total, acte) => total + acte.prix, 0);

  const resteAPayer = Math.max(0, montantTotal - montantPaye);

  // Validation du montant payé en temps réel
  const handleMontantPayeChange = (value: number) => {
    if (value > montantTotal) {
      toast({
        title: "Oups 🤧 Montant invalide",
        description: `Le montant payé ne peut pas dépasser le montant total à régler (${montantTotal.toLocaleString()} FCFA)`,
        variant: "destructive",
      });
      // Limiter automatiquement au montant total
      setMontantPaye(montantTotal);
    } else {
      setMontantPaye(value);
    }
  };

  const toggleActe = (id: string) => {
    setActesMedicaux(prev => 
      prev.map(acte => 
        acte.id === id ? { ...acte, realise: !acte.realise } : acte
      )
    );
  };

  const ajouterActePersonnalise = () => {
    if (actePersonnalise.nom && actePersonnalise.prix > 0) {
      const nouvelActe: ActeMedical = {
        id: Date.now().toString(),
        nom: actePersonnalise.nom,
        prix: actePersonnalise.prix,
        realise: true
      };
      setActesMedicaux(prev => [...prev, nouvelActe]);
      setActePersonnalise({ nom: '', prix: 0 });
    }
  };

  const handleSubmit = () => {
    // Validation finale avant soumission
    if (montantPaye > montantTotal) {
      toast({
        title: "Oups 🤧 Erreur de validation",
        description: "Le montant payé ne peut pas dépasser le montant total de la facture",
        variant: "destructive",
      });
      return;
    }

    const facturationData = {
      ...consultationData,
      actes_medicaux: actesMedicaux.filter(acte => acte.realise),
      montant_total: montantTotal,
      montant_paye: montantPaye,
      reste_a_payer: resteAPayer,
      methode_paiement: methodePaiement,
      statut: 'facture'
    };
    onNext(facturationData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-medical-700">
            Facturation des Actes Médicaux
          </h2>
          <p className="text-gray-600">
            Sélectionnez les actes réalisés pendant la consultation
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
      </div>

      {/* Liste des actes médicaux */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Actes Médicaux Réalisés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {actesMedicaux.map((acte) => (
              <div key={acte.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={acte.id}
                    checked={acte.realise}
                    onCheckedChange={() => toggleActe(acte.id)}
                  />
                  <Label htmlFor={acte.id} className="font-medium">
                    {acte.nom}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={acte.realise ? "default" : "secondary"}>
                    {acte.prix.toLocaleString()} FCFA
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Ajouter un acte personnalisé */}
          <div className="mt-6 p-4 border-2 border-dashed rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un acte personnalisé
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Nom de l'acte"
                value={actePersonnalise.nom}
                onChange={(e) => setActePersonnalise(prev => ({ ...prev, nom: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Prix (FCFA)"
                value={actePersonnalise.prix || ''}
                onChange={(e) => setActePersonnalise(prev => ({ ...prev, prix: parseInt(e.target.value) || 0 }))}
              />
              <Button onClick={ajouterActePersonnalise} variant="outline">
                Ajouter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calcul du total */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Récapitulatif des Coûts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-t border-b py-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total des actes :</span>
                <span className="text-medical-600">
                  {montantTotal.toLocaleString()} FCFA
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="montantPaye">Montant payé (FCFA)</Label>
                <Input
                  id="montantPaye"
                  type="number"
                  max={montantTotal}
                  value={montantPaye || ''}
                  onChange={(e) => handleMontantPayeChange(parseInt(e.target.value) || 0)}
                  placeholder="Montant reçu"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maximum autorisé : {montantTotal.toLocaleString()} FCFA
                </p>
              </div>
              <div>
                <Label htmlFor="methodePaiement">Méthode de paiement</Label>
                <Select value={methodePaiement} onValueChange={(value: any) => setMethodePaiement(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="especes">Espèces</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="carte">Carte bancaire</SelectItem>
                    <SelectItem value="assurance">Assurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Alerte si montant dépasse le total */}
            {montantPaye > montantTotal && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-red-800 text-sm">
                  Le montant payé ne peut pas dépasser le montant total à régler
                </p>
              </div>
            )}

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Reste à payer :</span>
              <span className={`font-bold text-lg ${resteAPayer > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {resteAPayer.toLocaleString()} FCFA
              </span>
            </div>

            {resteAPayer > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-800 text-sm">
                  ⚠️ Paiement partiel - Un crédit de {resteAPayer.toLocaleString()} FCFA sera enregistré
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button 
          onClick={handleSubmit} 
          size="lg"
          disabled={montantTotal === 0 || montantPaye > montantTotal}
        >
          Finaliser et Imprimer
        </Button>
      </div>
    </div>
  );
}
