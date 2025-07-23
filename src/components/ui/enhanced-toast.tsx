import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertTriangle, Info, X, RefreshCw } from "lucide-react";

interface EnhancedToastOptions {
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

export function useEnhancedToast() {
  const { toast, dismiss } = useToast();

  const showToast = (options: EnhancedToastOptions) => {
    const { title, description, type = 'info', duration, action, persistent } = options;

    const icons = {
      success: <CheckCircle className="h-5 w-5 text-green-500" />,
      error: <XCircle className="h-5 w-5 text-red-500" />,
      warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      info: <Info className="h-5 w-5 text-blue-500" />
    };

    const variants = {
      success: 'default' as const,
      error: 'destructive' as const,
      warning: 'default' as const,
      info: 'default' as const
    };

    const backgrounds = {
      success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    };

    return toast({
      title: (
        <div className="flex items-center gap-2">
          {icons[type]}
          <span className="font-medium">{title}</span>
        </div>
      ),
      description: description && (
        <div className="mt-1 text-sm opacity-90">
          {description}
        </div>
      ),
      variant: variants[type],
      duration: persistent ? Infinity : duration || (type === 'error' ? 6000 : 4000),
      className: `${backgrounds[type]} animate-in slide-in-from-top-2 duration-300`,
      action: action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-1 text-xs font-medium underline-offset-4 hover:underline"
        >
          {action.label}
        </button>
      ),
    });
  };

  const success = (title: string, description?: string, action?: EnhancedToastOptions['action']) =>
    showToast({ title, description, type: 'success', action });

  const error = (title: string, description?: string, action?: EnhancedToastOptions['action']) =>
    showToast({ title, description, type: 'error', action });

  const warning = (title: string, description?: string, action?: EnhancedToastOptions['action']) =>
    showToast({ title, description, type: 'warning', action });

  const info = (title: string, description?: string, action?: EnhancedToastOptions['action']) =>
    showToast({ title, description, type: 'info', action });

  const loading = (title: string, description?: string) => {
    return showToast({
      title: (
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
          <span className="font-medium">{title}</span>
        </div>
      ) as any,
      description,
      type: 'info',
      persistent: true
    });
  };

  return {
    toast: showToast,
    success,
    error,
    warning,
    info,
    loading,
    dismiss
  };
}

// Hook pour les notifications système avec persistance
export function useSystemNotifications() {
  const enhancedToast = useEnhancedToast();

  const notifyNetworkError = () => {
    return enhancedToast.error(
      "Problème de connexion",
      "Vérifiez votre connexion internet et réessayez.",
      {
        label: "Réessayer",
        onClick: () => window.location.reload()
      }
    );
  };

  const notifyUpdate = () => {
    return enhancedToast.info(
      "Mise à jour disponible",
      "Une nouvelle version de l'application est disponible.",
      {
        label: "Actualiser",
        onClick: () => window.location.reload()
      }
    );
  };

  const notifyOffline = () => {
    return enhancedToast.warning(
      "Mode hors ligne",
      "Vous êtes actuellement déconnecté. Certaines fonctionnalités peuvent être limitées."
    );
  };

  const notifyOnline = () => {
    return enhancedToast.success(
      "Connexion rétablie",
      "Vous êtes de nouveau en ligne."
    );
  };

  return {
    notifyNetworkError,
    notifyUpdate,
    notifyOffline,
    notifyOnline
  };
}
