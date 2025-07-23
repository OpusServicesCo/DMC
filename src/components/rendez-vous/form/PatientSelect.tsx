
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Patient } from "@/types/models";

interface PatientSelectProps {
  patients: Patient[];
  value: string;
  onChange: (value: string) => void;
}

export const PatientSelect = ({ patients, value, onChange }: PatientSelectProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Patient</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sélectionner un patient" />
        </SelectTrigger>
        <SelectContent>
          {patients?.map((patient) => (
            <SelectItem key={patient.id} value={patient.id}>
              {patient.nom} {patient.prenom} {patient.groupe_sanguin ? `(${patient.groupe_sanguin})` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
