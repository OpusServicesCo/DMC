import React, { useState } from 'react';
import { Bell, CreditCard, FileText, MessageCircle, UserCheck, Clock, X, Check, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const notificationIcons = {
  payment_due: CreditCard,
  credit_exceeded: CreditCard,
  unbilled_acts: FileText,
  unread_messages: MessageCircle,
  consultation_completed: UserCheck,
  appointment_reminder: Clock
};

const notificationColors = {
  payment_due: 'text-red-600 bg-red-50',
  credit_exceeded: 'text-red-800 bg-red-100',
  unbilled_acts: 'text-blue-600 bg-blue-50',
  unread_messages: 'text-orange-600 bg-orange-50',
  consultation_completed: 'text-green-600 bg-green-50',
  appointment_reminder: 'text-purple-600 bg-purple-50'
};

const priorityColors = {
  low: 'border-l-gray-300',
  medium: 'border-l-yellow-400',
  high: 'border-l-orange-500',
  urgent: 'border-l-red-600 animate-pulse'
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onRemove }: NotificationItemProps) {
  const Icon = notificationIcons[notification.type];
  const timeAgo = formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: fr });

  return (
    <div className={`
      relative p-4 border-l-4 transition-all hover:bg-gray-50
      ${priorityColors[notification.priority]}
      ${notification.isRead ? 'opacity-60' : 'bg-white'}
    `}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${notificationColors[notification.type]}`}>
          <Icon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-medium text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
              {notification.title}
            </h4>
            <div className="flex items-center gap-1">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-6 w-6 p-0 hover:bg-green-100"
                >
                  <Eye className="h-3 w-3 text-green-600" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(notification.id)}
                className="h-6 w-6 p-0 hover:bg-red-100"
              >
                <X className="h-3 w-3 text-red-600" />
              </Button>
            </div>
          </div>
          
          <p className={`text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">{timeAgo}</span>
            {notification.amount && (
              <Badge variant="outline" className="text-xs">
                {notification.amount}€
              </Badge>
            )}
            {notification.patientName && (
              <Badge variant="secondary" className="text-xs">
                {notification.patientName}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {!notification.isRead && (
        <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
      )}
    </div>
  );
}

export function NotificationPanel() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    clearNotifications
  } = useNotifications();
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const recentNotifications = filteredNotifications.slice(0, 10);

  return (
    <Card className="w-96 max-h-96 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Tout lire
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 mt-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Toutes ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Non lues ({unreadCount})
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {recentNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune notification</p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-1">
              {recentNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onRemove={removeNotification}
                  />
                  {index < recentNotifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        {notifications.length > 10 && (
          <div className="p-3 border-t">
            <Button variant="outline" className="w-full text-sm">
              Voir toutes les notifications ({notifications.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
