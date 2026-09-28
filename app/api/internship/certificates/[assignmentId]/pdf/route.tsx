import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { CertificateDocument, type CertificatePdfData } from "@/components/features/internship/certificate-document";

// Direct structural copy of app/api/fees/vouchers/[id]/pdf/route.tsx's
// loadLogoDataUri() — this codebase doesn't have a shared extraction of it
// yet, so this mirrors it verbatim rather than introducing a new shared
// util as a side effect of this route.
async function loadLogoDataUri(logoPath: string | null): Promise<string | null> {
  if (!logoPath) return null;
  try {
    if (logoPath.startsWith("http")) {
      const res = await fetch(logoPath);
      if (!res.ok) return null;
      const contentType = res.headers.get("content-type") ?? "image/png";
      const buffer = Buffer.from(await res.arrayBuffer());
      return `data:${contentType};base64,${buffer.toString("base64")}`;
    }
    const filePath = path.join(process.cwd(), "public", logoPath.replace(/^\//, ""));
    const buffer = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = ext === ".png" ? "image/png" : ext === ".svg" ? "image/svg+xml" : "image/jpeg";
    if (contentType === "image/svg+xml") return null;
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

// RLS-scoped, same reasoning as the fee voucher PDF route: no query param or
// role check needed beyond RLS itself. The certificate row must already
// exist (via generate_internship_certificate()) — this route only renders,
// never mutates.
export async function GET(_request: Request, { params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: certificate, error: certError } = await supabase
    .from("internship_certificates")
    .select("*")
    .eq("assignment_id", assignmentId)
    .single();
  if (certError || !certificate) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });

  const { data: assignment, error: assignmentError } = await supabase
    .from("internship_assignments")
    .select("*")
    .eq("id", assignmentId)
    .single();
  if (assignmentError || !assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

  const [{ data: student }, { data: company }, { data: department }, { data: supervisor }] = await Promise.all([
    supabase.from("profiles").select("full_name, registration_number, program_id, college_id").eq("id", assignment.student_profile_id).single(),
    supabase.from("internship_companies").select("name").eq("id", assignment.company_id).single(),
    supabase.from("departments").select("name, college_id").eq("id", assignment.department_id).single(),
    assignment.supervisor_profile_id
      ? supabase.from("profiles").select("full_name").eq("id", assignment.supervisor_profile_id).single()
      : Promise.resolve({ data: null }),
  ]);
  if (!student || !company || !department) return NextResponse.json({ error: "Certificate data incomplete" }, { status: 404 });

  const { data: program } = student.program_id
    ? await supabase.from("programs").select("name").eq("id", student.program_id).single()
    : { data: null };
  const { data: college } = await supabase.from("colleges").select("name, logo_path").eq("id", department.college_id).single();

  const logoDataUri = await loadLogoDataUri(college?.logo_path ?? "/brand/al-asar-mark.png");
  const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");

  const data: CertificatePdfData = {
    collegeName: college?.name ?? "Al-Asar Degree College",
    logoDataUri,
    certificateNumber: certificate.certificate_number,
    studentName: student.full_name,
    registrationNumber: student.registration_number,
    programName: program?.name ?? "—",
    departmentName: department.name,
    companyName: company.name,
    durationWeeks: assignment.duration_weeks,
    startDate: fmt(assignment.start_date),
    endDate: fmt(assignment.end_date),
    generatedAt: fmt(certificate.generated_at),
    supervisorName: supervisor?.full_name ?? null,
  };

  const buffer = await renderToBuffer(<CertificateDocument data={data} />);

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="internship_certificate_${certificate.certificate_number}.pdf"`,
    },
  });
}
