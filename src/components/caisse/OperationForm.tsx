import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ErrorDialog } from "@/components/ui/ErrorDialog";
import { NouvelleOperationCaisse } from "@/types/models";

interface OperationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (operation: NouvelleOperationCaisse) => void;
  soldeDisponible: number;
}

export function OperationForm({
  open,
  onClose,
  onSubmit,
  soldeDisponible,
}: OperationFormProps) {
  const [error, setError] = useState<{ title: string; description: string } | null>(null);

  const [operation, setOperation] = useState<NouvelleOperationCaisse>({
    type: "sortie",
    montant: 0,
    date: new Date().toISOString().split("T")[0],
    description: "",
    categorie: "frais_operationnels",
  });

  // Sécuriser soldeDisponible avec une valeur par défaut
  const soldeActuel = soldeDisponible || 0;
  
  // Debug : vérifier la valeur reçue
  console.log('🔍 Debug OperationForm - soldeDisponible reçu:', soldeDisponible);
  console.log('🔍 Debug OperationForm - soldeActuel calculé:', soldeActuel);
  
  const montantNumber = Number(operation.montant);
  const isMontantValide =
    montantNumber > 0 && (soldeActuel <= 0 || montantNumber <= soldeActuel);

  const categories = [
    { value: "frais_operationnels", label: "Frais opérationnels" },
    { value: "salaires", label: "Salaires" },
    { value: "fournitures_medicales", label: "Fournitures médicales" },
    { value: "equipement", label: "Équipement" },
    { value: "maintenance", label: "Maintenance" },
    { value: "loyer", label: "Loyer" },
    { value: "electricite", label: "Électricité" },
    { value: "eau", label: "Eau" },
    { value: "telephone", label: "Téléphone/Internet" },
    { value: "carburant", label: "Carburant" },
    { value: "autre", label: "Autre" },
  ];

  const validateForm = () => {
    if (isNaN(montantNumber) || montantNumber <= 0) {
      setError({
        title: "Montant invalide",
        description: "Le montant doit être un nombre supérieur à 0",
      });
      return false;
    }

    if (operation.type === "sortie" && montantNumber > soldeActuel) {
      setError({
        title: "Montant trop élevé",
        description: `Cette sortie dépasse le solde actuel de la caisse (${soldeActuel.toLocaleString()} FCFA).`,
      });
      return false;
    }

    if (!operation.description.trim()) {
      setError({
        title: "Description requise",
        description: "Veuillez fournir une description pour cette sortie",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit({
      ...operation,
      montant: montantNumber, // s'assurer que montant est bien un nombre
    });

    // Réinitialiser le formulaire
    setOperation({
      type: "sortie",
      montant: 0,
      date: new Date().toISOString().split("T")[0],
      description: "",
      categorie: "frais_operationnels",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nouvelle sortie de caisse</DialogTitle>
            <DialogDescription>Enregistrer une nouvelle sortie de caisse</DialogDescription>
          </DialogHeader>

          {/* Affichage du solde disponible */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Solde disponible en caisse :</span>{" "}
                  <span className="font-bold text-lg">
                    {soldeActuel.toLocaleString()} FCFA
                  </span>
                </p>
                {soldeActuel <= 0 && (
                  <p className="text-red-600 text-xs mt-1">
                    ⚠️ Aucun fonds disponible pour effectuer une sortie
                  </p>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="montant">Montant (FCFA)</Label>
                <Input
                  id="montant"
                  type="number"
                  min={1}
                  max={soldeActuel}
                  step="0.01"
                  value={operation.montant === 0 ? "" : operation.montant}
                  onChange={(e) => {
                    const value = e.target.value;
                    setOperation({
                      ...operation,
                      montant: value === "" ? 0 : parseFloat(value),
                    });
                  }}
                  className={montantNumber > soldeActuel ? "border-red-500 focus:border-red-500" : ""}
                  required
                />
                {montantNumber > 0 && montantNumber > soldeActuel && (
                  <p className="text-red-500 text-xs mt-1">
                    ⚠️ Montant supérieur au solde disponible ({soldeActuel.toLocaleString()} FCFA)
                  </p>
                )}
                {montantNumber > 0 && montantNumber <= soldeActuel && (
                  <p className="text-green-600 text-xs mt-1">
                    ✓ Solde restant après cette sortie : {(soldeActuel - montantNumber).toLocaleString()} FCFA
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={operation.date}
                  onChange={(e) => setOperation({ ...operation, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                type="text"
                value={operation.description}
                onChange={(e) => setOperation({ ...operation, description: e.target.value })}
                placeholder="Description de la sortie..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categorie">Catégorie</Label>
              <select
                id="categorie"
                className="w-full border rounded-md p-2"
                value={operation.categorie}
                onChange={(e) => setOperation({ ...operation, categorie: e.target.value })}
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={montantNumber <= 0 || montantNumber > soldeActuel || soldeActuel <= 0}
            >
              {soldeActuel <= 0 
                ? "Aucun fonds disponible" 
                : montantNumber > soldeActuel 
                  ? "Montant trop élevé" 
                  : "Enregistrer la sortie"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {error && (
        <ErrorDialog
          open={true}
          onClose={() => setError(null)}
          title={error.title}
          description={error.description}
        />
      )}
    </>
  );
}
