
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Receipt, 
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface CaisseStatsProps {
  operations: any[];
}

export const CaisseStats: React.FC<CaisseStatsProps> = ({ operations }) => {
  // Calculs des statistiques
  const aujourd_hui = new Date();
  const debutMois = new Date(aujourd_hui.getFullYear(), aujourd_hui.getMonth(), 1);
  const finMois = new Date(aujourd_hui.getFullYear(), aujourd_hui.getMonth() + 1, 0);
  
  // Opérations du jour
  const operationsAujourdhui = operations.filter(op => {
    const dateOp = new Date(op.date);
    return dateOp.toDateString() === aujourd_hui.toDateString();
  });

  // Opérations du mois
  const operationsMois = operations.filter(op => {
    const dateOp = new Date(op.date);
    return dateOp >= debutMois && dateOp <= finMois;
  });

  // Statistiques générales
  const totalEntrees = operations
    .filter(op => op.type === 'entrée')
    .reduce((sum, op) => sum + parseFloat(op.montant), 0);

  const totalSorties = operations
    .filter(op => op.type === 'sortie')
    .reduce((sum, op) => sum + parseFloat(op.montant), 0);

  const soldeActuel = totalEntrees - totalSorties;

  // Statistiques du jour
  const entreesJour = operationsAujourdhui
    .filter(op => op.type === 'entrée')
    .reduce((sum, op) => sum + parseFloat(op.montant), 0);

  const sortiesJour = operationsAujourdhui
    .filter(op => op.type === 'sortie')
    .reduce((sum, op) => sum + parseFloat(op.montant), 0);

  // Statistiques du mois
  const entreesMois = operationsMois
    .filter(op => op.type === 'entrée')
    .reduce((sum, op) => sum + parseFloat(op.montant), 0);

  const sortiesMois = operationsMois
    .filter(op => op.type === 'sortie')
    .reduce((sum, op) => sum + parseFloat(op.montant), 0);

  // Moyennes
  const nombreJoursMois = new Date().getDate();
  const moyenneJour = entreesMois / nombreJoursMois;

  // Répartition par catégorie
  const categoriesStats = operations.reduce((acc, op) => {
    const cat = op.categorie || 'Non catégorisé';
    if (!acc[cat]) {
      acc[cat] = { entrées: 0, sorties: 0, total: 0 };
    }
    if (op.type === 'entrée') {
      acc[cat].entrées += parseFloat(op.montant);
    } else {
      acc[cat].sorties += parseFloat(op.montant);
    }
    acc[cat].total = acc[cat].entrées - acc[cat].sorties;
    return acc;
  }, {} as Record<string, any>);

  // Évolution (simulation - vous pourrez l'améliorer avec de vraies données historiques)
  const evolutionSolde = soldeActuel > 0 ? 'positive' : soldeActuel < 0 ? 'negative' : 'stable';
  const pourcentageEvolution = Math.abs((soldeActuel / (totalEntrees || 1)) * 100);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Solde actuel */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700">Solde Actuel</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-800">
            {soldeActuel.toLocaleString()} FCFA
          </div>
          <div className="flex items-center gap-2 mt-2">
            {evolutionSolde === 'positive' ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : evolutionSolde === 'negative' ? (
              <TrendingDown className="h-4 w-4 text-red-600" />
            ) : (
              <Activity className="h-4 w-4 text-gray-600" />
            )}
            <p className="text-xs text-green-600">
              {pourcentageEvolution.toFixed(1)}% du CA
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Entrées du jour */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">Entrées Aujourd'hui</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-800">
            {entreesJour.toLocaleString()} FCFA
          </div>
          <p className="text-xs text-blue-600 mt-2">
            {operationsAujourdhui.filter(op => op.type === 'entrée').length} opération(s)
          </p>
        </CardContent>
      </Card>

      {/* Sorties du jour */}
      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-700">Sorties Aujourd'hui</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-800">
            {sortiesJour.toLocaleString()} FCFA
          </div>
          <p className="text-xs text-red-600 mt-2">
            {operationsAujourdhui.filter(op => op.type === 'sortie').length} opération(s)
          </p>
        </CardContent>
      </Card>

      {/* Moyenne journalière */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700">Moyenne/Jour</CardTitle>
          <BarChart3 className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-800">
            {moyenneJour.toLocaleString()} FCFA
          </div>
          <p className="text-xs text-purple-600 mt-2">
            Sur {nombreJoursMois} jours ce mois
          </p>
        </CardContent>
      </Card>

      {/* Statistiques du mois - span sur 2 colonnes */}
      <Card className="md:col-span-2 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <Calendar className="h-5 w-5" />
            Performances du Mois
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-orange-700">Entrées du mois</p>
              <p className="text-xl font-bold text-orange-800">
                {entreesMois.toLocaleString()} FCFA
              </p>
              <Badge className="bg-green-100 text-green-800">
                +{((entreesMois / (totalEntrees || 1)) * 100).toFixed(1)}%
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-orange-700">Sorties du mois</p>
              <p className="text-xl font-bold text-orange-800">
                {sortiesMois.toLocaleString()} FCFA
              </p>
              <Badge className="bg-red-100 text-red-800">
                -{((sortiesMois / (totalSorties || 1)) * 100).toFixed(1)}%
              </Badge>
            </div>
          </div>
          <div className="mt-4 p-3 bg-orange-200 rounded-lg">
            <p className="text-sm font-medium text-orange-800">
              Bénéfice du mois : <span className="font-bold">{(entreesMois - sortiesMois).toLocaleString()} FCFA</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Répartition par catégories - span sur 2 colonnes */}
      <Card className="md:col-span-2 bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-teal-700">
            <PieChart className="h-5 w-5" />
            Répartition par Catégories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(categoriesStats).map(([categorie, stats]: any) => (
              <div key={categorie} className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-teal-800">{categorie}</p>
                  <div className="flex gap-4 text-sm text-teal-600">
                    <span>Entrées: {stats.entrées.toLocaleString()} FCFA</span>
                    <span>Sorties: {stats.sorties.toLocaleString()} FCFA</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${stats.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.total >= 0 ? '+' : ''}{stats.total.toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Indicateurs de performance */}
      <Card className="md:col-span-4 bg-gradient-to-br from-medical-50 to-medical-100 border-medical-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-medical-700">
            <Target className="h-5 w-5" />
            Indicateurs de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-medical-100 rounded-lg">
              <p className="text-sm text-medical-600">Total Opérations</p>
              <p className="text-xl font-bold text-medical-800">{operations.length}</p>
            </div>
            <div className="text-center p-3 bg-medical-100 rounded-lg">
              <p className="text-sm text-medical-600">Ratio Entrées/Sorties</p>
              <p className="text-xl font-bold text-medical-800">
                {totalSorties > 0 ? (totalEntrees / totalSorties).toFixed(2) : '∞'}
              </p>
            </div>
            <div className="text-center p-3 bg-medical-100 rounded-lg">
              <p className="text-sm text-medical-600">Opérations/Jour</p>
              <p className="text-xl font-bold text-medical-800">
                {(operations.length / Math.max(nombreJoursMois, 1)).toFixed(1)}
              </p>
            </div>
            <div className="text-center p-3 bg-medical-100 rounded-lg">
              <p className="text-sm text-medical-600">Taux de Rentabilité</p>
              <p className="text-xl font-bold text-medical-800">
                {totalEntrees > 0 ? ((soldeActuel / totalEntrees) * 100).toFixed(1) : '0'}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
