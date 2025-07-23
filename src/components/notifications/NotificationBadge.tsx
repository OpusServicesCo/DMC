import React from 'react';
import { Badge } from '@/components/ui/badge';

interface NotificationBadgeProps {
  count: number;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  size?: 'sm' | 'lg';
  maxCount?: number;
  className?: string;
}

export function NotificationBadge({ 
  count, 
  variant = 'destructive', 
  size = 'sm',
  maxCount = 99,
  className = ''
}: NotificationBadgeProps) {
  if (count === 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  
  const sizeClasses = {
    sm: 'h-5 w-5 text-xs',
    lg: 'h-6 w-6 text-sm'
  };

  return (
    <Badge 
      variant={variant}
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        flex items-center justify-center 
        animate-pulse
        ${className}
      `}
    >
      {displayCount}
    </Badge>
  );
}

// Badge spécialisés
export function PaymentBadge({ count }: { count: number }) {
  return (
    <NotificationBadge 
      count={count} 
      variant="destructive" 
      className="bg-red-500 hover:bg-red-600" 
    />
  );
}

export function ConsultationBadge({ count }: { count: number }) {
  return (
    <NotificationBadge 
      count={count} 
      variant="default" 
      className="bg-blue-500 hover:bg-blue-600" 
    />
  );
}

export function MessageBadge({ count }: { count: number }) {
  return (
    <NotificationBadge 
      count={count} 
      variant="secondary" 
      className="bg-orange-500 hover:bg-orange-600" 
    />
  );
}

export function UrgentBadge({ count }: { count: number }) {
  return (
    <NotificationBadge 
      count={count} 
      variant="destructive" 
      className="bg-red-600 hover:bg-red-700 animate-bounce" 
    />
  );
}
