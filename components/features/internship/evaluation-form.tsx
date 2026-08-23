"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { submitInternshipEvaluationAction } from "@/lib/actions/internship";

export function EvaluationForm({ assignmentId }: { assignmentId: string }) {
  const [open, setOpen] = useState(false);
  const [completionConfirmed, setCompletionConfirmed] = useState(true);
  const [finalStatus, setFinalStatus] = useState<"successfully_completed" | "not_completed">("successfully_completed");
  const [overallPerformance, setOverallPerformance] = useState("");
  const [attendanceNote, setAttendanceNote] = useState("");
  const [remarks, setRemarks] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setError("");
    const formData = new FormData();
    formData.set("assignmentId", assignmentId);
    formData.set("completionConfirmed", String(completionConfirmed));
    formData.set("finalStatus", finalStatus);
    formData.set("overallPerformance", overallPerformance);
    formData.set("attendanceNote", attendanceNote);
    formData.set("remarks", remarks);
    formData.set("recommendation", recommendation);
    startTransition(async () => {
      const result = await submitInternshipEvaluationAction(formData);
      if (result?.error) setError(result.error);
      else {
        setOpen(false);
        toast.success("Evaluation submitted");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Submit Final Evaluation</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Final Internship Evaluation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={completionConfirmed} onCheckedChange={(v) => setCompletionConfirmed(v === true)} disabled={isPending} />
            The student has successfully completed the required internship period.
          </label>
          <div>
            <Label>Final Status</Label>
            <Select value={finalStatus} onValueChange={(v) => setFinalStatus(v as typeof finalStatus)} disabled={isPending}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="successfully_completed">Successfully Completed</SelectItem>
                <SelectItem value="not_completed">Not Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor={`perf-${assignmentId}`}>Overall Performance</Label>
            <Textarea id={`perf-${assignmentId}`} value={overallPerformance} onChange={(e) => setOverallPerformance(e.target.value)} disabled={isPending} rows={2} />
          </div>
          <div>
            <Label htmlFor={`attendance-${assignmentId}`}>Attendance / Performance Note</Label>
            <Textarea id={`attendance-${assignmentId}`} value={attendanceNote} onChange={(e) => setAttendanceNote(e.target.value)} disabled={isPending} rows={2} />
          </div>
          <div>
            <Label htmlFor={`remarks-${assignmentId}`}>Remarks</Label>
            <Textarea id={`remarks-${assignmentId}`} value={remarks} onChange={(e) => setRemarks(e.target.value)} disabled={isPending} rows={2} />
          </div>
          <div>
            <Label htmlFor={`rec-${assignmentId}`}>Recommendation</Label>
            <Textarea id={`rec-${assignmentId}`} value={recommendation} onChange={(e) => setRecommendation(e.target.value)} disabled={isPending} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="button" onClick={submit} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Evaluation
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
