import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  Eye, 
  Calendar, 
  User, 
  TrendingUp,
  Clock,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface Patient {
  id: string;
  nom: string;
  prenom: string;
  derniereConsultation?: string;
  prochainRdv?: string;
  nombreConsultations: number;
  statut: 'actif' | 'suivi' | 'maintenance';
}

interface QuickAccessConsultationsProps {
  title?: string;
  limit?: number;
}

// Données simulées des patients avec historique
const patientsAvecHistorique: Patient[] = [
  {
    id: '1',
    nom: 'Dupont',
    prenom: 'Marie',
    derniereConsultation: '2024-05-15T14:30:00',
    prochainRdv: '2024-06-15T14:30:00',
    nombreConsultations: 5,
    statut: 'maintenance'
  },
  {
    id: '2',
    nom: 'Martin',
    prenom: 'Jean',
    derniereConsultation: '2024-05-10T09:00:00',
    prochainRdv: '2024-06-10T09:00:00',
    nombreConsultations: 3,
    statut: 'suivi'
  },
  {
    id: '3',
    nom: 'Bernard',
    prenom: 'Sophie',
    derniereConsultation: '2024-05-08T16:30:00',
    nombreConsultations: 8,
    statut: 'actif'
  },
  {
    id: '4',
    nom: 'Rousseau',
    prenom: 'Pierre',
    derniereConsultation: '2024-04-30T11:00:00',
    prochainRdv: '2024-06-05T11:00:00',
    nombreConsultations: 12,
    statut: 'maintenance'
  },
  {
    id: '5',
    nom: 'Leroy',
    prenom: 'Emma',
    derniereConsultation: '2024-05-12T14:00:00',
    nombreConsultations: 2,
    statut: 'suivi'
  }
];

const statutColors = {
  actif: 'bg-green-100 text-green-800',
  suivi: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-purple-100 text-purple-800'
};

const statutLabels = {
  actif: 'Actif',
  suivi: 'En suivi',
  maintenance: 'Maintenance'
};

export function QuickAccessConsultations({ 
  title = "Accès rapide - Historique patients", 
  limit = 5 
}: QuickAccessConsultationsProps) {
  const navigate = useNavigate();

  const patientsRecents = patientsAvecHistorique
    .sort((a, b) => new Date(b.derniereConsultation || '').getTime() - new Date(a.derniereConsultation || '').getTime())
    .slice(0, limit);

  const handleViewHistory = (patientId: string) => {
    navigate(`/patients/${patientId}?tab=history`);
  };

  const handleViewPatient = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  return (
    <Card className="border-medical-200">
      <CardHeader className="bg-gradient-to-r from-medical-50 to-blue-50">
        <CardTitle className="flex items-center gap-3 text-medical-800">
          <History className="h-6 w-6" />
          {title}
        </CardTitle>
        <p className="text-medical-600 text-sm">
          Accédez rapidement à l'historique complet des consultations de vos patients
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        {patientsRecents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun patient trouvé
            </h3>
            <p className="text-gray-600">
              Aucun patient avec historique de consultations.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {patientsRecents.map((patient) => (
              <div key={patient.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {patient.prenom} {patient.nom}
                      </h4>
                      <Badge className={statutColors[patient.statut]}>
                        {statutLabels[patient.statut]}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {patient.nombreConsultations} consultation{patient.nombreConsultations > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                      {patient.derniereConsultation && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            Dernière: {format(new Date(patient.derniereConsultation), 'dd/MM/yyyy', { locale: fr })}
                          </span>
                        </div>
                      )}
                      
                      {patient.prochainRdv && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Prochain: {format(new Date(patient.prochainRdv), 'dd/MM/yyyy', { locale: fr })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleViewHistory(patient.id)}
                      variant="outline"
                      size="sm"
                      className="border-medical-200 text-medical-600 hover:bg-medical-50"
                    >
                      <History className="h-4 w-4 mr-1" />
                      Historique
                    </Button>
                    
                    <Button
                      onClick={() => handleViewPatient(patient.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {patientsRecents.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <Button 
              onClick={() => navigate('/patients')}
              variant="outline" 
              className="w-full"
            >
              Voir tous les patients
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
