
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface AppSettings {
  language: 'fr' | 'en' | 'es' | 'ar';
  theme: 'light' | 'dark' | 'system';
  speechRate: number;
  speechPitch: number;
  speechVolume: number;
  autoSave: boolean;
  notifications: boolean;
  soundEffects: boolean;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
}

const defaultSettings: AppSettings = {
  language: 'fr',
  theme: 'light',
  speechRate: 0.85,
  speechPitch: 1.1,
  speechVolume: 0.9,
  autoSave: true,
  notifications: true,
  soundEffects: true,
  fontSize: 'medium',
  compactMode: false,
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  // Appliquer les paramètres au DOM
  useEffect(() => {
    applySettings();
  }, [settings]);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('app-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applySettings = () => {
    const root = document.documentElement;
    
    // Appliquer le thème IMMÉDIATEMENT
    root.classList.remove('dark'); // Reset first
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    } else {
      // System theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    }

    // Appliquer la taille de police
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    switch (settings.fontSize) {
      case 'small':
        root.classList.add('text-sm');
        break;
      case 'large':
        root.classList.add('text-lg');
        break;
      default:
        root.classList.add('text-base');
    }

    // Appliquer la langue - forcer un refresh de la page
    const currentLang = root.getAttribute('lang');
    if (currentLang !== settings.language) {
      root.setAttribute('lang', settings.language);
      // Mettre à jour le document title selon la langue
      switch (settings.language) {
        case 'fr':
          document.title = 'Cabinet Nutrition - Gestion IA';
          break;
        case 'en':
          document.title = 'Nutrition Cabinet - AI Management';
          break;
        case 'es':
          document.title = 'Gabinete Nutrición - Gestión IA';
          break;
        case 'ar':
          document.title = 'عيادة التغذية - إدارة الذكاء الاصطناعي';
          break;
      }
    }
  };

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const saveSettings = (settingsToSave: AppSettings) => {
    try {
      localStorage.setItem('app-settings', JSON.stringify(settingsToSave));
      toast({
        title: "Paramètres sauvegardés",
        description: "Vos préférences ont été appliquées",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive",
      });
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
    toast({
      title: "Paramètres réinitialisés",
      description: "Les paramètres par défaut ont été restaurés",
    });
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cabinet-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        const validatedSettings = { ...defaultSettings, ...imported };
        setSettings(validatedSettings);
        saveSettings(validatedSettings);
        toast({
          title: "Paramètres importés",
          description: "Vos paramètres ont été restaurés avec succès",
        });
      } catch (error) {
        toast({
          title: "Erreur d'importation",
          description: "Le fichier de paramètres n'est pas valide",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return {
    settings,
    isLoading,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings,
  };
};
