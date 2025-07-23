
import { Plus, ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface NotificationHeaderProps {
  onNewNotification: () => void;
}

export function NotificationHeader({ onNewNotification }: NotificationHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold text-medical-700 flex items-center">
          <Bell className="mr-2 h-6 w-6 text-medical-600" />
          Notifications
        </h1>
      </div>
      <Button className="bg-medical-600 hover:bg-medical-700" onClick={onNewNotification}>
        <Plus className="mr-2" />
        Nouvelle notification
      </Button>
    </div>
  );
}
