
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { CaisseHeader } from "@/components/caisse/CaisseHeader";
import { OperationTable } from "@/components/caisse/OperationTable";
import { CaisseStats } from "@/components/caisse/CaisseStats";
import { OperationForm } from "@/components/caisse/OperationForm";
import { useCaisse } from "@/hooks/useCaisse";
import { useToast } from "@/hooks/use-toast";

export default function Caisse() {
  const [openSortieForm, setOpenSortieForm] = useState(false);
  const { toast } = useToast();

  const { 
    operations, 
    statistiques, 
    isLoading,
    ajouterSortie,
    supprimerSortie
  } = useCaisse((error) => {
    toast({
      title: error.title,
      description: error.description,
      variant: "destructive",
    });
  });

  const handleAjouterSortie = (nouvelleOperation: any) => {
    ajouterSortie.mutate(nouvelleOperation);
    setOpenSortieForm(false);
  };

  const handleSupprimerOperation = (id: string) => {
    supprimerSortie.mutate(id);
  };

  // Debug : vérifier la valeur du solde
  console.log('🔍 Debug Caisse - Statistiques:', statistiques);
  console.log('🔍 Debug Caisse - Solde disponible:', statistiques?.solde);

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion de Caisse</h1>
            <p className="text-gray-600">
              Entrées automatiques depuis les paiements • Sorties manuelles
            </p>
          </div>
          <button
            onClick={() => setOpenSortieForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            + Nouvelle sortie
          </button>
        </div>
        
        <CaisseStats operations={operations || []} />
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Opérations de caisse</h2>
          {isLoading ? (
            <div className="text-center p-8">Chargement des opérations...</div>
          ) : (
            <OperationTable 
              operations={operations} 
              onDelete={handleSupprimerOperation}
            />
          )}
        </div>

        {/* Ne pas ouvrir le formulaire tant que les statistiques ne sont pas chargées */}
        <OperationForm
          open={openSortieForm && !isLoading && statistiques !== undefined}
          onClose={() => setOpenSortieForm(false)}
          onSubmit={handleAjouterSortie}
          soldeDisponible={statistiques?.solde ?? 0}
        />
      </div>
    </MainLayout>
  );
}
