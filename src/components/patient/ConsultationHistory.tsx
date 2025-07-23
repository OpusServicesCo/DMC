import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  User,
  Weight,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Consultation {
  id: string;
  date: string;
  type: 'consultation_initiale' | 'bilan_nutritionnel' | 'suivi_nutritionnel' | 'dietetique_pathologique' | 'troubles_alimentaires';
  statut: 'terminee' | 'en_cours' | 'annulee';
  poids?: number;
  imc?: number;
  objectif?: string;
  notes?: string;
  prochainRdv?: string;
  montant?: number;
  medecin?: string;
}

interface ConsultationHistoryProps {
  patientId: string;
  patientName: string;
  onViewDetails: (consultationId: string) => void;
}

// Données simulées - en production, cela viendrait de la base de données
const mockConsultations: Consultation[] = [
  {
    id: '1',
    date: '2024-01-15T14:30:00',
    type: 'consultation_initiale',
    statut: 'terminee',
    poids: 85,
    imc: 28.5,
    objectif: 'Perte de poids - 15kg',
    notes: 'Patient motivé, antécédents familiaux de diabète',
    prochainRdv: '2024-02-15T14:30:00',
    montant: 150,
    medecin: 'Dr. Martin'
  },
  {
    id: '2',
    date: '2024-02-15T14:30:00',
    type: 'bilan_nutritionnel',
    statut: 'terminee',
    poids: 82,
    imc: 27.5,
    notes: 'Bonne progression, respect du plan nutritionnel',
    prochainRdv: '2024-03-15T14:30:00',
    montant: 120,
    medecin: 'Dr. Martin'
  },
  {
    id: '3',
    date: '2024-03-15T14:30:00',
    type: 'suivi_nutritionnel',
    statut: 'terminee',
    poids: 79,
    imc: 26.5,
    notes: 'Excellente progression, patient très satisfait',
    prochainRdv: '2024-04-15T14:30:00',
    montant: 100,
    medecin: 'Dr. Martin'
  },
  {
    id: '4',
    date: '2024-04-15T14:30:00',
    type: 'suivi_nutritionnel',
    statut: 'terminee',
    poids: 77,
    imc: 25.8,
    notes: 'Objectif presque atteint, ajustement du plan',
    prochainRdv: '2024-05-15T14:30:00',
    montant: 100,
    medecin: 'Dr. Martin'
  },
  {
    id: '5',
    date: '2024-05-15T14:30:00',
    type: 'suivi_nutritionnel',
    statut: 'en_cours',
    poids: 75,
    imc: 25.2,
    notes: 'Objectif atteint ! Maintenance',
    montant: 100,
    medecin: 'Dr. Martin'
  }
];

const typeLabels = {
  consultation_initiale: 'Consultation Initiale',
  bilan_nutritionnel: 'Bilan Nutritionnel',
  suivi_nutritionnel: 'Suivi Nutritionnel',
  dietetique_pathologique: 'Diététique Pathologique',
  troubles_alimentaires: 'Troubles Alimentaires'
};

const typeColors = {
  consultation_initiale: 'bg-blue-100 text-blue-800',
  bilan_nutritionnel: 'bg-green-100 text-green-800',
  suivi_nutritionnel: 'bg-purple-100 text-purple-800',
  dietetique_pathologique: 'bg-orange-100 text-orange-800',
  troubles_alimentaires: 'bg-red-100 text-red-800'
};

const statutColors = {
  terminee: 'bg-green-100 text-green-800',
  en_cours: 'bg-yellow-100 text-yellow-800',
  annulee: 'bg-red-100 text-red-800'
};

