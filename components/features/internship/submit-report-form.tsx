"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { submitInternshipReportAction, uploadInternshipReportDocumentAction } from "@/lib/actions/internship";

export function SubmitReportForm({
  reportId,
  defaultTasksPerformed,
  defaultLearningExperience,
  defaultChallenges,
}: {
  reportId: string;
  defaultTasksPerformed?: string | null;
  defaultLearningExperience?: string | null;
  defaultChallenges?: string | null;
}) {
  const [tasksPerformed, setTasksPerformed] = useState(defaultTasksPerformed ?? "");
  const [learningExperience, setLearningExperience] = useState(defaultLearningExperience ?? "");
  const [challenges, setChallenges] = useState(defaultChallenges ?? "");
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setError("");
    if (!tasksPerformed.trim() || !learningExperience.trim() || !challenges.trim()) {
      setError("Tasks performed, learning experience, and challenges are all required");
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
      formData.set("tasksPerformed", tasksPerformed);
      formData.set("learningExperience", learningExperience);
      formData.set("challenges", challenges);
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
        <Label htmlFor={`tasks-${reportId}`}>Tasks Performed *</Label>
        <Textarea id={`tasks-${reportId}`} value={tasksPerformed} onChange={(e) => setTasksPerformed(e.target.value)} disabled={isPending} rows={3} />
      </div>
      <div>
        <Label htmlFor={`learning-${reportId}`}>Learning Experience *</Label>
        <Textarea id={`learning-${reportId}`} value={learningExperience} onChange={(e) => setLearningExperience(e.target.value)} disabled={isPending} rows={3} />
      </div>
      <div>
        <Label htmlFor={`challenges-${reportId}`}>Challenges *</Label>
        <Textarea id={`challenges-${reportId}`} value={challenges} onChange={(e) => setChallenges(e.target.value)} disabled={isPending} rows={3} />
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
