import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  DocumentProps,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 12,
    lineHeight: 1.5,
    color: "#2D3748",
  },
  header: {
    borderBottom: 1,
    paddingBottom: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    color: "#2B6CB0",
    fontWeight: "bold",
  },
  invoiceNumber: {
    fontSize: 14,
    marginTop: 4,
  },
  date: {
    fontSize: 11,
    color: "#718096",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2B6CB0",
    backgroundColor: "#EBF8FF",
    padding: 5,
    borderRadius: 4,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    width: 100,
    fontWeight: "bold",
    color: "#4A5568",
  },
  value: {
    flex: 1,
  },
  total: {
    marginTop: 30,
    paddingTop: 10,
    borderTop: 1,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#2B6CB0",
    marginRight: 10,
  },
  totalValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#2B6CB0",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 10,
    color: "#A0AEC0",
    borderTop: 1,
    paddingTop: 8,
  },
});

interface FacturePDFProps extends DocumentProps {
  facture: {
    id: string;
    numero_facture: number;
    date_emission: string;
    montant_total: number;
    consultations: {
      motif: string;
      date: string;
      diagnostic?: string;
      observations?: string;
      patients: {
        nom: string;
        prenom: string;
        adresse?: string;
        telephone?: string;
      };
    };
  };
}

export const FacturePDF = ({ facture, ...props }: FacturePDFProps) => (
  <Document {...props}>
    <Page size="A4" style={styles.page}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>Cabinet Médical</Text>
        <Text style={styles.invoiceNumber}>Facture N° {facture.numero_facture}</Text>
        <Text style={styles.date}>
          Émise le : {format(new Date(facture.date_emission), "PPPp", { locale: fr })}
        </Text>
      </View>

      {/* Infos Patient */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations du Patient</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nom :</Text>
          <Text style={styles.value}>
            {facture.consultations.patients.nom} {facture.consultations.patients.prenom}
          </Text>
        </View>
        {facture.consultations.patients.adresse && (
          <View style={styles.row}>
            <Text style={styles.label}>Adresse :</Text>
            <Text style={styles.value}>{facture.consultations.patients.adresse}</Text>
          </View>
        )}
        {facture.consultations.patients.telephone && (
          <View style={styles.row}>
            <Text style={styles.label}>Téléphone :</Text>
            <Text style={styles.value}>{facture.consultations.patients.telephone}</Text>
          </View>
        )}
      </View>

      {/* Détails consultation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Détails de la Consultation</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Date :</Text>
          <Text style={styles.value}>
            {format(new Date(facture.consultations.date), "PPPp", { locale: fr })}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Motif :</Text>
          <Text style={styles.value}>{facture.consultations.motif}</Text>
        </View>
        {facture.consultations.diagnostic && (
          <View style={styles.row}>
            <Text style={styles.label}>Diagnostic :</Text>
            <Text style={styles.value}>{facture.consultations.diagnostic}</Text>
          </View>
        )}
      </View>

      {/* Montant total */}
      <View style={styles.total}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Montant total :</Text>
          <Text style={styles.totalValue}>{facture.montant_total.toLocaleString()} FCFA</Text>
        </View>
      </View>

      {/* Pied de page */}
      <Text style={styles.footer}>
        DMC - Téléphone : +242 06 512 3630 - Email : depaget@gmail.com
      </Text>
    </Page>
  </Document>
);
