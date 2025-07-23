export type Patient = {
  id: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  created_at: string;
};

export type Consultation = {
  id: string;
  patient_id: string;
  date: string;
  motif: string;
  montant: number;
  created_at: string;
};

export type Facture = {
  id: string;
  consultation_id: string;
  date_emission: string;
  montant_total: number;
  statut: 'payée' | 'impayée';
  created_at: string;
};

export type Paiement = {
  id: string;
  facture_id: string;
  date_paiement: string;
  montant_paye: number;
  mode_paiement: 'espèces' | 'carte' | 'chèque';
  created_at: string;
};

export type UserRole = 'secrétaire' | 'médecin' | 'admin';

export type Profile = {
  id: string;
  nom_utilisateur: string;
  role: UserRole;
  updated_at: string;
};