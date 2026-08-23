"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Building2, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { createInternshipCompanyAction, updateInternshipCompanyAction } from "@/lib/actions/internship";

export type InternshipCompany = {
  id: string;
  name: string;
  companyType: string | null;
  industry: string | null;
  address: string | null;
  contactPerson: string | null;
  contactNumber: string | null;
  contactEmail: string | null;
  website: string | null;
  internshipDomain: string | null;
  availableSeats: number | null;
  isActive: boolean;
};

export function CompanyFormDialog({ departmentId, company }: { departmentId: string; company?: InternshipCompany }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = (formData: FormData) => {
    setError("");
    formData.set("departmentId", departmentId);
    if (company) formData.set("companyId", company.id);
    startTransition(async () => {
      const result = company ? await updateInternshipCompanyAction(formData) : await createInternshipCompanyAction(formData);
      if (result?.error) setError(result.error);
      else {
        setOpen(false);
        toast.success(company ? "Company updated" : "Company added");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {company ? (
          <Button size="sm" variant="ghost">
            <Pencil className="mr-1 h-3 w-3" />
            Edit
          </Button>
        ) : (
          <Button>
            <Building2 className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{company ? `Edit Company — ${company.name}` : "Add Internship Company"}</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div>
            <Label htmlFor="name">Company Name *</Label>
            <Input id="name" name="name" defaultValue={company?.name} disabled={isPending} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="companyType">Company Type</Label>
              <Input id="companyType" name="companyType" defaultValue={company?.companyType ?? ""} disabled={isPending} />
            </div>
            <div>
              <Label htmlFor="industry">Industry / Domain</Label>
              <Input id="industry" name="industry" defaultValue={company?.industry ?? ""} disabled={isPending} />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" defaultValue={company?.address ?? ""} disabled={isPending} rows={2} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input id="contactPerson" name="contactPerson" defaultValue={company?.contactPerson ?? ""} disabled={isPending} />
            </div>
            <div>
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input id="contactNumber" name="contactNumber" defaultValue={company?.contactNumber ?? ""} disabled={isPending} />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input id="contactEmail" name="contactEmail" type="email" defaultValue={company?.contactEmail ?? ""} disabled={isPending} />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" defaultValue={company?.website ?? ""} disabled={isPending} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="internshipDomain">Internship Area / Domain</Label>
              <Input id="internshipDomain" name="internshipDomain" defaultValue={company?.internshipDomain ?? ""} disabled={isPending} />
            </div>
            <div>
              <Label htmlFor="availableSeats">Available Seats</Label>
              <Input
                id="availableSeats"
                name="availableSeats"
                type="number"
                min={0}
                defaultValue={company?.availableSeats ?? ""}
                disabled={isPending}
              />
            </div>
          </div>
          {company && (
            <div>
              <Label className="mb-1 block text-xs">Status</Label>
              <select
                name="isActive"
                defaultValue={String(company.isActive)}
                disabled={isPending}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {company ? "Save Changes" : "Add Company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
