
import { useEffect, useState, useMemo, memo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, FileText, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobilePatientCard } from "./MobilePatientCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TableSkeleton, PatientCardSkeleton } from "@/components/ui/skeleton-components";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface PatientListProps {
  onEdit: (patient: any) => void;
  onViewHistory?: (patient: any) => void;
}

const PatientList = memo(function PatientList({ onEdit, onViewHistory }: PatientListProps) {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Debounce la recherche pour éviter les appels excessifs à l'API
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Mémoisation du calcul d'âge pour éviter les recalculs
  const calculateAge = useCallback((dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }, []);

  // Enrichissement des données patients avec mémoisation
  const enrichedPatients = useMemo(() => {
    return patients.map(patient => ({
      ...patient,
      age: calculateAge(patient.date_naissance),
      fullName: `${patient.nom} ${patient.prenom}`.toLowerCase()
    }));
  }, [patients, calculateAge]);

  // Filtrage côté client pour les performances (si recherche simple)
  const filteredPatients = useMemo(() => {
    if (!debouncedSearchTerm) return enrichedPatients;
    
    const term = debouncedSearchTerm.toLowerCase();
    return enrichedPatients.filter(patient =>
      patient.fullName.includes(term) ||
      patient.email?.toLowerCase().includes(term) ||
      patient.telephone?.includes(term)
    );
  }, [enrichedPatients, debouncedSearchTerm]);

  const fetchPatients = useCallback(async (searchTerm?: string) => {
    try {
      setSearching(!!searchTerm);
      if (!searchTerm) setLoading(true);
      setError(null);

      let query = supabase.from("patients").select("*");
      
      // Pour les recherches complexes, utiliser la base de données
      if (searchTerm && searchTerm.length > 2) {
        query = query.or(`nom.ilike.%${searchTerm}%,prenom.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
      
      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      console.error("❌ Erreur chargement patients:", error);
      setError(error.message);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger la liste des patients. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, [toast]);

  // Chargement initial
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Recherche avec debounce
  useEffect(() => {
    if (debouncedSearchTerm.length > 2) {
      fetchPatients(debouncedSearchTerm);
    } else if (debouncedSearchTerm.length === 0 && patients.length === 0) {
      fetchPatients();
    }
  }, [debouncedSearchTerm, fetchPatients]);

  // Gestion des états de chargement avec des skeletons intelligents
  if (loading) {
    return isMobile ? (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <PatientCardSkeleton key={i} />
        ))}
      </div>
    ) : (
      <TableSkeleton rows={8} columns={8} />
    );
  }

  if (error) {
    return (
      <ErrorBoundary level="component">
        <div className="text-center py-8">
          <p className="text-red-500 dark:text-red-400 mb-4">
            {error}
          </p>
          <Button onClick={() => fetchPatients()} variant="outline">
            Réessayer
          </Button>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary level="component">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par nom, prénom, email ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 max-w-md dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:border-gray-700 transition-all duration-200 ${
              isMobile ? "text-sm" : ""
            } ${searching ? "border-blue-500 dark:border-blue-400" : ""}`}
          />
          {searching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>

        {searchTerm && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredPatients.length} résultat(s) pour "{searchTerm}"
          </div>
        )}

        {/* Vue mobile avec optimisations */}
        {isMobile ? (
          <div className="space-y-3">
            {filteredPatients.map((patient) => (
              <MobilePatientCard
                key={patient.id}
                patient={patient}
                onEdit={onEdit}
                onViewHistory={onViewHistory}
              />
            ))}
            {filteredPatients.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {searchTerm ? "Aucun patient trouvé pour cette recherche" : "Aucun patient enregistré"}
                </p>
                {searchTerm && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setSearchTerm("")}
                  >
                    Effacer la recherche
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Vue desktop optimisée */
          <div className="rounded-lg border dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <TableHead className="dark:text-gray-300 font-semibold">Nom</TableHead>
                  <TableHead className="dark:text-gray-300 font-semibold">Prénom</TableHead>
                  <TableHead className="dark:text-gray-300 font-semibold">Âge</TableHead>
                  <TableHead className="dark:text-gray-300 font-semibold">Sexe</TableHead>
                  <TableHead className="dark:text-gray-300 font-semibold">Gr. Sanguin</TableHead>
                  <TableHead className="dark:text-gray-300 font-semibold">Email</TableHead>
                  <TableHead className="dark:text-gray-300 font-semibold">Téléphone</TableHead>
                  <TableHead className="dark:text-gray-300 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow 
                    key={patient.id} 
                    className="dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                  >
                    <TableCell className="dark:text-gray-300 font-medium">{patient.nom}</TableCell>
                    <TableCell className="dark:text-gray-300">{patient.prenom}</TableCell>
                    <TableCell className="dark:text-gray-300">
                      <span className="text-sm">{patient.age} ans</span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={patient.sexe === "M" ? "default" : "secondary"}
                        className="dark:text-gray-100 text-xs"
                      >
                        {patient.sexe === "M" ? "M" : "F"}
                      </Badge>
                    </TableCell>
                    <TableCell className="dark:text-gray-300">
                      {patient.groupe_sanguin || "-"}
                    </TableCell>
                    <TableCell className="dark:text-gray-300 max-w-48 truncate">
                      {patient.email || "-"}
                    </TableCell>
                    <TableCell className="dark:text-gray-300">{patient.telephone || "-"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onEdit(patient)}
                                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 hover:scale-105 transition-transform duration-150"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Modifier</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        {onViewHistory && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => onViewHistory(patient)}
                                  className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 hover:scale-105 transition-transform duration-150"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Voir l'historique</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPatients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 dark:text-gray-300">
                      <div className="flex flex-col items-center">
                        <Search className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 mb-2">
                          {searchTerm ? "Aucun patient trouvé pour cette recherche" : "Aucun patient enregistré"}
                        </p>
                        {searchTerm && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSearchTerm("")}
                          >
                            Effacer la recherche
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
});

export { PatientList };
