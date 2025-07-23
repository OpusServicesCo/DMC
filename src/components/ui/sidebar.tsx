
import {
  BarChart,
  Bell,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  LayoutDashboard,
  LucideIcon,
  Menu,
  MessageSquare,
  Receipt,
  Settings,
  Stethoscope,
  User,
  Users,
  UserPlus,
  Search,
  Printer,
} from "lucide-react";
import { NotificationIcon } from "@/components/layout/NotificationIcon";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { PaymentBadge, ConsultationBadge, MessageBadge } from "@/components/notifications/NotificationBadge";
import { useNotifications } from "@/contexts/NotificationContext";
import { useNotifications as useDBNotifications } from "@/hooks/useNotifications";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/types/roles";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles?: UserRole[];
  badge?: string;
}

export function Sidebar({ className, ...props }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const { userRole } = useUserRole();
  const { 
    paymentDueCount, 
    consultationCompletedCount, 
    unbilledActsCount,
    unreadMessagesCount 
  } = useNotifications();
  
  const { notifications: dbNotifications } = useDBNotifications();
  const dbNotificationCount = dbNotifications?.length || 0;

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
      }
    };
    getProfile();
  }, [toast]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast({
        title: "Déconnexion",
        description: "Vous êtes déconnecté avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const allSidebarItems: NavItem[] = [
    {
      title: "Tableau de bord",
      url: "/",
      icon: BarChart,
    },
    // Fonctions Médecin
    {
      title: "Chercher Patient",
      url: "/patients?action=recherche",
      icon: Search,
      roles: ['medecin']
    },
    {
      title: "Nouveau Patient",
      url: "/patients?action=nouveau",
      icon: UserPlus,
      roles: ['medecin', 'secretaire']
    },
    {
      title: "Consultation IA",
      url: "/consultation-specialisee", 
      icon: Stethoscope,
      roles: ['medecin'],
      badge: "IA"
    },
    {
      title: "Historique Patient",
      url: "/patients/1", // Par défaut, ou dynamique selon le dernier patient consulté
      icon: FileText,
      roles: ['medecin'],
      badge: "Rapide"
    },
    {
      title: "Dossiers Patients",
      url: "/patients",
      icon: Users,
      roles: ['medecin', 'secretaire']
    },
    {
      title: "Historique Consultations",
      url: "/consultations",
      icon: FileText,
      roles: ['medecin'],
      badge: "Médecin"
    },
    // Fonctions Secrétaire
    {
      title: "Planning & RDV",
      url: "/rendez-vous",
      icon: Calendar,
      roles: ['secretaire'],
      badge: "Amélioré"
    },
    {
      title: "Gestion Factures",
      url: "/factures",
      icon: Receipt,
      roles: ['secretaire']
    },
    {
      title: "Historique Paiements",
      url: "/paiements",
      icon: CreditCard,
      roles: ['secretaire'],
      badge: "Secrétaire"
    },
    {
      title: "Caisse & Stats",
      url: "/caisse",
      icon: DollarSign,
      roles: ['secretaire'],
      badge: "Stats"
    },
    {
      title: "Impression",
      url: "/factures?action=imprimer",
      icon: Printer,
      roles: ['secretaire']
    },
    // Fonctions communes
    {
      title: "Notifications",
      url: "/notifications",
      icon: Bell,
    },
    {
      title: "Paramètres",
      url: "/settings",
      icon: Settings,
    },
  ];

  // Filtrer les éléments selon le rôle
  const sidebarItems = allSidebarItems.filter(item => 
    !item.roles || item.roles.includes(userRole as UserRole)
  );

  return (
    <div
      className={cn(
        "hidden border-r bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 lg:block fixed left-0 top-0 h-full w-64 z-30 shadow-lg border-gray-200",
        className
      )}
      {...props}
    >
      <div className="flex flex-col space-y-6 py-6 h-full">
        <div className="px-6 py-4 bg-medical-50 mx-3 rounded-lg border border-medical-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-lg text-medical-800">Cabinet Nutrition</h1>
              <p className="text-xs text-medical-600 mt-1">Gestion IA intégrée</p>
            </div>
            
            {/* Notifications rapides */}
            <div className="flex items-center gap-2">
              <NotificationDropdown />
              
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-medical-100">
                  <Avatar className="h-10 w-10 border-2 border-medical-200">
                    <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                    <AvatarFallback className="bg-medical-100 text-medical-700 font-semibold">
                      {userRole === 'medecin' ? 'Dr' : 'Sec'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white dark:bg-gray-900 border border-gray-200 z-50" align="end" forceMount>
                <DropdownMenuItem className="focus:outline-none">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil ({userRole === 'medecin' ? 'Médecin' : 'Secrétaire'})</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="focus:outline-none">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="focus:outline-none text-red-600">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-2 px-3">
          {sidebarItems.map((item) => (
            <Link key={item.title} to={item.url}>
              <Button
                variant="ghost"
                className={cn(
                  "justify-start font-normal w-full text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-medical-50 hover:to-medical-100 rounded-lg transition-all duration-200 group relative",
                  location.pathname === item.url
                    ? "bg-gradient-to-r from-medical-100 to-medical-50 text-medical-800 border-l-4 border-medical-600 shadow-md"
                    : ""
                )}
              >
                {item.title === "Notifications" ? (
                  <div className="mr-3 relative">
                    <NotificationIcon className={cn(
                      "h-4 w-4 transition-transform group-hover:scale-110",
                      location.pathname === item.url ? "text-medical-600" : ""
                    )} />
                    {dbNotificationCount > 0 && (
                      <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                        {dbNotificationCount > 9 ? '9+' : dbNotificationCount}
                      </span>
                    )}
                  </div>
                ) : (
                  <item.icon className={cn(
                    "mr-3 h-4 w-4 transition-transform group-hover:scale-110",
                    location.pathname === item.url ? "text-medical-600" : ""
                  )} />
                )}
                <span className="flex-1 text-left">{item.title}</span>
                
                {/* Badges de notification spécifiques */}
                {item.title === "Gestion Factures" && paymentDueCount > 0 && (
                  <PaymentBadge count={paymentDueCount} />
                )}
                {item.title === "Consultation IA" && consultationCompletedCount > 0 && (
                  <ConsultationBadge count={consultationCompletedCount} />
                )}
                {item.title === "Historique Paiements" && unbilledActsCount > 0 && (
                  <ConsultationBadge count={unbilledActsCount} />
                )}
                
                {item.badge && (
                  <span className={cn(
                    "ml-2 px-2 py-1 text-xs rounded-full font-medium text-white",
                    item.badge === "IA" ? "bg-purple-600" :
                    item.badge === "Médecin" ? "bg-blue-600" :
                    item.badge === "Secrétaire" ? "bg-green-600" :
                    item.badge === "Stats" ? "bg-orange-600" :
                    "bg-medical-600"
                  )}>
                    {item.badge}
                  </span>
                )}
              </Button>
            </Link>
          ))}
        </div>
        
        {userRole && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 mx-3 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-3 h-3 rounded-full animate-pulse",
                userRole === 'medecin' ? 'bg-blue-500' : 'bg-green-500'
              )}></div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {userRole === 'medecin' ? 'Dr. Médecin Nutritionniste' : 'Secrétaire Médicale'}
                </p>
                <p className="text-xs text-gray-500">Connecté • IA Activée</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
