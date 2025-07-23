# 🧪 Guide de Test - IA Nutritionnelle

## Scénarios de test pour valider l'IA

### 1. Test de base - Journal alimentaire simple

**Saisie test :**
```
Petit-déjeuner: café noir, croissant
Déjeuner: sandwich jambon beurre, chips, coca
Dîner: pizza margherita, bière
Grignotage: chocolat, bonbons
Boisson: 2-3 verres d'eau par jour
```

**Résultat attendu :**
- Score nutritionnel : 20-40/100 (faible)
- Carences identifiées : Fibres, vitamines, oméga-3
- Alertes : Excès de sucres et graisses saturées
- Recommandations : Augmenter légumes, réduire aliments transformés

### 2. Test avancé - Patient diabétique

**Saisie test :**
```
Patient diabétique type 2, 68 ans, 82kg, 1m70
Petit-déjeuner: flocons d'avoine, lait écrémé, pomme
Déjeuner: salade verte, saumon grillé, riz complet, légumes vapeur  
Collation: yaourt nature, amandes
Dîner: soupe de légumes, blanc de poulet, haricots verts
Glycémie matinale: 1.35 g/L
Hydratation: 2L d'eau/jour
Activité: marche 30min/jour
```

**Résultat attendu :**
- Score nutritionnel : 75-85/100 (bon)
- Alerte glycémie élevée détectée
- Recommandations : Surveillance glycémique, bon équilibre global
- Plan adapté au diabète

### 3. Test transcription vocale

**Test dictée :**
1. Cliquer sur le bouton "Dicter"
2. Parler clairement : "Le patient consomme principalement des légumes verts, du poisson trois fois par semaine, et évite les sucreries. Il boit environ deux litres d'eau par jour."
3. Vérifier la transcription automatique
4. Lancer l'analyse IA

### 4. Test cas complexe - Troubles alimentaires

**Saisie test :**
```
Patiente 25 ans, 55kg, 1m65, troubles du comportement alimentaire
Petit-déjeuner: généralement sauté
Déjeuner: salade verte uniquement (restriction calorique sévère)
Dîner: compulsions alimentaires - gâteaux, glaces, chips
Episodes de vomissements occasionnels
Hydratation insuffisante
Pas d'activité physique
Fatigue chronique, irritabilité
```

**Résultat attendu :**
- Score très faible (<30/100)
- Multiples carences identifiées
- Alertes critiques sur le comportement alimentaire
- Recommandations de prise en charge spécialisée

## 🔍 Points de vérification

### Interface utilisateur
- [ ] Boutons de dictée vocale présents
- [ ] Transcription en temps réel fonctionne
- [ ] Indicateurs de progression pendant l'analyse
- [ ] Affichage des résultats structurés

### Fonctionnalités IA
- [ ] Extraction correcte des données nutritionnelles
- [ ] Calcul du score de qualité alimentaire
- [ ] Identification pertinente des carences
- [ ] Recommandations adaptées au profil patient
- [ ] Détection des alertes médicales

### Performance
- [ ] Analyse complète en <15 secondes
- [ ] Transcription vocale réactive
- [ ] Pas d'erreurs dans la console
- [ ] Interface responsive sur mobile

### Cas d'erreur
- [ ] Gestion des erreurs de connexion
- [ ] Fallback en cas d'échec de l'IA
- [ ] Messages d'erreur clairs pour l'utilisateur
- [ ] Récupération gracieuse des erreurs

## 🚨 Problèmes fréquents et solutions

### "L'IA ne répond pas"
```bash
# Vérifier les logs Supabase
supabase functions logs ai-consultation-assistant --follow

# Vérifier la clé OpenAI
supabase secrets list | grep OPENAI
```

### "Transcription vocale ne fonctionne pas"
- Vérifier les permissions microphone dans le navigateur
- Tester uniquement sur HTTPS (pas en localhost HTTP)
- Utiliser Chrome ou Firefox (meilleur support)

### "Erreur de quota OpenAI" 
- Vérifier le crédit disponible sur platform.openai.com
- Réduire temporairement la complexité des analyses
- Activer le mode fallback local

### "Fonctions non déployées"
```bash
# Redéployer toutes les fonctions
supabase functions deploy ai-consultation-assistant
supabase functions deploy voice-transcription

# Vérifier le statut
supabase functions list
```

## 📊 Métriques de succès

### Précision clinique
- Score nutritionnel cohérent avec l'évaluation manuelle
- Carences identifiées pertinentes 
- Recommandations adaptées au contexte médical

### Usabilité
- Temps de saisie réduit de 50% avec la dictée vocale
- Analyse complète en <20 secondes
- Interface intuitive sans formation

### Fiabilité
- Taux de succès >95% pour les analyses
- Gestion d'erreur gracieuse
- Pas de perte de données utilisateur

## 🎯 Validation finale

Avant mise en production, valider :
1. ✅ Tests sur 10 cas patients différents
2. ✅ Validation médicale des recommandations
3. ✅ Tests de charge (plusieurs analyses simultanées)
4. ✅ Tests sur différents navigateurs/appareils
5. ✅ Sauvegarde et récupération des données
6. ✅ Conformité RGPD et sécurité des données

---

💡 **Conseil :** Commencez par tester avec des cas simples, puis progressez vers des cas complexes pour valider la robustesse de l'IA.
