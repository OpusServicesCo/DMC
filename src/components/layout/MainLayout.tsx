
import { ReactNode, memo, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { NotificationIndicator } from "./NotificationIndicator";
import { PageTransition } from "@/components/ui/page-transition";
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  CreditCard, 
  Settings, 
  LogOut,
  Stethoscope,
  DollarSign
} from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = memo(function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole } = useUserRole();

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  }, [navigate]);

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  const navItems = useMemo(() => {
    const commonItems = [
      { path: "/", icon: Home, label: "Accueil" }
    ];

    if (userRole === 'medecin') {
      return [
        ...commonItems,
        { path: "/patients", icon: Users, label: "Patients" },
        { path: "/consultation-specialisee", icon: Stethoscope, label: "Consultations" },
        { path: "/consultations", icon: FileText, label: "Historique" }
      ];
    } else if (userRole === 'secretaire') {
      return [
        ...commonItems,
        { path: "/patients", icon: Users, label: "Patients" },
        { path: "/rendez-vous", icon: Calendar, label: "Rendez-vous" },
        { path: "/paiements", icon: CreditCard, label: "Paiements" },
        { path: "/caisse", icon: DollarSign, label: "Caisse" },
        { path: "/factures", icon: FileText, label: "Factures" }
      ];
    }

    return commonItems;
  }, [userRole]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Card className="rounded-none border-0 border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-medical-600 to-medical-700 rounded-lg flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Cabinet DMC</h1>
                  <p className="text-xs text-gray-500">Nutrition & Santé</p>
                </div>
              </Link>
              
              <Separator orientation="vertical" className="h-8" />
              
              <Badge variant="outline" className="text-xs">
                {userRole === 'medecin' ? 'Médecin' : 'Secrétaire'}
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <NotificationIndicator />
              <Link to="/settings">
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation responsive améliorée */}
      <Card className="rounded-none border-0 border-b bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-2 sm:px-4">
          <nav className="flex justify-start sm:justify-center overflow-x-auto py-2 gap-1 scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path} className="flex-shrink-0">
                  <Button
                    variant={active ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center space-x-2 transition-all duration-200 min-w-fit ${
                      active
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg scale-105" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105"
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline text-sm font-medium">{item.label}</span>
                    {/* Badge mobile pour indiquer la page active */}
                    {active && (
                      <div className="sm:hidden absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </Card>

      {/* Main Content */}
      <main className="flex-1">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
    </div>
  );
});

export { MainLayout };
