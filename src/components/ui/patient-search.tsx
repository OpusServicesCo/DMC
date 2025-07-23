
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, User } from "lucide-react";

interface Patient {
  id: string;
  nom: string;
  prenom: string;
  telephone?: string;
  date_naissance: string;
}

interface PatientSearchProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onPatientSelect: (patient: Patient) => void;
  placeholder?: string;
}

export function PatientSearch({ 
  patients, 
  selectedPatient, 
  onPatientSelect,
  placeholder = "👆 Cliquez ici pour rechercher un patient..."
}: PatientSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = patients.filter(patient =>
        patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.telephone && patient.telephone.includes(searchTerm))
      );
      setFilteredPatients(filtered);
      setShowResults(true);
    } else {
      setFilteredPatients([]);
      setShowResults(false);
    }
  }, [searchTerm, patients]);

  const handlePatientSelect = (patient: Patient) => {
    onPatientSelect(patient);
    setSearchTerm(`${patient.nom} ${patient.prenom}`);
    setShowResults(false);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
          onFocus={() => {
            if (searchTerm.trim() && filteredPatients.length > 0) {
              setShowResults(true);
            }
          }}
        />
      </div>

      {showResults && filteredPatients.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            {filteredPatients.map((patient) => (
              <Button
                key={patient.id}
                variant="ghost"
                className="w-full justify-start p-3 h-auto border-b border-gray-100 last:border-b-0 hover:bg-blue-50"
                onClick={() => handlePatientSelect(patient)}
              >
                <div className="flex items-center gap-3 w-full">
                  <User className="h-4 w-4 text-blue-600" />
                  <div className="text-left flex-1">
                    <div className="font-medium">
                      {patient.nom} {patient.prenom}
                    </div>
                    <div className="text-sm text-gray-500">
                      {calculateAge(patient.date_naissance)} ans
                      {patient.telephone && ` • ${patient.telephone}`}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {selectedPatient && (
        <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Patient sélectionné : {selectedPatient.nom} {selectedPatient.prenom}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
