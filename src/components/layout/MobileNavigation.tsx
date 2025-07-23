
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  CreditCard, 
  Bell,
  Wallet,
  Settings,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const navigationItems = [
  { title: "Accueil", url: "/", icon: Home },
  { title: "Rendez-vous", url: "/rendez-vous", icon: Calendar },
  { title: "Consultations", url: "/consultations", icon: FileText },
  { title: "Patients", url: "/patients", icon: Users },
  { title: "Factures", url: "/factures", icon: FileText },
  { title: "Paiements", url: "/paiements", icon: CreditCard },
  { title: "Caisse", url: "/caisse", icon: Wallet },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Paramètres", url: "/settings", icon: Settings },
];

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-lg font-bold text-medical-600">DMC</h1>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle className="text-medical-600">Cabinet DMC</SheetTitle>
            </SheetHeader>
            <nav className="mt-6">
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                        isActive
                          ? "bg-medical-50 text-medical-700 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </NavLink>
                ))}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
