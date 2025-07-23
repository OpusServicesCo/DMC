import { memo } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { HelpAssistant } from "@/components/ui/help-assistant";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = memo(function AppLayout({ children }: AppLayoutProps) {
  return (
    <AuthGuard>
      {children}
      <HelpAssistant />
    </AuthGuard>
  );
});

export { AppLayout };
