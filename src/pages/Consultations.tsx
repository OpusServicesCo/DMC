import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, ArrowLeft, AlertCircle, CreditCard, Check, CalendarCheck, Filter } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ErrorDialog } from "@/components/ui/ErrorDialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "@/integrations/supabase/types";

// Définir le type correct pour le statut de rendez-vous
type StatutRendezVous = Database["public"]["Enums"]["statut_rendez_vous"];

export default function Consultations() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [error, setError] = useState<{ title: string; description: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatutRendezVous | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<string | null>(null);
  const [newConsultation, setNewConsultation] = useState({
    patient_id: "",
    date: new Date().toISOString(),
    motif: "",
    montant: 0,
    diagnostic: "",
    observations: "",
    type_visite: "consultation" as const,
  });

  const { data: consultations, refetch, isLoading } = useQuery({
    queryKey: ["consultations", statusFilter, paymentFilter],
    queryFn: async () => {
      try {
        let query = supabase
          .from("consultations")
          .select(`
            *,
            patients (
              nom,
              prenom
            )
          `)
          .eq('type_visite', 'consultation')
          .order("date", { ascending: false });

        // Appliquer le filtre de statut si défini
        if (statusFilter) {
          query = query.eq('statut_rendez_vous', statusFilter);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Si on a besoin de filtrer par statut de paiement, on récupère les factures
        if (paymentFilter) {
          const { data: factures } = await supabase
            .from("factures")
            .select('consultation_id, statut');

          // Mapper les consultations avec leurs factures
          const consultationsWithPaymentStatus = data.map(consultation => {
            const facture = factures?.find(f => f.consultation_id === consultation.id);
            return {
              ...consultation,
              payment_status: facture?.statut || 'inconnue'
            };
          });

          // Filtrer selon le statut de paiement
          return consultationsWithPaymentStatus.filter(c => 
            paymentFilter === 'all' || c.payment_status === paymentFilter
          );
        }

        return data;
      } catch (err: any) {
        setError({
          title: "Erreur lors du chargement des consultations",
          description: "Une erreur est survenue lors de la récupération des consultations. Veuillez réessayer plus tard.",
        });
        return [];
      }
    },
  });

  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("patients")
          .select("id, nom, prenom");
        if (error) throw error;
        return data;
      } catch (err: any) {
        setError({
          title: "Erreur lors du chargement des patients",
          description: "Une erreur est survenue lors de la récupération des patients. Veuillez réessayer plus tard.",
        });
        return [];
      }
    },
  });

  const { data: factures } = useQuery({
    queryKey: ["factures-consultations"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("factures")
          .select('*');
        if (error) throw error;
        return data;
      } catch (err: any) {
        console.error("Erreur lors du chargement des factures:", err);
        return [];
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error: consultationError, data: consultationData } = await supabase
        .from("consultations")
        .insert([{
          ...newConsultation,
          type_visite: 'consultation',
          statut_rendez_vous: 'en_attente' as StatutRendezVous
        }])
        .select();

      if (consultationError) {
        if (consultationError.code === "23505") {
          throw new Error("Une consultation existe déjà pour ce patient à cette date");
        }
        throw consultationError;
      }

      if (consultationData && consultationData.length > 0) {
        const consultationId = consultationData[0].id;
        
        const { error: factureError, data: factureData } = await supabase
          .from("factures")
          .insert([
            {
              consultation_id: consultationId,
              date_emission: new Date().toISOString(),
              montant_total: newConsultation.montant,
              statut: "impayée",
            },
          ])
          .select();

        if (factureError) throw factureError;

        toast({
          title: "Succès",
          description: "La consultation a été créée avec succès. Elle doit être payée avant d'être effectuée.",
        });
        setOpen(false);
        queryClient.invalidateQueries({ queryKey: ["consultations"] });
        queryClient.invalidateQueries({ queryKey: ["factures-consultations"] });
      }
    } catch (err: any) {
      console.error("Erreur lors de la création de la consultation:", err);
      setError({
        title: "Erreur",
        description: err.message || "Une erreur est survenue lors de la création de la consultation",
      });
    }
  };

  const getConsultationFacture = (consultationId: string) => {
    return factures?.find(f => f.consultation_id === consultationId);
  };

  const handlePayClick = (consultationId: string) => {
    const facture = getConsultationFacture(consultationId);
    if (facture) {
      navigate(`/paiements?facture_id=${facture.id}`);
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de trouver la facture associée à cette consultation",
        variant: "destructive",
      });
    }
  };

  const handleExecuteConsultation = async (id: string) => {
    try {
      const facture = getConsultationFacture(id);
      
      if (!facture || facture.statut !== 'payée') {
        setError({
          title: "Paiement requis",
          description: "La consultation ne peut pas être effectuée car elle n'a pas été payée. Veuillez d'abord procéder au paiement.",
        });
        return;
      }
      
      const { error } = await supabase
        .from("consultations")
        .update({ statut_rendez_vous: "effectué" as StatutRendezVous })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La consultation a été marquée comme effectuée",
      });
      refetch();
    } catch (err: any) {
      setError({
        title: "Erreur",
        description: err.message || "Une erreur est survenue lors de la mise à jour de la consultation",
      });
    }
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'effectué':
        return <Badge className="bg-green-100 text-green-800">Effectuée</Badge>;
      case 'annulé':
        return <Badge className="bg-red-100 text-red-800">Annulée</Badge>;
      default:
        return <Badge>{statut}</Badge>;
    }
  };

  const getPaymentBadge = (consultation: any) => {
    const facture = getConsultationFacture(consultation.id);
    
    if (!facture) {
      return <Badge className="bg-gray-100 text-gray-800">Sans facture</Badge>;
    }
    
    switch (facture.statut) {
      case 'payée':
        return <Badge className="bg-green-100 text-green-800">Payée</Badge>;
      case 'impayée':
        return <Badge className="bg-red-100 text-red-800">Non payée</Badge>;
      case 'partiellement_payée':
        return <Badge className="bg-orange-100 text-orange-800">Paiement partiel</Badge>;
      default:
        return <Badge>{facture.statut}</Badge>;
    }
  };

  const canExecute = (consultation: any) => {
    const facture = getConsultationFacture(consultation.id);
    return consultation.statut_rendez_vous === 'en_attente' && facture?.statut === 'payée';
  };

  // Fonction pour gérer le changement de statut du filtre avec le type correct
  const handleStatusFilterChange = (value: string) => {
    if (value === 'all') {
      setStatusFilter(null);
    } else {
      // Cast le string en StatutRendezVous puisque nous savons que la valeur est valide
      setStatusFilter(value as StatutRendezVous);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
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
            <h1 className="text-2xl font-bold text-medical-700">Consultations</h1>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-medical-600 hover:bg-medical-700">
                <Plus className="mr-2" />
                Nouvelle consultation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nouvelle consultation</DialogTitle>
                <DialogDescription>
                  Créez une nouvelle consultation. La consultation devra être payée avant d'être effectuée.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Patient</label>
                  <select
                    className="w-full border rounded-md p-2"
                    value={newConsultation.patient_id}
                    onChange={(e) =>
                      setNewConsultation({
                        ...newConsultation,
                        patient_id: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Sélectionner un patient</option>
                    {patients?.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.nom} {patient.prenom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Date et heure</label>
                  <Input
                    type="datetime-local"
                    value={format(new Date(newConsultation.date), "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) =>
                      setNewConsultation({
                        ...newConsultation,
                        date: new Date(e.target.value).toISOString(),
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Motif</label>
                  <Input
                    value={newConsultation.motif}
                    onChange={(e) =>
                      setNewConsultation({
                        ...newConsultation,
                        motif: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Diagnostic</label>
                  <Input
                    value={newConsultation.diagnostic || ""}
                    onChange={(e) =>
                      setNewConsultation({
                        ...newConsultation,
                        diagnostic: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Observations</label>
                  <Input
                    value={newConsultation.observations || ""}
                    onChange={(e) =>
                      setNewConsultation({
                        ...newConsultation,
                        observations: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Montant (FCFA)</label>
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    value={newConsultation.montant}
                    onChange={(e) =>
                      setNewConsultation({
                        ...newConsultation,
                        montant: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-medical-600 hover:bg-medical-700">
                  Créer la consultation
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="bg-medical-50 pb-2">
              <CardTitle className="text-lg text-medical-700 flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" />
                Consultations et paiements
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <CardDescription>
                Une consultation doit être payée avant d'être effectuée. 
                Créez d'abord la consultation, puis procédez au paiement.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filtrer :</span>
            </div>
            <Select
              value={statusFilter || 'all'}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="effectué">Effectuées</SelectItem>
                <SelectItem value="annulé">Annulées</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={paymentFilter || 'all'}
              onValueChange={(value) => setPaymentFilter(value === 'all' ? null : value)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les paiements</SelectItem>
                <SelectItem value="payée">Payées</SelectItem>
                <SelectItem value="impayée">Non payées</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setStatusFilter(null);
                setPaymentFilter(null);
              }}
              className="ml-auto"
            >
              Réinitialiser
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">Patient</TableHead>
                <TableHead className="font-medium">Date</TableHead>
                <TableHead className="font-medium">Motif</TableHead>
                <TableHead className="font-medium">Montant</TableHead>
                <TableHead className="font-medium">Statut</TableHead>
                <TableHead className="font-medium">Paiement</TableHead>
                <TableHead className="font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center text-gray-500">
                      <p className="text-lg font-medium">Chargement en cours...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : consultations && consultations.length > 0 ? (
                consultations.map((consultation: any) => (
                  <TableRow key={consultation.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {consultation.patients.nom} {consultation.patients.prenom}
                    </TableCell>
                    <TableCell>
                      {format(new Date(consultation.date), "Pp", { locale: fr })}
                    </TableCell>
                    <TableCell>{consultation.motif}</TableCell>
                    <TableCell>{consultation.montant.toLocaleString()} FCFA</TableCell>
                    <TableCell>{getStatusBadge(consultation.statut_rendez_vous)}</TableCell>
                    <TableCell>{getPaymentBadge(consultation)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {consultation.statut_rendez_vous === 'en_attente' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExecuteConsultation(consultation.id)}
                              disabled={!canExecute(consultation)}
                              className="flex items-center gap-1"
                              title={!canExecute(consultation) ? "Le paiement doit être effectué avant la consultation" : ""}
                            >
                              <Check className="h-4 w-4" />
                              <span className="hidden sm:inline">Effectuer</span>
                            </Button>
                            {getConsultationFacture(consultation.id)?.statut !== 'payée' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePayClick(consultation.id)}
                                className="flex items-center gap-1"
                              >
                                <CreditCard className="h-4 w-4" />
                                <span className="hidden sm:inline">Payer</span>
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center text-gray-500">
                      <CalendarCheck className="h-12 w-12 mb-2 text-gray-400" />
                      <p className="text-lg font-medium">Aucune consultation enregistrée</p>
                      <p className="text-sm">
                        Commencez par créer une nouvelle consultation
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {error && (
        <ErrorDialog
          open={!!error}
          onClose={() => setError(null)}
          title={error.title}
          description={error.description}
        />
      )}
    </MainLayout>
  );
}
