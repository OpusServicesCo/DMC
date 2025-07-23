export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      actes_medicaux: {
        Row: {
          consultation_id: string | null
          created_at: string
          description: string | null
          id: string
          type: string
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          type: string
        }
        Update: {
          consultation_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "actes_medicaux_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      assurances: {
        Row: {
          created_at: string
          id: string
          nom_assurance: string
          numero_assure: string | null
          patient_id: string | null
          type_assurance: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nom_assurance: string
          numero_assure?: string | null
          patient_id?: string | null
          type_assurance?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nom_assurance?: string
          numero_assure?: string | null
          patient_id?: string | null
          type_assurance?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assurances_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assurances_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "vue_progression_patients"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      cabinets_medecins: {
        Row: {
          cabinet_id: string | null
          created_at: string
          id: string
          medecin_id: string | null
        }
        Insert: {
          cabinet_id?: string | null
          created_at?: string
          id?: string
          medecin_id?: string | null
        }
        Update: {
          cabinet_id?: string | null
          created_at?: string
          id?: string
          medecin_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cabinets_medecins_cabinet_id_fkey"
            columns: ["cabinet_id"]
            isOneToOne: false
            referencedRelation: "cabinets_medicaux"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cabinets_medecins_medecin_id_fkey"
            columns: ["medecin_id"]
            isOneToOne: false
            referencedRelation: "medecins"
            referencedColumns: ["id"]
          },
        ]
      }
      cabinets_medicaux: {
        Row: {
          adresse: string | null
          created_at: string
          id: string
          nom: string
          telephone: string | null
        }
        Insert: {
          adresse?: string | null
          created_at?: string
          id?: string
          nom: string
          telephone?: string | null
        }
        Update: {
          adresse?: string | null
          created_at?: string
          id?: string
          nom?: string
          telephone?: string | null
        }
        Relationships: []
      }
      consultations: {
        Row: {
          alerte_suivi: boolean | null
          created_at: string
          date: string
          diagnostic: string | null
          donnees_ia_extraites: Json | null
          id: string
          medecin_id: string | null
          montant: number
          motif: string
          notes_medecin: string | null
          objectif_consultation: string | null
          observations: string | null
          pathologie_ciblee: string | null
          patient_id: string
          progression_notes: string | null
          recommendations_ia: string | null
          statut_rendez_vous:
            | Database["public"]["Enums"]["statut_rendez_vous"]
            | null
          type_consultation_nutritionnelle:
            | Database["public"]["Enums"]["type_consultation_nutritionnelle"]
            | null
          type_visite: string
          updated_at: string | null
        }
        Insert: {
          alerte_suivi?: boolean | null
          created_at?: string
          date: string
          diagnostic?: string | null
          donnees_ia_extraites?: Json | null
          id?: string
          medecin_id?: string | null
          montant: number
          motif: string
          notes_medecin?: string | null
          objectif_consultation?: string | null
          observations?: string | null
          pathologie_ciblee?: string | null
          patient_id: string
          progression_notes?: string | null
          recommendations_ia?: string | null
          statut_rendez_vous?:
            | Database["public"]["Enums"]["statut_rendez_vous"]
            | null
          type_consultation_nutritionnelle?:
            | Database["public"]["Enums"]["type_consultation_nutritionnelle"]
            | null
          type_visite?: string
          updated_at?: string | null
        }
        Update: {
          alerte_suivi?: boolean | null
          created_at?: string
          date?: string
          diagnostic?: string | null
          donnees_ia_extraites?: Json | null
          id?: string
          medecin_id?: string | null
          montant?: number
          motif?: string
          notes_medecin?: string | null
          objectif_consultation?: string | null
          observations?: string | null
          pathologie_ciblee?: string | null
          patient_id?: string
          progression_notes?: string | null
          recommendations_ia?: string | null
          statut_rendez_vous?:
            | Database["public"]["Enums"]["statut_rendez_vous"]
            | null
          type_consultation_nutritionnelle?:
            | Database["public"]["Enums"]["type_consultation_nutritionnelle"]
            | null
          type_visite?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_medecin_id_fkey"
            columns: ["medecin_id"]
            isOneToOne: false
            referencedRelation: "medecins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "vue_progression_patients"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      examens: {
        Row: {
          created_at: string
          date_examen: string | null
          id: string
          resultat: string | null
        }
        Insert: {
          created_at?: string
          date_examen?: string | null
          id: string
          resultat?: string | null
        }
        Update: {
          created_at?: string
          date_examen?: string | null
          id?: string
          resultat?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "examens_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "actes_medicaux"
            referencedColumns: ["id"]
          },
        ]
      }
      factures: {
        Row: {
          consultation_id: string
          created_at: string
          date_emission: string
          id: string
          medecin_id: string | null
          montant_total: number
          numero_facture: number | null
          statut: string
        }
        Insert: {
          consultation_id: string
          created_at?: string
          date_emission: string
          id?: string
          medecin_id?: string | null
          montant_total: number
          numero_facture?: number | null
          statut?: string
        }
        Update: {
          consultation_id?: string
          created_at?: string
          date_emission?: string
          id?: string
          medecin_id?: string | null
          montant_total?: number
          numero_facture?: number | null
          statut?: string
        }
        Relationships: [
          {
            foreignKeyName: "factures_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: true
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factures_medecin_id_fkey"
            columns: ["medecin_id"]
            isOneToOne: false
            referencedRelation: "medecins"
            referencedColumns: ["id"]
          },
        ]
      }
      historique_consultations: {
        Row: {
          consultation_id: string | null
          created_at: string
          date: string
          id: string
          notes: string | null
          patient_id: string | null
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
        }
        Update: {
          consultation_id?: string | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historique_consultations_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historique_consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historique_consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "vue_progression_patients"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      historique_mesures: {
        Row: {
          cholesterol_total: number | null
          consultation_id: string | null
          created_at: string | null
          date_mesure: string | null
          glycemie: number | null
          id: string
          imc: number | null
          notes_evolution: string | null
          patient_id: string
          poids: number | null
          taille: number | null
          tension_diastolique: number | null
          tension_systolique: number | null
          tour_taille: number | null
        }
        Insert: {
          cholesterol_total?: number | null
          consultation_id?: string | null
          created_at?: string | null
          date_mesure?: string | null
          glycemie?: number | null
          id?: string
          imc?: number | null
          notes_evolution?: string | null
          patient_id: string
          poids?: number | null
          taille?: number | null
          tension_diastolique?: number | null
          tension_systolique?: number | null
          tour_taille?: number | null
        }
        Update: {
          cholesterol_total?: number | null
          consultation_id?: string | null
          created_at?: string | null
          date_mesure?: string | null
          glycemie?: number | null
          id?: string
          imc?: number | null
          notes_evolution?: string | null
          patient_id?: string
          poids?: number | null
          taille?: number | null
          tension_diastolique?: number | null
          tension_systolique?: number | null
          tour_taille?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "historique_mesures_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historique_mesures_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historique_mesures_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "vue_progression_patients"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      medecins: {
        Row: {
          created_at: string
          id: string
          nom: string
          numero_de_licence: string | null
          prenom: string
          specialite: string | null
          utilisateur_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nom: string
          numero_de_licence?: string | null
          prenom: string
          specialite?: string | null
          utilisateur_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nom?: string
          numero_de_licence?: string | null
          prenom?: string
          specialite?: string | null
          utilisateur_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medecins_utilisateur_id_fkey"
            columns: ["utilisateur_id"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          date: string
          id: string
          medecin_id: string | null
          message: string
          secretaire_id: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          medecin_id?: string | null
          message: string
          secretaire_id?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          medecin_id?: string | null
          message?: string
          secretaire_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_medecin_id_fkey"
            columns: ["medecin_id"]
            isOneToOne: false
            referencedRelation: "medecins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_secretaire_id_fkey"
            columns: ["secretaire_id"]
            isOneToOne: false
            referencedRelation: "secretaires"
            referencedColumns: ["id"]
          },
        ]
      }
      operations_caisse: {
        Row: {
          categorie: string
          created_at: string
          date: string
          description: string
          facture_id: string | null
          id: string
          montant: number
          paiement_id: string | null
          type: string
        }
        Insert: {
          categorie: string
          created_at?: string
          date: string
          description: string
          facture_id?: string | null
          id?: string
          montant: number
          paiement_id?: string | null
          type: string
        }
        Update: {
          categorie?: string
          created_at?: string
          date?: string
          description?: string
          facture_id?: string | null
          id?: string
          montant?: number
          paiement_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "operations_caisse_facture_id_fkey"
            columns: ["facture_id"]
            isOneToOne: false
            referencedRelation: "factures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operations_caisse_paiement_id_fkey"
            columns: ["paiement_id"]
            isOneToOne: false
            referencedRelation: "paiements"
            referencedColumns: ["id"]
          },
        ]
      }
      ordonnances: {
        Row: {
          consultation_id: string | null
          created_at: string
          date_emission: string
          id: string
          medicaments_prescrits: string | null
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string
          date_emission?: string
          id?: string
          medicaments_prescrits?: string | null
        }
        Update: {
          consultation_id?: string | null
          created_at?: string
          date_emission?: string
          id?: string
          medicaments_prescrits?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordonnances_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      paiements: {
        Row: {
          created_at: string
          date_paiement: string
          facture_id: string
          id: string
          mode_paiement: string
          montant_paye: number
        }
        Insert: {
          created_at?: string
          date_paiement: string
          facture_id: string
          id?: string
          mode_paiement: string
          montant_paye: number
        }
        Update: {
          created_at?: string
          date_paiement?: string
          facture_id?: string
          id?: string
          mode_paiement?: string
          montant_paye?: number
        }
        Relationships: [
          {
            foreignKeyName: "paiements_facture_id_fkey"
            columns: ["facture_id"]
            isOneToOne: false
            referencedRelation: "factures"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          adresse: string | null
          antecedents: string | null
          created_at: string
          date_naissance: string
          email: string | null
          groupe_sanguin: string | null
          id: string
          nom: string
          poids: number | null
          prenom: string
          sexe: string | null
          taille: number | null
          telephone: string | null
        }
        Insert: {
          adresse?: string | null
          antecedents?: string | null
          created_at?: string
          date_naissance: string
          email?: string | null
          groupe_sanguin?: string | null
          id?: string
          nom: string
          poids?: number | null
          prenom: string
          sexe?: string | null
          taille?: number | null
          telephone?: string | null
        }
        Update: {
          adresse?: string | null
          antecedents?: string | null
          created_at?: string
          date_naissance?: string
          email?: string | null
          groupe_sanguin?: string | null
          id?: string
          nom?: string
          poids?: number | null
          prenom?: string
          sexe?: string | null
          taille?: number | null
          telephone?: string | null
        }
        Relationships: []
      }
      plans_nutritionnels_ia: {
        Row: {
          consultation_id: string
          contenu_plan: Json
          created_at: string | null
          date_generation: string | null
          id: string
          patient_id: string
          score_adequation: number | null
          statut: string | null
          suggestions_amelioration: string | null
          type_plan: string
        }
        Insert: {
          consultation_id: string
          contenu_plan: Json
          created_at?: string | null
          date_generation?: string | null
          id?: string
          patient_id: string
          score_adequation?: number | null
          statut?: string | null
          suggestions_amelioration?: string | null
          type_plan: string
        }
        Update: {
          consultation_id?: string
          contenu_plan?: Json
          created_at?: string | null
          date_generation?: string | null
          id?: string
          patient_id?: string
          score_adequation?: number | null
          statut?: string | null
          suggestions_amelioration?: string | null
          type_plan?: string
        }
        Relationships: [
          {
            foreignKeyName: "plans_nutritionnels_ia_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plans_nutritionnels_ia_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plans_nutritionnels_ia_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "vue_progression_patients"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      politiques: {
        Row: {
          confidentialite: string | null
          created_at: string
          id: string
          secretaire_id: string | null
          terms_conditions: string | null
        }
        Insert: {
          confidentialite?: string | null
          created_at?: string
          id?: string
          secretaire_id?: string | null
          terms_conditions?: string | null
        }
        Update: {
          confidentialite?: string | null
          created_at?: string
          id?: string
          secretaire_id?: string | null
          terms_conditions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "politiques_secretaire_id_fkey"
            columns: ["secretaire_id"]
            isOneToOne: false
            referencedRelation: "secretaires"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          nom_utilisateur: string
          role: string
          updated_at: string
        }
        Insert: {
          id: string
          nom_utilisateur: string
          role: string
          updated_at?: string
        }
        Update: {
          id?: string
          nom_utilisateur?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      secretaires: {
        Row: {
          created_at: string
          date_d_embauche: string | null
          id: string
          nom: string
          prenom: string
          utilisateur_id: string | null
        }
        Insert: {
          created_at?: string
          date_d_embauche?: string | null
          id?: string
          nom: string
          prenom: string
          utilisateur_id?: string | null
        }
        Update: {
          created_at?: string
          date_d_embauche?: string | null
          id?: string
          nom?: string
          prenom?: string
          utilisateur_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "secretaires_utilisateur_id_fkey"
            columns: ["utilisateur_id"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          cabinet_id: string | null
          created_at: string
          description_service: string | null
          id: string
          nom_service: string
        }
        Insert: {
          cabinet_id?: string | null
          created_at?: string
          description_service?: string | null
          id?: string
          nom_service: string
        }
        Update: {
          cabinet_id?: string | null
          created_at?: string
          description_service?: string | null
          id?: string
          nom_service?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_cabinet_id_fkey"
            columns: ["cabinet_id"]
            isOneToOne: false
            referencedRelation: "cabinets_medicaux"
            referencedColumns: ["id"]
          },
        ]
      }
      traitements: {
        Row: {
          consultation_id: string
          created_at: string
          description: string | null
          id: string
          nom: string
          prix: number
          statut: string
          updated_at: string | null
        }
        Insert: {
          consultation_id: string
          created_at?: string
          description?: string | null
          id?: string
          nom: string
          prix?: number
          statut?: string
          updated_at?: string | null
        }
        Update: {
          consultation_id?: string
          created_at?: string
          description?: string | null
          id?: string
          nom?: string
          prix?: number
          statut?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "traitements_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: true
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      traitements_specifiques: {
        Row: {
          created_at: string
          duree: string | null
          id: string
          posologie: string | null
        }
        Insert: {
          created_at?: string
          duree?: string | null
          id: string
          posologie?: string | null
        }
        Update: {
          created_at?: string
          duree?: string | null
          id?: string
          posologie?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "traitements_specifiques_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "actes_medicaux"
            referencedColumns: ["id"]
          },
        ]
      }
      utilisateurs: {
        Row: {
          created_at: string
          id: string
          identifiant: string
          role: string
        }
        Insert: {
          created_at?: string
          id: string
          identifiant: string
          role: string
        }
        Update: {
          created_at?: string
          id?: string
          identifiant?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "utilisateurs_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vue_progression_patients: {
        Row: {
          derniere_consultation: string | null
          evolution_poids: number | null
          nom: string | null
          nombre_consultations: number | null
          patient_id: string | null
          poids_max: number | null
          poids_min: number | null
          poids_moyen: number | null
          prenom: string | null
          types_consultations_suivies: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_operation_caisse: {
        Args: { p_id: string }
        Returns: undefined
      }
      insert_operation_caisse: {
        Args: {
          p_type: string
          p_montant: number
          p_date: string
          p_description: string
          p_categorie: string
          p_facture_id?: string
          p_paiement_id?: string
        }
        Returns: {
          categorie: string
          created_at: string
          date: string
          description: string
          facture_id: string | null
          id: string
          montant: number
          paiement_id: string | null
          type: string
        }
      }
      select_all_from_operations_caisse: {
        Args: Record<PropertyKey, never>
        Returns: {
          categorie: string
          created_at: string
          date: string
          description: string
          facture_id: string | null
          id: string
          montant: number
          paiement_id: string | null
          type: string
        }[]
      }
    }
    Enums: {
      statut_consultation: "payée" | "impayée"
      statut_paiement: "payé" | "impayé"
      statut_rendez_vous: "en_attente" | "effectué" | "annulé"
      type_consultation_nutritionnelle:
        | "consultation_initiale"
        | "bilan_nutritionnel"
        | "suivi_nutritionnel"
        | "dietetique_pathologie"
        | "trouble_comportement_alimentaire"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      statut_consultation: ["payée", "impayée"],
      statut_paiement: ["payé", "impayé"],
      statut_rendez_vous: ["en_attente", "effectué", "annulé"],
      type_consultation_nutritionnelle: [
        "consultation_initiale",
        "bilan_nutritionnel",
        "suivi_nutritionnel",
        "dietetique_pathologie",
        "trouble_comportement_alimentaire",
      ],
    },
  },
} as const
