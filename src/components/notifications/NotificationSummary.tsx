import React from 'react';
import { CreditCard, FileText, MessageCircle, UserCheck, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/contexts/NotificationContext';
import { PaymentBadge, ConsultationBadge, MessageBadge, UrgentBadge } from './NotificationBadge';

export function NotificationSummary() {
  const {
    paymentDueCount,
    creditExceededCount,
    unbilledActsCount,
    unreadMessagesCount,
    consultationCompletedCount,
    notifications
  } = useNotifications();

  const urgentNotifications = notifications.filter(n => n.priority === 'urgent' && !n.isRead);
  const urgentCount = urgentNotifications.length;

  const summaryItems = [
    {
      title: 'Paiements en attente',
      count: paymentDueCount,
      icon: CreditCard,
      color: 'text-red-600 bg-red-50',
      badge: <PaymentBadge count={paymentDueCount} />
    },
    {
      title: 'Consultations terminées',
      count: consultationCompletedCount,
      icon: UserCheck,
      color: 'text-green-600 bg-green-50',
      badge: <ConsultationBadge count={consultationCompletedCount} />
    },
    {
      title: 'Actes non facturés',
      count: unbilledActsCount,
      icon: FileText,
      color: 'text-blue-600 bg-blue-50',
      badge: <ConsultationBadge count={unbilledActsCount} />
    },
    {
      title: 'Messages non lus',
      count: unreadMessagesCount,
      icon: MessageCircle,
      color: 'text-orange-600 bg-orange-50',
      badge: <MessageBadge count={unreadMessagesCount} />
    }
  ];

  return (
    <div className="space-y-4">
      {/* Alertes urgentes */}
      {urgentCount > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Alertes urgentes
              <UrgentBadge count={urgentCount} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {urgentNotifications.slice(0, 3).map(notification => (
                <div key={notification.id} className="p-2 bg-white rounded border">
                  <p className="text-sm font-medium text-red-800">{notification.title}</p>
                  <p className="text-sm text-red-600">{notification.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résumé des notifications */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-full ${item.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {item.badge}
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold">{item.count}</p>
                  <p className="text-sm text-gray-600">{item.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dépassement de crédit */}
      {creditExceededCount > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <CreditCard className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-red-800">
                  ⚠️ Dépassement de crédit autorisé
                </p>
                <p className="text-sm text-red-600">
                  {creditExceededCount} patient(s) ont dépassé leur crédit autorisé
                </p>
              </div>
              <Badge variant="destructive">
                {creditExceededCount}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
