"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { FilePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { createInternshipMouAction } from "@/lib/actions/internship";

export function AddMouDialog({ companyId }: { companyId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = (formData: FormData) => {
    setError("");
    formData.set("companyId", companyId);
    startTransition(async () => {
      const result = await createInternshipMouAction(formData);
      if (result?.error) setError(result.error);
      else {
        setOpen(false);
        toast.success("MoU added");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <FilePlus className="mr-1 h-3 w-3" />
          Add MoU
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add MoU</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="mouStartDate">Start Date *</Label>
              <Input id="mouStartDate" name="mouStartDate" type="date" disabled={isPending} required />
            </div>
            <div>
              <Label htmlFor="mouExpiryDate">Expiry Date *</Label>
              <Input id="mouExpiryDate" name="mouExpiryDate" type="date" disabled={isPending} required />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" disabled={isPending} rows={2} />
          </div>
          <p className="text-xs text-gray-500">
            New MoUs start as Draft — set it to Active once signed, from the table, to make this company selectable by
            students.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add MoU
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
