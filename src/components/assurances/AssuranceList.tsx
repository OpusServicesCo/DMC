
import { useState } from "react";
import { Edit, Trash2, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AssuranceType {
  id: string;
  nom_assurance: string;
  numero_assure: string | null;
  type_assurance: string | null;
  patient_id: string | null;
  created_at: string;
  patients?: {
    nom: string;
    prenom: string;
  } | null;
}

interface AssuranceListProps {
  assurances: AssuranceType[];
  isLoading: boolean;
  onEdit: (patientId: string) => void;
  onRefresh: () => void;
}

export function AssuranceList({ assurances, isLoading, onEdit, onRefresh }: AssuranceListProps) {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const { error } = await supabase
        .from("assurances")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Assurance supprimée",
        description: "L'assurance a été supprimée avec succès",
      });
      
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression: " + error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-medical-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Shield className="mr-2 h-5 w-5 text-medical-600" />
          Liste des assurances
        </h2>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Actualiser
        </Button>
      </div>

      {assurances.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>Aucune assurance enregistrée.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assurance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Numéro assuré
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assurances.map((assurance) => (
                <tr key={assurance.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {assurance.patients ? (
                      <div className="text-sm font-medium text-gray-900">
                        {assurance.patients.nom} {assurance.patients.prenom}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Non assigné</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {assurance.nom_assurance}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {assurance.numero_assure || "Non spécifié"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {assurance.type_assurance || "Standard"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(assurance.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(assurance.id)}
                        disabled={deletingId === assurance.id}
                      >
                        {deletingId === assurance.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
