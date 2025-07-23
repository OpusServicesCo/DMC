
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { Suspense, lazy, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { SkipLink } from "@/components/ui/accessibility-helpers";

// Lazy loading des pages pour améliorer les performances
const Auth = lazy(() => import("@/pages/Auth"));
const Index = lazy(() => import("@/pages/Index"));
const RendezVous = lazy(() => import("@/pages/RendezVous"));
const Consultations = lazy(() => import("@/pages/Consultations"));
const Factures = lazy(() => import("@/pages/Factures"));
const Paiements = lazy(() => import("@/pages/Paiements"));
const Patients = lazy(() => import("@/pages/Patients"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Caisse = lazy(() => import("@/pages/Caisse"));
const ConsultationSpecialiseePage = lazy(() => import("@/pages/ConsultationSpecialisee"));
const ConsultationNutritionnellePage = lazy(() => import("@/pages/ConsultationNutritionnellePage"));
const Settings = lazy(() => import("@/pages/Settings"));
const PatientDetails = lazy(() => import("@/pages/PatientDetails"));

import "./App.css";

// Configuration ultra-optimisée du QueryClient pour des performances maximales
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: 'always',
      retry: (failureCount, error) => {
        // Ne pas retry pour les erreurs d'authentification
        if (error?.message?.includes('JWT')) return false;
        if (error?.message?.includes('4')) return false; // Erreurs 4xx
        return failureCount < 2;
      },
      staleTime: 10 * 60 * 1000, // 10 minutes - données considérées comme fraîches plus longtemps
      gcTime: 30 * 60 * 1000, // 30 minutes - garde en cache plus longtemps
      networkMode: 'online',
      // Optimisation: requêtes en background moins fréquentes
      refetchInterval: false,
      // Optimisation: utiliser le cache plus agressivement
      structuralSharing: true,
    },
    mutations: {
      retry: 1,
      // Optimisation: ne pas refetch automatiquement après mutation
      onSettled: () => {
        // Custom logic pour invalidation sélective si nécessaire
      },
    },
  },
});

function App() {
  // Composant de fallback pour le loading avec accessibilité
  const PageFallback = () => (
    <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Chargement de la page">
      <LoadingSpinner size="lg" />
      <span className="sr-only">Chargement en cours...</span>
    </div>
  );

  // Initialisation du monitoring réseau
  useNetworkStatus();

  // Router avec protection d'authentification renforcée et lazy loading
  const router = createBrowserRouter([
    {
      path: "/auth",
      element: (
        <Suspense fallback={<PageFallback />}>
          <Auth />
        </Suspense>
      ),
    },
    {
      path: "/",
      element: (
        <AppLayout>
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}>
              <Index />
            </Suspense>
          </ProtectedRoute>
        </AppLayout>
      ),
    },
    {
      path: "/consultation-specialisee",
      element: (
        <AppLayout>
          <ProtectedRoute requiredRole={['medecin']}>
            <Suspense fallback={<PageFallback />}>
              <ConsultationSpecialiseePage />
            </Suspense>
          </ProtectedRoute>
        </AppLayout>
      ),
    },
    {
      path: "/consultation-nutritionnelle",
      element: (
        <AppLayout>
          <ProtectedRoute requiredRole={['medecin']}>
            <Suspense fallback={<PageFallback />}>
              <ConsultationNutritionnellePage />
            </Suspense>
          </ProtectedRoute>
        </AppLayout>
      ),
    },
    {
      path: "/rendez-vous",
      element: (
        <AppLayout>
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}>
              <RendezVous />
            </Suspense>
          </ProtectedRoute>
        </AppLayout>
      ),
    },
    {
      path: "/consultations",
      element: (
        <AppLayout>
          <ProtectedRoute requiredRole={['medecin']}>
            <Suspense fallback={<PageFallback />}>
              <Consultations />
            </Suspense>
          </ProtectedRoute>
        </AppLayout>
      ),
    },
    {
      path: "/patients",
      element: (
        <AppLayout>
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}>
              <Patients />
            </Suspense>
          </ProtectedRoute>
        </AppLayout>
      ),
    },
    {
      path: "/patients/:patientId",
      element: (
        <AppLayout>
          <ProtectedRoute requiredRole={['medecin']}>
            <Suspense fallback={<PageFallback />}>
              <PatientDetails />
            </Suspense>
          </ProtectedRoute>
        </AppLayout>
      ),
    },
    {
      path: "/factures",
      element: (
        <AppLayout>
          <ProtectedRoute requiredRole={['secretaire']}>
            <Suspense fallback={<PageFallback />}>
              <Factures />
            </Suspense>
          </ProtectedRoute>
        </AppLayout>
      ),
    },
    {
      path: "/paiements",
      element: (
        <AppLayout>
          <ProtectedRoute requiredRole={['secretaire']}>
            <Suspense fallback={<PageFallback />}>
              <Paiements />
            </Suspense>
          </ProtectedRoute>
        </AppLayout>
      ),
    },
    {
      path: "/notifications",
      element: (
        <AppLayout>
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}>
              <Notifications />
            </Suspense>
          </ProtectedRoute>
        </AppLayout>
      ),
    },
    {
      path: "/caisse",
      element: (
        <AppLayout>
          <ProtectedRoute requiredRole={['secretaire']}>
            <Suspense fallback={<PageFallback />}>
              <Caisse />
            </Suspense>
          </ProtectedRoute>
        </AppLayout>
      ),
    },
    {
      path: "/settings",
      element: (
        <AppLayout>
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}>
              <Settings />
            </Suspense>
          </ProtectedRoute>
        </AppLayout>
      ),
    },
  ]);

  return (
    <ErrorBoundary level="critical">
      <SkipLink href="#main-content">Aller au contenu principal</SkipLink>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <div id="main-content">
            <RouterProvider router={router} />
          </div>
          <Toaster />
        </NotificationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
