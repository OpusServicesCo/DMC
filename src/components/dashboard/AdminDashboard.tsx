
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Users, BarChart, Shield, Database, Bell } from "lucide-react";
import { Link } from "react-router-dom";

interface AdminDashboardProps {
  user: any;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const adminFunctions = [
    {
      title: "Gestion des Utilisateurs",
      description: "Gérer les comptes médecins et secrétaires",
      icon: Users,
      link: "/admin/users"
    },
    {
      title: "Rapports et Statistiques",
      description: "Voir les rapports d'activité",
      icon: BarChart,
      link: "/admin/reports"
    },
    {
      title: "Droits d'Accès",
      description: "Configurer les permissions",
      icon: Shield,
      link: "/admin/permissions"
    },
    {
      title: "Base de Données",
      description: "Maintenance et sauvegarde",
      icon: Database,
      link: "/admin/database"
    },
    {
      title: "Notifications Système",
      description: "Gérer les notifications",
      icon: Bell,
      link: "/notifications"
    },
    {
      title: "Paramètres Généraux",
      description: "Configuration de l'application",
      icon: Settings,
      link: "/settings"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord - Administrateur
          </h1>
          <p className="text-gray-600 mt-2">
            Administrateur: {user?.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminFunctions.map((func) => (
          <Card key={func.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <func.icon className="h-5 w-5 mr-2 text-medical-600" />
                {func.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {func.description}
              </p>
              <Link to={func.link}>
                <Button className="w-full bg-medical-600 hover:bg-medical-700">
                  Accéder
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
