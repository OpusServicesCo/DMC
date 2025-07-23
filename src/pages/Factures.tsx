
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Printer, ArrowLeft, Search, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ErrorDialog } from "@/components/ui/ErrorDialog";
import { generateFacturePDF } from "@/services/printService";

export default function Factures() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<{ title: string; description: string } | null>(null);

  const { data: factures, isLoading, refetch } = useQuery({
    queryKey: ["factures-complete"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("factures")
          .select(`
            *,
            consultations (
              id,
              motif,
              date,
              diagnostic,
              observations,
              patient_id,
              patients (
                id,
                nom,
                prenom,
                adresse,
                telephone
              )
            )
          `)
          .order("date_emission", { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (err: any) {
        setError({
          title: "Erreur lors du chargement des factures",
          description: "Une erreur est survenue lors de la récupération des factures. Veuillez réessayer plus tard.",
        });
        return [];
      }
    },
    retry: 2,
    staleTime: 10000,
  });

  // Récupérer les paiements pour calculer les montants restants
  const { data: paiements } = useQuery({
    queryKey: ["paiements-pour-factures"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("paiements")
          .select("facture_id, montant_paye");

        if (error) throw error;
        return data || [];
      } catch (err: any) {
        console.error("Erreur lors du chargement des paiements:", err);
        return [];
      }
    },
  });

  const calculerMontantRestant = (factureId: string, montantTotal: number) => {
    if (!paiements) return montantTotal;
    
    const paiementsFacture = paiements.filter(p => p.facture_id === factureId);
    const montantPaye = paiementsFacture.reduce((sum, p) => sum + (p.montant_paye || 0), 0);
    return Math.max(0, montantTotal - montantPaye);
  };

  const handlePrint = async (facture: any) => {
    try {
      await generateFacturePDF(facture);
      toast({
        title: "Succès 😊",
        description: "La facture a été générée avec succès",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération de la facture",
        variant: "destructive",
      });
    }
  };

  const filteredFactures = factures?.filter((facture) => {
    if (!facture.consultations) {
      return false;
    }
    
    const patient = facture.consultations.patients;
    if (!patient) {
      return false;
    }
    
    const searchString = searchTerm.toLowerCase();
    const patientName = `${patient.nom} ${patient.prenom}`.toLowerCase();
    const numeroFacture = facture.numero_facture?.toString() || "";
    
    return (
      patientName.includes(searchString) ||
      numeroFacture.includes(searchString) ||
      (facture.consultations.motif?.toLowerCase() || "").includes(searchString)
    );
  });

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <h1 className="text-2xl font-bold text-medical-700">Toutes les Factures</h1>
          </div>
          <Button
            onClick={() => navigate("/paiements")}
            className="bg-medical-600 hover:bg-medical-700"
          >
            Gérer les Paiements
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Rechercher une facture (patient, numéro, motif)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Facture</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Date d'émission</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>Montant Total</TableHead>
                <TableHead>Montant Restant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center text-gray-500">
                      <p className="text-lg font-medium">Chargement...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredFactures?.length ? (
                filteredFactures.map((facture) => {
                  const montantRestant = calculerMontantRestant(facture.id, facture.montant_total);
                  
                  return (
                    <TableRow key={facture.id}>
                      <TableCell className="font-medium">
                        #{facture.numero_facture || facture.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        {facture.consultations?.patients ? 
                          `${facture.consultations.patients.nom} ${facture.consultations.patients.prenom}` : 
                          "Patient inconnu"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(facture.date_emission), "Pp", { locale: fr })}
                      </TableCell>
                      <TableCell>{facture.consultations?.motif || "N/A"}</TableCell>
                      <TableCell className="font-medium">
                        {facture.montant_total.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>
                        <span className={montantRestant > 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                          {montantRestant.toLocaleString()} FCFA
                        </span>
                      </TableCell>
                      <TableCell>
                        {facture.statut === "payée" ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Payée
                          </span>
                        ) : facture.statut === "partiellement_payée" ? (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                            Paiement partiel
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            Non payée
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handlePrint(facture)}
                            variant="outline"
                            className="text-medical-700"
                            size="sm"
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimer
                          </Button>
                          {montantRestant > 0 && (
                            <Button
                              onClick={() => navigate(`/paiements?facture_id=${facture.id}`)}
                              variant="outline"
                              className="text-green-700 border-green-200 hover:bg-green-50"
                              size="sm"
                            >
                              Payer ({montantRestant.toLocaleString()} FCFA)
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center text-gray-500">
                      <FileText className="h-12 w-12 mb-2 text-gray-400" />
                      <p className="text-lg font-medium">Aucune facture trouvée</p>
                      <p className="text-sm">
                        {searchTerm
                          ? "Essayez de modifier vos critères de recherche"
                          : "Les factures apparaîtront ici une fois créées"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {error && (
        <ErrorDialog
          open={!!error}
          onClose={() => setError(null)}
          title={error.title}
          description={error.description}
        />
      )}
    </MainLayout>
  );
}
