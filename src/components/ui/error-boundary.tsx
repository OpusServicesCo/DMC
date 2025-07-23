
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug, ExternalLink } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'page' | 'component' | 'critical';
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimer: NodeJS.Timeout | null = null;

  public state: State = {
    hasError: false,
    retryCount: 0
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Erreur capturée par ErrorBoundary:', error, errorInfo);
    
    // Log détaillé pour le debugging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.error('📋 Détails de l\'erreur:', errorDetails);
    
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // En production, on pourrait envoyer l'erreur à un service de monitoring
    if (process.env.NODE_ENV === 'production') {
      // Exemple: Sentry.captureException(error, { extra: errorDetails });
    }
  }

  private handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;
    
    // Limite le nombre de tentatives pour éviter les boucles infinies
    if (newRetryCount > 3) {
      console.warn('⚠️ Trop de tentatives de retry, arrêt automatique');
      return;
    }

    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: newRetryCount 
    });
  };

  private handleAutoRetry = () => {
    if (this.state.retryCount === 0) {
      this.retryTimer = setTimeout(() => {
        this.handleRetry();
      }, 3000);
    }
  };

  private getErrorMessage = () => {
    const { error } = this.state;
    if (!error) return "Une erreur inattendue s'est produite";
    
    // Messages d'erreur plus user-friendly
    if (error.message.includes('ChunkLoadError')) {
      return "Erreur de chargement. Veuillez rafraîchir la page.";
    }
    if (error.message.includes('Network')) {
      return "Problème de connexion réseau. Vérifiez votre connexion.";
    }
    if (error.message.includes('404')) {
      return "Ressource non trouvée. La page a peut-être été déplacée.";
    }
    
    return error.message;
  };

  public componentDidMount() {
    if (this.state.hasError && this.props.level !== 'critical') {
      this.handleAutoRetry();
    }
  }

  public componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = 'component' } = this.props;
      const isDevelopment = process.env.NODE_ENV === 'development';

      if (level === 'critical') {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="max-w-lg w-full p-8 text-center space-y-6 shadow-xl">
              <div className="space-y-4">
                <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Erreur Critique
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  L'application a rencontré une erreur critique et ne peut pas continuer.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="w-full"
                  size="lg"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Redémarrer l'application
                </Button>
                
                {isDevelopment && (
                  <details className="text-left text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded">
                    <summary className="cursor-pointer font-medium">Détails techniques</summary>
                    <pre className="mt-2 whitespace-pre-wrap">{this.state.error?.stack}</pre>
                  </details>
                )}
              </div>
            </Card>
          </div>
        );
      }

      return (
        <div className={`flex flex-col items-center justify-center ${
          level === 'page' ? 'min-h-[400px]' : 'min-h-[200px]'
        } p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 animate-in fade-in duration-300`}>
          <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400 mb-4 animate-pulse" />
          
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            {level === 'page' ? 'Erreur de chargement' : 'Une erreur s\'est produite'}
          </h2>
          
          <p className="text-sm text-red-600 dark:text-red-400 text-center mb-4 max-w-md">
            {this.getErrorMessage()}
          </p>
          
          <div className="flex gap-2 flex-wrap justify-center">
            <Button 
              onClick={this.handleRetry} 
              variant="outline" 
              size="sm"
              disabled={this.state.retryCount >= 3}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer {this.state.retryCount > 0 && `(${this.state.retryCount}/3)`}
            </Button>
            
            {level === 'page' && (
              <Button 
                onClick={() => window.history.back()} 
                variant="ghost" 
                size="sm"
              >
                Retour
              </Button>
            )}
          </div>
          
          {isDevelopment && this.state.error && (
            <details className="mt-4 text-left text-xs bg-white dark:bg-gray-800 p-3 rounded max-w-full overflow-auto">
              <summary className="cursor-pointer font-medium text-red-700 dark:text-red-300">
                <Bug className="inline h-4 w-4 mr-1" />
                Debug Info
              </summary>
              <div className="mt-2 space-y-2">
                <div>
                  <strong>Message:</strong> {this.state.error.message}
                </div>
                <div>
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap text-xs">{this.state.error.stack}</pre>
                </div>
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
