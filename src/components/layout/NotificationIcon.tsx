import { Bell, BellRing } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface NotificationIconProps {
  className?: string;
}

export function NotificationIcon({ className = "h-4 w-4" }: NotificationIconProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, userRole } = useAuth();

  useEffect(() => {
    if (!user || !userRole) return;

    const fetchUnreadNotifications = async () => {
      try {
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
            query = query.eq("lu", false);
          } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            query = query.gte("date", yesterday.toISOString());
          }
        } catch {
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
          query = query.or(`medecin_id.eq.${user.id},secretaire_id.eq.${user.id}`);
        }

        const { count, error } = await query;
        
        if (!error) {
          setUnreadCount(count || 0);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des notifications:", error);
      }
    };

    fetchUnreadNotifications();

    // Écouter les notifications en temps réel
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

  return (
    <div className="relative inline-block">
      {unreadCount > 0 ? (
        <>
          <BellRing className={`${className} text-yellow-500`} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center text-[10px] leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </>
      ) : (
        <Bell className={className} />
      )}
    </div>
  );
}
