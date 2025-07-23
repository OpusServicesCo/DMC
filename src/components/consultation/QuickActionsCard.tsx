
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Calendar, FileText, CreditCard, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickActionsCard() {
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: User,
      title: 'Nouveau patient',
      description: 'Ajouter un patient',
      action: () => navigate('/patients?action=new'),
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      icon: Calendar,
      title: 'Rendez-vous',
      description: 'Planifier un RDV',
      action: () => navigate('/rendez-vous?action=new'),
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      icon: Brain,
      title: 'Consultation IA',
      description: 'Consultation avec IA',
      action: () => navigate('/consultation-nutritionnelle'),
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    {
      icon: FileText,
      title: 'Nouvelle facture',
      description: 'Créer une facture',
      action: () => navigate('/factures?action=new'),
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className={`h-auto p-4 flex flex-col items-center gap-2 ${action.color}`}
                onClick={action.action}
              >
                <Icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-gray-500">{action.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
