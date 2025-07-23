# 🤖 Guide d'utilisation - IA Nutritionnelle

## Workflow recommandé

### 1. **Consultation Spécialisée avec IA**
```
Navigation → Consultations → Consultation spécialisée → Bilan nutritionnel
```

### 2. **Activation de l'Assistant IA**
1. Cliquez sur "**Cliquez ici pour l'IA**" (bouton violet)
2. L'interface IA spécialisée s'affiche avec le message :
   > 📊 IA spécialisée en BILAN NUTRITIONNEL : Je peux analyser les journaux alimentaires, identifier les carences et proposer des corrections.

### 3. **Saisie du journal alimentaire**

#### Option A : Dictée vocale (recommandé)
1. Cliquez "**👆 Cliquez ici pour parler**"
2. **Dictez le journal alimentaire** du patient :
   ```
   "Le patient prend son petit-déjeuner vers 8h avec du café et un croissant.
   Pour le déjeuner à 13h, il mange un sandwich jambon-beurre avec des chips.
   Le soir vers 20h, une pizza avec une bière.
   Il grignote du chocolat dans l'après-midi et boit environ 1 litre d'eau par jour."
   ```
3. Le texte s'affiche automatiquement dans la zone de saisie

#### Option B : Saisie manuelle
- Tapez directement dans la zone de texte qui apparaît

### 4. **Analyse IA automatique**
1. Cliquez "**👆 Cliquez ici pour analyser avec l'IA**"
2. L'IA traite les données (10-15 secondes)
3. **Le formulaire se remplit automatiquement** avec :
   - **Journal alimentaire** 24h
   - **Score nutritionnel** calculé (0-10)
   - **Synthèse des carences** identifiées
   - **Comportements alimentaires** extraits
   - **Hydratation** estimée
   - **Tests biologiques** si mentionnés

### 5. **Modification et validation**
- **Tous les champs sont modifiables** après remplissage automatique
- Ajustez les valeurs si nécessaire
- L'IA sert de base, vous gardez le contrôle médical

### 6. **Finalisation**
- Vérifiez les constantes vitales (poids, taille, IMC)
- Cliquez "**👆 Cliquez ici pour clôturer**"

## 🎯 Exemple concret

### Dictée patient diabétique :
```
"Patiente de 55 ans, diabétique type 2. 
Petit-déjeuner : flocons d'avoine avec du lait écrémé.
Déjeuner : salade verte, blanc de poulet, riz complet.
Dîner : soupe de légumes, poisson grillé.
Grignotage de biscuits sucrés l'après-midi.
Boit environ 1,5 litre d'eau par jour.
Glycémie ce matin à 1,4 g/L."
```

### Résultat automatique :
- **Score nutritionnel** : 7/10
- **Synthèse carences** : "diabete type2"
- **Comportements** : "Réduire les biscuits sucrés, bon équilibre général"
- **Hydratation** : 1,5L
- **Glycémie** : 1,4 g/L (alerte automatique)

## 💡 Conseils d'utilisation

### Pour optimiser l'IA :
- **Soyez précis** : mentionnez horaires, quantités, types d'aliments
- **Incluez les pathologies** : "diabétique", "hypertendu", etc.
- **Mentionnez les habitudes** : grignotage, hydratation, activité physique
- **Ajoutez les constantes** : "poids 75kg", "glycémie 1.3g/L"

### Cas types qui fonctionnent bien :
- Journal alimentaire détaillé sur 24h
- Patient avec pathologie métabolique
- Problèmes de poids ou nutritionnels
- Troubles du comportement alimentaire

## 🚨 Résolution des problèmes

### "L'IA ne remplit pas les champs"
- Vérifiez que vous avez cliqué "Analyser avec l'IA"
- Attendez la fin du traitement (message vert)
- Rechargez la page si nécessaire

### "Transcription vocale ne fonctionne pas"
- Autorisez le microphone dans votre navigateur
- Utilisez Chrome ou Firefox (recommandé)
- Vérifiez votre connexion internet

### "Erreur d'analyse IA"
- Vérifiez votre connexion
- Le service peut être temporairement indisponible
- Utilisez la saisie manuelle en attendant

## 🔧 Configuration technique

Si l'IA ne fonctionne pas, vérifiez :
1. **Clé OpenAI** configurée dans Supabase
2. **Fonctions Edge** déployées
3. **Connexion internet** active

Consultez `DEPLOY_AI.md` pour la configuration complète.

---

💡 **L'IA est un assistant, pas un remplaçant** : elle accélère la saisie et propose des analyses, mais la validation médicale finale vous appartient toujours.
