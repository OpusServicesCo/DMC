
import { Trash2, Ban } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { OperationCaisse } from "@/types/models";

interface OperationTableProps {
  operations: OperationCaisse[] | undefined;
  onDelete: (id: string) => void;
}

export function OperationTable({ operations, onDelete }: OperationTableProps) {
  if (!operations || operations.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <p>Aucune opération de caisse enregistrée</p>
      </div>
    );
  }

  const handleDelete = (operation: OperationCaisse) => {
  if (operation.id.startsWith('paiement-')) {
    alert("Cette opération automatique ne peut pas être supprimée. Modifiez le paiement correspondant.");
    return;
  }

  if (operation.type === 'sortie') {
    alert("Vous ne pouvez pas supprimer une sortie.");
    return;
  }

  if (confirm("Êtes-vous sûr de vouloir supprimer cette opération ?")) {
    onDelete(operation.id);
  }
};

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {operations.map((operation) => {
              const isAutomatic = operation.id.startsWith('paiement-');
              
              return (
                <tr key={operation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(operation.date), 'dd MMMM yyyy', { locale: fr })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        operation.type === 'entrée'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {operation.type}
                      </span>
                      {isAutomatic && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Auto
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCategorie(operation.categorie)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {operation.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    <span className={operation.type === 'entrée' ? 'text-green-600' : 'text-red-600'}>
                      {operation.type === 'entrée' ? '+' : '-'} {operation.montant.toLocaleString()} FCFA
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isAutomatic ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 cursor-not-allowed"
                        disabled
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(operation)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatCategorie(categorie: string): string {
  const categories: Record<string, string> = {
    'paiement_consultation': 'Paiement consultation',
    'paiement_traitement': 'Paiement traitement',
    'frais_operationnels': 'Frais opérationnels',
    'salaires': 'Salaires',
    'fournitures_medicales': 'Fournitures médicales',
    'equipement': 'Équipement',
    'maintenance': 'Maintenance',
    'loyer': 'Loyer',
    'electricite': 'Électricité',
    'eau': 'Eau',
    'telephone': 'Téléphone/Internet',
    'carburant': 'Carburant',
    'autre': 'Autre',
  };
  
  return categories[categorie] || categorie;
}
