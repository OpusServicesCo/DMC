import { useState, useEffect } from 'react';
import { useSystemNotifications } from '@/components/ui/enhanced-toast';

interface NetworkStatus {
  isOnline: boolean;
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
}

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
  });
  
  const [wasOffline, setWasOffline] = useState(!navigator.onLine);
  const { notifyOffline, notifyOnline, notifyNetworkError } = useSystemNotifications();

  useEffect(() => {
    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine;
      
      // Détection des changements de statut réseau
      if (!isOnline && !wasOffline) {
        setWasOffline(true);
        notifyOffline();
      } else if (isOnline && wasOffline) {
        setWasOffline(false);
        notifyOnline();
      }

      // Informations détaillées sur la connexion (si disponible)
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      setNetworkStatus({
        isOnline,
        downlink: connection?.downlink,
        effectiveType: connection?.effectiveType,
        rtt: connection?.rtt,
      });
    };

    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();
    const handleConnectionChange = () => updateNetworkStatus();

    // Écoute des événements réseau
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Écoute des changements de connexion (si disponible)
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Vérification périodique de la connectivité
    const intervalId = setInterval(async () => {
      if (navigator.onLine) {
        try {
          // Ping vers un endpoint pour vérifier la connectivité réelle
          const response = await fetch('/api/health', { 
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache',
          });
          // Si la requête échoue, on est probablement hors ligne
        } catch (error) {
          if (networkStatus.isOnline) {
            notifyNetworkError();
          }
        }
      }
    }, 30000); // Vérification toutes les 30 secondes

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
      
      clearInterval(intervalId);
    };
  }, [wasOffline, networkStatus.isOnline, notifyOffline, notifyOnline, notifyNetworkError]);

  return networkStatus;
}

/**
 * Hook pour gérer les requêtes avec retry automatique en cas de problème réseau
 */
export function useNetworkAwareRequest() {
  const { isOnline } = useNetworkStatus();
  const { notifyNetworkError } = useSystemNotifications();

  const executeWithRetry = async <T>(
    requestFn: () => Promise<T>,
    options: {
      maxRetries?: number;
      retryDelay?: number;
      onRetry?: (attempt: number) => void;
    } = {}
  ): Promise<T> => {
    const { maxRetries = 3, retryDelay = 1000, onRetry } = options;

    if (!isOnline) {
      throw new Error('Aucune connexion réseau disponible');
    }

    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        
        // Si c'est la dernière tentative, on lance l'erreur
        if (attempt === maxRetries) {
          notifyNetworkError();
          throw lastError;
        }

        // Délai avant la prochaine tentative
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        onRetry?.(attempt);
      }
    }

    throw lastError!;
  };

  return {
    executeWithRetry,
    isOnline,
  };
}

/**
 * Hook pour détecter une connexion lente et adapter l'interface
 */
export function useConnectionQuality() {
  const { effectiveType, downlink, rtt } = useNetworkStatus();

  const connectionQuality = useMemo(() => {
    if (!effectiveType) return 'unknown';

    // Classification basée sur effectiveType
    switch (effectiveType) {
      case 'slow-2g':
        return 'very-slow';
      case '2g':
        return 'slow';
      case '3g':
        return 'medium';
      case '4g':
        return 'fast';
      default:
        return 'unknown';
    }
  }, [effectiveType]);

  const isSlowConnection = useMemo(() => {
    return connectionQuality === 'very-slow' || connectionQuality === 'slow';
  }, [connectionQuality]);

  return {
    connectionQuality,
    isSlowConnection,
    effectiveType,
    downlink,
    rtt,
  };
}
