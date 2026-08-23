"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setInternshipMouStatusAction } from "@/lib/actions/internship";

export function MouStatusSelect({ mouId, status }: { mouId: string; status: "draft" | "active" | "inactive" }) {
  const [isPending, startTransition] = useTransition();

  const onChange = (value: string) => {
    const formData = new FormData();
    formData.set("mouId", mouId);
    formData.set("status", value);
    startTransition(async () => {
      const result = await setInternshipMouStatusAction(formData);
      if (result?.error) toast.error(result.error);
      else toast.success("MoU status updated");
    });
  };

  return (
    <Select value={status} onValueChange={onChange} disabled={isPending}>
      <SelectTrigger className="h-8 w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="draft">Draft</SelectItem>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="inactive">Inactive</SelectItem>
      </SelectContent>
    </Select>
  );
}
