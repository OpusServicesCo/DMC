
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function NotificationIndicator() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user, userRole } = useAuth();

  useEffect(() => {
    if (!user || !userRole) return;

    // Récupérer le nombre de notifications non lues pour l'utilisateur connecté
    const fetchUnreadNotifications = async () => {
      try {
        setIsLoading(true);

        // Construire la requête selon le rôle de l'utilisateur
        // Note: Si la colonne 'lu' n'existe pas encore, on compte les notifications récentes
        let query = supabase
          .from("notifications")
          .select("*", { count: "exact", head: true });

        // Essayer d'abord avec le champ 'lu', sinon utiliser la date (dernières 24h)
        try {
          const testQuery = await supabase
            .from("notifications")
            .select("lu", { count: "exact", head: true })
            .limit(1);
          
          if (!testQuery.error) {
            // Le champ 'lu' existe, l'utiliser
            query = query.eq("lu", false);
          } else {
            // Le champ 'lu' n'existe pas, utiliser la date
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            query = query.gte("date", yesterday.toISOString());
          }
        } catch {
          // Fallback sur la date
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          query = query.gte("date", yesterday.toISOString());
        }

        // Filtrer par rôle
        if (userRole === 'medecin') {
          query = query.eq("medecin_id", user.id);
        } else if (userRole === 'secretaire') {
          query = query.eq("secretaire_id", user.id);
        } else {
          // Si l'utilisateur n'a pas de rôle spécifique, montrer toutes les notifications non lues
          query = query.or(`medecin_id.eq.${user.id},secretaire_id.eq.${user.id}`);
        }

        const { count, error } = await query;
        
        if (error) {
          console.error("Erreur lors de la récupération des notifications:", error);
          return;
        }
        
        setUnreadCount(count || 0);
      } catch (error) {
        console.error("Erreur lors de la récupération des notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUnreadNotifications();
    
    // Mettre en place un canal pour les notifications en temps réel
    const channel = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          fetchUnreadNotifications();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userRole]);

  // Fonction pour marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    if (!user || !userRole) return;

    try {
      // Vérifier si la colonne 'lu' existe
      const testQuery = await supabase
        .from("notifications")
        .select("lu", { count: "exact", head: true })
        .limit(1);
      
      if (!testQuery.error) {
        // La colonne 'lu' existe, marquer comme lu
        let query = supabase
          .from("notifications")
          .update({ lu: true })
          .eq("lu", false);

        // Filtrer par rôle
        if (userRole === 'medecin') {
          query = query.eq("medecin_id", user.id);
        } else if (userRole === 'secretaire') {
          query = query.eq("secretaire_id", user.id);
        }

        const { error } = await query;
        
        if (!error) {
          setUnreadCount(0);
        }
      } else {
        // La colonne 'lu' n'existe pas encore, juste réinitialiser le compteur
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Erreur lors du marquage des notifications:", error);
      // En cas d'erreur, juste réinitialiser le compteur pour l'UX
      setUnreadCount(0);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        navigate("/notifications");
        // Marquer les notifications comme lues quand on clique
        if (unreadCount > 0) {
          setTimeout(markAllAsRead, 500); // Petit délai pour l'UX
        }
      }}
      className="relative group"
    >
      {unreadCount > 0 ? (
        <>
          <BellRing className="h-5 w-5 text-yellow-500 animate-pulse" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center shadow-lg border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        </>
      ) : (
        <Bell className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
      )}
      
      {/* Tooltip */}
      {unreadCount > 0 && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {unreadCount === 1 ? '1 nouvelle notification' : `${unreadCount} nouvelles notifications`}
        </div>
      )}
    </Button>
  );
}
