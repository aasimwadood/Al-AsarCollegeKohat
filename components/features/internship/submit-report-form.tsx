"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { submitInternshipReportAction, uploadInternshipReportDocumentAction } from "@/lib/actions/internship";

export function SubmitReportForm({ reportId, defaultContent }: { reportId: string; defaultContent?: string | null }) {
  const [content, setContent] = useState(defaultContent ?? "");
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setError("");
    if (!content.trim()) {
      setError("Report content is required");
      return;
    }
    startTransition(async () => {
      if (file) {
        const uploadData = new FormData();
        uploadData.set("reportId", reportId);
        uploadData.set("file", file);
        const uploadResult = await uploadInternshipReportDocumentAction(uploadData);
        if (uploadResult?.error) {
          setError(uploadResult.error);
          return;
        }
      }
      const formData = new FormData();
      formData.set("reportId", reportId);
      formData.set("content", content);
      formData.set("studentRemarks", remarks);
      const result = await submitInternshipReportAction(formData);
      if (result?.error) setError(result.error);
      else toast.success("Report submitted");
    });
  };

  return (
    <div className="space-y-3 rounded-lg border p-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div>
        <Label htmlFor={`content-${reportId}`}>Report Content *</Label>
        <Textarea id={`content-${reportId}`} value={content} onChange={(e) => setContent(e.target.value)} disabled={isPending} rows={5} />
      </div>
      <div>
        <Label htmlFor={`remarks-${reportId}`}>Remarks (optional)</Label>
        <Textarea id={`remarks-${reportId}`} value={remarks} onChange={(e) => setRemarks(e.target.value)} disabled={isPending} rows={2} />
      </div>
      <div>
        <Label htmlFor={`file-${reportId}`}>Supporting Document (optional, PDF/PNG/JPEG)</Label>
        <Input
          id={`file-${reportId}`}
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          disabled={isPending}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <Button onClick={submit} disabled={isPending}>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
        Submit Report
      </Button>
    </div>
  );
}
