
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, FileText, Users, UserPlus, Search, Calendar, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface MedecinDashboardProps {
  user: any;
}

export function MedecinDashboard({ user }: MedecinDashboardProps) {
  const medecinFunctions = [
    {
      title: "Chercher un Patient",
      description: "Recherche rapide dans la base de données des patients",
      icon: Search,
      link: "/patients?action=recherche",
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: " Patient",
      description: "Créer un nouveau dossier patient complet",
      icon: UserPlus,
      link: "/patients?action=nouveau",
      color: "from-green-500 to-green-600",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      badge: "Rapide"
    },
    {
      title: "Consultation Nutritionnelle",
      description: "Nouvelle consultation avec diagnostic complet",
      icon: Stethoscope,
      link: "/consultation-specialisee",
      color: "from-medical-500 to-medical-600",
      textColor: "text-medical-700",
      bgColor: "bg-medical-50",
      borderColor: "border-medical-200",
      badge: "IA Intégrée"
    },
   
    {
      title: "Historique Consultations",
      description: "Voir l'historique complet des consultations",
      icon: FileText,
      link: "/consultations",
      color: "from-orange-500 to-orange-600",
      textColor: "text-orange-700",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-medical-700 to-medical-500 bg-clip-text text-transparent">
            Tableau de bord - Médecin
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            Bienvenue Dr.  {user?.email?.split('@')[0] }
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge className="bg-medical-100 text-medical-700 border-medical-200">
              Médecin Nutritionniste
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              En ligne
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {medecinFunctions.map((func) => (
          <Card 
            key={func.title} 
            className={`hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${func.borderColor} ${func.bgColor} group cursor-pointer`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`text-lg font-semibold flex items-center ${func.textColor}`}>
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${func.color} text-white mr-3 group-hover:scale-110 transition-transform`}>
                    <func.icon className="h-5 w-5" />
                  </div>
                  <div>
                    {func.title}
                    {func.badge && (
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800 text-xs">
                        {func.badge}
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {func.description}
              </p>
              <Link to={func.link}>
                <Button className={`w-full bg-gradient-to-r ${func.color} hover:opacity-90 text-white font-medium py-2 transition-all duration-200`}>
                  Accéder
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-medical-200 bg-gradient-to-br from-medical-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center text-medical-700">
              <Stethoscope className="h-6 w-6 mr-3" />
              Activité Récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Consultations et patients récents de la journée
            </p>
            <div className="flex gap-3">
              <Link to="/consultations">
                <Button 
                  variant="outline" 
                  className="border-medical-200 text-medical-700 hover:bg-medical-50"
                >
                  Voir l'activité
                </Button>
              </Link>
              <Link to="/patients">
                <Button 
                  variant="outline" 
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Patients du jour
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <TrendingUp className="h-6 w-6 mr-3" />
              Statistiques Rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Aperçu de votre activité professionnelle
            </p>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-700">--</div>
                <div className="text-xs text-green-600">Consultations ce mois</div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">--</div>
                <div className="text-xs text-blue-600">Patients actifs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
