"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { submitSiteSupervisorReportSectionAction } from "@/lib/actions/internship";
import { SITE_SUPERVISOR_CRITERIA } from "@/lib/utils/internship";

const SCORE_OPTIONS = [
  { value: "1", label: "1 — Does not meet expectations" },
  { value: "2", label: "2 — Inconsistently meets expectations" },
  { value: "3", label: "3 — Consistently meets expectations" },
  { value: "4", label: "4 — Above expectations" },
  { value: "5", label: "5 — Far above expectations" },
];

export function ReviewSiteSupervisorReportButtons({ reportId }: { reportId: string }) {
  const [dialog, setDialog] = useState<"approve" | "reject" | null>(null);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = (approve: boolean) => {
    setError("");
    if (approve && SITE_SUPERVISOR_CRITERIA.some((c) => !scores[c.key])) {
      setError("Please score every criterion");
      return;
    }
    const formData = new FormData();
    formData.set("reportId", reportId);
    formData.set("approve", String(approve));
    if (approve) formData.set("scores", JSON.stringify(scores));
    if (remarks) formData.set("remarks", remarks);
    startTransition(async () => {
      const result = await submitSiteSupervisorReportSectionAction(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        toast.success(approve ? "Report forwarded for academic review" : "Report rejected");
        setDialog(null);
        setScores({});
        setRemarks("");
      }
    });
  };

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => { setError(""); setDialog("reject"); }} disabled={isPending}>
          Reject
        </Button>
        <Button size="sm" onClick={() => { setError(""); setDialog("approve"); }} disabled={isPending}>
          Forward to Academic Supervisor
        </Button>
      </div>
      <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialog === "approve" ? "Site Supervisor Evaluation" : "Reject Report"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            {dialog === "approve" &&
              SITE_SUPERVISOR_CRITERIA.map((c) => (
                <div key={c.key}>
                  <Label htmlFor={`score-${reportId}-${c.key}`}>{c.label}</Label>
                  <Select value={scores[c.key] ?? ""} onValueChange={(v) => setScores((prev) => ({ ...prev, [c.key]: v }))} disabled={isPending}>
                    <SelectTrigger id={`score-${reportId}-${c.key}`}>
                      <SelectValue placeholder="Select score" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCORE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            <div>
              <Label htmlFor={`ss-remarks-${reportId}`}>Remarks{dialog === "reject" ? " *" : " (optional)"}</Label>
              <Textarea id={`ss-remarks-${reportId}`} value={remarks} onChange={(e) => setRemarks(e.target.value)} disabled={isPending} rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialog(null)} disabled={isPending}>
                Cancel
              </Button>
              {dialog === "approve" ? (
                <Button type="button" onClick={() => submit(true)} disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Forward
                </Button>
              ) : (
                <Button type="button" variant="destructive" onClick={() => submit(false)} disabled={isPending || !remarks.trim()}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Reject
                </Button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
