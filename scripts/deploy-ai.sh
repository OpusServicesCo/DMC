#!/bin/bash

# Script de déploiement automatisé pour l'IA nutritionnelle
# Usage: ./scripts/deploy-ai.sh

echo "🚀 Déploiement de l'IA Nutritionnelle DMC"
echo "========================================"

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé"
    echo "Installation: npm install -g supabase"
    exit 1
fi

# Vérifier la connexion au projet
echo "🔍 Vérification de la connexion Supabase..."
if ! supabase status &> /dev/null; then
    echo "❌ Projet Supabase non connecté"
    echo "Exécutez: supabase link --project-ref VOTRE_PROJECT_ID"
    exit 1
fi

# Vérifier la clé OpenAI
echo "🔑 Vérification de la clé OpenAI..."
if ! supabase secrets list | grep -q "OPENAI_API_KEY"; then
    echo "⚠️  Clé OpenAI non configurée"
    read -p "Entrez votre clé OpenAI: " openai_key
    supabase secrets set OPENAI_API_KEY="$openai_key"
    echo "✅ Clé OpenAI configurée"
fi

# Déployer les fonctions
echo "📦 Déploiement des fonctions Edge..."

echo "  → ai-consultation-assistant"
supabase functions deploy ai-consultation-assistant

echo "  → voice-transcription" 
supabase functions deploy voice-transcription

echo "  → text-to-speech"
supabase functions deploy text-to-speech

# Vérifier le déploiement
echo "🔍 Vérification du déploiement..."
supabase functions list

# Test rapide
echo "🧪 Test de la fonction IA..."
test_result=$(supabase functions invoke ai-consultation-assistant --data '{
  "transcription": "Test: Patient diabétique, 75kg",
  "action": "extract_data"
}' 2>/dev/null)

if echo "$test_result" | grep -q "result"; then
    echo "✅ Fonction IA opérationnelle"
else
    echo "⚠️  Fonction IA - vérifiez les logs"
    echo "Logs: supabase functions logs ai-consultation-assistant"
fi

echo ""
echo "🎉 Déploiement terminé !"
echo "📚 Consultez DEPLOY_AI.md pour plus d'informations"
echo "🏥 L'IA nutritionnelle est maintenant disponible dans l'application"
