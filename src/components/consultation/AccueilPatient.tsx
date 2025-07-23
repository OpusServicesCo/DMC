
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Patient } from "@/types/models";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface AccueilPatientProps {
  onPatientSelected: (patient: Patient) => void;
  onNouveauPatient: () => void;
}

export function AccueilPatient({ onPatientSelected, onNouveauPatient }: AccueilPatientProps) {
  const [patientsDuJour, setPatientsDuJour] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [patientsRecherche, setPatientsRecherche] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    chargerPatientsDuJour();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 2) {
      rechercherPatients();
    } else {
      setPatientsRecherche([]);
    }
  }, [searchTerm]);

  const chargerPatientsDuJour = async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("consultations")
        .select(`
          id,
          date,
          motif,
          statut_rendez_vous,
          type_visite,
          patients (
            id,
            nom,
            prenom,
            telephone,
            date_naissance
          )
        `)
        .gte('date', `${today}T00:00:00`)
        .lte('date', `${today}T23:59:59`)
        .order('date');

      if (error) throw error;
      
      // Regrouper par patient pour éviter les doublons
      const patientsUniques = new Map();
      (data || []).forEach(consultation => {
        if (consultation.patients) {
          const patientId = consultation.patients.id;
          if (!patientsUniques.has(patientId)) {
            patientsUniques.set(patientId, {
              ...consultation.patients,
              prochainRdv: consultation
            });
          }
        }
      });
      
      setPatientsDuJour(Array.from(patientsUniques.values()));
    } catch (error: any) {
      console.error("Erreur chargement patients du jour:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les patients du jour",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const rechercherPatients = async () => {
    try {
      setIsSearching(true);
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .or(`nom.ilike.%${searchTerm}%,prenom.ilike.%${searchTerm}%,telephone.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      setPatientsRecherche(data || []);
    } catch (error: any) {
      console.error("Erreur recherche patients:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la recherche",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Chargement des patients..." />;
  }

  return (
    <div className={`space-y-4 ${isMobile ? "p-2" : "p-4"}`}>
      <div className="text-center">
        <h1 className={`font-bold text-gray-900 dark:text-white mb-2 ${isMobile ? "text-lg" : "text-2xl"}`}>
          Accueil du Patient
        </h1>
        <p className={`text-gray-600 dark:text-gray-300 ${isMobile ? "text-sm" : ""}`}>
          {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
        </p>
      </div>

      {/* Patients du jour */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className={isMobile ? "pb-2" : ""}>
          <CardTitle className={`flex items-center gap-2 text-gray-900 dark:text-white ${isMobile ? "text-base" : ""}`}>
            <Calendar className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
            Patients du jour ({patientsDuJour.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patientsDuJour.length === 0 ? (
            <p className={`text-gray-500 dark:text-gray-400 text-center py-8 ${isMobile ? "text-sm py-4" : ""}`}>
              Aucun patient prévu aujourd'hui 
            </p>
          ) : (
            <div className="grid gap-3">
              {patientsDuJour.map((patient) => (
                <div
                  key={patient.id}
                  className={`flex items-center justify-between p-3 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${isMobile ? "p-2" : "p-4"}`}
                  onClick={() => onPatientSelected(patient)}
                >
                  <div className="flex-1">
                    <p className={`font-medium text-gray-900 dark:text-white ${isMobile ? "text-sm" : ""}`}>
                      {patient.nom} {patient.prenom}
                    </p>
                    <p className={`text-gray-500 dark:text-gray-400 ${isMobile ? "text-xs" : "text-sm"}`}>
                      {patient.prochainRdv?.motif} - {new Date(patient.prochainRdv?.date).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                      <span className={`ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full ${isMobile ? "text-xs" : "text-xs"}`}>
                        {patient.prochainRdv?.type_visite || 'consultation'}
                      </span>
                    </p>
                  </div>
                  <Button variant="outline" size={isMobile ? "sm" : "sm"} className={`dark:border-gray-600 dark:text-gray-300 ${isMobile ? "text-xs px-2" : ""}`}>
                    Consulter
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recherche d'anciens patients */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className={isMobile ? "pb-2" : ""}>
          <CardTitle className={`flex items-center gap-2 text-gray-900 dark:text-white ${isMobile ? "text-base" : ""}`}>
            <Search className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
            Rechercher un patient
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Rechercher par nom, prénom ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${isMobile ? "text-sm" : ""}`}
            />
            
            {isSearching && <LoadingSpinner size="sm" text="Recherche..." />}
            
            {patientsRecherche.length > 0 && (
              <div className={`grid gap-2 max-h-60 overflow-y-auto ${isMobile ? "max-h-48" : ""}`}>
                {patientsRecherche.map((patient) => (
                  <div
                    key={patient.id}
                    className={`flex items-center justify-between border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${isMobile ? "p-2" : "p-3"}`}
                    onClick={() => onPatientSelected(patient)}
                  >
                    <div>
                      <p className={`font-medium text-gray-900 dark:text-white ${isMobile ? "text-sm" : ""}`}>
                        {patient.nom} {patient.prenom}
                      </p>
                      <p className={`text-gray-500 dark:text-gray-400 ${isMobile ? "text-xs" : "text-sm"}`}>
                        {patient.telephone} - {patient.date_naissance}
                      </p>
                    </div>
                    <Button variant="outline" size={isMobile ? "sm" : "sm"} className={`dark:border-gray-600 dark:text-gray-300 ${isMobile ? "text-xs px-2" : ""}`}>
                      Sélectionner
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Nouveau patient */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className={isMobile ? "pt-4" : "pt-6"}>
          <Button 
            onClick={onNouveauPatient}
            className={`w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 ${isMobile ? "py-3" : ""}`}
            size={isMobile ? "default" : "lg"}
          >
            <Plus className={`mr-2 ${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
            Nouveau patient
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
