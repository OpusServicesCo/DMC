import { pdf } from "@react-pdf/renderer";
import { FacturePDF } from "@/components/factures/FacturePDF";
import React from 'react';

export const generateFacturePDF = async (facture: any) => {
  try {
    const blob = await pdf(React.createElement(FacturePDF, { facture })).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `facture-${facture.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    throw error;
  }
};