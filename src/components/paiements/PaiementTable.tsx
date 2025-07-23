
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertCircle, Eye, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

interface Paiement {
  id: string;
  date_paiement: string;
  montant_paye: number;
  mode_paiement: string;
  facture_id: string;
  factures?: {
    numero_facture?: number;
    montant_total: number;
    statut: string;
    consultations?: {
      patients?: {
        nom: string;
        prenom: string;
      };
    };
  };
}

interface PaiementTableProps {
  paiements?: Paiement[];
}

export function PaiementTable({ paiements }: PaiementTableProps) {
  const navigate = useNavigate();

  // Grouper les paiements par facture pour calculer les totaux
  const paiementsGroupes = paiements?.reduce((acc, paiement) => {
    const factureId = paiement.facture_id;
    if (!acc[factureId]) {
      acc[factureId] = {
        facture: paiement.factures,
        paiements: [],
        totalPaye: 0
      };
    }
    acc[factureId].paiements.push(paiement);
    acc[factureId].totalPaye += paiement.montant_paye;
    return acc;
  }, {} as Record<string, any>) || {};

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "carte":
        return <CreditCard className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "espèces":
        return "bg-green-100 text-green-800";
      case "carte":
        return "bg-blue-100 text-blue-800";
      case "mobile_money":
        return "bg-orange-100 text-orange-800";
      case "chèque":
        return "bg-purple-100 text-purple-800";
      case "virement":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Historique des Paiements</h2>
        <p className="text-sm text-gray-600 mt-1">
          Tous les paiements enregistrés dans le système ({paiements?.length || 0} paiements)
        </p>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° Facture</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Date de paiement</TableHead>
            <TableHead>Montant payé</TableHead>
            <TableHead>Mode de paiement</TableHead>
            <TableHead>Statut facture</TableHead>
            <TableHead>Progression</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paiements?.length ? (
            paiements.map((paiement) => {
              const groupeFacture = paiementsGroupes[paiement.facture_id];
              const montantTotal = paiement.factures?.montant_total || 0;
              const pourcentagePaye = montantTotal > 0 ? (groupeFacture.totalPaye / montantTotal) * 100 : 0;
              
              return (
                <TableRow key={paiement.id}>
                  <TableCell className="font-medium">
                    #{paiement.factures?.numero_facture || paiement.facture_id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    {paiement.factures?.consultations?.patients ? 
                      `${paiement.factures.consultations.patients.nom} ${paiement.factures.consultations.patients.prenom}` : 
                      "Patient inconnu"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(paiement.date_paiement), "dd/MM/yyyy HH:mm", { locale: fr })}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getModeIcon(paiement.mode_paiement)}
                      {paiement.montant_paye.toLocaleString()} FCFA
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getModeColor(paiement.mode_paiement)}>
                      {paiement.mode_paiement.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {paiement.factures?.statut === "payée" ? (
                      <Badge className="bg-green-100 text-green-800">Payée</Badge>
                    ) : paiement.factures?.statut === "partiellement_payée" ? (
                      <Badge className="bg-orange-100 text-orange-800">Paiement partiel</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Non payée</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="w-full">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{groupeFacture.totalPaye.toLocaleString()} FCFA</span>
                        <span>{montantTotal.toLocaleString()} FCFA</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${pourcentagePaye >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min(pourcentagePaye, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {pourcentagePaye.toFixed(1)}% payé
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/paiements?facture_id=${paiement.facture_id}`)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Voir facture
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                  <p className="text-gray-500">Aucun paiement enregistré</p>
                  <p className="text-sm text-gray-400">
                    Les paiements apparaîtront ici après leur enregistrement
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
