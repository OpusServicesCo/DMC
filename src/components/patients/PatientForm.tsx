
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Patient, PatientFormData } from "@/types/models";

interface PatientFormProps {
  patient?: Patient;
  onClose: () => void;
}

export function PatientForm({ patient, onClose }: PatientFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<PatientFormData>({
    nom: patient?.nom || "",
    prenom: patient?.prenom || "",
    date_naissance: patient?.date_naissance || "",
    email: patient?.email || "",
    telephone: patient?.telephone || "",
    adresse: patient?.adresse || "",
    sexe: patient?.sexe || "",
    antecedents: patient?.antecedents || "",
    groupe_sanguin: patient?.groupe_sanguin || "",
    poids: patient?.poids || "",
    taille: patient?.taille || "",
  });

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  const { nom, prenom, date_naissance, telephone, email } = formData;

  const dateNaissance = new Date(date_naissance);
  const today = new Date();

  // Date naissance pas dans le futur
  if (dateNaissance > today) {
    toast({
      title: "🤧 Oups !",
      description: "La date de naissance ne peut pas être dans le futur.",
      variant: "destructive",
    });
    setLoading(false);
    return;
  }

  // Age max 100 ans
  let age = today.getFullYear() - dateNaissance.getFullYear();
  const m = today.getMonth() - dateNaissance.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dateNaissance.getDate())) {
    age--;
  }
  if (age > 100) {
    toast({
      title: "🤧 Oups !",
      description: "L'âge du patient dépasse la limite autorisée (100 ans).",
      variant: "destructive",
    });
    setLoading(false);
    return;
  }

  // Téléphone 9 chiffres
  if (telephone && !/^\d{9}$/.test(telephone)) {
    toast({
      title: "📱 Numéro invalide",
      description: "Le numéro de téléphone doit contenir exactement 9 chiffres.",
      variant: "destructive",
    });
    setLoading(false);
    return;
  }

  // Email valide si rempli
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    toast({
      title: "✉️ Email invalide",
      description: "L'adresse email saisie est invalide.",
      variant: "destructive",
    });
    setLoading(false);
    return;
  }

  try {
    // Recherche doublon nom+prenom+date_naissance (sauf si on modifie ce même patient)
    const { data: existingPatients, error: fetchError } = await supabase
      .from("patients")
      .select("id")
      .eq("nom", nom.trim())
      .eq("prenom", prenom.trim())
      .eq("date_naissance", date_naissance);

    if (fetchError) {
      throw new Error("Erreur lors de la vérification des doublons.");
    }

    // Si un doublon existe et ce n'est pas la mise à jour du même patient
    if (existingPatients && existingPatients.length > 0) {
      if (!patient || existingPatients[0].id !== patient.id) {
        toast({
          title: "⚠️ Doublon détecté",
          description: "Un patient avec le même nom, prénom et date de naissance existe déjà.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
    }

    // Préparation données
    const patientData = {
      ...formData,
      poids: formData.poids ? Number(formData.poids) : null,
      taille: formData.taille ? Number(formData.taille) : null,
    };

    if (patient) {
      // Update
      const { error } = await supabase
        .from("patients")
        .update(patientData)
        .eq("id", patient.id);

      if (error) {
        if (error.code === "23505") {
          const msg = error.message.toLowerCase();
          if (msg.includes("email")) {
            throw new Error("📧 Un patient avec cet email existe déjà.");
          }
          if (msg.includes("telephone")) {
            throw new Error("📱 Ce numéro de téléphone est déjà utilisé.");
          }
          throw new Error("🧍‍♂️ Un patient similaire existe déjà.");
        }
        throw error;
      }

      toast({
        title: "Succès",
        description: "Patient modifié avec succès",
      });
    } else {
      // Insert
      const { error } = await supabase.from("patients").insert([patientData]);

      if (error) {
        if (error.code === "23505") {
          const msg = error.message.toLowerCase();
          if (msg.includes("email")) {
            throw new Error("📧 Un patient avec cet email existe déjà.");
          }
          if (msg.includes("telephone")) {
            throw new Error("📱 Ce numéro de téléphone est déjà utilisé.");
          }
          throw new Error("🧍‍♂️ Un patient similaire existe déjà.");
        }
        throw error;
      }

      toast({
        title: "Succès",
        description: "Patient ajouté avec succès",
      });
    }

    onClose();
  } catch (error: any) {
    console.error("Erreur patient :", error);
    toast({
      title: "Erreur",
      description: error.message || "Une erreur est survenue.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};


  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">
        {patient ? "Modifier le patient" : "Nouveau patient"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              placeholder="Nom"
              value={formData.nom}
              onChange={(e) =>
                setFormData({ ...formData, nom: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Input
              placeholder="Prénom"
              value={formData.prenom}
              onChange={(e) =>
                setFormData({ ...formData, prenom: e.target.value })
              }
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              type="date"
              value={formData.date_naissance}
              onChange={(e) =>
                setFormData({ ...formData, date_naissance: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Select
              value={formData.sexe}
              onValueChange={(value) =>
                setFormData({ ...formData, sexe: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sexe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculin</SelectItem>
                <SelectItem value="F">Féminin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div>
            <Input
              placeholder="Téléphone"
              value={formData.telephone}
              onChange={(e) =>
                setFormData({ ...formData, telephone: e.target.value })
              }
            />
          </div>
        </div>
        <div>
          <Input
            placeholder="Adresse"
            value={formData.adresse}
            onChange={(e) =>
              setFormData({ ...formData, adresse: e.target.value })
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Select
              value={formData.groupe_sanguin}
              onValueChange={(value) =>
                setFormData({ ...formData, groupe_sanguin: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Groupe sanguin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Input
              type="number"
              step="0.1"
              placeholder="Poids (kg)"
              value={formData.poids}
              onChange={(e) =>
                setFormData({ ...formData, poids: e.target.value })
              }
            />
          </div>
          <div>
            <Input
              type="number"
              step="0.01"
              placeholder="Taille (m)"
              value={formData.taille}
              onChange={(e) =>
                setFormData({ ...formData, taille: e.target.value })
              }
            />
          </div>
        </div>
        <div>
          <Textarea
            placeholder="Antécédents médicaux"
            value={formData.antecedents}
            onChange={(e) =>
              setFormData({ ...formData, antecedents: e.target.value })
            }
            className="min-h-[100px]"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} type="button">
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Chargement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
