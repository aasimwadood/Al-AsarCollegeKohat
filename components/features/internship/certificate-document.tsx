import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

// A single portrait A4 certificate — deliberately simple/formal, matching
// the fee voucher's "computer-generated document" framing rather than an
// ornate template, since the official college format hasn't been supplied.

const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica", color: "#111827" },
  border: { borderWidth: 2, borderColor: "#111827", padding: 32, height: "100%" },
  logoRow: { alignItems: "center", marginBottom: 4 },
  logo: { width: 52, height: 52, marginBottom: 6 },
  collegeName: { fontSize: 16, fontWeight: 700, textAlign: "center" },
  title: { fontSize: 20, fontWeight: 700, textAlign: "center", textDecoration: "underline", marginTop: 22, marginBottom: 26 },
  bodyText: { fontSize: 11.5, lineHeight: 1.9, textAlign: "center", marginHorizontal: 20 },
  studentName: { fontWeight: 700 },
  detailsGrid: { flexDirection: "row", justifyContent: "space-between", marginTop: 30, marginBottom: 30, paddingHorizontal: 20 },
  detailsCol: { flexDirection: "column" },
  detailLabel: { fontSize: 8, color: "#6b7280" },
  detailValue: { fontSize: 10, fontWeight: 500, marginBottom: 8 },
  footerRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 60, paddingHorizontal: 20 },
  signatureBlock: { alignItems: "center", width: 160 },
  signatureLine: { borderTop: "1pt solid #111827", width: "100%", marginBottom: 4 },
  signatureLabel: { fontSize: 8.5, color: "#374151" },
  certNumber: { position: "absolute", bottom: 20, right: 40, fontSize: 8, color: "#6b7280" },
  generatedNote: { position: "absolute", bottom: 20, left: 40, fontSize: 7, color: "#9ca3af" },
});

export type CertificatePdfData = {
  collegeName: string;
  logoDataUri: string | null;
  certificateNumber: string;
  studentName: string;
  registrationNumber: string | null;
  programName: string;
  departmentName: string;
  companyName: string;
  durationWeeks: number;
  startDate: string;
  endDate: string;
  generatedAt: string;
  supervisorName: string | null;
};

export function CertificateDocument({ data }: { data: CertificatePdfData }) {
  return (
    <Document title={`Internship Completion Certificate ${data.certificateNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.border}>
          <View style={styles.logoRow}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image is not an HTML <img>, it doesn't accept alt */}
            {data.logoDataUri && <Image src={data.logoDataUri} style={styles.logo} />}
            <Text style={styles.collegeName}>{data.collegeName}</Text>
          </View>

          <Text style={styles.title}>Internship Completion Certificate</Text>

          <Text style={styles.bodyText}>
            This is to certify that <Text style={styles.studentName}>{data.studentName}</Text>
            {data.registrationNumber ? ` (Reg. No. ${data.registrationNumber})` : ""}, a student of {data.programName},{" "}
            {data.departmentName}, has successfully completed a {data.durationWeeks}-week internship at{" "}
            <Text style={styles.studentName}>{data.companyName}</Text> from {data.startDate} to {data.endDate}, and has
            demonstrated satisfactory performance throughout the internship period.
          </Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailsCol}>
              <Text style={styles.detailLabel}>Department</Text>
              <Text style={styles.detailValue}>{data.departmentName}</Text>
            </View>
            <View style={styles.detailsCol}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{data.durationWeeks} weeks</Text>
            </View>
            <View style={styles.detailsCol}>
              <Text style={styles.detailLabel}>Period</Text>
              <Text style={styles.detailValue}>
                {data.startDate} — {data.endDate}
              </Text>
            </View>
          </View>

          <View style={styles.footerRow}>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>{data.supervisorName ?? "Academic Supervisor"}</Text>
            </View>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Authorized Signature</Text>
            </View>
          </View>

          <Text style={styles.certNumber}>Certificate No: {data.certificateNumber}</Text>
          <Text style={styles.generatedNote}>Computer-generated on {data.generatedAt}</Text>
        </View>
      </Page>
    </Document>
  );
}
