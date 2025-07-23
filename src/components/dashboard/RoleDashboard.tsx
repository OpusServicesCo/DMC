
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SecretaireDashboard } from "./SecretaireDashboard";
import { MedecinDashboard } from "./MedecinDashboard";
import { UserRole } from "@/types/roles";

interface RoleDashboardProps {
  userRole: UserRole;
}

export function RoleDashboard({ userRole }: RoleDashboardProps) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  switch (userRole) {
    case 'secretaire':
      return <SecretaireDashboard user={user} />;
    case 'medecin':
      return <MedecinDashboard user={user} />;
    default:
      return <div>Rôle non reconnu</div>;
  }
}
