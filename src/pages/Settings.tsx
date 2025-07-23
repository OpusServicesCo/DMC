
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useToast } from '@/hooks/use-toast';
import {
  Settings as SettingsIcon,
  Globe,
  Palette,
  Volume2,
  Download,
  Upload,
  RotateCcw,
  Bell,
  Type,
  Monitor,
  Zap,
  Save,
  TestTube,
  Shield,
  Database,
  Key,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  HardDrive,
  Wifi,
  Activity,
} from 'lucide-react';

export default function Settings() {
  const { settings, isLoading, updateSetting, resetSettings, exportSettings, importSettings } = useAppSettings();
  const { toast } = useToast();
  const [importFile, setImportFile] = useState<File | null>(null);
  const [userProfile, setUserProfile] = useState({
    nom: localStorage.getItem('user-nom') || '',
    prenom: localStorage.getItem('user-prenom') || '',
    email: localStorage.getItem('user-email') || '',
    telephone: localStorage.getItem('user-telephone') || '',
    specialite: localStorage.getItem('user-specialite') || 'Nutritionniste',
    cabinet: localStorage.getItem('user-cabinet') || 'Cabinet Nutrition',
  });
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: localStorage.getItem('auto-backup') === 'true',
    backupFrequency: localStorage.getItem('backup-frequency') || 'daily',
    cloudSync: localStorage.getItem('cloud-sync') === 'true',
  });

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      importSettings(file);
    }
  };

  const saveUserProfile = () => {
    Object.entries(userProfile).forEach(([key, value]) => {
      localStorage.setItem(`user-${key}`, value);
    });
    toast({
      title: "Profil sauvegardé",
      description: "Vos informations personnelles ont été mises à jour",
    });
  };

  const saveBackupSettings = () => {
    localStorage.setItem('auto-backup', backupSettings.autoBackup.toString());
    localStorage.setItem('backup-frequency', backupSettings.backupFrequency);
    localStorage.setItem('cloud-sync', backupSettings.cloudSync.toString());
    toast({
      title: "Paramètres de sauvegarde mis à jour",
      description: "Vos préférences de sauvegarde ont été appliquées",
    });
  };

  const clearAllData = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les données ? Cette action est irréversible.')) {
      localStorage.clear();
      sessionStorage.clear();
      toast({
        title: "Données effacées",
        description: "Toutes les données locales ont été supprimées",
        variant: "destructive",
      });
    }
  };

  const testSpeech = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Test de synthèse vocale avec les paramètres actuels');
      utterance.rate = settings.speechRate;
      utterance.pitch = settings.speechPitch;
      utterance.volume = settings.speechVolume;
      utterance.lang = settings.language === 'fr' ? 'fr-FR' : settings.language === 'en' ? 'en-US' : settings.language;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Non supporté",
        description: "La synthèse vocale n'est pas supportée par ce navigateur",
        variant: "destructive",
      });
    }
  };

  const getStorageInfo = () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        const used = estimate.usage ? (estimate.usage / 1024 / 1024).toFixed(2) : '0';
        const quota = estimate.quota ? (estimate.quota / 1024 / 1024).toFixed(2) : 'Illimité';
        toast({
          title: "Stockage utilisé",
          description: `${used} MB utilisés sur ${quota} MB disponibles`,
        });
      });
    }
  };

  const languageOptions = [
    { value: 'fr', label: '🇫🇷 Français' },
    { value: 'en', label: '🇺🇸 English' },
    { value: 'es', label: '🇪🇸 Español' },
    { value: 'ar', label: '🇸🇦 العربية' },
  ];

  const themeOptions = [
    { value: 'light', label: '☀️ Clair' },
    { value: 'dark', label: '🌙 Sombre' },
    { value: 'system', label: '💻 Système' },
  ];

  const fontSizeOptions = [
    { value: 'small', label: 'Petite (12px)' },
    { value: 'medium', label: 'Moyenne (14px)' },
    { value: 'large', label: 'Grande (16px)' },
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        {/* En-tête amélioré */}
        <div className="flex items-center justify-between bg-gradient-to-r from-medical-50 to-blue-50 p-6 rounded-lg border border-medical-200">
          <div>
            <h1 className="text-3xl font-bold text-medical-800 flex items-center gap-3">
              <SettingsIcon className="h-8 w-8 text-medical-600" />
              Paramètres de l'Application
            </h1>
            <p className="text-medical-600 mt-2 text-lg">
              Personnalisez votre expérience utilisateur
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={exportSettings} variant="outline" className="border-medical-200 hover:bg-medical-50">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button onClick={resetSettings} variant="outline" className="border-red-200 hover:bg-red-50 hover:text-red-700">
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Apparence améliorée */}
          <Card className="shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Palette className="h-6 w-6" />
                Interface & Apparence
              </CardTitle>
              <CardDescription>
                Personnalisez l'apparence de votre interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-3">
                <Label htmlFor="theme" className="text-sm font-semibold">Thème de l'interface</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => {
                    updateSetting('theme', value as any);
                    // Force immediate theme application
                    setTimeout(() => window.location.reload(), 100);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="fontSize" className="text-sm font-semibold">Taille de police</Label>
                <Select
                  value={settings.fontSize}
                  onValueChange={(value) => updateSetting('fontSize', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontSizeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="compactMode" className="text-sm font-semibold">Mode compact</Label>
                  <p className="text-xs text-gray-600">Interface plus dense et compacte</p>
                </div>
                <Switch
                  id="compactMode"
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Langue et région améliorées */}
          <Card className="shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Globe className="h-6 w-6" />
                Langue & Localisation
              </CardTitle>
              <CardDescription>
                Configurez votre langue préférée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-3">
                <Label htmlFor="language" className="text-sm font-semibold">Langue de l'interface</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => {
                    updateSetting('language', value as any);
                    toast({
                      title: "Langue modifiée",
                      description: `Interface changée en ${languageOptions.find(opt => opt.value === value)?.label}`,
                    });
                    // Force page reload to apply language changes
                    setTimeout(() => window.location.reload(), 500);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Note :</strong> Le changement de langue affectera l'ensemble de l'interface utilisateur et sera appliqué immédiatement.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Synthèse vocale améliorée */}
          <Card className="shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Volume2 className="h-6 w-6" />
                Synthèse Vocale IA
              </CardTitle>
              <CardDescription>
                Ajustez les paramètres de la voix artificielle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">Vitesse de parole</Label>
                  <span className="text-sm bg-green-100 px-2 py-1 rounded">{settings.speechRate.toFixed(2)}x</span>
                </div>
                <Slider
                  value={[settings.speechRate]}
                  onValueChange={([value]) => updateSetting('speechRate', value)}
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">Hauteur de voix</Label>
                  <span className="text-sm bg-green-100 px-2 py-1 rounded">{settings.speechPitch.toFixed(2)}</span>
                </div>
                <Slider
                  value={[settings.speechPitch]}
                  onValueChange={([value]) => updateSetting('speechPitch', value)}
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">Volume</Label>
                  <span className="text-sm bg-green-100 px-2 py-1 rounded">{Math.round(settings.speechVolume * 100)}%</span>
                </div>
                <Slider
                  value={[settings.speechVolume]}
                  onValueChange={([value]) => updateSetting('speechVolume', value)}
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <Button onClick={testSpeech} className="w-full bg-green-600 hover:bg-green-700">
                <TestTube className="h-4 w-4 mr-2" />
                Tester la voix
              </Button>
            </CardContent>
          </Card>


        </div>

        {/* Sauvegarde et sécurité */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-purple-200 shadow-lg dark:border-gray-600 dark:bg-gray-800">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-gray-700 dark:to-gray-600">
              <CardTitle className="flex items-center gap-3 text-purple-700 dark:text-gray-200">
                <Database className="h-6 w-6" />
                Sauvegarde Automatique
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Configurez la sauvegarde de vos données
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6 dark:bg-gray-800">
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-gray-700 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="autoBackup" className="text-sm font-semibold dark:text-gray-200">Sauvegarde automatique</Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Sauvegarder automatiquement les données</p>
                </div>
                <Switch
                  id="autoBackup"
                  checked={backupSettings.autoBackup}
                  onCheckedChange={(checked) => setBackupSettings(prev => ({ ...prev, autoBackup: checked }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="dark:text-gray-200">Fréquence de sauvegarde</Label>
                <Select
                  value={backupSettings.backupFrequency}
                  onValueChange={(value) => setBackupSettings(prev => ({ ...prev, backupFrequency: value }))}
                >
                  <SelectTrigger className="border-purple-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                    <SelectItem value="hourly" className="dark:text-gray-200 dark:hover:bg-gray-600">Toutes les heures</SelectItem>
                    <SelectItem value="daily" className="dark:text-gray-200 dark:hover:bg-gray-600">Quotidienne</SelectItem>
                    <SelectItem value="weekly" className="dark:text-gray-200 dark:hover:bg-gray-600">Hebdomadaire</SelectItem>
                    <SelectItem value="monthly" className="dark:text-gray-200 dark:hover:bg-gray-600">Mensuelle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-gray-700 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="cloudSync" className="text-sm font-semibold dark:text-gray-200">Synchronisation cloud</Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Synchroniser avec le cloud</p>
                </div>
                <Switch
                  id="cloudSync"
                  checked={backupSettings.cloudSync}
                  onCheckedChange={(checked) => setBackupSettings(prev => ({ ...prev, cloudSync: checked }))}
                />
              </div>
              
              <Button onClick={saveBackupSettings} className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800">
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder les paramètres
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200 shadow-lg dark:border-gray-600 dark:bg-gray-800">
            <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-gray-700 dark:to-gray-600">
              <CardTitle className="flex items-center gap-3 text-red-700 dark:text-gray-200">
                <Shield className="h-6 w-6" />
                Sécurité & Données
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Gérez la sécurité et l'effacement des données
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6 dark:bg-gray-800">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="font-medium text-red-800 dark:text-red-400 mb-2">Zone de danger</h4>
                <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                  Ces actions sont irréversibles et affecteront toutes vos données.
                </p>
                <Button
                  onClick={clearAllData}
                  variant="destructive"
                  className="w-full"
                >
                  <HardDrive className="h-4 w-4 mr-2" />
                  Effacer toutes les données
                </Button>
              </div>
              
              <div className="space-y-3">
                <Button onClick={getStorageInfo} variant="outline" className="w-full dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                  <Activity className="h-4 w-4 mr-2" />
                  Vérifier l'espace de stockage
                </Button>
                
                <Button onClick={exportSettings} variant="outline" className="w-full dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter les paramètres
                </Button>
                
                <div className="space-y-2">
                  <Label htmlFor="importFile" className="text-sm font-semibold dark:text-gray-200">Importer des paramètres</Label>
                  <Input
                    id="importFile"
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="border-red-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informations système */}
        <Card className="border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
          <CardHeader className="dark:bg-gray-800">
            <CardTitle className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
              <Monitor className="h-6 w-6" />
              Informations Système
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 dark:bg-gray-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-medical-600 dark:text-medical-400">2.1.0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Version</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">En ligne</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Statut</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Object.keys(localStorage).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Données stockées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {new Date().toLocaleDateString('fr-FR')}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Dernière connexion</div>
              </div>
            </div>
            
            <div className="border-t dark:border-gray-600 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-200">
                    <Wifi className="h-3 w-3 mr-1" />
                    Connexion stable
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-200">
                    <Shield className="h-3 w-3 mr-1" />
                    Données sécurisées
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-200">
                    <Activity className="h-3 w-3 mr-1" />
                    Performances optimales
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-600 pt-4">
              Cabinet Nutrition - Gestion IA intégrée © 2024
              <br />
              Dernière sauvegarde : {new Date().toLocaleString('fr-FR')}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
