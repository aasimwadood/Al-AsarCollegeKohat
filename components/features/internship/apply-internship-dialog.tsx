"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { applyForInternshipAction } from "@/lib/actions/internship";

type Company = { id: string; name: string; domain: string | null };
type Supervisor = { id: string; name: string };

export function ApplyInternshipDialog({
  configId,
  companies,
  supervisors,
  siteSupervisorsByCompany,
  defaultCompanyId,
  triggerLabel = "Apply for Internship",
}: {
  configId: string;
  companies: Company[];
  supervisors: Supervisor[];
  /** Only the site supervisors linked to each company are selectable once that company is picked. */
  siteSupervisorsByCompany: Record<string, Supervisor[]>;
  defaultCompanyId?: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [companyId, setCompanyId] = useState(defaultCompanyId ?? "");
  const [supervisorId, setSupervisorId] = useState("");
  const [siteSupervisorId, setSiteSupervisorId] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const siteSupervisorsForCompany = companyId ? (siteSupervisorsByCompany[companyId] ?? []) : [];

  const onCompanyChange = (value: string) => {
    setCompanyId(value);
    setSiteSupervisorId("");
  };

  const onSubmit = () => {
    setError("");
    if (!companyId) {
      setError("Select a company");
      return;
    }
    if (!supervisorId) {
      setError("Select an academic supervisor");
      return;
    }
    if (!siteSupervisorId) {
      setError("Select a site supervisor");
      return;
    }
    const formData = new FormData();
    formData.set("configId", configId);
    formData.set("companyId", companyId);
    formData.set("supervisorProfileId", supervisorId);
    formData.set("siteSupervisorProfileId", siteSupervisorId);
    startTransition(async () => {
      const result = await applyForInternshipAction(formData);
      if (result?.error) setError(result.error);
      else {
        setOpen(false);
        toast.success("Request sent to your supervisors");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={companies.length === 0 || supervisors.length === 0}>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Internship Application</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div>
            <Label>Host Organization</Label>
            <Select value={companyId} onValueChange={onCompanyChange} disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                    {c.domain ? ` — ${c.domain}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {companies.length === 0 && <p className="mt-1 text-xs text-gray-500">No companies with an active MoU are available yet.</p>}
          </div>
          <div>
            <Label>Site Supervisor</Label>
            <Select value={siteSupervisorId} onValueChange={setSiteSupervisorId} disabled={isPending || !companyId}>
              <SelectTrigger>
                <SelectValue placeholder={companyId ? "Select a site supervisor" : "Select a company first"} />
              </SelectTrigger>
              <SelectContent>
                {siteSupervisorsForCompany.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {companyId && siteSupervisorsForCompany.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">This company has no registered site supervisors yet.</p>
            )}
          </div>
          <div>
            <Label>Academic Supervisor</Label>
            <Select value={supervisorId} onValueChange={setSupervisorId} disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select a supervisor" />
              </SelectTrigger>
              <SelectContent>
                {supervisors.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="button" onClick={onSubmit} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
