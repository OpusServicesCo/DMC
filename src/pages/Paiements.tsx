
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { PaiementForm } from "@/components/paiements/PaiementForm";
import { PaiementTable } from "@/components/paiements/PaiementTable";
import { PaiementHeader } from "@/components/paiements/PaiementHeader";
import { FactureDetails } from "@/components/paiements/FactureDetails";
import { usePaiements, useSelectedFacture } from "@/hooks/usePaiements";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CreditCard, CheckCircle, Clock, AlertCircle, Calendar, Users } from "lucide-react";

export default function Paiements() {
  const [searchParams] = useSearchParams();
  const factureId = searchParams.get("facture_id");
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupération des données
  const { 
    paiements, 
    factures, 
    facturesImpayees, 
    consultationsEnAttente,
    refetch, 
    refetchFactures 
  } = usePaiements((error) => {
    toast({
      title: error.title,
      description: error.description,
      variant: "destructive",
    });
  });
  
  const { selectedFacture } = useSelectedFacture(factureId, (error) => {
    toast({
      title: error.title,
      description: error.description,
      variant: "destructive",
    });
  });

  // Récupérer les notifications de paiement en attente
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'paiement_en_attente')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setNotifications(data);
      }
    };

    fetchNotifications();

    // Écouter les nouvelles notifications en temps réel
    const channel = supabase
      .channel('notifications-paiements')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: 'type=eq.paiement_en_attente'
      }, (payload) => {
        console.log('Nouvelle notification:', payload);
        setNotifications(prev => [payload.new, ...prev]);
        
        // Toast de notification
        toast({
          title: "🔔 Nouveau paiement à traiter",
          description: "Une consultation vient d'être clôturée",
          duration: 5000,
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handlePaiementSuccess = async () => {
    toast({
      title: "✅ Paiement enregistré",
      description: "Le paiement a été enregistré avec succès",
    });
    
    // Rafraîchir toutes les données pertinentes
    await Promise.all([
      refetch(),
      refetchFactures(),
      queryClient.invalidateQueries({ queryKey: ["factures"] }),
      queryClient.invalidateQueries({ queryKey: ["consultations"] }),
      queryClient.invalidateQueries({ queryKey: ["consultations-en-attente"] }),
      queryClient.invalidateQueries({ queryKey: ["operations-caisse"] })
    ]);
  };

  const handleNotificationClick = async (notification: any) => {
    // Marquer la notification comme lue (la supprimer)
    await supabase
      .from('notifications')
      .delete()
      .eq('id', notification.id);
    
    // Rafraîchir les notifications
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
    
    toast({
      title: "✅ Notification traitée",
      description: "Vous pouvez maintenant traiter le paiement",
    });
  };

  const totalConsultationsEnAttente = consultationsEnAttente?.length || 0;

  return (
    <MainLayout>
      <div className="container mx-auto py-8 space-y-6">
        <PaiementHeader onNewPaiement={() => setOpen(true)} />

        {/* Section consultations en attente de paiement */}
        {totalConsultationsEnAttente > 0 && (
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-orange-800">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-xl">🕒 Consultations à payer ({totalConsultationsEnAttente})</div>
                  <div className="text-sm font-normal text-orange-600">Consultations terminées en attente de facturation</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {consultationsEnAttente?.slice(0, 5).map((consultation: any) => (
                  <Card 
                    key={consultation.id}
                    className="border border-orange-200 hover:shadow-md transition-all cursor-pointer bg-white"
                    onClick={() => setOpen(true)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <Users className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {consultation.patients.nom} {consultation.patients.prenom}
                            </p>
                            <p className="text-sm text-gray-600">{consultation.motif}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(consultation.date).toLocaleDateString('fr-FR')} • {consultation.montant.toLocaleString()} FCFA
                            </p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                        >
                          Payer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-700">
                    {paiements.length}
                  </p>
                  <p className="text-sm text-green-600">Paiements effectués</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-orange-700">
                    {totalConsultationsEnAttente}
                  </p>
                  <p className="text-sm text-orange-600">À payer</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-700">
                    {facturesImpayees.length}
                  </p>
                  <p className="text-sm text-red-600">Factures impayées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-700">
                    {paiements.reduce((sum, p) => sum + (p.montant_paye || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-600">Total encaissé (FCFA)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedFacture && (
          <FactureDetails 
            selectedFacture={selectedFacture} 
            paiements={paiements} 
          />
        )}

        <PaiementTable paiements={paiements} />

        <PaiementForm
          open={open}
          onClose={() => setOpen(false)}
          factureId={factureId}
          factures={facturesImpayees}
          paiements={paiements}
          selectedFacture={selectedFacture}
          consultationsEnAttente={consultationsEnAttente}
          onPaiementSuccess={handlePaiementSuccess}
        />
      </div>
    </MainLayout>
  );
}
