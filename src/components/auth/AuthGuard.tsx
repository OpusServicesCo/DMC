import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    let verificationInterval: NodeJS.Timeout;

    const verifyAuthentication = async () => {
      try {
        // Vérifier la session actuelle
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error || !session) {
          console.log('🔐 Session invalide ou expirée');
          setIsAuthenticated(false);
          
          // Ne pas rediriger si on est déjà sur la page d'auth
          if (location.pathname !== '/auth') {
            toast({
              title: "Session expirée",
              description: "Veuillez vous reconnecter",
              variant: "destructive",
            });
            navigate('/auth', { state: { from: location } });
          }
        } else {
          console.log('✅ Session valide pour:', session.user.email);
          setIsAuthenticated(true);
          
          // Si on est sur /auth et connecté, rediriger vers l'accueil
          if (location.pathname === '/auth') {
            navigate('/', { replace: true });
          }
        }
      } catch (error: any) {
        console.error('❌ Erreur de vérification auth:', error);
        if (mounted) {
          setIsAuthenticated(false);
          if (location.pathname !== '/auth') {
            navigate('/auth', { state: { from: location } });
          }
        }
      } finally {
        if (mounted) {
          setIsVerifying(false);
        }
      }
    };

    // Vérification initiale
    verifyAuthentication();

    // Vérification périodique toutes les 2 minutes
    verificationInterval = setInterval(() => {
      if (location.pathname !== '/auth') {
        verifyAuthentication();
      }
    }, 2 * 60 * 1000);

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('🔄 Auth state changed:', event);

        switch (event) {
          case 'SIGNED_IN':
            setIsAuthenticated(true);
            toast({
              title: "Connexion réussie",
              description: "Bienvenue !",
            });
            break;

          case 'SIGNED_OUT':
            setIsAuthenticated(false);
            toast({
              title: "Déconnecté",
              description: "Vous avez été déconnecté",
            });
            navigate('/auth');
            break;

          case 'TOKEN_REFRESHED':
            console.log('🔄 Token rafraîchi');
            setIsAuthenticated(!!session);
            break;

          default:
            setIsAuthenticated(!!session);
        }
      }
    );

    // Cleanup
    return () => {
      mounted = false;
      clearInterval(verificationInterval);
      subscription.unsubscribe();
    };
  }, [location.pathname, navigate, toast]);

  // Vérification de la validité du token au focus de la fenêtre
  useEffect(() => {
    const handleFocus = async () => {
      if (location.pathname !== '/auth') {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsAuthenticated(false);
          toast({
            title: "Session expirée",
            description: "Veuillez vous reconnecter",
            variant: "destructive",
          });
          navigate('/auth');
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [location.pathname, navigate, toast]);

  // Affichage du loader pendant la vérification initiale
  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-medical-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Afficher le contenu si authentifié ou sur la page d'auth
  if (isAuthenticated || location.pathname === '/auth') {
    return <>{children}</>;
  }

  // Sinon, ne rien afficher (la redirection est en cours)
  return null;
}
