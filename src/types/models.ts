import { Database } from "@/integrations/supabase/types";

// Types de base issus du schéma Supabase
export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type Consultation = Database["public"]["Tables"]["consultations"]["Row"];
export type Facture = Database["public"]["Tables"]["factures"]["Row"];
export type Traitement = Database["public"]["Tables"]["traitements"]["Row"];
export type TraitementSpecifique = Database["public"]["Tables"]["traitements_specifiques"]["Row"];
export type ActeMedical = Database["public"]["Tables"]["actes_medicaux"]["Row"];
export type Paiement = Database["public"]["Tables"]["paiements"]["Row"];
export type Assurance = Database["public"]["Tables"]["assurances"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type Medecin = Database["public"]["Tables"]["medecins"]["Row"];
export type Secretaire = Database["public"]["Tables"]["secretaires"]["Row"];

// Types de réponses étendus pour les requêtes avec jointures
export interface PatientWithAssurances extends Patient {
  assurances?: Assurance[];
}

export interface ConsultationWithPatient extends Consultation {
  patients: Pick<Patient, "id" | "nom" | "prenom" | "groupe_sanguin">;
}

export interface ConsultationWithDetails extends Consultation {
  patients: Pick<Patient, "id" | "nom" | "prenom" | "groupe_sanguin">;
  medecins?: Pick<Medecin, "id" | "nom" | "prenom"> | null;
}

export interface TraitementWithDetails extends Traitement {
  consultations: ConsultationWithPatient;
}

export interface TraitementSpecifiqueWithDetails extends TraitementSpecifique {
  actes_medicaux: ActeMedical & {
    consultation_id: string;
  };
}

export interface AssuranceWithPatient extends Assurance {
  patients: Pick<Patient, "nom" | "prenom"> | null;
}

export interface NotificationWithDetails extends Notification {
  medecins?: Pick<Medecin, "nom" | "prenom"> | null;
  secretaires?: Pick<Secretaire, "nom" | "prenom"> | null;
}

export interface FactureWithDetails extends Facture {
  consultations: ConsultationWithPatient;
  paiements?: Paiement[];
}

// Types des formulaires
export interface PatientFormData {
  nom: string;
  prenom: string;
  date_naissance: string;
  email: string;
  telephone: string;
  adresse: string;
  sexe: string;
  antecedents: string;
  groupe_sanguin: string;
  poids: string | number;
  taille: string | number;
}

// Types pour la gestion de caisse
export interface OperationCaisse {
  id: string;
  type: 'entrée' | 'sortie';
  montant: number;
  date: string;
  description: string;
  categorie: string;
  created_at: string;
  facture_id?: string | null;
  paiement_id?: string | null;
}

export interface NouvelleOperationCaisse {
  type: 'entrée' | 'sortie';
  montant: number;
  date: string;
  description: string;
  categorie: string;
  facture_id?: string | null;
  paiement_id?: string | null;
}

export interface StatistiqueCaisse {
  total_entrees: number;
  total_sorties: number;
  solde: number;
}
