import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RendezVousForm } from "./RendezVousForm";
import { supabase } from "@/integrations/supabase/client";

interface RendezVousHeaderProps {
  onSuccess: () => void;
}

export const RendezVousHeader = ({ onSuccess }: RendezVousHeaderProps) => {
  const [open, setOpen] = useState(false);

  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("nom");
      
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-medical-700">Rendez-vous</h1>
      <Button 
        onClick={() => setOpen(true)}
        className="bg-medical-600 hover:bg-medical-700 text-white"
      >
        Nouveau rendez-vous
      </Button>
      <RendezVousForm 
        patients={patients || []} 
        open={open} 
        onOpenChange={setOpen} 
        onSuccess={onSuccess} 
      />
    </div>
  );
};