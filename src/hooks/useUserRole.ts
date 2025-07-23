
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/roles';

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUserRole = async () => {
      try {
        setIsLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Erreur lors de la récupération de l\'utilisateur:', userError);
          setUserRole(null);
          return;
        }
        
        if (user) {
          console.log('User found:', user.id);
          
          // Récupérer le rôle depuis la table profiles avec maybeSingle pour éviter les erreurs
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
          
          console.log('Profile data:', profile, 'Error:', error);
          
          if (error) {
            console.error('Erreur lors de la récupération du profil:', error);
            setUserRole(null);
          } else if (profile && profile.role) {
            console.log('Setting user role:', profile.role);
            setUserRole(profile.role as UserRole);
          } else {
            console.log('No profile found or no role set');
            setUserRole(null);
          }
        } else {
          console.log('No user found');
          setUserRole(null);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du rôle:', error);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    getUserRole();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Attendre un peu pour que le trigger ait le temps de créer le profil
        setTimeout(() => {
          getUserRole();
        }, 1500);
      } else if (event === 'SIGNED_OUT') {
        setUserRole(null);
        setIsLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Rafraîchir le rôle lors du renouvellement du token
        getUserRole();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { userRole, isLoading };
};
