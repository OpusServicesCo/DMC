import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Notification {
  id: string;
  type: 'payment_due' | 'credit_exceeded' | 'unbilled_acts' | 'unread_messages' | 'consultation_completed' | 'appointment_reminder';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
  isRead: boolean;
  patientId?: string;
  patientName?: string;
  amount?: number;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  paymentDueCount: number;
  creditExceededCount: number;
  unbilledActsCount: number;
  unreadMessagesCount: number;
  consultationCompletedCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: (type?: Notification['type']) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Ajouter une notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      isRead: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Marquer comme lu
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  // Marquer tout comme lu
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  // Supprimer une notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Effacer les notifications d'un type
  const clearNotifications = (type?: Notification['type']) => {
    if (type) {
      setNotifications(prev => prev.filter(notif => notif.type !== type));
    } else {
      setNotifications([]);
    }
  };

  // Calculer les compteurs
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const paymentDueCount = notifications.filter(n => n.type === 'payment_due' && !n.isRead).length;
  const creditExceededCount = notifications.filter(n => n.type === 'credit_exceeded' && !n.isRead).length;
  const unbilledActsCount = notifications.filter(n => n.type === 'unbilled_acts' && !n.isRead).length;
  const unreadMessagesCount = notifications.filter(n => n.type === 'unread_messages' && !n.isRead).length;
  const consultationCompletedCount = notifications.filter(n => n.type === 'consultation_completed' && !n.isRead).length;

  // Simuler des notifications automatiques (en production, cela viendrait du backend)
  useEffect(() => {
    const interval = setInterval(() => {
      // Vérifier les paiements en attente (simulation)
      if (Math.random() < 0.1) { // 10% de chance toutes les 30 secondes
        addNotification({
          type: 'payment_due',
          title: 'Paiement en attente',
          message: `Facture en attente pour M./Mme Patient`,
          priority: 'medium',
          patientName: 'Patient Test',
          amount: 150
        });
      }

      // Vérifier les consultations terminées (simulation)
      if (Math.random() < 0.05) { // 5% de chance
        addNotification({
          type: 'consultation_completed',
          title: 'Consultation terminée',
          message: 'Nouvelle consultation à facturer',
          priority: 'high',
          patientName: 'Patient Consultation'
        });
      }
    }, 30000); // Vérifier toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        paymentDueCount,
        creditExceededCount,
        unbilledActsCount,
        unreadMessagesCount,
        consultationCompletedCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Hooks utilitaires pour des types spécifiques
export function usePaymentNotifications() {
  const { notifications, paymentDueCount, addNotification } = useNotifications();
  
  const addPaymentDue = (patientName: string, amount: number) => {
    addNotification({
      type: 'payment_due',
      title: 'Paiement en attente',
      message: `Facture de ${amount}€ en attente pour ${patientName}`,
      priority: 'medium',
      patientName,
      amount
    });
  };

  const paymentNotifications = notifications.filter(n => n.type === 'payment_due');

  return { paymentNotifications, paymentDueCount, addPaymentDue };
}

export function useConsultationNotifications() {
  const { notifications, consultationCompletedCount, addNotification } = useNotifications();
  
  const addConsultationCompleted = (patientName: string, consultationType: string) => {
    addNotification({
      type: 'consultation_completed',
      title: 'Consultation terminée',
      message: `${consultationType} terminée pour ${patientName} - À facturer`,
      priority: 'high',
      patientName
    });
  };

  const addUnbilledAct = (patientName: string, actType: string) => {
    addNotification({
      type: 'unbilled_acts',
      title: 'Acte non facturé',
      message: `${actType} non facturé pour ${patientName}`,
      priority: 'medium',
      patientName
    });
  };

  const consultationNotifications = notifications.filter(n => 
    n.type === 'consultation_completed' || n.type === 'unbilled_acts'
  );

  return { 
    consultationNotifications, 
    consultationCompletedCount, 
    addConsultationCompleted, 
    addUnbilledAct 
  };
}
