import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Vérifier la session actuelle
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur de vérification de session:', error);
          throw error;
        }

        setSession(session);

        if (session?.user) {
          // Récupérer le profil utilisateur et son rôle
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (!profileError && profile) {
            setUserRole(profile.role);
          }
        }
      } catch (error: any) {
        console.error('Erreur d\'authentification:', error);
        setSession(null);
        setUserRole(null);
        
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_OUT' || !session) {
          setSession(null);
          setUserRole(null);
          
          if (event === 'SIGNED_OUT') {
            toast({
              title: "Déconnecté",
              description: "Vous avez été déconnecté avec succès",
            });
          }
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(session);
          
          // Récupérer le rôle utilisateur
          if (session.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            
            if (profile) {
              setUserRole(profile.role);
            }
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [toast]);

  // Vérification périodique de la session (toutes les 5 minutes)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          console.log('Session invalide détectée, redirection...');
          setSession(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Erreur de vérification périodique:', error);
        setSession(null);
        setUserRole(null);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Affichage du loader pendant la vérification
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Redirection si pas de session
  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Vérification des rôles si requis
  if (requiredRole && requiredRole.length > 0 && userRole) {
    if (!requiredRole.includes(userRole)) {
      toast({
        title: "Accès refusé",
        description: `Vous n'avez pas les permissions nécessaires. Rôle requis: ${requiredRole.join(', ')}`,
        variant: "destructive",
      });
      
      return <Navigate to="/" replace />;
    }
  }

  // Si tout est OK, afficher le contenu
  return <>{children}</>;
}
