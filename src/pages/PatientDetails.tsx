import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PatientConsultationDashboard } from '@/components/patient/PatientConsultationDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PatientDetails() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const handleNewConsultation = () => {
    navigate(`/consultation-specialisee?patientId=${patientId}`);
  };

  const handleScheduleAppointment = () => {
    navigate(`/rendez-vous?action=nouveau&patientId=${patientId}`);
  };

  const handleEditPatient = () => {
    navigate(`/patients?action=modifier&id=${patientId}`);
  };

  const handleGoBack = () => {
    navigate('/patients');
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button 
            onClick={handleGoBack} 
            variant="outline" 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux patients
          </Button>
        </div>

        <PatientConsultationDashboard
          patient={{
            id: patientId || '1',
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
          }}
          onNewConsultation={handleNewConsultation}
          onScheduleAppointment={handleScheduleAppointment}
          onEditPatient={handleEditPatient}
        />
      </div>
    </MainLayout>
  );
}
