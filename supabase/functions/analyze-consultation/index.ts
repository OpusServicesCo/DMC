import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { consultation } = await req.json();
    console.log('Analyzing consultation:', consultation);
    
    if (!consultation) {
      throw new Error('Aucune donnée de consultation fournie');
    }

    if (!consultation.motif) {
      throw new Error('Le motif de la consultation est requis pour l\'analyse');
    }

    const prompt = `En tant qu'assistant médical spécialisé, analysez cette consultation médicale :

Motif: ${consultation.motif}
Diagnostic: ${consultation.diagnostic || 'Non spécifié'}
Observations: ${consultation.observations || 'Aucune'}
Type de visite: ${consultation.type_visite}
Date: ${new Date(consultation.date).toLocaleDateString('fr-FR')}

Veuillez fournir une analyse détaillée en français qui inclut :
1. Un résumé des points clés de la consultation
2. Des suggestions de suivi médical potentiel
3. Des points d'attention particuliers pour le médecin
4. Des recommandations pour le patient
5. Une estimation de l'urgence du suivi (normale, à surveiller, urgente)

Formatez votre réponse de manière claire et professionnelle, en utilisant des sections bien définies.`;

    console.log('Sending request to OpenAI with prompt:', prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'Vous êtes un assistant médical professionnel qui analyse les consultations avec précision et bienveillance. Vos réponses sont toujours structurées, pertinentes et adaptées au contexte médical français.' 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`Erreur lors de l'analyse: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('OpenAI API response:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Format de réponse API inattendu');
    }

    return new Response(JSON.stringify({ 
      analysis: data.choices[0].message.content 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-consultation function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Une erreur est survenue lors de l\'analyse' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});