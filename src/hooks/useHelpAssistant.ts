import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export const useHelpAssistant = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (message: string, conversationHistory: Message[] = []): Promise<string> => {
    setIsLoading(true);
    
    try {
      console.log('🤖 Sending message to AI assistant:', message);

      // Préparer l'historique de conversation (derniers 10 messages pour le contexte)
      const recentHistory = conversationHistory
        .slice(-10)
        .map(msg => ({
          text: msg.text,
          isBot: msg.isBot
        }));

      // Utiliser la fonction IA existante avec un prompt spécialisé pour l'aide
      const { data, error } = await supabase.functions.invoke('ai-consultation-assistant', {
        body: { 
          transcription: message,
          action: 'help_assistant',
          model: 'gpt-4o-mini',
          temperature: 0.7,
          context: {
            conversationHistory: recentHistory,
            systemType: 'dmc_help_assistant'
          }
        }
      });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      console.log('✅ AI response received');
      return data?.result || "Désolé, je n'ai pas pu générer une réponse.";

    } catch (error: any) {
      console.error('❌ Help assistant error:', error);
      
      // Solution de fallback avec réponses contextuelles locales
      const fallbackResponse = getFallbackResponse(message);
      
      // Afficher l'erreur seulement si ce n'est pas un fallback attendu
      if (!fallbackResponse.includes('Pour vous aider')) {
        let errorTitle = "Assistant IA temporairement indisponible";
        let errorDescription = "Utilisation du mode de compatibilité";
        
        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "default",
        });
      }

      return fallbackResponse;
      
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de fallback avec réponses contextuelles
  const getFallbackResponse = (message: string): string => {
    const msg = message.toLowerCase().trim().replace(/[^a-záàâäéèêëíìîïóòôöúùûüç\s]/g, '');
    
    // Fonction pour vérifier les variations et fautes de frappe
    const matchesAny = (text: string, patterns: string[]): boolean => {
      return patterns.some(pattern => {
        // Vérification exacte
        if (text.includes(pattern)) return true;
        // Vérification avec distance de Levenshtein simple (1-2 caractères de différence)
        if (pattern.length > 3) {
          const words = text.split(' ');
          return words.some(word => {
            if (Math.abs(word.length - pattern.length) <= 2) {
              let diff = 0;
              const minLen = Math.min(word.length, pattern.length);
              for (let i = 0; i < minLen; i++) {
                if (word[i] !== pattern[i]) diff++;
              }
              diff += Math.abs(word.length - pattern.length);
              return diff <= 2;
            }
            return false;
          });
        }
        return false;
      });
    };
    
    // Salutations et interactions sociales (priorité utilisation app)
    if (matchesAny(msg, ['bonjour', 'salut', 'hello', 'hi', 'bonsoir', 'coucou'])) {
      const greetings = [
        '👋 **Bonjour !** Je suis votre assistant pour le système médical DMC.\n\n🏥 **Fonctionnalités principales :**\n• Gestion des patients et dossiers\n• Planification des rendez-vous\n• Consultations médicales\n• Paiements et facturation\n• Suivi financier (caisse)\n\n💬 **Questions populaires :** "Comment ajouter un patient ?" ou "Comment créer un RDV ?"',
        
        '🌟 **Salut !** Assistant DMC à votre service !\n\n⚙️ **Utilisation de l\'application :**\n• Navigation dans les menus\n• Création et modification des données\n• Configuration des paramètres\n• Export et impression\n• Notifications et alertes\n\n❓ **Essayez :** "Comment utiliser les consultations ?" ou "Comment configurer les notifications ?"',
        
        '👨‍⚕️ **Bonjour !** Votre guide pour maîtriser DMC.\n\n📋 **Modules principaux :**\n• **Patients** → Création et gestion des dossiers\n• **Rendez-vous** → Planification et suivi\n• **Consultations** → Spécialisées et nutritionnelles\n• **Paiements** → Encaissements et factures\n• **Paramètres** → Configuration système\n\n🔍 **Demandez :** "Comment naviguer dans l\'app ?" ou "Utilisation des modules"'
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    if (matchesAny(msg, ['merci', 'thanks', 'thank you', 'remercie'])) {
      return '😊 **De rien !** Je suis là pour vous aider.\n\n**Besoin d\'autre chose ?** N\'hésitez pas à me poser d\'autres questions sur le système DMC !\n\n• Gestion des patients\n• Planification des rendez-vous\n• Consultations médicales\n• Paiements et facturation\n• Configuration du système';
    }
    
    if (matchesAny(msg, ['au revoir', 'bye', 'bientot', 'aurevoir', 'adieu'])) {
      return '👋 **À bientôt !** J\'espère avoir pu vous aider.\n\n**Je reste disponible** pour toutes vos questions sur le système médical DMC.\n\n✨ **Bonne journée !**';
    }
    
    // Expressions émotionnelles et interjections (priorité app)
    if (matchesAny(msg, ['ah', 'ahhh', 'oh', 'ohhh', 'ok', 'okay', 'daccord', 'hmm', 'hum', 'oui', 'non', 'bien', 'super'])) {
      const emotionalResponses = [
        '😊 **Je vous écoute !** Comment puis-je vous aider avec DMC ?\n\n🏥 **Fonctionnalités populaires :**\n• Ajouter un nouveau patient\n• Créer un rendez-vous\n• Démarrer une consultation\n• Traiter un paiement\n• Configurer les paramètres\n\n💬 **Posez votre question sur l\'utilisation !**',
        
        '🤗 **Parfait ! Je suis là pour vous guider.**\n\n📋 **Actions courantes :**\n• Navigation dans les menus\n• Création et modification des données\n• Recherche et filtrage\n• Export et impression\n• Gestion des notifications\n\n✨ **Que souhaitez-vous apprendre ?**',
        
        '👨‍⚕️ **À votre service !** Maîtrisons DMC ensemble.\n\n⚙️ **Aide disponible pour :**\n• Prise en main de l\'interface\n• Utilisation des modules\n• Résolution de problèmes\n• Optimisation du workflow\n• Trucs et astuces pratiques\n\n🎯 **Quelle fonctionnalité vous intéresse ?**'
      ];
      return emotionalResponses[Math.floor(Math.random() * emotionalResponses.length)];
    }
    
    // Questions spécifiques au système (avec tolérance élargie)
    if (matchesAny(msg, ['patient', 'patients', 'malade', 'malades', 'dossier', 'dossiers'])) {
      // Si c'est spécifiquement pour ajouter/créer
      if (matchesAny(msg, ['ajouter', 'créer', 'nouveau', 'nouvelle', 'creation', 'ajouter', 'enregistrer'])) {
        return '**Ajouter un nouveau patient :**\n\n1. Allez dans le menu "**Patients**"\n2. Cliquez sur "**Nouveau Patient**"\n3. Remplissez les informations obligatoires :\n   • Nom et prénom\n   • Date de naissance\n   • Coordonnées\n4. Ajoutez les informations médicales\n5. Cliquez sur "**Enregistrer**"\n\n✅ Le dossier patient sera créé avec un ID unique.';
      }
      // Sinon, info générale sur la gestion des patients
      return '👥 **Gestion des patients :**\n\n**Fonctionnalités disponibles :**\n• **Créer** un nouveau patient\n• **Modifier** les informations existantes\n• **Consulter** l\'historique médical\n• **Rechercher** dans la base de données\n• **Archiver** les dossiers inactifs\n\n**Actions rapides :**\n• Menu "Patients" → "Nouveau Patient"\n• Recherche par nom/ID\n• Export des listes\n\n💡 **Besoin d\'aide spécifique ?** Demandez "comment ajouter un patient"';
    }
    
    if (matchesAny(msg, ['consultation', 'consultations', 'visite', 'visites', 'examen', 'examens'])) {
      if (matchesAny(msg, ['créer', 'nouvelle', 'nouveau', 'demarrer', 'commencer'])) {
        return '**Créer une consultation :**\n\n1. Cliquez sur "**Consultations**" depuis l\'accueil\n2. Sélectionnez un patient existant\n3. Choisissez le type :\n   • Consultation spécialisée\n   • Consultation nutritionnelle\n   • Suivi\n4. Remplissez le formulaire\n5. Utilisez l\'IA pour l\'aide au diagnostic\n6. Cliquez "**Clôturer la consultation**"';
      }
      return '🩺 **Module Consultations :**\n\n**Types disponibles :**\n• Consultation spécialisée\n• Consultation nutritionnelle\n• Consultation de suivi\n• Téléconsultation\n\n**Fonctionnalités :**\n• Aide au diagnostic par IA\n• Historique patient intégré\n• Ordonnances automatiques\n• Export PDF des comptes-rendus\n\n📋 **Accès :** Menu "Consultations" → Sélectionner patient';
    }
    
    if (matchesAny(msg, ['rendez-vous', 'rendezvous', 'rdv', 'appointment', 'planning', 'calendrier'])) {
      return '📅 **Gestion des rendez-vous :**\n\n• **Nouveau RDV :** Menu "Rendez-vous" → "Nouveau"\n• **Planification :** Patient + Date + Heure + Motif\n• **Modification :** Cliquer sur le RDV dans le calendrier\n• **Annulation :** Bouton "Annuler" avec motif\n• **Rappels :** Notifications automatiques\n\n⚡ Le système gère les conflits d\'horaires automatiquement.';
    }
    
    if (matchesAny(msg, ['paiement', 'paiements', 'facture', 'factures', 'argent', 'money', 'reglement'])) {
      return '💰 **Paiements et facturation :**\n\n**Traiter un paiement :**\n1. Menu "**Paiements**" → Consultations en attente\n2. Sélectionnez la consultation\n3. Mode : Cash, Mobile Money, Carte, Assurance\n4. Confirmez le montant\n5. Validez\n\n📄 **Facturation automatique :** PDF généré, suivi des impayés.';
    }
    
    if (msg.includes('caisse') || msg.includes('finance') || msg.includes('comptabilité')) {
      return '**Module Caisse :**\n\n• **Tableau de bord** - Revenus jour/mois\n• **Historique** - Toutes les transactions\n• **Rapports** - Export Excel/PDF\n• **Modes de paiement** - Cash, Mobile Money, Carte\n• **Réconciliation** - Vérification des comptes\n\n📊 **Accès :** Menu "Caisse" (permissions admin requises)';
    }
    
    if (msg.includes('notification') || msg.includes('alerte') || msg.includes('rappel')) {
      return '**Système de notifications :**\n\n**Types :**\n• Rappels de RDV (patients + équipe)\n• Alertes médicales importantes\n• Échéances de paiement\n• Notifications système\n\n**Configuration :**\n• Menu "Paramètres" → "Notifications"\n• Email automatique + SMS\n• Personnalisation par utilisateur';
    }
    
    if (msg.includes('aide') || msg.includes('help') || msg.includes('fonctionnalité')) {
      return '**Je peux vous aider avec :**\n\n• 👥 **Patients** - Création, modification, dossiers\n• 📅 **Rendez-vous** - Planification, rappels\n• 🩺 **Consultations** - Spécialisées, nutritionnelles\n• 💰 **Paiements** - Tous modes de paiement\n• 📊 **Caisse** - Gestion financière\n• 🔔 **Notifications** - Configuration des alertes\n• ⚙️ **Paramètres** - Configuration système\n\n**Posez-moi une question spécifique !**';
    }
    
    if (msg.includes('problème') || msg.includes('erreur') || msg.includes('bug') || msg.includes('marche pas')) {
      return '🔧 **Dépannage rapide :**\n\n**Problèmes courants :**\n• **Lenteur :** Rafraîchissez (F5)\n• **Données manquantes :** Synchronisation en cours\n• **Erreur de connexion :** Vérifiez internet\n• **Sauvegarde échouée :** Réessayez\n\n**Besoin d\'aide :** Contactez l\'administrateur avec :\n• Description précise du problème\n• Étapes qui ont causé l\'erreur';
    }
    
    // Questions sur l'IA et nutrition spécialisée
    if (matchesAny(msg, ['ia', 'intelligence artificielle', 'ai', 'utiliser ia', 'assistant ia', 'robot'])) {
      const aiResponses = [
        '🤖 **L\'IA nutritionnelle DMC :**\n\n**Fonctionnalités avancées :**\n• **Analyse automatique** des habitudes alimentaires\n• **Calculs nutritionnels** instantanés (calories, macro/micronutriments)\n• **Recommandations personnalisées** selon profil patient\n• **Détection des carences** et suggestions d\'amélioration\n• **Plans de repas** générés automatiquement\n\n🍎 **Utilisation :** Pendant une consultation → Bouton "Assistant IA" → L\'IA analyse et propose',
        
        '🧠 **Intelligence Nutritionnelle :**\n\n**L\'IA vous aide à :**\n• **Interpréter les analyses biologiques** (glycémie, cholestérol...)\n• **Calculer l\'IMC optimal** et objectifs réalistes\n• **Adapter les régimes** aux pathologies (diabète, hypertension...)\n• **Surveiller l\'évolution** nutritionnelle du patient\n• **Générer des rapports** détaillés automatiquement\n\n💡 **Astuce :** L\'IA apprend de vos consultations pour s\'améliorer !',
        
        '⚡ **Assistant IA Nutrition :**\n\n**Intelligence au service de la diététique :**\n• **Analyse de photos** d\'aliments et estimation calorique\n• **Reconnaissance vocale** pour saisie rapide des consultations\n• **Suggestions d\'exercices** adaptées au profil nutritionnel\n• **Alertes intelligentes** sur les interactions médicamenteuses\n• **Prédictions de résultats** basées sur l\'historique patient\n\n🎯 **Activation :** Menu Consultation → "Mode IA Avancé"'
      ];
      return aiResponses[Math.floor(Math.random() * aiResponses.length)];
    }
    
    // Nutrition spécialisée et pathologies
    if (matchesAny(msg, ['nutrition', 'nutritionnel', 'nutritionnelle', 'dietetique', 'regime', 'alimentation', 'calories'])) {
      const nutritionResponses = [
        '🥗 **Module Nutrition Avancé :**\n\n**Spécialisations disponibles :**\n• **Nutrition clinique** (diabète, obésité, cardio)\n• **Nutrition sportive** (performance, récupération)\n• **Nutrition pédiatrique** (croissance, allergies)\n• **Nutrition gériatrique** (dénutrition, fragilité)\n• **Micronutrition** (carences, supplémentation)\n\n📊 **Outils :** Analyses biologiques + Plans personnalisés + Suivi évolution',
        
        '🍎 **Consultations Nutritionnelles :**\n\n**Protocoles intégrés :**\n• **Anamnèse alimentaire** automatisée (questionnaire intelligent)\n• **Calcul des besoins énergétiques** (Harris-Benedict, Mifflin)\n• **Analyse de la composition corporelle** (masse grasse/muscle)\n• **Planification de menus** équilibrés et personnalisés\n• **Suivi des objectifs** avec graphiques d\'évolution\n\n⚙️ **Personnalisation :** Âge, sexe, activité, pathologies, préférences',
        
        '📈 **Suivi Nutritionnel Intelligent :**\n\n**Métriques surveillées :**\n• **Évolution pondérale** et courbes de tendance\n• **Indicateurs biochimiques** (HbA1c, profil lipidique)\n• **Marqueurs inflammatoires** et stress oxydatif\n• **Compliance alimentaire** et écarts au programme\n• **Qualité de vie** et satisfaction patient\n\n🎯 **Alertes automatiques :** Déviations significatives, objectifs atteints'
      ];
      return nutritionResponses[Math.floor(Math.random() * nutritionResponses.length)];
    }
    
    // IMC et anthropométrie
    if (matchesAny(msg, ['imc', 'poids', 'taille', 'obesite', 'maigreur', 'corpulence', 'anthropometrie'])) {
      return '📏 **Évaluation Anthropométrique :**\n\n**Calculs automatisés :**\n• **IMC** (Indice de Masse Corporelle) avec interprétation\n• **Rapport taille/hanches** et répartition adipositaire\n• **Poids idéal théorique** selon différentes formules\n• **Pourcentage de masse grasse** estimé\n• **Surface corporelle** pour dosages médicamenteux\n\n🎯 **Objectifs personnalisés :** Perte/prise de poids progressive et durable\n📊 **Suivi graphique :** Courbes d\'évolution et zones cibles';
    }
    
    // Pathologies nutritionnelles
    if (matchesAny(msg, ['diabete', 'cholesterol', 'hypertension', 'allergie', 'intolerance', 'maladie'])) {
      return '🏥 **Nutrition Thérapeutique :**\n\n**Prises en charge spécialisées :**\n• **Diabète T1/T2** → Comptage glucides, index glycémique\n• **Dyslipidémies** → Régimes hypocholestérolémiants\n• **Hypertension** → Réduction sodique, DASH\n• **Allergies alimentaires** → Éviction et substitutions\n• **Maladies inflammatoires** → Nutrition anti-inflammatoire\n\n⚕️ **Protocoles validés :** Recommandations HAS + Sociétés savantes\n🔄 **Réévaluation** régulière selon évolution clinique';
    }
    
    // Questions générales sur l'utilisation
    if (matchesAny(msg, ['comment', 'utiliser', 'faire']) && !msg.includes('ia')) {
      const helpResponses = [
        '🤔 **Comment puis-je vous aider ?**\n\n**Questions d\'utilisation populaires :**\n• "Comment ajouter un nouveau patient ?"\n• "Comment créer un rendez-vous ?"\n• "Comment démarrer une consultation ?"\n• "Comment traiter un paiement ?"\n• "Comment configurer les notifications ?"\n\n💡 **Soyez spécifique** pour une réponse détaillée !',
        
        '📚 **Guide d\'utilisation DMC :**\n\n**Modules principaux :**\n• "Patients" → Gestion complète des dossiers\n• "Rendez-vous" → Planification et calendrier\n• "Consultations" → Examens et suivis\n• "Paiements" → Facturation et encaissements\n• "Paramètres" → Configuration personnalisée\n\n🎯 **Quel module vous intéresse ?**',
        
        '⚙️ **Utilisation de l\'application :**\n\n**Actions courantes :**\n• Navigation entre les menus\n• Création et modification des données\n• Recherche et filtrage d\'informations\n• Export et impression de documents\n• Configuration des préférences\n\n🔍 **Demandez l\'aide spécifique** que vous cherchez !'
      ];
      return helpResponses[Math.floor(Math.random() * helpResponses.length)];
    }
    
    // Réponse par défaut améliorée
    return `🤔 **Je n\'ai pas bien compris "${message}"**\n\n**Voici ce que je peux vous expliquer :**\n\n• **Patients :** Création et gestion des dossiers\n• **Rendez-vous :** Planification et suivi\n• **Consultations :** Spécialisées et nutritionnelles\n• **Paiements :** Facturation et encaissements\n• **Caisse :** Gestion financière\n\n💬 **Exemple :** "Comment ajouter un patient ?" ou "Comment créer un RDV ?"`;
  };

  return {
    sendMessage,
    isLoading
  };
};
