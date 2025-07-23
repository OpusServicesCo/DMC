import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthState {
  session: any;
  user: any;
  userRole: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    userRole: null,
    loading: true,
    isAuthenticated: false
  });
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Récupérer la session actuelle
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        let userRole = null;
        if (session?.user) {
          // Récupérer le profil utilisateur
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, nom, prenom')
            .eq('id', session.user.id)
            .single();
          
          userRole = profile?.role || null;
        }

        setAuthState({
          session,
          user: session?.user || null,
          userRole,
          loading: false,
          isAuthenticated: !!session
        });

      } catch (error: any) {
        console.error('Erreur d\'initialisation auth:', error);
        setAuthState({
          session: null,
          user: null,
          userRole: null,
          loading: false,
          isAuthenticated: false
        });
      }
    };

    initializeAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event);

        if (event === 'SIGNED_OUT' || !session) {
          setAuthState({
            session: null,
            user: null,
            userRole: null,
            loading: false,
            isAuthenticated: false
          });

          if (event === 'SIGNED_OUT') {
            toast({
              title: "Déconnecté",
              description: "Session terminée avec succès",
            });
          }
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          let userRole = null;
          
          if (session.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role, nom, prenom')
              .eq('id', session.user.id)
              .single();
            
            userRole = profile?.role || null;
          }

          setAuthState({
            session,
            user: session.user,
            userRole,
            loading: false,
            isAuthenticated: true
          });

          if (event === 'SIGNED_IN') {
            toast({
              title: "Connexion réussie",
              description: `Bienvenue ${session.user.email}`,
            });
          }
        } else if (event === 'PASSWORD_RECOVERY') {
          toast({
            title: "Récupération de mot de passe",
            description: "Vérifiez votre email pour réinitialiser votre mot de passe",
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [toast]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Erreur de déconnexion:', error);
      toast({
        title: "Erreur de déconnexion",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return session;
    } catch (error: any) {
      console.error('Erreur de rafraîchissement:', error);
      return null;
    }
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!authState.userRole) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(authState.userRole);
  };

  const isSecretaire = () => hasRole('secretaire');
  const isMedecin = () => hasRole('medecin');

  return {
    ...authState,
    signOut,
    refreshSession,
    hasRole,
    isSecretaire,
    isMedecin
  };
};
