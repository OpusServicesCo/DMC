
import { format, isSameDay, isPast, isToday, addMinutes, isWithinInterval, setHours, setMinutes } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, Calendar, Check, X, AlertCircle, Edit, Search, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useEnhancedToast } from "@/components/ui/enhanced-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { Database } from "@/integrations/supabase/types";
import { useState, useCallback, useEffect, useMemo, memo } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AppointmentSkeleton } from "@/components/ui/skeleton-components";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";


export const TestToast = () => {
  const { toast } = useToast();

  return (
    <button onClick={() => toast({ title: "Test", description: "Ça marche !" })}>
      Test Toast
    </button>
  );
};


type StatutRendezVous = Database["public"]["Enums"]["statut_rendez_vous"];

interface RendezVousTableProps {
  consultations: any[];
  onUpdate: () => void;
}

const getStatusColor = (status: StatutRendezVous) => {
  switch (status) {
    case "en_attente":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "effectué":
      return "bg-green-100 text-green-800 border-green-300";
    case "annulé":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

export const RendezVousTable = ({ consultations, onUpdate }: RendezVousTableProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<{id: string, date: string} | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [newDateTime, setNewDateTime] = useState("");

  // Configurer les rappels pour les rendez-vous à venir
  useEffect(() => {
    const reminders: NodeJS.Timeout[] = [];
    
    if (consultations && consultations.length > 0) {
      consultations.forEach(consultation => {
        if (consultation.statut_rendez_vous === "en_attente") {
          const appointmentDate = new Date(consultation.date);
          const now = new Date();
          
          if (isToday(appointmentDate) && appointmentDate > now) {
            const reminderTime = addMinutes(appointmentDate, -5);
            const timeUntilReminder = reminderTime.getTime() - now.getTime();
            
            if (timeUntilReminder > 0) {
              console.log(`Rappel configuré pour ${consultation.patients.nom} ${consultation.patients.prenom} dans ${Math.floor(timeUntilReminder / 60000)} minutes`);
              
              const timerId = setTimeout(() => {
                toast({
                  title: "⏰ Rappel de rendez-vous",
                  description: `Le RDV avec ${consultation.patients.nom} ${consultation.patients.prenom} commence dans 5 minutes !`,
                });
              }, timeUntilReminder);
              
              reminders.push(timerId);
            }
          }
        }
      });
    }
    
    return () => {
      reminders.forEach(timerId => clearTimeout(timerId));
    };
  }, [consultations, toast]);

  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorDialog(true);
  };

  const isValidBusinessHour = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return hours >= 9 && (hours < 17 || (hours === 17 && minutes === 0));
  };

  const handleStatusChange = useCallback(async (id: string, newStatus: StatutRendezVous) => {
    try {
      setLoading(id);
      console.log("Tentative de mise à jour du rendez-vous:", id, "avec statut:", newStatus);
      
      const { data: currentConsultation, error: fetchError } = await supabase
        .from("consultations")
        .select("*")
        .eq("id", id)
        .single();
      
      if (fetchError) {
        console.error("Erreur lors de la récupération du rendez-vous:", fetchError);
        throw fetchError;
      }
      
      const appointmentDate = new Date(currentConsultation.date);
      const now = new Date();
      
      if (newStatus === "effectué" && isPast(appointmentDate) && !isToday(appointmentDate)) {
        const daysPassed = Math.floor((now.getTime() - appointmentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysPassed > 1) {
          throw new Error(`Impossible de marquer comme effectué un rendez-vous passé depuis plus d'un jour (${daysPassed} jours).`);
        }
      }
      
      const { error } = await supabase
        .from("consultations")
        .update({ statut_rendez_vous: newStatus })
        .eq("id", id);

      if (error) {
        console.error("Erreur de mise à jour:", error);
        throw error;
      }

      console.log("Mise à jour réussie");
      
      onUpdate();
      
      toast({
        title: "✅ Succès",
        description: newStatus === "effectué" 
          ? "Le rendez-vous a été marqué comme effectué" 
          : "Le rendez-vous a été annulé",
      });
    } catch (error: any) {
      console.error("Erreur:", error);
      showError(error.message || "Impossible de mettre à jour le statut du rendez-vous");
    } finally {
      setLoading(null);
      setShowCancelDialog(false);
    }
  }, [toast, onUpdate]);

  const handleReschedule = async () => {
    if (!selectedConsultation || !newDateTime) return;

    const newDate = new Date(newDateTime);
    
    if (!isValidBusinessHour(newDate)) {
      showError("Les rendez-vous ne peuvent être programmés qu'entre 9h00 et 17h00.");
      return;
    }

    if (isPast(newDate)) {
      showError("Impossible de programmer un rendez-vous dans le passé.");
      return;
    }

    try {
      setLoading(selectedConsultation.id);
      
      const { error } = await supabase
        .from("consultations")
        .update({ 
          date: newDate.toISOString(),
          statut_rendez_vous: "en_attente"
        })
        .eq("id", selectedConsultation.id);

      if (error) throw error;

      toast({
        title: "✅ Rendez-vous reporté",
        description: `Le rendez-vous a été reporté au ${format(newDate, "Pp", { locale: fr })}`,
      });

      setShowRescheduleDialog(false);
      setNewDateTime("");
      setSelectedConsultation(null);
      onUpdate();
    } catch (error: any) {
      showError(error.message || "Erreur lors du report du rendez-vous");
    } finally {
      setLoading(null);
    }
  };

  const handleCancelClick = (consultation: any) => {
    setSelectedConsultation({ id: consultation.id, date: consultation.date });
    setShowCancelDialog(true);
  };

  const handleRescheduleClick = (consultation: any) => {
    setSelectedConsultation({ id: consultation.id, date: consultation.date });
    const currentDate = new Date(consultation.date);
    const minDateTime = format(new Date(), "yyyy-MM-dd'T'HH:mm");
    setNewDateTime(minDateTime);
    setShowRescheduleDialog(true);
  };

  const handleConfirmCancel = () => {
    if (selectedConsultation) {
      handleStatusChange(selectedConsultation.id, "annulé");
    }
  };

  const getStatusBadge = (consultation: any) => {
    const appointmentDate = new Date(consultation.date);
    if (consultation.statut_rendez_vous === "en_attente" && isPast(appointmentDate)) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-300 animate-pulse">
          ⚠️ En retard
        </Badge>
      );
    }

    const status = consultation.statut_rendez_vous;
    return (
      <Badge className={getStatusColor(status)}>
        {status === "en_attente" && "⏳ En attente"}
        {status === "effectué" && "✅ Effectué"}
        {status === "annulé" && "❌ Annulé"}
      </Badge>
    );
  };

  const canBeMarkedAsDone = (consultation: any) => {
    if (consultation.statut_rendez_vous !== "en_attente") {
      return false;
    }
    
    const appointmentDate = new Date(consultation.date);
    const now = new Date();
    
    if (isPast(appointmentDate) && !isToday(appointmentDate)) {
      const daysPassed = Math.floor((now.getTime() - appointmentDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysPassed <= 1;
    }
    
    return true;
  };

  const getMinDateTime = () => {
    const now = new Date();
    const minDate = setHours(setMinutes(now, 0), 9);
    return format(minDate, "yyyy-MM-dd'T'HH:mm");
  };

  const getMaxDateTime = () => {
    const now = new Date();
    const maxDate = setHours(setMinutes(now, 0), 17);
    return format(maxDate, "yyyy-MM-dd'T'HH:mm");
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-medical-50 to-medical-100">
              <TableHead className="text-medical-700 font-semibold">Patient</TableHead>
              <TableHead className="text-medical-700 font-semibold">Date & Heure</TableHead>
              <TableHead className="text-medical-700 font-semibold">Motif</TableHead>
              <TableHead className="text-medical-700 font-semibold">Statut</TableHead>
              <TableHead className="text-medical-700 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consultations?.map((consultation) => {
              const appointmentDate = new Date(consultation.date);
              const isOverdue = isPast(appointmentDate) && consultation.statut_rendez_vous === "en_attente";
              
              return (
                <TableRow 
                  key={consultation.id} 
                  className={`hover:bg-gray-50 transition-colors ${isOverdue ? 'bg-red-50 border-l-4 border-red-400' : ''}`}
                >
                  <TableCell className="font-medium text-gray-900">
                    {consultation.patients.nom} {consultation.patients.prenom}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">
                        {format(appointmentDate, "EEEE d MMMM yyyy", { locale: fr })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(appointmentDate, "HH:mm", { locale: fr })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={consultation.motif}>
                      {consultation.motif}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(consultation)}
                  </TableCell>
                  <TableCell>
                    {consultation.statut_rendez_vous === "en_attente" && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(consultation.id, "effectué")}
                          disabled={loading === consultation.id || !canBeMarkedAsDone(consultation)}
                          className="flex items-center gap-2 border-green-200 hover:bg-green-50 hover:text-green-700"
                          title={!canBeMarkedAsDone(consultation) ? "Impossible de marquer comme effectué un rendez-vous passé depuis plus d'un jour" : "Marquer comme effectué"}
                        >
                          <Check className="h-4 w-4" />
                          {loading === consultation.id ? "..." : "Effectué"}
                        </Button>
                        
                        {isPast(appointmentDate) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRescheduleClick(consultation)}
                            disabled={loading === consultation.id}
                            className="flex items-center gap-2 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            title="Reporter le rendez-vous"
                          >
                            <Edit className="h-4 w-4" />
                            Reporter
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelClick(consultation)}
                          disabled={loading === consultation.id}
                          className="flex items-center gap-2 border-red-200 hover:bg-red-50 hover:text-red-600"
                          title="Annuler le rendez-vous"
                        >
                          <X className="h-4 w-4" />
                          {loading === consultation.id ? "..." : "Annuler"}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {(!consultations || consultations.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center text-gray-500">
                    <Calendar className="h-16 w-16 mb-4 text-gray-300" />
                    <p className="text-xl font-medium text-gray-400">Aucun rendez-vous trouvé</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Commencez par planifier un nouveau rendez-vous
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogue de confirmation d'annulation */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-700">
              ⚠️ Confirmation d'annulation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Non, garder</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Oui, annuler
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogue de report */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-blue-700">📅 Reporter le rendez-vous</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Nouvelle date et heure (entre 9h00 et 17h00)
              </label>
              <Input
                type="datetime-local"
                value={newDateTime}
                onChange={(e) => setNewDateTime(e.target.value)}
                min={getMinDateTime()}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Les rendez-vous ne peuvent être programmés qu'aux heures d'ouverture (9h-17h)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleReschedule}
              disabled={!newDateTime || loading !== null}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Reporter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue d'erreur */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Erreur
            </AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Compris</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
