
import { ArrowLeft, Plus, Shield, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PaiementHeaderProps {
  onNewPaiement: () => void;
}

export function PaiementHeader({ onNewPaiement }: PaiementHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold text-medical-700">Paiements</h1>
      </div>
      
      <div className="flex items-center gap-3">
        
        
        <Button 
          variant="outline" 
          onClick={() => navigate("/notifications")}
          className="flex items-center gap-2"
        >
          <Bell className="h-4 w-4" />
          Notifications
        </Button>
        
        <Button className="bg-medical-600 hover:bg-medical-700" onClick={onNewPaiement}>
          <Plus className="mr-2" />
          Nouveau paiement
        </Button>
      </div>
    </div>
  );
}
