
import { MainLayout } from "@/components/layout/MainLayout";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, Bell } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { differenceInMinutes } from "date-fns";

export default function Notifications() {
  const { notifications, isLoading, error } = useNotifications();

  const getBadgeVariant = (urgence: string) => {
    switch (urgence) {
      case 'aujourd_hui':
        return 'destructive';
      case 'demain':
        return 'default';
      case 'cette_semaine':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  const getTempsRestant = (dateStr: string) => {
    const now = new Date();
    const rdvDate = new Date(dateStr);

    const totalMinutes = differenceInMinutes(rdvDate, now);

    if (totalMinutes <= 0) return "⏰ En cours ou passé";

    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (heures === 0) return `Dans ${minutes} min`;
    if (minutes === 0) return `Dans ${heures}h`;

    return `Dans ${heures}h et ${minutes}min`;
  };
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="text-center dark:text-gray-300">Chargement des notifications...</div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            <p className="font-bold">Erreur</p>
            <p>{error.message}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <Bell className="mr-3 h-8 w-8" />
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Rendez-vous à venir dans les 7 prochains jours</p>
        </div>

        {notifications && notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card key={notification.id} className="hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg flex items-center dark:text-white">
                      <User className="mr-2 h-5 w-5" />
                      {notification.patient_nom} {notification.patient_prenom}
                    </CardTitle>
                    <Badge variant={getBadgeVariant(notification.urgence)} className="notification-pulse">
  {getTempsRestant(notification.date)}
</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>
                        {format(new Date(notification.date), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Motif: {notification.motif}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucun rendez-vous à venir
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Tous vos rendez-vous sont à jour
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
