
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, FileText, Phone } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MobileConsultationCardProps {
  consultation: any;
  onEdit?: (consultation: any) => void;
  onView?: (consultation: any) => void;
  onGenerateInvoice?: (consultation: any) => void;
}

export function MobileConsultationCard({ 
  consultation, 
  onEdit, 
  onView, 
  onGenerateInvoice 
}: MobileConsultationCardProps) {
  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "effectué":
        return <Badge className="bg-green-100 text-green-800 text-xs">Effectué</Badge>;
      case "annulé":
        return <Badge className="bg-red-100 text-red-800 text-xs">Annulé</Badge>;
      default:
        return <Badge className="bg-orange-100 text-orange-800 text-xs">En attente</Badge>;
    }
  };

  return (
    <Card className="mb-3 border-l-4 border-l-medical-500">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-sm">
                {consultation.patients?.nom} {consultation.patients?.prenom}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(consultation.date), "dd/MM/yyyy", { locale: fr })}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              <Clock className="h-3 w-3" />
              <span>{format(new Date(consultation.date), "HH:mm")}</span>
            </div>
            {consultation.patients?.telephone && (
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                <Phone className="h-3 w-3" />
                <span>{consultation.patients.telephone}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(consultation.statut_rendez_vous)}
            <span className="text-sm font-medium text-medical-600">
              {consultation.montant?.toLocaleString()} FCFA
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs mb-3">
          <span className="font-medium">Motif:</span> {consultation.motif}
        </div>

        <div className="flex gap-2">
          {onView && (
            <Button variant="outline" size="sm" onClick={() => onView(consultation)} className="flex-1 text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Voir
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(consultation)} className="flex-1 text-xs">
              Modifier
            </Button>
          )}
          {onGenerateInvoice && consultation.statut_rendez_vous === "effectué" && (
            <Button variant="outline" size="sm" onClick={() => onGenerateInvoice(consultation)} className="flex-1 text-xs">
              Facture
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
