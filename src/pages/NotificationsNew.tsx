import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check, CheckCircle, Clock, CreditCard, FileText, Trash, UserPlus } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";

const staticNotifications = [
  {
    id: 1,
    type: "consultation",
    title: "Consultation terminée",
    message: "Consultation avec Marie Dupont terminée - À facturer",
    time: "Il y a 5 minutes",
    priority: "high",
    read: false,
  },
  {
    id: 2,
    type: "payment",
    title: "Paiement en attente",
    message: "Facture de 150€ en attente pour Jean Martin",
    time: "Il y a 1 heure",
    priority: "medium",
    read: false,
  },
  {
    id: 3,
    type: "unbilled",
    title: "Acte non facturé",
    message: "Bilan nutritionnel de Pierre Durand non facturé",
    time: "Il y a 2 heures",
    priority: "medium",
    read: true,
  },
];

const NotificationItem = ({ notification, onMarkRead, onDelete }: any) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "consultation":
        return <UserPlus className="h-4 w-4" />;
      case "payment":
        return <CreditCard className="h-4 w-4" />;
      case "unbilled":
        return <FileText className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      case "low":
        return "border-l-green-500 bg-green-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  return (
    <div
      className={`p-4 border-l-4 transition-all hover:shadow-sm ${getPriorityColor(notification.priority)} ${
        notification.read ? "opacity-60" : "bg-white"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="mt-1">{getIcon(notification.type)}</div>
          <div className="flex-1">
            <h4 className={`font-medium ${notification.read ? "text-gray-600" : "text-gray-900"}`}>
              {notification.title}
            </h4>
            <p className={`text-sm ${notification.read ? "text-gray-500" : "text-gray-700"}`}>
              {notification.message}
            </p>
            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkRead(notification.id)}
              className="text-green-600 hover:text-green-700"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(notification.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function Notifications() {
  const [notificationList, setNotificationList] = React.useState(staticNotifications);

  const handleMarkRead = (id: number) => {
    setNotificationList(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const handleDelete = (id: number) => {
    setNotificationList(prev => prev.filter(notif => notif.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotificationList(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const unreadCount = notificationList.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos notifications et alertes
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary">
            {unreadCount} non lu{unreadCount > 1 ? "es" : ""}
          </Badge>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllRead} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </div>

      {/* Résumé simple */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-red-50 rounded-full">
                <CreditCard className="h-4 w-4 text-red-600" />
              </div>
              <Badge variant="destructive">1</Badge>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-gray-600">Paiement en attente</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-50 rounded-full">
                <UserPlus className="h-4 w-4 text-green-600" />
              </div>
              <Badge variant="default">1</Badge>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-gray-600">Consultation terminée</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-50 rounded-full">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <Badge variant="secondary">1</Badge>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-gray-600">Acte non facturé</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Toutes les notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {notificationList.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y">
              {notificationList.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
