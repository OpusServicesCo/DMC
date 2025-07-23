
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

interface DateTimeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const DateTimeInput = ({ value, onChange }: DateTimeInputProps) => {
  // Obtenir la date et l'heure actuelles au format ISO
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

  return (
    <div>
      <label className="text-sm font-medium text-gray-700">Date et heure</label>
      <div className="relative mt-1">
        <Input
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={minDateTime}
          className="pl-10"
          required
        />
        <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
};
