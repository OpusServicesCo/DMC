
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, Calendar, Edit, FileText } from "lucide-react";

interface MobilePatientCardProps {
  patient: any;
  onEdit?: (patient: any) => void;
  onViewHistory?: (patient: any) => void;
}

export function MobilePatientCard({ patient, onEdit, onViewHistory }: MobilePatientCardProps) {
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-medical-600" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {patient.nom} {patient.prenom}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {calculateAge(patient.date_naissance)} ans
              </p>
            </div>
          </div>
          <Badge variant={patient.sexe === "M" ? "default" : "secondary"} className="text-xs">
            {patient.sexe === "M" ? "M" : "F"}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-3">
          {patient.telephone && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <Phone className="h-3 w-3" />
              <span>{patient.telephone}</span>
            </div>
          )}
          {patient.email && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <Mail className="h-3 w-3" />
              <span>{patient.email}</span>
            </div>
          )}
          {patient.groupe_sanguin && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium">Groupe sanguin:</span>
              <Badge variant="outline" className="text-xs">{patient.groupe_sanguin}</Badge>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(patient)}
              className="flex-1 text-xs"
            >
              <Edit className="h-3 w-3 mr-1" />
              Modifier
            </Button>
          )}
          {onViewHistory && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewHistory(patient)}
              className="flex-1 text-xs"
            >
              <FileText className="h-3 w-3 mr-1" />
              Historique
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
