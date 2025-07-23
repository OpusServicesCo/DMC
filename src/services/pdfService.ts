
import { jsPDF } from 'jspdf';

interface FactureData {
  numero_facture: number;
  date_emission: string;
  montant_total: number;
  patient: {
    nom: string;
    prenom: string;
    adresse?: string;
    telephone?: string;
  };
  consultation: {
    motif: string;
    date: string;
    diagnostic?: string;
  };
  statut: string;
}

export const generateFacturePDF = (facture: FactureData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Bordure principale
  doc.setDrawColor(0, 123, 255);
  doc.setLineWidth(2);
  doc.rect(10, 10, pageWidth - 20, 270);
  
  // En-tête avec bordure
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(15, 15, pageWidth - 30, 50);
  
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 123, 255);
  doc.text('DMC', pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('FACTURE MÉDICALE', pageWidth / 2, 45, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${facture.numero_facture}`, 20, 55);
  doc.text(`Date: ${new Date(facture.date_emission).toLocaleDateString('fr-FR')}`, pageWidth - 80, 55);
  
  // Section patient avec bordure
  doc.rect(15, 75, pageWidth - 30, 45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('INFORMATIONS PATIENT', 20, 85);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Nom: ${facture.patient.nom} ${facture.patient.prenom}`, 20, 95);
  if (facture.patient.adresse) {
    doc.text(`Adresse: ${facture.patient.adresse}`, 20, 105);
  }
  if (facture.patient.telephone) {
    doc.text(`Téléphone: ${facture.patient.telephone}`, 20, 115);
  }
  
  // Section consultation avec bordure
  doc.rect(15, 130, pageWidth - 30, 50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('DÉTAILS CONSULTATION', 20, 140);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Date: ${new Date(facture.consultation.date).toLocaleDateString('fr-FR')}`, 20, 150);
  doc.text(`Motif: ${facture.consultation.motif}`, 20, 160);
  if (facture.consultation.diagnostic) {
    doc.text(`Diagnostic: ${facture.consultation.diagnostic}`, 20, 170);
  }
  
  // Section montant avec bordure
  doc.rect(15, 190, pageWidth - 30, 30);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 123, 255);
  const montantText = `MONTANT TOTAL: ${facture.montant_total.toLocaleString()} FCFA`;
  doc.text(montantText, pageWidth / 2, 210, { align: 'center' });
  
  // Pied de page
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Cabinet Médical DMC', pageWidth / 2, 250, { align: 'center' });
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, pageWidth / 2, 260, { align: 'center' });
  doc.text('© 2025 Kim Javer - Tous droits réservés', pageWidth / 2, 270, { align: 'center' });
  
  doc.save(`Facture-${facture.numero_facture}.pdf`);
};

export const generateReçuPaiement = (paiement: any, facture: FactureData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Bordure principale
  doc.setDrawColor(34, 139, 34);
  doc.setLineWidth(2);
  doc.rect(10, 10, pageWidth - 20, 270);
  
  // En-tête avec bordure
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(15, 15, pageWidth - 30, 60);
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 139, 34);
  doc.text('DMC', pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('REÇU DE PAIEMENT', pageWidth / 2, 45, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const maintenant = new Date();
  doc.text(`Date: ${maintenant.toLocaleDateString('fr-FR')}`, 20, 60);
  doc.text(`Heure: ${maintenant.toLocaleTimeString('fr-FR')}`, pageWidth - 80, 60);
  doc.text(`Mode: ${paiement.mode_paiement}`, 20, 70);
  
  // Section patient avec bordure
  doc.rect(15, 85, pageWidth - 30, 35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PATIENT', 20, 95);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`${facture.patient.nom} ${facture.patient.prenom}`, 20, 105);
  if (facture.patient.telephone) {
    doc.text(`Tél: ${facture.patient.telephone}`, 20, 115);
  }
  
  // Section facture avec bordure
  doc.rect(15, 130, pageWidth - 30, 35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('FACTURE', 20, 140);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`N° ${facture.numero_facture}`, 20, 150);
  doc.text(`Montant total: ${facture.montant_total.toLocaleString()} FCFA`, 20, 160);
  
  // Section paiement avec bordure
  doc.rect(15, 175, pageWidth - 30, 45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(34, 139, 34);
  doc.text(`MONTANT PAYÉ: ${paiement.montant_paye.toLocaleString()} FCFA`, pageWidth / 2, 190, { align: 'center' });
  
  // Afficher le montant restant si applicable
  if (paiement.montant_restant && paiement.montant_restant > 0) {
    doc.setTextColor(255, 140, 0);
    doc.text(`RESTE À PAYER: ${paiement.montant_restant.toLocaleString()} FCFA`, pageWidth / 2, 205, { align: 'center' });
  } else {
    doc.setTextColor(34, 139, 34);
    doc.text('FACTURE ENTIÈREMENT PAYÉE', pageWidth / 2, 205, { align: 'center' });
  }
  
  // Section signature avec bordure
  doc.setTextColor(0, 0, 0);
  doc.rect(15, 230, pageWidth - 30, 35);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('Encaissé par: Kim Javer', 20, 245);
  doc.text('Signature et cachet:', 20, 255);
  doc.rect(120, 240, 60, 20);
  
  // Pied de page
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Cabinet Médical DMC', pageWidth / 2, 275, { align: 'center' });
  doc.text('© 2025 Kim Javer - Tous droits réservés', pageWidth / 2, 285, { align: 'center' });
  
  doc.save(`Recu-Paiement-${facture.numero_facture}-${new Date().getTime()}.pdf`);
};
