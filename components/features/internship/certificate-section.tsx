"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Award, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateInternshipCertificateAction } from "@/lib/actions/internship";

export function CertificateSection({ assignmentId, certificateExists }: { assignmentId: string; certificateExists: boolean }) {
  const [ready, setReady] = useState(certificateExists);
  const [isPending, startTransition] = useTransition();

  const generate = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("assignmentId", assignmentId);
      const result = await generateInternshipCertificateAction(formData);
      if (result?.error) toast.error(result.error);
      else {
        setReady(true);
        toast.success("Certificate generated");
      }
    });
  };

  if (ready) {
    return (
      <Button asChild>
        <a href={`/api/internship/certificates/${assignmentId}/pdf`} target="_blank" rel="noopener noreferrer">
          <Download className="mr-2 h-4 w-4" />
          Download Certificate
        </a>
      </Button>
    );
  }

  return (
    <Button onClick={generate} disabled={isPending}>
      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Award className="mr-2 h-4 w-4" />}
      Generate Certificate
    </Button>
  );
}
