
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OperationCaisse, NouvelleOperationCaisse, StatistiqueCaisse } from "@/types/models";
import { useToast } from "@/hooks/use-toast";

type ErrorState = { title: string; description: string } | null;

export const useCaisse = (onError?: (error: ErrorState) => void) => {
  const [error, setError] = useState<ErrorState>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer toutes les opérations de caisse
  const { data: operations, isLoading } = useQuery({
    queryKey: ["operations-caisse"],
    queryFn: async (): Promise<OperationCaisse[]> => {
      try {
        // 1. Récupérer les entrées automatiques (paiements)
        const { data: paiements, error: paiementsError } = await supabase
          .from("paiements")
          .select(`
            *,
            factures!inner (
              numero_facture,
              consultations!inner (
                patients (nom, prenom)
              )
            )
          `)
          .order("date_paiement", { ascending: false });

        if (paiementsError) throw paiementsError;

        // 2. Récupérer les sorties manuelles
        const { data: sortiesManuelle, error: sortiesError } = await supabase
          .from("operations_caisse")
          .select("*")
          .eq("type", "sortie")
          .order("date", { ascending: false });

        if (sortiesError) throw sortiesError;

        // Convertir les paiements en opérations d'entrée
        const entrees: OperationCaisse[] = (paiements || []).map(paiement => ({
          id: `paiement-${paiement.id}`,
          type: 'entrée' as const,
          montant: paiement.montant_paye,
          date: paiement.date_paiement.split('T')[0],
          description: `Paiement consultation - ${paiement.factures?.consultations?.patients?.nom} ${paiement.factures?.consultations?.patients?.prenom}`,
          categorie: 'paiement_consultation',
          facture_id: paiement.facture_id,
          paiement_id: paiement.id,
          created_at: paiement.created_at
        }));

        // Convertir les sorties manuelles
        const sorties: OperationCaisse[] = (sortiesManuelle || []).map(sortie => ({
          id: sortie.id,
          type: sortie.type as 'sortie',
          montant: sortie.montant,
          date: sortie.date.split('T')[0],
          description: sortie.description,
          categorie: sortie.categorie,
          created_at: sortie.created_at
        }));

        // Combiner et trier par date
        const toutesOperations = [...entrees, ...sorties].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        return toutesOperations;
      } catch (err: any) {
        const errorMsg = {
          title: "Erreur lors du chargement des opérations de caisse",
          description: err.message || "Impossible de récupérer les données de la caisse",
        };
        setError(errorMsg);
        if (onError) onError(errorMsg);
        return [];
      }
    },
  });

  // Statistiques de la caisse
  const { data: statistiques } = useQuery({
    queryKey: ["statistiques-caisse"],
    queryFn: async (): Promise<StatistiqueCaisse> => {
      try {
        const defaultStats: StatistiqueCaisse = {
          total_entrees: 0,
          total_sorties: 0,
          solde: 0,
        };

        if (!operations || operations.length === 0) return defaultStats;

        // Calcul des totaux
        const totalEntrees = operations
          .filter(op => op.type === 'entrée')
          .reduce((sum, op) => sum + op.montant, 0);

        const totalSorties = operations
          .filter(op => op.type === 'sortie')
          .reduce((sum, op) => sum + op.montant, 0);

        return {
          total_entrees: totalEntrees,
          total_sorties: totalSorties,
          solde: totalEntrees - totalSorties,
        };
      } catch (err: any) {
        console.error("Erreur lors du calcul des statistiques:", err);
        return { total_entrees: 0, total_sorties: 0, solde: 0 };
      }
    },
    enabled: !!operations,
  });

  // Ajouter une sortie manuelle
  const ajouterSortie = useMutation({
    mutationFn: async (nouvelleSortie: NouvelleOperationCaisse) => {
      if (nouvelleSortie.type !== 'sortie') {
        throw new Error("Seules les sorties peuvent être ajoutées manuellement");
      }

      // Vérification du solde disponible avant la sortie
      const soldeActuel = statistiques?.solde || 0;
      const montantSortie = nouvelleSortie.montant;
      
      if (montantSortie > soldeActuel) {
        throw new Error(
          `Sortie impossible : montant demandé ${montantSortie.toLocaleString()} FCFA supérieur au solde disponible ${soldeActuel.toLocaleString()} FCFA`
        );
      }

      if (soldeActuel <= 0) {
        throw new Error("Aucun fonds disponible en caisse pour effectuer une sortie");
      }

      const { data, error } = await supabase
        .from("operations_caisse")
        .insert([{
          type: nouvelleSortie.type,
          montant: nouvelleSortie.montant,
          date: nouvelleSortie.date,
          description: nouvelleSortie.description,
          categorie: nouvelleSortie.categorie,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations-caisse"] });
      toast({
        title: "Sortie enregistrée",
        description: "La sortie de caisse a été enregistrée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer la sortie",
        variant: "destructive",
      });
    },
  });

  // Supprimer une sortie manuelle
  const supprimerSortie = useMutation({
    mutationFn: async (id: string) => {
      // Vérifier si c'est une opération automatique
      if (id.startsWith('paiement-')) {
        throw new Error("Impossible de supprimer une opération automatique. Modifiez le paiement correspondant.");
      }

      const { error } = await supabase
        .from("operations_caisse")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations-caisse"] });
      toast({
        title: "Sortie supprimée",
        description: "La sortie de caisse a été supprimée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'opération",
        variant: "destructive",
      });
    },
  });

  return {
    operations,
    statistiques,
    isLoading,
    error,
    setError,
    ajouterSortie,
    supprimerSortie,
  };
};
