
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface RendezVousNotification {
  id: string;
  patient_nom: string;
  patient_prenom: string;
  date: string;
  motif: string;
  temps_restant: string;
  urgence: 'aujourd_hui' | 'demain' | 'cette_semaine' | 'plus_tard';
}

export const useNotifications = () => {
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ["notifications-rendez-vous"],
    queryFn: async (): Promise<RendezVousNotification[]> => {
      try {
        const maintenant = new Date();
        const dansSeptJours = new Date();
        dansSeptJours.setDate(maintenant.getDate() + 7);

        const { data, error } = await supabase
          .from("consultations")
          .select(`
            id,
            date,
            motif,
            statut_rendez_vous,
            patients (
              nom,
              prenom
            )
          `)
          .eq("type_visite", "rendez_vous")
          .eq("statut_rendez_vous", "en_attente")
          .gte("date", maintenant.toISOString())
          .lte("date", dansSeptJours.toISOString())
          .order("date", { ascending: true });

        if (error) throw new Error(error.message);

        const notifications: RendezVousNotification[] = (data || []).map(rdv => {
          const dateRdv = new Date(rdv.date);
          const diffHeures = Math.ceil((dateRdv.getTime() - maintenant.getTime()) / (1000 * 60 * 60));
          
          let tempsRestant = "";
          let urgence: RendezVousNotification['urgence'] = 'plus_tard';

          if (diffHeures < 24) {
            if (diffHeures < 1) {
              tempsRestant = "Dans moins d'une heure";
            } else {
              tempsRestant = `Dans ${diffHeures} heure${diffHeures > 1 ? 's' : ''}`;
            }
            urgence = 'aujourd_hui';
          } else if (diffHeures < 48) {
            tempsRestant = "Demain";
            urgence = 'demain';
          } else if (diffHeures < 168) {
            const jours = Math.ceil(diffHeures / 24);
            tempsRestant = `Dans ${jours} jour${jours > 1 ? 's' : ''}`;
            urgence = 'cette_semaine';
          } else {
            tempsRestant = "Plus tard";
            urgence = 'plus_tard';
          }

          return {
            id: rdv.id,
            patient_nom: rdv.patients?.nom || 'Inconnu',
            patient_prenom: rdv.patients?.prenom || '',
            date: rdv.date,
            motif: rdv.motif,
            temps_restant: tempsRestant,
            urgence
          };
        });

        return notifications;
      } catch (err: any) {
        setError(err);
        return [];
      }
    },
    refetchInterval: 60000, // Rafraîchir toutes les minutes
    staleTime: 30000, // Considérer comme frais pendant 30 secondes
  });

  // Notifications sonores pour les rendez-vous dans 1 heure
  useEffect(() => {
    if (!notifications) return;

    const maintenant = new Date();
    const rdvProches = notifications.filter(notif => {
      const dateRdv = new Date(notif.date);
      const diffMinutes = Math.ceil((dateRdv.getTime() - maintenant.getTime()) / (1000 * 60));
      return diffMinutes === 60; // Exactement 1 heure avant
    });

    rdvProches.forEach(rdv => {
      // Son de notification
      if ('Audio' in window) {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmLJ1EdfU0N5nJqOjXBjKlAcOjV5nCmRxjRLKUaVjAqPdnB3ZbHPzWQwJAA=');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }

      toast({
        title: "🔔 Rappel de rendez-vous",
        description: `RDV avec ${rdv.patient_nom} ${rdv.patient_prenom} dans 1 heure`,
        duration: 10000,
      });
    });
  }, [notifications, toast]);

  return {
    notifications,
    isLoading,
    error,
    refetch
  };
};
