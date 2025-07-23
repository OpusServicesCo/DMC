
import { CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface Facture {
  id: string;
  montant_total: number;
  statut: string;
  consultations?: {
    patients?: {
      nom: string;
      prenom: string;
      adresse?: string;
      telephone?: string;
    };
    motif: string;
    date: string;
    diagnostic?: string;
  };
}

interface Paiement {
  id: string;
  facture_id: string;
  montant_paye: number;
}

interface FactureDetailsProps {
  selectedFacture: Facture;
  paiements?: Paiement[];
}

export function FactureDetails({ selectedFacture, paiements = [] }: FactureDetailsProps) {
  // Sécuriser les calculs avec des vérifications
  const paiementsEffectues = paiements?.filter(p => p?.facture_id === selectedFacture?.id) || [];
  const montantDejaPaye = paiementsEffectues.reduce((sum, p) => {
    const montant = Number(p?.montant_paye) || 0;
    return sum + montant;
  }, 0);
  
  const montantTotal = Number(selectedFacture?.montant_total) || 0;
  const montantRestant = Math.max(0, montantTotal - montantDejaPaye);

  // Gestion sécurisée des données patient
  const patientNom = selectedFacture?.consultations?.patients?.nom || "Non renseigné";
  const patientPrenom = selectedFacture?.consultations?.patients?.prenom || "";
  const patientFullName = `${patientNom} ${patientPrenom}`.trim() || "Patient inconnu";

  // Gestion sécurisée du statut
  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "payée":
        return "bg-green-100 text-green-800";
      case "partiellement_payée":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case "payée":
        return "Payée";
      case "partiellement_payée":
        return "Paiement partiel";
      default:
        return "Non payée";
    }
  };

  if (!selectedFacture) {
    return (
      <Card className="mb-6 border-l-4 border-l-red-500">
        <CardContent className="p-4">
          <p className="text-red-600">Aucune facture sélectionnée</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-l-4 border-l-medical-500">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-medical-700">
          <CreditCard className="h-5 w-5" />
          Détails de la facture sélectionnée
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Patient</p>
            <p className="font-medium">{patientFullName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Montant total</p>
            <p className="font-medium">{montantTotal.toLocaleString()} FCFA</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Statut</p>
            <Badge className={getStatusBadge(selectedFacture.statut)}>
              {getStatusLabel(selectedFacture.statut)}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Montant restant</p>
            <p className="font-medium text-green-600">
              {montantRestant.toLocaleString()} FCFA
            </p>
          </div>
          {paiementsEffectues.length > 0 && (
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">Paiements effectués</p>
              <p className="font-medium">{paiementsEffectues.length} paiement(s) - {montantDejaPaye.toLocaleString()} FCFA</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
