
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NotificationFormProps {
  open: boolean;
  onClose: () => void;
  notificationId: string | null;
  onSuccess: () => void;
}

interface Medecin {
  id: string;
  nom: string;
  prenom: string;
}

interface Secretaire {
  id: string;
  nom: string;
  prenom: string;
}

export function NotificationForm({
  open,
  onClose,
  notificationId,
  onSuccess,
}: NotificationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [secretaires, setSecretaires] = useState<Secretaire[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    message: "",
    type: "information",
    recipientType: "medecin",
    medecin_id: "",
    secretaire_id: "",
    date: new Date().toISOString().slice(0, 16), // Format YYYY-MM-DDTHH:MM
  });
  
  const [currentNotification, setCurrentNotification] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch médecins
        const { data: medecinsData, error: medecinsError } = await supabase
          .from("medecins")
          .select("id, nom, prenom")
          .order("nom");
          
        if (medecinsError) throw medecinsError;
        setMedecins(medecinsData || []);
        
        // Fetch secrétaires
        const { data: secretairesData, error: secretairesError } = await supabase
          .from("secretaires")
          .select("id, nom, prenom")
          .order("nom");
          
        if (secretairesError) throw secretairesError;
        setSecretaires(secretairesData || []);
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les données: " + error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchData();
      
      // Si un ID de notification est spécifié, remplir le formulaire avec ses données
      if (notificationId) {
        fetchNotification(notificationId);
      } else {
        resetForm();
      }
    }
  }, [open, notificationId]);

  const fetchNotification = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setCurrentNotification(data);
        
        // Déterminer le type de destinataire
        const recipientType = data.medecin_id ? "medecin" : "secretaire";
        
        setFormData({
          message: data.message || "",
          type: data.type || "information",
          recipientType,
          medecin_id: data.medecin_id || "",
          secretaire_id: data.secretaire_id || "",
          date: new Date(data.date).toISOString().slice(0, 16),
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la notification: " + error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      message: "",
      type: "information",
      recipientType: "medecin",
      medecin_id: "",
      secretaire_id: "",
      date: new Date().toISOString().slice(0, 16),
    });
    setCurrentNotification(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleRadioChange = (value: string) => {
    setFormData({
      ...formData,
      recipientType: value,
      medecin_id: value === "medecin" ? formData.medecin_id : "",
      secretaire_id: value === "secretaire" ? formData.secretaire_id : "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Valider que les champs obligatoires sont remplis
      if (!formData.message) {
        throw new Error("Veuillez saisir un message");
      }

      const notificationData = {
        message: formData.message,
        type: formData.type,
        date: new Date(formData.date).toISOString(),
        medecin_id: formData.recipientType === "medecin" ? formData.medecin_id : null,
        secretaire_id: formData.recipientType === "secretaire" ? formData.secretaire_id : null,
      };

      let response;
      
      if (currentNotification) {
        // Mise à jour d'une notification existante
        response = await supabase
          .from("notifications")
          .update(notificationData)
          .eq("id", currentNotification.id);
      } else {
        // Création d'une nouvelle notification
        response = await supabase
          .from("notifications")
          .insert([notificationData]);
      }

      if (response.error) throw response.error;
      
      onSuccess();
      resetForm();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {currentNotification ? "Modifier la notification" : "Nouvelle notification"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message <span className="text-red-500">*</span></Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={3}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type de notification</Label>
            <Select
              name="type"
              value={formData.type}
              onValueChange={(value) => handleSelectChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="information">Information</SelectItem>
                <SelectItem value="rappel">Rappel</SelectItem>
                <SelectItem value="urgence">Urgence</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date et heure</Label>
            <Input
              id="date"
              name="date"
              type="datetime-local"
              value={formData.date}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Destinataire</Label>
            <RadioGroup value={formData.recipientType} onValueChange={handleRadioChange} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medecin" id="medecin" />
                <Label htmlFor="medecin">Médecin</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="secretaire" id="secretaire" />
                <Label htmlFor="secretaire">Secrétaire</Label>
              </div>
            </RadioGroup>
          </div>
          
          {formData.recipientType === "medecin" ? (
            <div className="space-y-2">
              <Label htmlFor="medecin_id">Médecin</Label>
              <Select
                name="medecin_id"
                value={formData.medecin_id}
                onValueChange={(value) => handleSelectChange("medecin_id", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un médecin" />
                </SelectTrigger>
                <SelectContent>
                  {medecins.map((medecin) => (
                    <SelectItem key={medecin.id} value={medecin.id}>
                      Dr. {medecin.prenom} {medecin.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="secretaire_id">Secrétaire</Label>
              <Select
                name="secretaire_id"
                value={formData.secretaire_id}
                onValueChange={(value) => handleSelectChange("secretaire_id", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un(e) secrétaire" />
                </SelectTrigger>
                <SelectContent>
                  {secretaires.map((secretaire) => (
                    <SelectItem key={secretaire.id} value={secretaire.id}>
                      {secretaire.prenom} {secretaire.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : currentNotification ? "Mettre à jour" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
