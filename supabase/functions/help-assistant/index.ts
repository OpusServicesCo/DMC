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
    const { message, conversationHistory = [] } = await req.json();
    console.log('🤖 Help Assistant request:', { message, historyLength: conversationHistory.length });

    if (!message) {
      throw new Error('Message is required');
    }

    const systemPrompt = `Vous êtes l'assistant IA du système médical DMC (Digital Medical Center). Vous êtes un expert en aide utilisateur pour ce logiciel de gestion médicale.

VOTRE RÔLE :
- Aider les utilisateurs à naviguer et utiliser le système DMC
- Fournir des instructions claires et précises
- Répondre aux questions techniques sur les fonctionnalités
- Proposer des solutions aux problèmes courants
- Être professionnel, bienveillant et efficace

FONCTIONNALITÉS DU SYSTÈME DMC :
• 👥 **Gestion des patients** : Création, modification, dossiers médicaux complets
• 📅 **Rendez-vous** : Planification, calendrier, rappels automatiques
• 🩺 **Consultations** : Spécialisées, nutritionnelles, avec IA intégrée
• 💰 **Paiements** : Cash, Mobile Money, Carte, Assurance
• 📊 **Facturation** : Génération automatique, export PDF
• 📈 **Caisse** : Gestion financière, rapports, comptabilité
• 🔔 **Notifications** : Alertes, rappels, notifications système
• ⚙️ **Paramètres** : Configuration utilisateur, thèmes, permissions
• 🤖 **IA médicale** : Aide au diagnostic, suggestions, analyse

STYLE DE RÉPONSE :
- Réponses courtes et structurées
- Utilisez des puces et numérotation pour les étapes
- Mentionnez les menus/boutons exacts à cliquer
- Proposez des alternatives si nécessaire
- Demandez des précisions si la question est vague
- Répondez en français

CONTEXTE TECHNIQUE :
- Interface web moderne avec navigation intuitive
- Système basé sur Supabase avec authentification
- Support des thèmes clair/sombre
- Notifications en temps réel
- Export de données en Excel/PDF

Répondez de manière utile et précise à la question de l'utilisateur.`;

    // Construire l'historique de conversation pour le contexte
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.isBot ? "assistant" : "user",
        content: msg.text
      })),
      { role: "user", content: message }
    ];

    console.log('📤 Sending request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Modèle rapide et économique pour l'assistance
        messages,
        temperature: 0.7, // Balance entre créativité et précision
        max_tokens: 800, // Réponses concises
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI response received');

    const aiResponse = data.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer une réponse.";

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        usage: data.usage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('❌ Help Assistant error:', error);
    
    let errorMessage = "Une erreur technique est survenue.";
    
    if (error.message?.includes('quota') || error.message?.includes('insufficient_quota')) {
      errorMessage = "Quota OpenAI dépassé. Veuillez contacter l'administrateur.";
    } else if (error.message?.includes('rate_limit')) {
      errorMessage = "Trop de requêtes. Veuillez patienter quelques secondes.";
    } else if (error.message?.includes('API key')) {
      errorMessage = "Configuration OpenAI manquante. Contactez l'administrateur.";
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
