
export type UserRole = 'secretaire' | 'medecin';

export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  role: UserRole;
}

export interface Secretaire extends Utilisateur {
  poste: string;
  // Méthodes spécifiques secrétaire
  ajouterPatient(): void;
  modifierDossierPatient(): void;
  planifierRendezVous(): void;
  annulerRendezVous(): void;
  creerFacture(): void;
  enregistrerPaiement(): void;
  gererCaisse(): void;
  imprimerFacture(): void;
  voirHistoriqueConsultations(): void;
}

export interface Medecin extends Utilisateur {
  specialite: string;
  // Méthodes spécifiques médecin
  chercherPatient(): void;
  ajouterNouveauPatient(): void;
  creerActeMedical(): void;
  voirHistoriqueConsultations(): void;
  accederDossiersPatients(): void;
  suivrePatients(): void;
}

export interface Patient {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  contact: string;
}

export interface DossierPatient {
  id: number;
  patientId: number;
  groupeSanguin: string;
  antecedents: string;
  // Méthodes
  consulterDossier(): void;
  mettreAJourDossier(): void;
}

export interface RendezVous {
  idRdv: number;
  patientId: number;
  dateHeure: Date;
  statut: string;
  // Méthodes
  planifier(): void;
  annuler(): void;
  confirmer(): void;
}

export interface ActeMedical {
  idActe: number;
  patientId: number;
  medecinId: number;
  dateConsultation: Date;
  motif: string;
  diagnostic: string;
  traitement: string;
  planNutritionnel: string;
  // Méthodes
  ajouterActe(): void;
  modifierActe(): void;
  consulterActe(): void;
}

export interface Facture {
  idFacture: number;
  acteId: number;
  dateEmission: Date;
  montantTotal: number;
  // Méthodes
  genererFacture(): void;
  imprimerFacture(): void;
}

export interface Paiement {
  idPaiement: number;
  factureId: number;
  montantPaye: number;
  modePaiement: string;
  datePaiement: Date;
  // Méthodes
  effectuerPaiement(): void;
  verifierPaiement(): void;
}

export interface Notification {
  idNotification: number;
  rendezVousId: number;
  contenu: string;
  dateEnvoi: Date;
  // Méthodes
  envoyer(): void;
  marquerCommeLue(): void;
}

export interface Role {
  id: number;
  nomRole: string;
  // Méthodes
  definirPermissions(): void;
}

export interface DroitAcces {
  id: number;
  nomDroit: string;
}
