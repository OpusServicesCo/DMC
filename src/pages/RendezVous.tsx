
import { MainLayout } from "@/components/layout/MainLayout";
import { RendezVousHeader } from "@/components/rendez-vous/RendezVousHeader";
import { RendezVousTable } from "@/components/rendez-vous/RendezVousTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useCallback } from "react";


export default function RendezVous() {
  const fetchRendezVous = useCallback(async () => {
    console.log("Chargement des rendez-vous...");
    const { data, error } = await supabase
      .from("consultations")
      .select(`
        *,
        patients (
          nom,
          prenom
        )
      `)
      .eq('type_visite', 'rendez_vous')
      .order("date", { ascending: true });

    if (error) {
      console.error("Erreur lors de la récupération des rendez-vous:", error);
      throw error;
    }

    console.log("Rendez-vous chargés:", data);
    return data;
  }, []);

  const { data: consultations, refetch } = useQuery({
    queryKey: ["rendez-vous"],
    queryFn: fetchRendezVous,
    refetchInterval: 5000, // Rafraîchir toutes les 5 secondes
    refetchOnWindowFocus: true,
    staleTime: 0, // Toujours considérer comme périmé
    gcTime: 0 // Pas de cache
  });

  // Abonnement aux changements en temps réel avec Supabase
  useEffect(() => {
    console.log("Configuration de l'abonnement aux changements...");
    const channel = supabase
      .channel('rendez-vous-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consultations'
        },
        async (payload) => {
          console.log('Changement détecté:', payload);
          // Forcer un rafraîchissement immédiat des données
          await refetch();
        }
      )
      .subscribe((status) => {
        console.log('Status de la subscription:', status);
      });

    return () => {
      console.log("Nettoyage de l'abonnement...");
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleUpdate = useCallback(async () => {
    console.log("Demande de mise à jour des données...");
    await refetch();
  }, [refetch]);

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <RendezVousHeader onSuccess={handleUpdate} />
        <div className="bg-white rounded-lg shadow">
          <RendezVousTable 
            consultations={consultations || []} 
            onUpdate={handleUpdate}
          />
        </div>
      </div>
    </MainLayout>
  );
}
