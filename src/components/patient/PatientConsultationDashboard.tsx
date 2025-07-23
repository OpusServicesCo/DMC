import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Clock,
  Phone,
  Mail,
  MapPin,
  Plus,
  History,
  ChevronRight
} from 'lucide-react';
import { ConsultationHistory } from './ConsultationHistory';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Patient {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  poidsInitial?: number;
  poidsActuel?: number;
  objectif?: string;
  allergies?: string[];
  pathologies?: string[];
  derniereConsultation?: string;
  prochainRdv?: string;
}

interface PatientConsultationDashboardProps {
  patient: Patient;
  onNewConsultation: () => void;
  onScheduleAppointment: () => void;
  onEditPatient: () => void;
}

// Données patient simulées
const mockPatient: Patient = {
  id: '1',
  nom: 'Dupont',
  prenom: 'Marie',
  dateNaissance: '1985-03-15',
  telephone: '06 12 34 56 78',
  email: 'marie.dupont@email.com',
  adresse: '123 Rue de la Santé, 75014 Paris',
  poidsInitial: 85,
  poidsActuel: 75,
  objectif: 'Perte de poids - 15kg (objectif atteint)',
  allergies: ['Arachides', 'Fruits à coque'],
  pathologies: ['Diabète type 2 contrôlé'],
  derniereConsultation: '2024-05-15T14:30:00',
  prochainRdv: '2024-06-15T14:30:00'
};

export function PatientConsultationDashboard({ 
  patient = mockPatient, 
  onNewConsultation, 
  onScheduleAppointment, 
  onEditPatient 
}: PatientConsultationDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);

  const calculateAge = (dateNaissance: string) => {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getProgressStatus = () => {
    if (!patient.poidsInitial || !patient.poidsActuel) return null;
    
    const difference = patient.poidsInitial - patient.poidsActuel;
    const percentage = (difference / patient.poidsInitial * 100).toFixed(1);
    
    return {
      difference,
      percentage,
      status: difference > 0 ? 'success' : difference < 0 ? 'warning' : 'neutral'
    };
  };

  const progress = getProgressStatus();

  const handleViewConsultationDetails = (consultationId: string) => {
    setSelectedConsultationId(consultationId);
    // Ici vous pourriez ouvrir un modal ou naviguer vers une page détaillée
    console.log('Voir détails consultation:', consultationId);
  };

  return (
    <div className="space-y-6">
      {/* En-tête patient */}
      <Card className="border-medical-200">
        <CardHeader className="bg-gradient-to-r from-medical-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-medical-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-medical-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-medical-800">
                  {patient.prenom} {patient.nom}
                </CardTitle>
                <p className="text-medical-600">
                  {calculateAge(patient.dateNaissance)} ans • Patient depuis {format(new Date(patient.dateNaissance), 'MMMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={onNewConsultation} className="bg-medical-600 hover:bg-medical-700">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle consultation
              </Button>
              <Button onClick={onScheduleAppointment} variant="outline" className="border-medical-200">
                <Calendar className="h-4 w-4 mr-2" />
                Planifier RDV
              </Button>
              <Button onClick={onEditPatient} variant="outline" className="border-medical-200">
                Modifier
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Informations rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="font-medium">{patient.telephone || 'Non renseigné'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium truncate">{patient.email || 'Non renseigné'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Dernière consultation</p>
                <p className="font-medium">
                  {patient.derniereConsultation ? 
                    format(new Date(patient.derniereConsultation), 'dd/MM/yyyy') : 
                    'Aucune'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Prochain RDV</p>
                <p className="font-medium">
                  {patient.prochainRdv ? 
                    format(new Date(patient.prochainRdv), 'dd/MM/yyyy') : 
                    'À planifier'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progression */}
      {progress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progression
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{patient.poidsInitial}kg</div>
                <div className="text-sm text-gray-600">Poids initial</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{patient.poidsActuel}kg</div>
                <div className="text-sm text-gray-600">Poids actuel</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  progress.status === 'success' ? 'text-green-600' : 
                  progress.status === 'warning' ? 'text-orange-600' : 'text-gray-600'
                }`}>
                  -{progress.difference}kg
                </div>
                <div className="text-sm text-gray-600">
                  {progress.percentage}% de progression
                </div>
              </div>
            </div>
            {patient.objectif && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Objectif:</strong> {patient.objectif}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="history">Historique consultations</TabsTrigger>
          <TabsTrigger value="medical">Infos médicales</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prochains RDV */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Prochains rendez-vous
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.prochainRdv ? (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Suivi nutritionnel</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(patient.prochainRdv), 'EEEE d MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-3">Aucun RDV planifié</p>
                    <Button onClick={onScheduleAppointment} size="sm">
                      Planifier un RDV
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Résumé récent */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Dernière consultation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.derniereConsultation ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-purple-100 text-purple-800">
                        Suivi nutritionnel
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {format(new Date(patient.derniereConsultation), 'dd/MM/yyyy')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Objectif atteint ! Patient très satisfait de sa progression. 
                      Passage en mode maintenance avec consultations trimestrielles.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('history')}>
                      <History className="h-4 w-4 mr-2" />
                      Voir l'historique complet
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-3">Aucune consultation enregistrée</p>
                    <Button onClick={onNewConsultation} size="sm">
                      Première consultation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <ConsultationHistory
            patientId={patient.id}
            patientName={`${patient.prenom} ${patient.nom}`}
            onViewDetails={handleViewConsultationDetails}
          />
        </TabsContent>
        
        <TabsContent value="medical" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allergies */}
            <Card>
              <CardHeader>
                <CardTitle>Allergies et intolérances</CardTitle>
              </CardHeader>
              <CardContent>
                {patient.allergies && patient.allergies.length > 0 ? (
                  <div className="space-y-2">
                    {patient.allergies.map((allergie, index) => (
                      <Badge key={index} variant="destructive" className="mr-2">
                        {allergie}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Aucune allergie connue</p>
                )}
              </CardContent>
            </Card>

            {/* Pathologies */}
            <Card>
              <CardHeader>
                <CardTitle>Pathologies</CardTitle>
              </CardHeader>
              <CardContent>
                {patient.pathologies && patient.pathologies.length > 0 ? (
                  <div className="space-y-2">
                    {patient.pathologies.map((pathologie, index) => (
                      <Badge key={index} variant="secondary" className="mr-2">
                        {pathologie}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Aucune pathologie connue</p>
                )}
              </CardContent>
            </Card>

            {/* Adresse */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Adresse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{patient.adresse || 'Adresse non renseignée'}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
