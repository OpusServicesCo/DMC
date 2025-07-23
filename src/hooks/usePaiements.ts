
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePaiements = (onError: (error: { title: string; description: string }) => void) => {
  // Récupérer tous les paiements avec des informations complètes
  const { data: paiements, refetch, isLoading: paymentsLoading, error: paymentsError } = useQuery({
    queryKey: ["paiements"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("paiements")
          .select(`
            *,
            factures (
              id,
              numero_facture,
              montant_total,
              statut,
              date_emission,
              consultations (
                id,
                date,
                motif,
                diagnostic,
                patients (
                  nom,
                  prenom,
                  adresse,
                  telephone
                )
              )
            )
          `)
          .order("date_paiement", { ascending: false });

        if (error) {
          console.error("Erreur lors de la récupération des paiements:", error);
          throw error;
        }
        return data || [];
      } catch (err: any) {
        console.error("Erreur dans usePaiements:", err);
        onError({
          title: "Erreur lors du chargement des paiements",
          description: err.message || "Une erreur est survenue lors de la récupération des paiements.",
        });
        return [];
      }
    },
    retry: 2,
    staleTime: 5000,
  });

  // Récupérer toutes les factures (payées et impayées)
  const { data: factures, refetch: refetchFactures, isLoading: invoicesLoading, error: invoicesError } = useQuery({
    queryKey: ["factures-all"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("factures")
          .select(`
            id,
            numero_facture,
            montant_total,
            statut,
            date_emission,
            consultations (
              id,
              date,
              motif,
              diagnostic,
              patients (
                nom,
                prenom,
                adresse,
                telephone
              )
            )
          `)
          .order("date_emission", { ascending: false });

        if (error) {
          console.error("Erreur lors de la récupération des factures:", error);
          throw error;
        }
        return data || [];
      } catch (err: any) {
        console.error("Erreur dans usePaiements (factures):", err);
        onError({
          title: "Erreur lors du chargement des factures",
          description: err.message || "Une erreur est survenue lors de la récupération des factures.",
        });
        return [];
      }
    },
    retry: 2,
    staleTime: 5000,
  });

  // Récupérer les consultations terminées sans factures (consultations en attente)
  const { data: consultationsEnAttente } = useQuery({
    queryKey: ["consultations-en-attente"],
    queryFn: async () => {
      try {
        // Récupérer les consultations terminées
        const { data: consultations, error: consultError } = await supabase
          .from("consultations")
          .select(`
            id,
            date,
            motif,
            diagnostic,
            montant,
            patients (
              id,
              nom,
              prenom,
              adresse,
              telephone
            )
          `)
          .eq("statut_rendez_vous", "effectué")
          .order("date", { ascending: false });

        if (consultError) throw consultError;

        if (!consultations) return [];

        // Filtrer les consultations qui n'ont pas de facture
        const consultationsSansFacture = [];
        
        for (const consultation of consultations) {
          const { data: facture } = await supabase
            .from("factures")
            .select("id")
            .eq("consultation_id", consultation.id)
            .maybeSingle();

          if (!facture) {
            consultationsSansFacture.push(consultation);
          }
        }

        return consultationsSansFacture;
      } catch (err: any) {
        console.error("Erreur consultationsEnAttente:", err);
        return [];
      }
    },
    retry: 2,
    staleTime: 5000,
  });

  // Récupérer les factures impayées pour les nouveaux paiements
  const { data: facturesImpayees } = useQuery({
    queryKey: ["factures-unpaid"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("factures")
          .select(`
            id,
            numero_facture,
            montant_total,
            statut,
            consultations (
              id,
              date,
              motif,
              patients (
                nom,
                prenom
              )
            )
          `)
          .in("statut", ["impayée", "partiellement_payée"])
          .order("date_emission", { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (err: any) {
        console.error("Erreur facturesImpayees:", err);
        return [];
      }
    },
    retry: 2,
    staleTime: 5000,
  });

  return {
    paiements: paiements || [],
    factures: factures || [],
    facturesImpayees: facturesImpayees || [],
    consultationsEnAttente: consultationsEnAttente || [],
    refetch,
    refetchFactures,
    isLoading: paymentsLoading || invoicesLoading,
    error: paymentsError || invoicesError
  };
};

export const useSelectedFacture = (factureId: string | null, onError: (error: { title: string; description: string }) => void) => {
  const { data: selectedFacture, isLoading, error } = useQuery({
    queryKey: ["selected-facture", factureId],
    queryFn: async () => {
      if (!factureId) return null;
      
      try {
        const { data, error } = await supabase
          .from("factures")
          .select(`
            id,
            numero_facture,
            montant_total,
            statut,
            date_emission,
            consultations (
              id,
              date,
              motif,
              diagnostic,
              patients (
                nom,
                prenom,
                adresse,
                telephone
              )
            )
          `)
          .eq("id", factureId)
          .maybeSingle();

        if (error) {
          console.error("Erreur lors de la récupération de la facture:", error);
          throw error;
        }
        return data;
      } catch (err: any) {
        console.error("Erreur dans useSelectedFacture:", err);
        onError({
          title: "Erreur lors du chargement de la facture",
          description: err.message || "Impossible de récupérer les détails de la facture sélectionnée.",
        });
        return null;
      }
    },
    enabled: !!factureId,
    retry: 2,
    staleTime: 30000,
  });

  return { 
    selectedFacture, 
    isLoading, 
    error 
  };
};
