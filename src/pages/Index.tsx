
import { MainLayout } from "@/components/layout/MainLayout";
import { RoleDashboard } from "@/components/dashboard/RoleDashboard";
import { useUserRole } from "@/hooks/useUserRole";
import { HelpAssistant } from "@/components/ui/help-assistant";

export default function Index() {
  const { userRole, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de votre tableau de bord...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <RoleDashboard userRole={userRole} />
      </div>
      <HelpAssistant />
    </MainLayout>
  );
}
