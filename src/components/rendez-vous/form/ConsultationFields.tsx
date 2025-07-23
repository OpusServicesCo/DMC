
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ConsultationFieldsProps {
  montant: number;
  observations: string;
  diagnostic: string;
  onMontantChange: (value: number) => void;
  onObservationsChange: (value: string) => void;
  onDiagnosticChange: (value: string) => void;
}

export const ConsultationFields = ({
  montant,
  observations,
  diagnostic,
  onMontantChange,
  onObservationsChange,
  onDiagnosticChange,
}: ConsultationFieldsProps) => {
  return (
    <>
      <div>
        <label className="text-sm font-medium text-gray-700">Montant (FCFA)</label>
        <Input
          type="number"
          value={montant}
          onChange={(e) => onMontantChange(parseFloat(e.target.value))}
          placeholder="Entrez le montant"
          required
          min="1"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Observations</label>
        <Textarea
          value={observations}
          onChange={(e) => onObservationsChange(e.target.value)}
          placeholder="Observations médicales (optionnel)"
          className="min-h-[100px]"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Diagnostic</label>
        <Textarea
          value={diagnostic}
          onChange={(e) => onDiagnosticChange(e.target.value)}
          placeholder="Diagnostic médical (optionnel)"
          className="min-h-[100px]"
        />
      </div>
    </>
  );
};
