# Déploiement de l'IA Nutritionnelle

## 🚀 Étapes de configuration

### 1. Configuration OpenAI
```bash
# Obtenez une clé API sur https://platform.openai.com/api-keys
# Modèle recommandé : gpt-4o pour la précision médicale
```

### 2. Configuration Supabase
```bash
# Installez Supabase CLI
npm install -g supabase

# Connectez-vous à votre projet
supabase login
supabase link --project-ref VOTRE_PROJECT_ID

# Ajoutez votre clé OpenAI dans les secrets Supabase
supabase secrets set OPENAI_API_KEY=sk-votre-cle-openai
```

### 3. Déployement des fonctions Edge
```bash
# Déployez toutes les fonctions IA
supabase functions deploy ai-consultation-assistant
supabase functions deploy voice-transcription
supabase functions deploy text-to-speech

# Vérifiez le déploiement
supabase functions list
```

### 4. Test des fonctions
```bash
# Test de l'IA consultation
supabase functions invoke ai-consultation-assistant --data '{
  "transcription": "Patient de 45 ans, poids 85kg, diabète type 2, souhaite perdre du poids",
  "action": "extract_data",
  "patientInfo": {"age": 45, "sexe": "M"}
}'

# Test de transcription vocale
# (nécessite un fichier audio en base64)
```

### 5. Configuration frontend
```bash
# Copiez .env.example vers .env
cp .env.example .env

# Configurez vos URLs Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-publique
```

## 🔧 Fonctionnalités disponibles

### IA Nutritionnelle
- ✅ Analyse automatique des journaux alimentaires
- ✅ Identification des carences nutritionnelles  
- ✅ Génération de plans nutritionnels personnalisés
- ✅ Évaluation des risques métaboliques
- ✅ Recommandations prioritaires

### Transcription Vocale
- ✅ Dictée en temps réel (Web Speech API)
- ✅ Transcription audio via OpenAI Whisper
- ✅ Support français médical optimisé
- ✅ Remplissage automatique des champs

### Synthèse Vocale
- ✅ Lecture des diagnostics et recommandations
- ✅ Voix française naturelle
- ✅ Contrôle de vitesse et tonalité

## 🩺 Utilisation clinique

### 1. Consultation Nutritionnelle Standard
1. Allez dans "Consultation nutritionnelle"
2. Remplissez le formulaire standard
3. Utilisez la dictée vocale pour les observations
4. Lancez l'analyse IA complète

### 2. Bilan Nutritionnel Avancé
1. Utilisez l'onglet "IA Nutrition"
2. Dictez ou saisissez le journal alimentaire détaillé
3. L'IA analyse automatiquement :
   - Qualité nutritionnelle globale
   - Carences identifiées
   - Recommandations prioritaires
   - Alertes nutritionnelles

### 3. Workflow recommandé
```
Anamnèse → Journal alimentaire → Analyse IA → Plan personnalisé → Suivi
```

## ⚠️ Points d'attention

### Sécurité
- Les données patient ne sont PAS stockées chez OpenAI
- Seules les analyses anonymisées sont transmises
- Respect du RGPD et secret médical

### Limitations
- Nécessite connexion internet pour l'IA
- Fonction locale de fallback disponible
- Budget OpenAI à surveiller (coût ~0.02€/analyse)

### Performance
- Analyse complète : 10-15 secondes
- Transcription vocale : 2-3 secondes
- Mode offline partiel disponible

## 🐛 Dépannage

### L'IA ne répond pas
```bash
# Vérifiez les logs Supabase
supabase functions logs ai-consultation-assistant

# Vérifiez la clé OpenAI
supabase secrets list
```

### Transcription vocale ne fonctionne pas
- Vérifiez les permissions microphone
- Utilisez HTTPS (requis pour Web Speech API)
- Testez dans Chrome/Firefox (meilleur support)

### Erreur de quota OpenAI
- Vérifiez votre facturation OpenAI
- Ajustez les limites dans le code si nécessaire
- Passez en mode local en cas d'urgence

## 📞 Support
En cas de problème, vérifiez d'abord :
1. Console navigateur (F12)
2. Logs Supabase Functions
3. Statut API OpenAI
4. Configuration des secrets
