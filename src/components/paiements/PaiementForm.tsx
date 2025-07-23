
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { PatientSearch } from "@/components/ui/patient-search";

interface Facture {
  id: string;
  montant_total: number;
  statut: string;
  numero_facture?: number;
  consultations?: {
    patients?: {
      nom: string;
      prenom: string;
      adresse?: string;
      telephone?: string;
    };
    motif: string;
    date: string;
    diagnostic?: string;
  };
}

interface Paiement {
  id: string;
  facture_id: string;
  montant_paye: number;
}

interface Consultation {
  id: string;
  date: string;
  motif: string;
  montant: number;
  patients: {
    id: string;
    nom: string;
    prenom: string;
    telephone?: string;
  };
}

interface PaiementFormProps {
  open: boolean;
  onClose: () => void;
  factureId?: string | null;
  factures?: Facture[];
  paiements?: Paiement[];
  selectedFacture?: Facture | null;
  consultationsEnAttente?: Consultation[];
  onPaiementSuccess: () => Promise<void>;
}

export function PaiementForm({
  open,
  onClose,
  factureId,
  factures,
  paiements,
  selectedFacture,
  consultationsEnAttente,
  onPaiementSuccess
}: PaiementFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [newPaiement, setNewPaiement] = useState({
    facture_id: factureId || "",
    montant_paye: 0,
    mode_paiement: "espèces",
  });

  const calculerMontantRestant = (factureId: string) => {
    const facture = factures?.find(f => f.id === factureId);
    if (!facture) return 0;
    
    const paiementsEffectues = paiements?.filter(p => p.facture_id === factureId) || [];
    const montantDejaPaye = paiementsEffectues.reduce((sum, p) => sum + (p.montant_paye || 0), 0);
    return Math.max(0, facture.montant_total - montantDejaPaye);
  };

  useEffect(() => {
    if (selectedFacture && factureId) {
      const montantRestant = calculerMontantRestant(factureId);
      setNewPaiement(prev => ({
        ...prev,
        facture_id: factureId,
        montant_paye: montantRestant
      }));
    }
  }, [selectedFacture, factureId, paiements]);

 const creerFactureEtPayer = async (consultation: Consultation) => {
  try {
    // Recherche d'une facture existante pour cette consultation
    const { data: existingFacture, error: searchError } = await supabase
      .from("factures")
      .select("*")
      .eq("consultation_id", consultation.id)
      .single();

    if (searchError && searchError.code !== "PGRST116") {
      // Code PGRST116 = "No rows found", donc pas d'erreur ici si facture inexistante
      throw searchError;
    }

    let factureData;

    if (existingFacture) {
      factureData = existingFacture;
      console.log("Facture existante trouvée :", factureData.id);
    } else {
      // Création de la nouvelle facture
      const { data: newFacture, error: insertError } = await supabase
        .from("factures")
        .insert([{
          consultation_id: consultation.id,
          montant_total: consultation.montant,
          date_emission: new Date().toISOString(),
          statut: "impayée"
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      factureData = newFacture;
      console.log("Nouvelle facture créée :", factureData.id);
    }

    // Création du paiement
    const { data: paiementData, error: paiementError } = await supabase
      .from("paiements")
      .insert([{
        facture_id: factureData.id,
        montant_paye: consultation.montant,
        mode_paiement: newPaiement.mode_paiement,
        date_paiement: new Date().toISOString(),
      }])
      .select()
      .single();

    if (paiementError) throw paiementError;

    // Mise à jour du statut facture en "payée"
    await supabase
      .from("factures")
      .update({ statut: "payée" })
      .eq("id", factureData.id);

    // Enregistrer l'entrée en caisse
    await creerEntreeCaisse(paiementData.id, consultation.montant, factureData.id);

    return { factureData, paiementData };
  } catch (error) {
    console.error("Erreur lors de la création de facture et paiement:", error);
    throw error;
  }
};

  const validatePaiement = () => {
    if (!selectedConsultation && !newPaiement.facture_id) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une consultation ou une facture",
        variant: "destructive",
      });
      return false;
    }

    if (newPaiement.montant_paye <= 0) {
      toast({
        title: "Erreur",
        description: "Le montant doit être supérieur à 0",
        variant: "destructive",
      });
      return false;
    }

    if (!selectedConsultation) {
      const montantRestant = calculerMontantRestant(newPaiement.facture_id);
      if (newPaiement.montant_paye > montantRestant) {
        toast({
          title: "Montant invalide",
          description: `Le montant ne peut pas dépasser ${montantRestant.toLocaleString()} FCFA`,
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const updateFactureStatus = async (factureId: string) => {
    try {
      const { data: paiementData, error: paiementError } = await supabase
        .from("paiements")
        .select("montant_paye")
        .eq("facture_id", factureId);
        
      if (paiementError) throw paiementError;
      
      const { data: factureData, error: factureError } = await supabase
        .from("factures")
        .select("montant_total")
        .eq("id", factureId)
        .single();
        
      if (factureError) throw factureError;
      
      const totalPaye = paiementData.reduce((sum, p) => sum + (p.montant_paye || 0), 0);
      
      let nouveauStatut = "impayée";
      if (totalPaye >= factureData.montant_total) {
        nouveauStatut = "payée";
      } else if (totalPaye > 0) {
        nouveauStatut = "partiellement_payée";
      }
      
      const { error: updateError } = await supabase
        .from("factures")
        .update({ statut: nouveauStatut })
        .eq("id", factureId);
        
      if (updateError) throw updateError;
      
      return nouveauStatut;
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du statut:", err);
      throw err;
    }
  };

  const creerEntreeCaisse = async (paiementId: string, montant: number, factureId: string) => {
    try {
      const facture = factures?.find(f => f.id === factureId);
      const { error } = await supabase.rpc('insert_operation_caisse', {
        p_type: 'entrée',
        p_montant: montant,
        p_date: new Date().toISOString(),
        p_description: `Paiement reçu pour facture #${facture?.numero_facture || factureId.slice(0, 8)}`,
        p_categorie: 'paiements_patients',
        p_facture_id: factureId,
        p_paiement_id: paiementId
      });

      if (error) throw error;
    } catch (err: any) {
      console.error("Erreur caisse:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePaiement() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (selectedConsultation) {
        const { paiementData } = await creerFactureEtPayer(selectedConsultation);
        
        toast({
          title: "✅ Consultation payée",
          description: `Paiement de ${selectedConsultation.montant.toLocaleString()} FCFA enregistré`,
        });
      } else {
        const { data: paiementData, error: paiementError } = await supabase
          .from("paiements")
          .insert([{
            facture_id: newPaiement.facture_id,
            montant_paye: newPaiement.montant_paye,
            mode_paiement: newPaiement.mode_paiement,
            date_paiement: new Date().toISOString(),
          }])
          .select()
          .single();

        if (paiementError) throw paiementError;
        
        await creerEntreeCaisse(paiementData.id, newPaiement.montant_paye, newPaiement.facture_id);
        await updateFactureStatus(newPaiement.facture_id);
        
        toast({
          title: "✅ Paiement enregistré",
          description: `Paiement de ${newPaiement.montant_paye.toLocaleString()} FCFA enregistré`,
        });
      }
      
      setNewPaiement({
        facture_id: "",
        montant_paye: 0,
        mode_paiement: "espèces",
      });
      setSelectedConsultation(null);
      
      onClose();
      await onPaiementSuccess();
      
      if (factureId) {
        setTimeout(() => navigate("/factures"), 1500);
      }
    } catch (err: any) {
      console.error("Erreur paiement:", err);
      toast({
        title: "❌ Erreur",
        description: err.message || "Erreur lors de l'enregistrement du paiement",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const montantAPayer = selectedConsultation 
    ? selectedConsultation.montant 
    : (newPaiement.facture_id ? calculerMontantRestant(newPaiement.facture_id) : 0);

  const facturePourPaiement = factures?.find(f => f.id === newPaiement.facture_id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>💳 Nouveau paiement</DialogTitle>
          <DialogDescription>
            Sélectionnez une consultation ou une facture à payer
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recherche de consultations en attente */}
          {consultationsEnAttente && consultationsEnAttente.length > 0 && (
            <div>
              <label className="text-sm font-medium">🔍 Consultations en attente</label>
              <PatientSearch
                patients={consultationsEnAttente.map(c => ({
                  id: c.id,
                  nom: c.patients.nom,
                  prenom: c.patients.prenom,
                  telephone: c.patients.telephone || '',
                  date_naissance: c.date
                }))}
                selectedPatient={selectedConsultation ? {
                  id: selectedConsultation.id,
                  nom: selectedConsultation.patients.nom,
                  prenom: selectedConsultation.patients.prenom,
                  telephone: selectedConsultation.patients.telephone || '',
                  date_naissance: selectedConsultation.date
                } : null}
                onPatientSelect={(patient) => {
                  const consultation = consultationsEnAttente.find(c => c.id === patient.id);
                  if (consultation) {
                    setSelectedConsultation(consultation);
                    setNewPaiement(prev => ({ ...prev, montant_paye: consultation.montant }));
                  }
                }}
                placeholder="Rechercher une consultation par nom de patient..."
              />
            </div>
          )}

          {/* Sélection de facture si pas de consultation sélectionnée */}
          {!selectedConsultation && (
            <div>
              <label className="text-sm font-medium">Ou sélectionner une facture impayée</label>
              <select
                className="w-full border rounded-md p-2"
                value={newPaiement.facture_id}
                onChange={(e) => {
                  const factureId = e.target.value;
                  const montantRestant = calculerMontantRestant(factureId);
                  setNewPaiement({
                    ...newPaiement,
                    facture_id: factureId,
                    montant_paye: montantRestant,
                  });
                }}
                disabled={!!factureId}
              >
                <option value="">Sélectionner une facture</option>
                {factures?.filter(f => f.statut !== "payée").map((facture) => {
                  if (!facture.consultations?.patients) return null;
                  
                  const montantRestant = calculerMontantRestant(facture.id);
                  if (montantRestant <= 0) return null;
                  
                  return (
                    <option key={facture.id} value={facture.id}>
                      Facture #{facture.numero_facture || facture.id.slice(0, 8)} - {facture.consultations.patients.nom}{" "}
                      {facture.consultations.patients.prenom} - {montantRestant.toLocaleString()} FCFA
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Affichage des détails */}
          {(selectedConsultation || facturePourPaiement) && (
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="text-sm text-blue-800">
                {selectedConsultation ? (
                  <>
                    <p><strong>Patient:</strong> {selectedConsultation.patients.nom} {selectedConsultation.patients.prenom}</p>
                    <p><strong>Consultation:</strong> {selectedConsultation.motif}</p>
                    <p><strong>Montant:</strong> <span className="font-bold text-green-600">{selectedConsultation.montant.toLocaleString()} FCFA</span></p>
                  </>
                ) : (
                  <>
                    <p><strong>Patient:</strong> {facturePourPaiement.consultations?.patients?.nom} {facturePourPaiement.consultations?.patients?.prenom}</p>
                    <p><strong>Montant total:</strong> {facturePourPaiement.montant_total.toLocaleString()} FCFA</p>
                    <p><strong>Montant restant:</strong> <span className="font-bold text-green-600">{montantAPayer.toLocaleString()} FCFA</span></p>
                  </>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Montant à payer (FCFA)</label>
            <Input
              type="number"
              min="1"
              max={montantAPayer}
              step="1"
              value={newPaiement.montant_paye || ""}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setNewPaiement({...newPaiement, montant_paye: value});
              }}
              required
              placeholder={`Maximum: ${montantAPayer.toLocaleString()} FCFA`}
              disabled={!!selectedConsultation}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Mode de paiement</label>
            <select
              className="w-full border rounded-md p-2"
              value={newPaiement.mode_paiement}
              onChange={(e) =>
                setNewPaiement({
                  ...newPaiement,
                  mode_paiement: e.target.value,
                })
              }
              required
            >
              <option value="espèces">💵 Espèces</option>
              <option value="carte">💳 Carte bancaire</option>
              <option value="mobile_money">📱 Mobile Money</option>
              <option value="chèque">📄 Chèque</option>
              <option value="virement">🏦 Virement</option>
            </select>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isSubmitting || (!selectedConsultation && !newPaiement.facture_id) || newPaiement.montant_paye <= 0}
          >
            {isSubmitting 
              ? "⏳ Enregistrement..." 
              : `Enregistrer le paiement (${newPaiement.montant_paye.toLocaleString()} FCFA)`
            }
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
