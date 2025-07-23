
import { ArrowLeft, Plus, FileText, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface CaisseHeaderProps {
  onNouvelleOperation: () => void;
}

export function CaisseHeader({ onNouvelleOperation }: CaisseHeaderProps) {
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
        <h1 className="text-2xl font-bold text-medical-700">Gestion de Caisse</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          onClick={() => navigate("/rapports-caisse")}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Rapports
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => navigate("/statistiques-caisse")}
          className="flex items-center gap-2"
        >
          <PieChart className="h-4 w-4" />
          Statistiques
        </Button>
        
        <Button className="bg-medical-600 hover:bg-medical-700" onClick={onNouvelleOperation}>
          <Plus className="mr-2" />
          Nouvelle opération
        </Button>
      </div>
    </div>
  );
}
