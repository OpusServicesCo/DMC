import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FastWorkingAIProps {
  onFormDataFilled: (data: any) => void;
  patientInfo?: any;
  consultationType: string;
}

export function FastWorkingAI({ onFormDataFilled, patientInfo, consultationType }: FastWorkingAIProps) {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  // IA LOCALE RAPIDE - Fonctionne à 100% sans connexion externe
  const processWithLocalAI = async () => {
    if (!input.trim()) {
      toast({
        title: "Texte requis",
        description: "Veuillez saisir le journal alimentaire du patient",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    
    // Simulation visuelle de progression RAPIDE
    const steps = [
      { progress: 20, message: "Analyse du texte..." },
      { progress: 50, message: "Extraction des données..." },
      { progress: 80, message: "Calcul du score nutritionnel..." },
      { progress: 100, message: "Remplissage du formulaire..." }
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300)); // Rapide !
      setProgress(steps[i].progress);
    }

    // TRAITEMENT IA LOCAL - INSTANTANÉ - ADAPTÉ AU TYPE DE CONSULTATION
    const analysisResult = analyzeTextLocally(input, patientInfo, consultationType);
    
    // Remplir automatiquement le formulaire
    onFormDataFilled(analysisResult);
    setResult(analysisResult);
    
    setIsProcessing(false);
    
    toast({
      title: "✅ IA terminée !",
      description: "Formulaire rempli automatiquement en 2 secondes",
    });
  };

  // FONCTION D'ANALYSE LOCALE - ADAPTÉE AU TYPE DE CONSULTATION
  const analyzeTextLocally = (text: string, patient: any, consultationType: string) => {
    const lowerText = text.toLowerCase();
    
    // === EXTRACTION DE BASE ===
    const poidsMatches = text.match(/(?:poids|pèse|pesait)\s*(?:actuel|maintenant|aujourd'hui)?\s*:?\s*(\d+(?:\.\d+)?)\s*kg/i) ||
                        text.match(/(\d+(?:\.\d+)?)\s*kg\s*(?:actuel|maintenant|aujourd'hui)/i) ||
                        text.match(/(\d+(?:\.\d+)?)\s*kg/);
    const poidsActuelMatch = text.match(/(?:poids|pèse)\s*(?:actuel|maintenant|aujourd'hui)\s*:?\s*(\d+(?:\.\d+)?)\s*kg/i);
    const poidsPrecedentMatch = text.match(/(?:poids|pesait)\s*(?:précédent|avant|dernier)\s*:?\s*(\d+(?:\.\d+)?)\s*kg/i);
    
    const tailleMatch = text.match(/(\d+)\s*cm/);
    const poids = poidsMatches ? parseFloat(poidsMatches[1]) : null;
    const poidsActuelExtrait = poidsActuelMatch ? parseFloat(poidsActuelMatch[1]) : poids;
    const poidsPrecedentExtrait = poidsPrecedentMatch ? parseFloat(poidsPrecedentMatch[1]) : null;
    const taille = tailleMatch ? parseFloat(tailleMatch[1]) : null;
    const glycemieMatch = text.match(/(\d+\.\d+)\s*g\/l|glycémie.*?(\d+\.\d+)/i);
    const glycemie = glycemieMatch ? parseFloat(glycemieMatch[1] || glycemieMatch[2]) : null;
    const eauMatch = text.match(/(\d+(?:\.\d+)?)\s*l(?:itre)?(?:s)?\s*(?:d'eau|eau)/i);
    const eau = eauMatch ? parseFloat(eauMatch[1]) : 1.5;

    // === ANALYSE SELON LE TYPE DE CONSULTATION ===
    
    if (consultationType === 'consultation_initiale') {
      // CONSULTATION INITIALE - Remplir les champs spécifiques
      return {
        objectif_nutritionnel: lowerText.includes('perte') || lowerText.includes('perdre') || lowerText.includes('maigrir') ? 'perte_poids' :
                              lowerText.includes('stabilisation') || lowerText.includes('maintenir') ? 'stabilisation' :
                              lowerText.includes('prise') && lowerText.includes('poids') ? 'prise_poids' : 'equilibre_nutritionnel',
        
        antecedents_medicaux: [
          lowerText.includes('diabète') || lowerText.includes('diabétique') ? 'Diabète type 2' : '',
          lowerText.includes('hypertension') || lowerText.includes('tension') ? 'Hypertension' : '',
          lowerText.includes('cholestérol') ? 'Hypercholestérolémie' : '',
          lowerText.includes('surpoids') || lowerText.includes('obèse') ? 'Surpoids/Obésité' : ''
        ].filter(Boolean).join(', '),
        
        habitudes_alimentaires: text,
        
        nombre_repas: lowerText.includes('1') || lowerText.includes('un repas') ? '1-2' :
                     lowerText.includes('5') || lowerText.includes('grignotage') ? '4-5' :
                     lowerText.includes('plus') || lowerText.includes('souvent') ? 'plus_5' : '3',
        
        aliments_frequents: [
          lowerText.includes('riz') ? 'riz' : '',
          lowerText.includes('pain') ? 'pain' : '',
          lowerText.includes('pâtes') ? 'pâtes' : '',
          lowerText.includes('viande') ? 'viande' : '',
          lowerText.includes('poisson') ? 'poisson' : '',
          lowerText.includes('légume') ? 'légumes' : '',
          lowerText.includes('fruit') ? 'fruits' : ''
        ].filter(Boolean).join(', '),
        
        activite_physique: lowerText.includes('marche') ? 'Marche' :
                          lowerText.includes('sport') ? 'Sport' :
                          lowerText.includes('gym') ? 'Gymnastique' :
                          lowerText.includes('course') ? 'Course' :
                          lowerText.includes('aucune') || lowerText.includes('sédentaire') ? 'Aucune' : 'Non spécifiée',
        
        frequence_activite: lowerText.includes('quotidien') || lowerText.includes('tous les jours') ? 'quotidienne' :
                           lowerText.includes('3') || lowerText.includes('plusieurs') ? '3-4' :
                           lowerText.includes('1') || lowerText.includes('rare') ? '1-2' : 'aucune',
        
        symptomes_associes: [
          lowerText.includes('ballonnement') ? 'Ballonnements' : '',
          lowerText.includes('fatigue') ? 'Fatigue' : '',
          lowerText.includes('trouble') && lowerText.includes('digestif') ? 'Troubles digestifs' : '',
          lowerText.includes('constipation') ? 'Constipation' : '',
          lowerText.includes('diarrhée') ? 'Diarrhée' : ''
        ].filter(Boolean).join(', '),
        
        diagnostic_initial: [
          lowerText.includes('surpoids') || (poids && patient?.taille && (poids / Math.pow(patient.taille / 100, 2)) > 25) ? 'Surpoids' : '',
          lowerText.includes('déséquilibre') || lowerText.includes('désequilibre') ? 'Déséquilibre alimentaire' : '',
          lowerText.includes('carence') ? 'Carences nutritionnelles' : '',
          glycemie && glycemie > 1.26 ? 'Hyperglycémie' : ''
        ].filter(Boolean).join(', '),
        
        remarques_complementaires: `Analyse automatique basée sur: ${text.substring(0, 100)}...`,
        
        _analysis: {
          score: 'N/A',
          carences: [],
          type: 'consultation_initiale',
          alertes: glycemie && glycemie > 1.26 ? ['⚠️ Glycémie élevée détectée'] : []
        }
      };
      
    } else if (consultationType === 'bilan_nutritionnel') {
      // BILAN NUTRITIONNEL - Champs spécifiques
      let score = 5;
      if (lowerText.includes('légume')) score += 2;
      if (lowerText.includes('fruit')) score += 1.5;
      if (lowerText.includes('poisson')) score += 1.5;
      if (lowerText.includes('sucre') || lowerText.includes('sucrés')) score -= 2;
      if (lowerText.includes('frit') || lowerText.includes('pizza')) score -= 1.5;
      const finalScore = Math.max(0, Math.min(10, Math.round(score)));
      
      const carences = [];
      if (!lowerText.includes('légume')) carences.push("Manque de légumes");
      if (!lowerText.includes('fruit')) carences.push("Insuffisance en fruits");
      if (!lowerText.includes('poisson')) carences.push("Carence en oméga-3");
      if (eau < 1.5) carences.push("Hydratation insuffisante");
      
      return {
        rappel_alimentaire_24h: text,
        aliments_dominants: lowerText.includes('féculent') || lowerText.includes('riz') || lowerText.includes('pâtes') ? 'feculents' : 
                           lowerText.includes('sucre') || lowerText.includes('sucrés') ? 'sucres' :
                           lowerText.includes('gras') || lowerText.includes('frit') ? 'gras' :
                           lowerText.includes('protéine') || lowerText.includes('viande') || lowerText.includes('poisson') ? 'proteines' : 'equilibre',
        frequence_repas: lowerText.includes('collation') ? '3 repas + 2 collations' :
                        lowerText.includes('grignotage') ? '3 repas + grignotage' : '3 repas principaux',
        eau_quotidienne: eau,
        comportements_alimentaires: [
          lowerText.includes('grignotage') ? 'Grignotage fréquent' : '',
          lowerText.includes('stress') && lowerText.includes('manger') ? 'Alimentation émotionnelle' : '',
          lowerText.includes('saut') && lowerText.includes('repas') ? 'Saut de repas' : '',
          lowerText.includes('rapide') || lowerText.includes('vite') ? 'Repas pris rapidement' : ''
        ].filter(Boolean).join(', '),
        tests_biologiques: glycemie ? `Glycémie: ${glycemie} g/L` : 'Aucun test biologique mentionné',
        cholesterol: text.match(/cholestérol.*?(\d+)/i)?.[1] || '',
        glycemie: glycemie?.toString() || '',
        score_nutritionnel: finalScore,
        synthese_carences: carences.join(', ') || 'Équilibre globalement satisfaisant',
        
        _analysis: {
          score: finalScore,
          carences: carences,
          type: 'bilan_nutritionnel',
          alertes: glycemie && glycemie > 1.26 ? ['⚠️ Glycémie élevée détectée'] : []
        }
      };
      
    } else if (consultationType === 'suivi_nutritionnel') {
      // SUIVI NUTRITIONNEL - Champs spécifiques
      const poidsActuel = poidsActuelExtrait || poids || 0;
      const poidsPrecedent = poidsPrecedentExtrait || patient?.dernierPoids || patient?.poids || 70;
      const evolution = poidsActuel - poidsPrecedent;
      
      return {
        poids_precedent: poidsPrecedent,
        poids_actuel: poidsActuel,
        imc_actuel: poidsActuel && patient?.taille ? Math.round((poidsActuel / Math.pow(patient.taille / 100, 2)) * 10) / 10 : 0,
        respect_plan: lowerText.includes('respecté') || lowerText.includes('suivi') || 
                     (!lowerText.includes('écart') && !lowerText.includes('difficulté')),
        remarques_respect: lowerText.includes('écart') || lowerText.includes('difficulté') ? 
                          'Quelques écarts constatés par rapport au plan initial' : 
                          'Plan nutritionnel globalement respecté',
        difficultes_rencontrees: [
          lowerText.includes('temps') ? 'Manque de temps' : '',
          lowerText.includes('social') || lowerText.includes('famille') ? 'Contraintes sociales/familiales' : '',
          lowerText.includes('coût') || lowerText.includes('cher') ? 'Contraintes financières' : '',
          lowerText.includes('envie') || lowerText.includes('motivation') ? 'Problèmes de motivation' : ''
        ].filter(Boolean).join(', '),
        ressenti_patient: lowerText.includes('satisfait') || lowerText.includes('content') ? 'satisfait' :
                         lowerText.includes('déçu') || lowerText.includes('decu') ? 'decu' :
                         lowerText.includes('découragé') || lowerText.includes('decourage') ? 'decourage' : 'mitige',
        evolution_positive: evolution < 0,
        stagnation: Math.abs(evolution) < 0.5,
        regression: evolution > 1,
        adaptations_proposees: evolution > 0 ? 'Révision du plan nutritionnel, réduction calorique modérée' :
                              evolution < -2 ? 'Maintien du plan actuel, surveillance rapprochée' :
                              'Ajustements mineurs du plan selon les préférences',
        nouveaux_conseils: 'Poursuite des efforts, consultation de suivi dans 1 mois',
        
        _analysis: {
          evolution: evolution,
          type: 'suivi_nutritionnel',
          alertes: evolution > 2 ? ['⚠️ Prise de poids importante - révision nécessaire'] : []
        }
      };
      
    } else if (consultationType === 'dietetique_pathologique') {
      // DIÉTÉTIQUE PATHOLOGIQUE - Prise en charge médicale
      const pathologies = [];
      if (lowerText.includes('diabète')) pathologies.push('Diabète');
      if (lowerText.includes('rein') || lowerText.includes('rénal')) pathologies.push('Insuffisance rénale');
      if (lowerText.includes('foie') || lowerText.includes('hépatique')) pathologies.push('Hépatopathie');
      if (lowerText.includes('cancer') || lowerText.includes('chimio')) pathologies.push('Oncologie');
      if (lowerText.includes('crohn') || lowerText.includes('colite')) pathologies.push('MICI');
      
      return {
        pathologie_principale: pathologies[0] || 'Non spécifiée',
        severity: lowerText.includes('grave') || lowerText.includes('sévère') ? 'severe' :
                 lowerText.includes('modéré') ? 'moderate' : 'mild',
        contraintes_alimentaires: [
          lowerText.includes('sans gluten') ? 'Sans gluten' : '',
          lowerText.includes('sans lactose') ? 'Sans lactose' : '',
          lowerText.includes('pauvre en sel') || lowerText.includes('hyposodé') ? 'Hyposodé' : '',
          lowerText.includes('diabétique') ? 'Contrôle glycémique' : '',
          lowerText.includes('rein') ? 'Restriction protéique' : ''
        ].filter(Boolean).join(', '),
        traitements_medicaux: text.match(/\b\w+ine\b|\b\w+ol\b/gi)?.slice(0,3).join(', ') || 'Non mentionnés',
        adaptations_necessaires: `Adaptation nutritionnelle pour ${pathologies.join(', ') || 'pathologie'}`,
        surveillance_requise: glycemie && glycemie > 1.26 ? 'Glycémie' : 'Poids et tolérance',
        
        _analysis: {
          pathologies: pathologies,
          type: 'dietetique_pathologique',
          alertes: [
            glycemie && glycemie > 1.26 ? '⚠️ Glycémie élevée détectée' : '',
            lowerText.includes('grave') ? '⚠️ Pathologie sévère - suivi rapproché' : ''
          ].filter(Boolean)
        }
      };
      
    } else if (consultationType === 'troubles_alimentaires') {
      // TROUBLES ALIMENTAIRES - Approche psycho-nutritionnelle
      const troubles = [];
      if (lowerText.includes('boulimi') || lowerText.includes('hyperphagie')) troubles.push('Hyperphagie boulimique');
      if (lowerText.includes('anorexie') || lowerText.includes('restriction')) troubles.push('Anorexie');
      if (lowerText.includes('compulsion') || lowerText.includes('compulsive')) troubles.push('Compulsions alimentaires');
      if (lowerText.includes('grignotage') && lowerText.includes('stress')) troubles.push('Alimentation émotionnelle');
      
      const emotions = [];
      if (lowerText.includes('stress')) emotions.push('Stress');
      if (lowerText.includes('anxiété') || lowerText.includes('angoisse')) emotions.push('Anxiété');
      if (lowerText.includes('tristesse') || lowerText.includes('déprim')) emotions.push('Tristesse');
      if (lowerText.includes('colère')) emotions.push('Colère');
      if (lowerText.includes('solitude')) emotions.push('Solitude');
      
      return {
        type_tca: troubles[0] || 'Non spécifié',
        frequence_episodes: lowerText.includes('quotidien') || lowerText.includes('tous les jours') ? 'quotidienne' :
                           lowerText.includes('plusieurs fois') || text.match(/\d+.*fois.*semaine/) ? 'plusieurs_semaine' :
                           lowerText.includes('occasionnel') ? 'occasionnelle' : 'variable',
        emotions_declencheuses: emotions.join(', ') || 'Non identifiées',
        aliments_problematiques: [
          lowerText.includes('sucré') || lowerText.includes('chocolat') || lowerText.includes('gâteau') ? 'Produits sucrés' : '',
          lowerText.includes('salé') || lowerText.includes('chips') ? 'Produits salés' : '',
          lowerText.includes('fast food') || lowerText.includes('pizza') ? 'Fast-food' : '',
          lowerText.includes('pain') || lowerText.includes('féculent') ? 'Féculents' : ''
        ].filter(Boolean).join(', '),
        comportements_compensatoires: lowerText.includes('vomissement') || lowerText.includes('laxatif') ? 
                                     'Vomissements/laxatifs' : 
                                     lowerText.includes('sport') && lowerText.includes('excessif') ? 'Sport excessif' :
                                     lowerText.includes('restriction') ? 'Restriction' : 'Aucun',
        relation_nourriture: lowerText.includes('culpabilité') ? 'Culpabilité importante' :
                            lowerText.includes('contrôle') ? 'Besoin de contrôle' :
                            lowerText.includes('plaisir') ? 'Perte de plaisir' : 'Relation complexe',
        impact_social: lowerText.includes('isolement') || lowerText.includes('évite') ? 
                      'Isolement social' : 'Impact modéré',
        
        _analysis: {
          troubles: troubles,
          emotions: emotions,
          type: 'troubles_alimentaires',
          alertes: [
            lowerText.includes('vomissement') ? '⚠️ Comportements compensatoires détectés' : '',
            lowerText.includes('quotidien') ? '⚠️ Épisodes quotidiens - urgence' : '',
            troubles.length === 0 ? '⚠️ Type de TCA à préciser' : ''
          ].filter(Boolean)
        }
      };
      
    } else {
      // AUTRES TYPES - Retour générique
      return {
        observations_generales: text,
        diagnostic_propose: 'Analyse en cours selon le type de consultation spécialisée',
        _analysis: {
          type: consultationType,
          alertes: glycemie && glycemie > 1.26 ? ['⚠️ Glycémie élevée détectée'] : []
        }
      };
    }
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Zap className="h-5 w-5" />
          {consultationType === 'consultation_initiale' && '🆕 Assistant Consultation Initiale - Première évaluation'}
          {consultationType === 'bilan_nutritionnel' && '📋 Assistant Bilan Nutritionnel - Analyse approfondie'}
          {consultationType === 'suivi_nutritionnel' && '🔄 Assistant Suivi Nutritionnel - Analyse de progression'}
          {consultationType === 'dietetique_pathologique' && '🏥 Assistant Diététique Pathologique - Prise en charge médicale'}
          {consultationType === 'troubles_alimentaires' && '🧠 Assistant Troubles Alimentaires - Approche psycho-nutritionnelle'}
          {!['consultation_initiale', 'bilan_nutritionnel', 'suivi_nutritionnel', 'dietetique_pathologique', 'troubles_alimentaires'].includes(consultationType) && '🚀 IA Nutritionnelle Rapide - Fonctionne toujours !'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Zone de saisie unique et claire */}
        <div>
          <label className="block text-sm font-medium text-green-700 mb-2">
            {consultationType === 'consultation_initiale' && '🆕 Première consultation - Décrivez le profil et les habitudes du patient :'}
            {consultationType === 'bilan_nutritionnel' && '📋 Rappel alimentaire 24h et évaluation complète :'}
            {consultationType === 'suivi_nutritionnel' && '📊 Rapport de suivi nutritionnel (évolution, respect du plan, difficultés...) :'}
            {consultationType === 'dietetique_pathologique' && '🏥 Pathologie et adaptation nutritionnelle requise :'}
            {consultationType === 'troubles_alimentaires' && '🧠 Comportement alimentaire et relation à la nourriture :'}
            {!['consultation_initiale', 'bilan_nutritionnel', 'suivi_nutritionnel', 'dietetique_pathologique', 'troubles_alimentaires'].includes(consultationType) && '📝 Décrivez l\'alimentation du patient (plus c\'est détaillé, meilleure est l\'analyse) :'}
          </label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              consultationType === 'consultation_initiale' ? 
                "Exemple INITIALE : Femme 45 ans, surpoids depuis 5 ans. Objectif: perdre 10kg. Habitudes: saute le petit-déjeuner, mange tard le soir, grignotage stress. Antécédents: diabète type 2. Activité: sédentaire, bureau toute la journée. Symptômes: fatigue, ballonnements." :
              consultationType === 'bilan_nutritionnel' ?
                "Exemple BILAN : Rappel 24h - Petit-déj: café + viennoiserie 7h30. Collation: fruits 10h. Déjeuner: salade caesar + pain 13h. Goûter: yaourt + biscuits 16h. Dîner: pâtes bolognaise + fromage 20h. Eau: 1.2L. Tests bio: cholestérol 2.4g/L, glycémie 1.1g/L." :
              consultationType === 'suivi_nutritionnel' ? 
                "Exemple SUIVI : Poids précédent 78kg, poids actuel 76.5kg. Plan nutritionnel respecté à 80%. Difficultés le weekend avec grignotage. Patient satisfait de sa progression. Petit-déjeuner: avoine + fruits. Déjeuner: salade + poisson. Dîner: légumes + protéines. Boit 2L d'eau par jour." :
              consultationType === 'dietetique_pathologique' ?
                "Exemple PATHOLOGIQUE : Patient diabétique type 1, HbA1c 8.2%. Hypoglycémies fréquentes la nuit. Difficultés comptage glucides. Petit-déj: pain complet + confiture. Collations: fruits. Insuline: 24U basale + 6U/repas. Activité: course 3x/semaine." :
              consultationType === 'troubles_alimentaires' ?
                "Exemple TCA : Patiente 28 ans, hyperphagie boulimique. Épisodes 3x/semaine le soir. Émotions: stress travail, solitude. Aliments déclencheurs: sucré, salé. Culpabilité importante. Restriction la journée puis perte de contrôle. Poids yo-yo depuis 10 ans." :
                "Exemple : Patient diabétique, 65 ans. Petit-déjeuner: café sucré + croissant à 8h. Déjeuner: sandwich jambon + chips à 13h. Dîner: pizza + soda à 20h. Grignotage de chocolat l'après-midi. Boit 0.5L d'eau par jour. Glycémie ce matin: 1.4 g/L."
            }
            rows={6}
            className="border-green-300 focus:border-green-500"
            disabled={isProcessing}
          />
        </div>

        {/* Conseils rapides */}
        <div className="text-xs bg-white p-3 rounded border border-green-200">
          <strong>💡 
            {consultationType === 'consultation_initiale' && 'Pour une évaluation initiale complète, mentionnez :'}
            {consultationType === 'bilan_nutritionnel' && 'Pour un bilan nutritionnel précis, mentionnez :'}
            {consultationType === 'suivi_nutritionnel' && 'Pour un suivi optimal, mentionnez :'}
            {consultationType === 'dietetique_pathologique' && 'Pour une prise en charge pathologique, mentionnez :'}
            {consultationType === 'troubles_alimentaires' && 'Pour l\'approche des TCA, mentionnez :'}
            {!['consultation_initiale', 'bilan_nutritionnel', 'suivi_nutritionnel', 'dietetique_pathologique', 'troubles_alimentaires'].includes(consultationType) && 'Pour une analyse optimale, mentionnez :'}
          </strong>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {consultationType === 'consultation_initiale' && (
              <>
                <div>• Objectifs nutritionnels</div>
                <div>• Antécédents médicaux</div>
                <div>• Habitudes alimentaires</div>
                <div>• Activité physique</div>
              </>
            )}
            {consultationType === 'bilan_nutritionnel' && (
              <>
                <div>• Rappel alimentaire 24h détaillé</div>
                <div>• Quantités et horaires</div>
                <div>• Tests biologiques</div>
                <div>• Comportements alimentaires</div>
              </>
            )}
            {consultationType === 'suivi_nutritionnel' && (
              <>
                <div>• Poids précédent vs actuel</div>
                <div>• Respect du plan nutritionnel</div>
                <div>• Difficultés rencontrées</div>
                <div>• Ressenti du patient</div>
              </>
            )}
            {consultationType === 'dietetique_pathologique' && (
              <>
                <div>• Pathologie et gravité</div>
                <div>• Traitements médicaux</div>
                <div>• Contraintes alimentaires</div>
                <div>• Adaptation nécessaire</div>
              </>
            )}
            {consultationType === 'troubles_alimentaires' && (
              <>
                <div>• Type de TCA et fréquence</div>
                <div>• Émotions déclencheuses</div>
                <div>• Aliments problématiques</div>
                <div>• Relation à la nourriture</div>
              </>
            )}
            {!['consultation_initiale', 'bilan_nutritionnel', 'suivi_nutritionnel', 'dietetique_pathologique', 'troubles_alimentaires'].includes(consultationType) && (
              <>
                <div>• Horaires et types de repas</div>
                <div>• Quantités approximatives</div>
                <div>• Pathologies (diabète, etc.)</div>
                <div>• Hydratation quotidienne</div>
              </>
            )}
          </div>
        </div>

        {/* Bouton principal */}
        <Button
          onClick={processWithLocalAI}
          disabled={isProcessing || !input.trim()}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 animate-pulse" />
              Analyse IA en cours... ({Math.round(progress)}%)
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {consultationType === 'consultation_initiale' && '🆕 ANALYSER PROFIL INITIAL'}
              {consultationType === 'bilan_nutritionnel' && '📋 ANALYSER BILAN COMPLET'}
              {consultationType === 'suivi_nutritionnel' && '📊 ANALYSER LE SUIVI'}
              {consultationType === 'dietetique_pathologique' && '🏥 ANALYSER PATHOLOGIE'}
              {consultationType === 'troubles_alimentaires' && '🧠 ANALYSER COMPORTEMENT TCA'}
              {!['consultation_initiale', 'bilan_nutritionnel', 'suivi_nutritionnel', 'dietetique_pathologique', 'troubles_alimentaires'].includes(consultationType) && '🧠 ANALYSER ET REMPLIR LE FORMULAIRE'}
            </div>
          )}
        </Button>

        {/* Barre de progression */}
        {isProcessing && (
          <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-center text-green-700">
              ⚡ Traitement local ultra-rapide...
            </p>
          </div>
        )}

        {/* Résultat instantané */}
        {result && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-800 text-lg">
                <CheckCircle className="h-5 w-5" />
                ✅ Analyse terminée ! Formulaire rempli automatiquement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Score */}
              <div className="flex items-center justify-between p-3 bg-white rounded border">
                <span className="font-medium">Score nutritionnel :</span>
                <Badge className={`text-lg px-3 py-1 ${
                  result._analysis?.score >= 7 ? 'bg-green-100 text-green-800' :
                  result._analysis?.score >= 4 ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {result._analysis?.score || 'N/A'}/10
                </Badge>
              </div>

              {/* Carences */}
              {result._analysis?.carences?.length > 0 && (
                <div className="p-3 bg-white rounded border">
                  <div className="font-medium text-orange-700 mb-2">⚠️ Carences identifiées :</div>
                  <ul className="text-sm space-y-1">
                    {result._analysis?.carences?.map((carence: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-500">•</span>
                        {carence}
                      </li>
                    )) || []}
                  </ul>
                </div>
              )}

              {/* Alertes */}
              {result._analysis?.alertes?.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-center gap-2 font-medium text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    Alertes médicales :
                  </div>
                  {result._analysis?.alertes?.map((alerte: string, index: number) => (
                    <p key={index} className="text-sm text-red-600 mt-1">{alerte}</p>
                  )) || []}
                </div>
              )}

              <div className="text-center text-sm text-blue-600 bg-white p-2 rounded border">
                👆 <strong>Vérifiez les champs du formulaire ci-dessous</strong> - ils ont été remplis automatiquement !
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
