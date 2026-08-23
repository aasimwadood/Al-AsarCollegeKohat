"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { reviewInternshipReportAction } from "@/lib/actions/internship";

export function ReviewReportButtons({ reportId }: { reportId: string }) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const review = (approve: boolean, reviewRemarks?: string) => {
    setError("");
    const formData = new FormData();
    formData.set("reportId", reportId);
    formData.set("approve", String(approve));
    if (reviewRemarks) formData.set("remarks", reviewRemarks);
    startTransition(async () => {
      const result = await reviewInternshipReportAction(formData);
      if (result?.error) {
        if (!approve) setError(result.error);
        else toast.error(result.error);
      } else {
        toast.success(approve ? "Report approved" : "Report rejected");
        setRejectOpen(false);
        setRemarks("");
      }
    });
  };

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setRejectOpen(true)} disabled={isPending}>
          Reject
        </Button>
        <Button size="sm" onClick={() => review(true)} disabled={isPending}>
          {isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
          Approve
        </Button>
      </div>
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div>
              <Label htmlFor={`remarks-${reportId}`}>Remarks *</Label>
              <Textarea id={`remarks-${reportId}`} value={remarks} onChange={(e) => setRemarks(e.target.value)} disabled={isPending} rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRejectOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={() => review(false, remarks)} disabled={isPending || !remarks.trim()}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Reject
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
