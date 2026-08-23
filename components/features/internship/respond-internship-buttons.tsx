"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { respondToInternshipSupervisionAction } from "@/lib/actions/internship";

export function RespondInternshipButtons({ requestId }: { requestId: string }) {
  const [declineOpen, setDeclineOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const respond = (approve: boolean, declineReason?: string) => {
    setError("");
    const formData = new FormData();
    formData.set("requestId", requestId);
    formData.set("approve", String(approve));
    if (declineReason) formData.set("reason", declineReason);
    startTransition(async () => {
      const result = await respondToInternshipSupervisionAction(formData);
      if (result?.error) {
        if (!approve) setError(result.error);
        else toast.error(result.error);
      } else {
        toast.success(approve ? "Request approved" : "Request declined");
        setDeclineOpen(false);
        setReason("");
      }
    });
  };

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setDeclineOpen(true)} disabled={isPending}>
          Disagree
        </Button>
        <Button size="sm" onClick={() => respond(true)} disabled={isPending}>
          {isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
          Agree
        </Button>
      </div>
      <Dialog open={declineOpen} onOpenChange={setDeclineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Supervision Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div>
              <Label htmlFor={`reason-${requestId}`}>Reason *</Label>
              <Textarea id={`reason-${requestId}`} value={reason} onChange={(e) => setReason(e.target.value)} disabled={isPending} rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDeclineOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={() => respond(false, reason)} disabled={isPending || !reason.trim()}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Decline
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
