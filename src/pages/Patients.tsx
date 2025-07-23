
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PatientList } from "@/components/patients/PatientList";
import { PatientForm } from "@/components/patients/PatientForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Patient } from "@/types/models";

export default function Patients() {
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Gestion des patients
          </h1>
          <Button 
            onClick={() => setShowForm(true)}
            className="dark:bg-medical-600 dark:hover:bg-medical-700 dark:text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau patient
          </Button>
        </div>

        {showForm && (
          <PatientForm
            patient={editingPatient || undefined}
            onClose={() => {
              setShowForm(false);
              setEditingPatient(null);
            }}
          />
        )}

        <PatientList
          onEdit={(patient: Patient) => {
            setEditingPatient(patient);
            setShowForm(true);
          }}
        />
      </div>
    </MainLayout>
  );
}
