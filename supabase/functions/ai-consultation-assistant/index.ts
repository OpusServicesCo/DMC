
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/std@0.168.0/dotenv/load.ts";


const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcription, patientInfo, action, model = 'gpt-4o', temperature = 0.7, context = {} } = await req.json();
    console.log('🤖 AI Assistant request:', { action, model, temperature });

    if (!transcription && !context && action !== 'help_assistant') {
      throw new Error('Transcription text or context is required');
    }
    
    if (action === 'help_assistant' && !transcription) {
      throw new Error('Message is required for help assistant');
    }

    let prompt = '';
    let systemPrompt = '';
    
    if (action === 'extract_data') {
      systemPrompt = `Vous êtes un assistant médical IA expert en nutrition et consultation médicale. 
      Analysez avec précision les transcriptions de consultations et extrayez les données structurées.
      Soyez précis avec les valeurs numériques et utilisez null pour les données non mentionnées.
      Respectez strictement le format JSON demandé.`;

      prompt = `Analysez cette transcription de consultation nutritionnelle et extrayez les données structurées :

TRANSCRIPTION: "${transcription}"

PATIENT: ${patientInfo ? `${patientInfo.nom} ${patientInfo.prenom}, ${patientInfo.age || 'âge non spécifié'} ans, ${patientInfo.sexe || 'sexe non spécifié'}` : 'Informations patient non disponibles'}

DONNÉES EXISTANTES: ${patientInfo ? JSON.stringify(patientInfo, null, 2) : 'Aucune donnée existante'}

Retournez UNIQUEMENT un objet JSON valide avec cette structure exacte :

{
  "constantes": {
    "poids": number | null,
    "taille": number | null,
    "imc": number | null,
    "tension_systolique": number | null,
    "tension_diastolique": number | null,
    "glycemie": number | null,
    "glycemie_type": "a_jeun" | "apres_repas" | "aleatoire" | null,
    "cholesterol_total": number | null,
    "cholesterol_hdl": number | null,
    "cholesterol_ldl": number | null,
    "triglycerides": number | null,
    "tour_taille": number | null,
    "frequence_cardiaque": number | null
  },
  "diagnostic": {
    "surpoids": boolean,
    "obesite": boolean,
    "obesite_grade": "I" | "II" | "III" | null,
    "diabete_type1": boolean,
    "diabete_type2": boolean,
    "prediabete": boolean,
    "syndrome_metabolique": boolean,
    "hypertension": boolean,
    "hypertension_grade": "grade_1" | "grade_2" | "grade_3" | null,
    "dyslipidémie": boolean,
    "carence_fer": boolean,
    "carence_b12": boolean,
    "carence_vitamine_d": boolean,
    "trouble_alimentaire": boolean,
    "type_trouble_alimentaire": string | null,
    "allergies_alimentaires": string | null,
    "intolérances": string | null,
    "pathologies_associées": string | null,
    "facteurs_risque": string[] | null,
    "remarques_medecin": string | null
  },
  "plan_nutritionnel": {
    "objectif_principal": string | null,
    "objectif_poids": number | null,
    "apport_calorique_cible": number | null,
    "répartition_macronutriments": {
      "proteines_pourcentage": number | null,
      "lipides_pourcentage": number | null,
      "glucides_pourcentage": number | null
    },
    "conseils_alimentaires": string | null,
    "aliments_privilégier": string[] | null,
    "aliments_limiter": string[] | null,
    "interdictions_alimentaires": string | null,
    "complements_recommandes": string[] | null,
    "hydratation_objectif": number | null,
    "niveau_activite_recommande": string | null,
    "frequence_repas": number | null
  },
  "suivi": {
    "frequence_rdv": "hebdomadaire" | "bimensuel" | "mensuel" | "trimestriel" | null,
    "date_prochain_rdv": string | null,
    "objectifs_court_terme": string[] | null,
    "objectifs_long_terme": string[] | null,
    "indicateurs_suivi": string[] | null,
    "examens_preconises": string[] | null,
    "alarme_suivi": boolean,
    "notes_suivi": string | null
  }
}

IMPORTANT: Calculez l'IMC si poids et taille sont disponibles (IMC = poids / (taille en mètres)²).
Si des données existent déjà, ne les écrasez que si de nouvelles valeurs sont explicitement mentionnées.`;
      
    } else if (action === 'suggest_nutrition') {
      systemPrompt = `Vous êtes un nutritionniste expert avec une vaste expérience clinique.
      Créez des plans nutritionnels personnalisés, scientifiquement fondés et pratiques.
      Tenez compte des contraintes médicales, sociales et personnelles du patient.`;

      prompt = `Créez un plan nutritionnel détaillé et personnalisé basé sur :

CONSULTATION: "${transcription}"
PATIENT: ${patientInfo ? JSON.stringify(patientInfo, null, 2) : 'Informations non disponibles'}
CONTEXTE MÉDICAL: ${context.medicalHistory || 'Aucun antécédent spécifié'}

Générez un plan nutritionnel complet en format JSON :

{
  "objectif_principal": "Description claire de l'objectif principal",
  "objectifs_specifiques": ["objectif 1", "objectif 2", "..."],
  "apport_energetique": {
    "kcal_jour": number,
    "repartition_repas": {
      "petit_dejeuner": number,
      "dejeuner": number,
      "diner": number,
      "collations": number
    }
  },
  "macronutriments": {
    "proteines": {"grammes": number, "pourcentage": number, "sources_recommandees": []},
    "lipides": {"grammes": number, "pourcentage": number, "sources_recommandees": []},
    "glucides": {"grammes": number, "pourcentage": number, "sources_recommandees": []}
  },
  "menu_type_journee": {
    "petit_dejeuner": "Exemple de petit-déjeuner équilibré",
    "dejeuner": "Exemple de déjeuner équilibré",
    "diner": "Exemple de dîner équilibré",
    "collations": ["collation 1", "collation 2"]
  },
  "aliments_privilégier": ["aliment 1", "aliment 2", "..."],
  "aliments_limiter": ["aliment 1", "aliment 2", "..."],
  "interdictions_formelles": ["aliment 1", "aliment 2", "..."],
  "complements_nutritionnels": [{"nom": "...", "dosage": "...", "justification": "..."}],
  "hydratation": {
    "eau_litres_jour": number,
    "autres_boissons": ["boisson 1", "boisson 2"]
  },
  "activite_physique": {
    "type_recommande": "Description du type d'activité",
    "frequence_semaine": number,
    "duree_seance": "durée en minutes",
    "intensite": "faible | modérée | élevée"
  },
  "conseils_pratiques": ["conseil 1", "conseil 2", "..."],
  "surveillance": {
    "parametres_suivre": ["paramètre 1", "paramètre 2"],
    "frequence_pesee": "quotidienne | hebdomadaire | mensuelle",
    "signes_alerte": ["signe 1", "signe 2"]
  },
  "suivi_recommande": {
    "prochaine_consultation": "délai recommandé",
    "examens_biologiques": ["examen 1", "examen 2"],
    "objectifs_court_terme": ["objectif 1", "objectif 2"],
    "objectifs_long_terme": ["objectif 1", "objectif 2"]
  }
}`;

    } else if (action === 'voice_response') {
      systemPrompt = `Vous êtes un assistant médical vocal professionnel, bienveillant et expert en nutrition.
      Répondez de manière conversationnelle, claire et rassurante.
      Vos réponses sont adaptées au contexte médical français et utilisent un langage accessible.
      Restez dans votre domaine de compétence et orientez vers un médecin si nécessaire.`;

      prompt = `Question du professionnel de santé : "${transcription}"

CONTEXTE PATIENT: ${context.currentPatient ? JSON.stringify(context.currentPatient) : 'Aucun patient spécifique'}
CONTEXTE MÉDICAL: ${context.medicalContext || 'Contexte général'}
HISTORIQUE: ${context.conversationHistory?.slice(-3).join('\n') || 'Pas d\'historique'}

Répondez de manière professionnelle, concise et utile. Votre réponse sera lue à haute voix.
Limitez-vous à 200 mots maximum et structurez votre réponse clairement.`;

    } else if (action === 'generate_summary') {
      systemPrompt = `Vous êtes un expert en rédaction médicale. 
      Créez des résumés de consultation clairs, complets et structurés pour le dossier médical.`;

      prompt = `Générez un résumé professionnel de cette consultation :

DONNÉES CONSULTATION: ${transcription}

Créez un résumé structuré incluant :
- Motif de consultation
- Anamnèse et antécédents pertinents
- Examen clinique et constantes
- Diagnostic(s) retenu(s)
- Plan thérapeutique et nutritionnel
- Suivi programmé
- Recommandations au patient

Format : Texte structuré professionnel pour dossier médical.`;

    } else if (action === 'risk_analysis') {
      systemPrompt = `Vous êtes un expert en évaluation des risques nutritionnels et métaboliques.
      Analysez les données patient pour identifier les facteurs de risque et proposer des mesures préventives.`;

      prompt = `Analysez les risques pour ce patient :

DONNÉES PATIENT: ${transcription}

Retournez une analyse JSON complète :

{
  "niveau_risque_global": "faible | modéré | élevé | très_élevé",
  "risques_identifiés": [
    {
      "facteur": "nom du facteur de risque",
      "niveau": "faible | modéré | élevé",
      "description": "description détaillée",
      "consequences_potentielles": ["conséquence 1", "conséquence 2"]
    }
  ],
  "facteurs_protecteurs": ["facteur 1", "facteur 2"],
  "recommandations_preventives": [
    {
      "priorité": "haute | moyenne | faible",
      "action": "description de l'action recommandée",
      "délai": "immédiat | court_terme | long_terme"
    }
  ],
  "surveillance_recommandée": {
    "paramètres": ["paramètre 1", "paramètre 2"],
    "fréquence": "quotidienne | hebdomadaire | mensuelle | trimestrielle"
  },
  "score_risque_cardiovasculaire": number,
  "score_risque_diabète": number,
  "recommandations_mode_vie": ["recommandation 1", "recommandation 2"]
}`;
    } else if (action === 'help_assistant') {
      systemPrompt = `Vous êtes l'assistant IA du système médical DMC (Digital Medical Center). Vous êtes un expert en aide utilisateur pour ce logiciel de gestion médicale.

VOTRE RÔLE :
- Aider les utilisateurs à naviguer et utiliser le système DMC
- Fournir des instructions claires et précises
- Répondre aux questions techniques sur les fonctionnalités
- Proposer des solutions aux problèmes courants
- Être professionnel, bienveillant et efficace

FONCTIONNALITÉS DU SYSTÈME DMC :
• 👥 Gestion des patients : Création, modification, dossiers médicaux complets
• 📅 Rendez-vous : Planification, calendrier, rappels automatiques
• 🩺 Consultations : Spécialisées, nutritionnelles, avec IA intégrée
• 💰 Paiements : Cash, Mobile Money, Carte, Assurance
• 📊 Facturation : Génération automatique, export PDF
• 📈 Caisse : Gestion financière, rapports, comptabilité
• 🔔 Notifications : Alertes, rappels, notifications système
• ⚙️ Paramètres : Configuration utilisateur, thèmes, permissions
• 🤖 IA médicale : Aide au diagnostic, suggestions, analyse

STYLE DE RÉPONSE :
- Réponses courtes et structurées
- Utilisez des puces et numérotation pour les étapes
- Mentionnez les menus/boutons exacts à cliquer
- Proposez des alternatives si nécessaire
- Demandez des précisions si la question est vague
- Répondez en français

Répondez de manière utile et précise à la question de l'utilisateur.`;

      // Construire l'historique de conversation pour le contexte
      let conversationContext = '';
      if (context.conversationHistory && context.conversationHistory.length > 0) {
        conversationContext = '\n\nCONTEXTE DE LA CONVERSATION :\n' + 
          context.conversationHistory.map((msg: any) => 
            `${msg.isBot ? 'Assistant' : 'Utilisateur'}: ${msg.text}`
          ).join('\n');
      }

      prompt = `${transcription}${conversationContext}`;
    }

    console.log('📤 Envoi requête OpenAI - Modèle:', model);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: temperature,
        max_tokens: action === 'voice_response' ? 300 : 2000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Erreur OpenAI API:', errorData);
      throw new Error(`Erreur OpenAI API: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('✅ Réponse OpenAI reçue');

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Format de réponse API inattendu');
    }

    let result = data.choices[0].message.content;

    // Pour les réponses JSON, essayez de parser et valider
    if (['extract_data', 'suggest_nutrition', 'risk_analysis'].includes(action)) {
      try {
        result = JSON.parse(result);
        console.log('✅ JSON parsé avec succès');
      } catch (e) {
        console.error('❌ Échec parsing JSON:', result);
        throw new Error('Réponse IA invalide - Format JSON incorrect');
      }
    }

    // Log des métriques
    console.log('📊 Métriques:', {
      action,
      model,
      tokens_used: data.usage?.total_tokens || 0,
      response_length: typeof result === 'string' ? result.length : JSON.stringify(result).length
    });

    return new Response(JSON.stringify({ 
      result,
      action,
      metadata: {
        model: model,
        tokens_used: data.usage?.total_tokens || 0,
        processing_time: Date.now()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Erreur dans ai-consultation-assistant:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Une erreur est survenue lors de l\'analyse IA',
      details: error.stack || 'Aucun détail disponible'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