export function ConsultationHistory({ patientId, patientName, onViewDetails }: ConsultationHistoryProps) {
  const [consultations] = useState<Consultation[]>(mockConsultations);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');

  // Filtrage des consultations
  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = consultation.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.objectif?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         typeLabels[consultation.type].toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || consultation.type === filterType;
    const matchesStatut = filterStatut === 'all' || consultation.statut === filterStatut;
    
    return matchesSearch && matchesType && matchesStatut;
  });

  // Calculs de progression
  const getEvolutionPoids = () => {
    const consultationsAvecPoids = consultations
      .filter(c => c.poids)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (consultationsAvecPoids.length < 2) return null;
    
    const premier = consultationsAvecPoids[0];
    const dernier = consultationsAvecPoids[consultationsAvecPoids.length - 1];
    
    return {
      initial: premier.poids!,
      actuel: dernier.poids!,
      difference: dernier.poids! - premier.poids!,
      pourcentage: ((dernier.poids! - premier.poids!) / premier.poids! * 100).toFixed(1)
    };
  };

  const evolution = getEvolutionPoids();

  const exportHistory = () => {
    const dataStr = JSON.stringify(consultations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historique-${patientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec résumé */}
      <Card className="border-medical-200">
        <CardHeader className="bg-gradient-to-r from-medical-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-medical-800">
                <User className="h-6 w-6" />
                Historique des consultations - {patientName}
              </CardTitle>
              <p className="text-medical-600 mt-2">
                {consultations.length} consultation{consultations.length > 1 ? 's' : ''} au total
              </p>
            </div>
            <Button onClick={exportHistory} variant="outline" className="border-medical-200">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </CardHeader>
        
        {/* Résumé de progression */}
        {evolution && (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{evolution.initial}kg</div>
                <div className="text-sm text-blue-700">Poids initial</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{evolution.actuel}kg</div>
                <div className="text-sm text-green-700">Poids actuel</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                  evolution.difference < 0 ? 'text-green-600' : evolution.difference > 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {evolution.difference < 0 ? <TrendingDown className="h-5 w-5" /> : 
                   evolution.difference > 0 ? <TrendingUp className="h-5 w-5" /> : 
                   <Minus className="h-5 w-5" />}
                  {evolution.difference > 0 ? '+' : ''}{evolution.difference}kg
                </div>
                <div className="text-sm text-purple-700">Évolution</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className={`text-2xl font-bold ${
                  parseFloat(evolution.pourcentage) < 0 ? 'text-green-600' : 
                  parseFloat(evolution.pourcentage) > 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {evolution.pourcentage > '0' ? '+' : ''}{evolution.pourcentage}%
                </div>
                <div className="text-sm text-orange-700">Pourcentage</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher dans les notes, objectifs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tous les types</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            
            <select 
              value={filterStatut} 
              onChange={(e) => setFilterStatut(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tous les statuts</option>
              <option value="terminee">Terminée</option>
              <option value="en_cours">En cours</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des consultations */}
      <div className="space-y-4">
        {filteredConsultations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune consultation trouvée
              </h3>
              <p className="text-gray-600">
                Aucune consultation ne correspond aux critères de recherche.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredConsultations
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((consultation, index) => (
              <Card key={consultation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={typeColors[consultation.type]}>
                          {typeLabels[consultation.type]}
                        </Badge>
                        <Badge className={statutColors[consultation.statut]}>
                          {consultation.statut.replace('_', ' ')}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(consultation.date), 'EEEE d MMMM yyyy', { locale: fr })}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {format(new Date(consultation.date), 'HH:mm')}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {consultation.poids && (
                          <div className="flex items-center gap-2">
                            <Weight className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">
                              <strong>Poids:</strong> {consultation.poids}kg
                            </span>
                          </div>
                        )}
                        {consultation.imc && (
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-green-600" />
                            <span className="text-sm">
                              <strong>IMC:</strong> {consultation.imc}
                            </span>
                          </div>
                        )}
                        {consultation.montant && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              <strong>Montant:</strong> {consultation.montant}€
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {consultation.objectif && (
                        <div className="mb-3">
                          <p className="text-sm">
                            <strong>Objectif:</strong> {consultation.objectif}
                          </p>
                        </div>
                      )}
                      
                      {consultation.notes && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-700">
                            <strong>Notes:</strong> {consultation.notes}
                          </p>
                        </div>
                      )}
                      
                      {consultation.prochainRdv && (
                        <div className="text-sm text-blue-600">
                          <strong>Prochain RDV:</strong> {format(new Date(consultation.prochainRdv), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <Button
                        onClick={() => onViewDetails(consultation.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Détails
                      </Button>
                    </div>
                  </div>
                  
                  {index < filteredConsultations.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
}
