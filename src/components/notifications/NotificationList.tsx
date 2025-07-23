
import { useState } from "react";
import { Edit, Trash2, RefreshCw, Bell, BellRing, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface NotificationType {
  id: string;
  message: string;
  type: string | null;
  date: string;
  medecin_id: string | null;
  secretaire_id: string | null;
  created_at: string;
  medecins?: {
    nom: string;
    prenom: string;
  } | null;
  secretaires?: {
    nom: string;
    prenom: string;
  } | null;
}

interface NotificationListProps {
  notifications: NotificationType[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onRefresh: () => void;
}

export function NotificationList({ notifications, isLoading, onEdit, onRefresh }: NotificationListProps) {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Notification supprimée",
        description: "La notification a été supprimée avec succès",
      });
      
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression: " + error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeIcon = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case "urgence":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "rappel":
        return <BellRing className="h-5 w-5 text-yellow-500" />;
      case "information":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-medical-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Bell className="mr-2 h-5 w-5 text-medical-600" />
          Liste des notifications
        </h2>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Actualiser
        </Button>
      </div>

      {notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>Aucune notification enregistrée.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {notification.type || "Notification"}
                        </span>
                        <span className="text-sm text-gray-500">
                          • {formatDate(notification.date)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700">{notification.message}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        {notification.medecins ? (
                          <span>Pour Dr. {notification.medecins.prenom} {notification.medecins.nom}</span>
                        ) : notification.secretaires ? (
                          <span>Pour {notification.secretaires.prenom} {notification.secretaires.nom}</span>
                        ) : (
                          <span>Destinataire non spécifié</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(notification.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                      disabled={deletingId === notification.id}
                    >
                      {deletingId === notification.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
