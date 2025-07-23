
export interface ConstantesVitales {
  poids: number;
  taille: number;
  imc?: number; // Calculé automatiquement
  tension_systolique: number;
  tension_diastolique: number;
  glycemie: number;
  glycemie_type: 'a_jeun' | 'apres_repas';
  cholesterol?: number;
}

export interface DiagnosticClinique {
  surpoids: boolean;
  obesite: boolean;
  diabete_type1: boolean;
  diabete_type2: boolean;
  hypertension: boolean;
  carence_fer: boolean;
  carence_b12: boolean;
  trouble_alimentaire: boolean;
  remarques_medecin: string;
}

export interface PlanNutritionnel {
  objectif: string;
  conseils_alimentaires: string;
  interdictions_alimentaires: string;
  complements_recommandes: string;
  niveau_activite: string;
}

export interface SuiviProgramme {
  frequence: 'hebdomadaire' | 'bimensuel' | 'mensuel';
  date_prochain_rdv?: string;
  alarme_suivi: boolean;
}

export interface ActeMedical {
  id: string;
  nom: string;
  prix: number;
  realise: boolean;
}

export interface ConsultationSpecialisee {
  id?: string;
  patient_id: string;
  date: string;
  constantes: ConstantesVitales;
  diagnostic: DiagnosticClinique;
  plan_nutritionnel: PlanNutritionnel;
  suivi: SuiviProgramme;
  actes_medicaux: ActeMedical[];
  montant_total: number;
  montant_paye: number;
  reste_a_payer: number;
  methode_paiement: 'especes' | 'mobile_money' | 'carte' | 'assurance';
  statut: 'en_cours' | 'termine' | 'facture';
}
