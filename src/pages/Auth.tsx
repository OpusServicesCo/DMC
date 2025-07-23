
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactDOM from "react-dom/client";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, LogIn, Mail, Lock, ChevronLeft, Loader2, User, UserCog } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"medecin" | "secretaire">("secretaire");
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/", { replace: true });
      }
    };
    
    checkSession();
  }, [navigate]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Oups 😞 Erreur de saisie",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Oups 😞 Format d'email invalide",
        description: "Veuillez entrer une adresse email valide",
        variant: "destructive",
      });
      return;
    }

    if (!validatePassword(password)) {
      toast({
        title: "Oups 😞 Mot de passe trop court ",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        console.log('Signing up with role:', role);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: role
            },
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) {
          console.error("Erreur d'inscription 😞:", error);
          let errorMessage = "Une erreur est survenue lors de l'inscription";
          
          if (error.message.includes("already registered") || error.message.includes("User already registered")) {
            errorMessage = "Cette adresse email est déjà utilisée";
          } else if (error.message.includes("password")) {
            errorMessage = "Le mot de passe ne respecte pas les critères de sécurité";
          } else if (error.message.includes("email")) {
            errorMessage = "L'adresse email n'est pas valide";
          } else if (error.message.includes("signup_disabled")) {
            errorMessage = "Les inscriptions sont temporairement désactivées";
          }

          throw new Error(errorMessage);
        }

        // Vérifier si l'utilisateur a été créé
        if (data.user) {
          toast({
            title: "Inscription réussie 😊!",
            description: "Vous pouvez maintenant vous connecter.",
          });
          
          // Basculer vers la connexion après inscription
          setIsSignUp(false);
          setEmail("");
          setPassword("");
        } else {
          throw new Error("Erreur lors de la création du compte");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error("Erreur de connexion:", error);
          let errorMessage = "Échec de la connexion";
          
          if (error.message.includes("Invalid login") || error.message.includes("Invalid credentials")) {
            errorMessage = "Email ou mot de passe incorrect 😞";
          } else if (error.message.includes("Email not confirmed")) {
            errorMessage = "Veuillez confirmer votre email avant de vous connecter";
          } else if (error.message.includes("Too many requests")) {
            errorMessage = "Trop de tentatives. Attendez quelques minutes";
          } else if (error.message.includes("captcha")) {
            errorMessage = "Erreur technique temporaire, merci de réessayer";
          }

          throw new Error(errorMessage);
        }

        if (data.user) {
          toast({
            title: "Connexion réussie",
            description: "Bienvenue 😉!",
          });
          navigate("/", { replace: true });
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 animate-in fade-in duration-700">
      {/* Éléments de fond décoratifs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <Card className="w-full max-w-md p-8 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 relative z-10 animate-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          {/* Logo ou icône */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg animate-in zoom-in duration-500 delay-200">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded"></div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2 animate-in slide-in-from-top-2 duration-500 delay-300">
            {isSignUp ? "Créer un compte" : "Bienvenue"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 animate-in slide-in-from-top-2 duration-500 delay-400">
            {isSignUp
              ? "Rejoignez-nous pour gérer vos patients"
              : "Connectez-vous à votre espace médical"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 delay-500">
          {isSignUp && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <Tabs defaultValue="secretaire" onValueChange={(value) => setRole(value as "medecin" | "secretaire")} className="w-full mb-4">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <TabsTrigger value="secretaire" className="flex items-center gap-2 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <User className="h-4 w-4" />
                    Secrétaire
                  </TabsTrigger>
                  <TabsTrigger value="medecin" className="flex items-center gap-2 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <UserCog className="h-4 w-4" />
                    Médecin
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 transition-colors duration-200 group-focus-within:text-blue-500" />
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 backdrop-blur-sm transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-800/80"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 transition-colors duration-200 group-focus-within:text-blue-500" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 backdrop-blur-sm transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-800/80"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center justify-center gap-2 h-12 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl font-medium"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isSignUp ? (
              <UserPlus className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            ) : (
              <LogIn className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            )}
            {loading
              ? "Chargement..."
              : isSignUp
              ? "S'inscrire"
              : "Se connecter"}
          </Button>
        </form>

        <div className="mt-6 text-center animate-in slide-in-from-bottom-2 duration-500 delay-700">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:underline transition-all duration-200 flex items-center justify-center gap-2 mx-auto group"
          >
            <ChevronLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            {isSignUp
              ? "Déjà un compte ? Connectez-vous"
              : "Pas de compte ? Inscrivez-vous"}
          </button>
        </div>
      </Card>
    </div>
  );
}
