
import { Input } from "@/components/ui/input";

interface MotifInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const MotifInput = ({ value, onChange }: MotifInputProps) => {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">Motif</label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Entrez le motif"
        required
      />
    </div>
  );
};
