
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, FileText, CreditCard, UserPlus, DollarSign, Printer, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface SecretaireDashboardProps {
  user: any;
}

export function SecretaireDashboard({ user }: SecretaireDashboardProps) {
  const secretaireFunctions = [
    {
      title: "Gestion Patients",
      description: "Créer et modifier les dossiers patients",
      icon: UserPlus,
      link: "/patients",
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Planning & RDV",
      description: "Programmer et gérer les rendez-vous",
      icon: Calendar,
      link: "/rendez-vous",
      color: "from-green-500 to-green-600",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      badge: "Rappels auto"
    },
    {
      title: "Gestion Factures",
      description: "Créer et gérer les factures patients",
      icon: FileText,
      link: "/factures",
      color: "from-purple-500 to-purple-600",
      textColor: "text-purple-700",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
  
    {
      title: "Caisse & Statistiques",
      description: "Voir les mouvements de caisse et stats",
      icon: DollarSign,
      link: "/caisse",
      color: "from-medical-500 to-medical-600",
      textColor: "text-medical-700",
      bgColor: "bg-medical-50",
      borderColor: "border-medical-200",
      badge: "Nouveau"
    },
    {
      title: "Impression",
      description: "Impression factures et documents",
      icon: Printer,
      link: "/factures?action=imprimer",
      color: "from-gray-500 to-gray-600",
      textColor: "text-gray-700",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-medical-700 to-medical-500 bg-clip-text text-transparent">
            Tableau de bord - Secrétaire
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            Bienvenue {user?.email?.split('@')[0]}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge className="bg-green-100 text-green-700 border-green-200">
              Secrétaire Médicale
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              En service
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
        {secretaireFunctions.map((func) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <Calendar className="h-6 w-6 mr-3" />
              Rendez-vous du Jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Consultations programmées aujourd'hui
            </p>
            <Link to="/rendez-vous">
              <Button 
                variant="outline" 
                className="w-full border-green-200 text-green-700 hover:bg-green-50"
              >
                Voir le planning
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-medical-200 bg-gradient-to-br from-medical-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center text-medical-700">
              <FileText className="h-6 w-6 mr-3" />
              Activité Récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Consultations et factures récentes
            </p>
            <Link to="/consultations">
              <Button 
                variant="outline" 
                className="w-full border-medical-200 text-medical-700 hover:bg-medical-50"
              >
                Voir l'historique
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-700">
              <TrendingUp className="h-6 w-6 mr-3" />
              Statistiques Caisse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Aperçu financier du cabinet
            </p>
            <Link to="/caisse">
              <Button 
                variant="outline" 
                className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                Voir la caisse
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
