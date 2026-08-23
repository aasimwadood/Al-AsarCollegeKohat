"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { setInternshipConfigAction } from "@/lib/actions/internship";

export type InternshipConfigEntry = {
  isEnabled: boolean;
  eligibilityCriteria: string | null;
  applicationOpenDate: string | null;
  applicationCloseDate: string | null;
  internshipStartDate: string | null;
  internshipEndDate: string | null;
  durationWeeks: number;
  requiredReports: number;
  reportIntervalWeeks: number;
  allowCrossDepartmentSupervisor: boolean;
};

const DEFAULT_CONFIG: InternshipConfigEntry = {
  isEnabled: false,
  eligibilityCriteria: null,
  applicationOpenDate: null,
  applicationCloseDate: null,
  internshipStartDate: null,
  internshipEndDate: null,
  durationWeeks: 9,
  requiredReports: 3,
  reportIntervalWeeks: 3,
  allowCrossDepartmentSupervisor: false,
};

export function InternshipConfigForm({
  departmentId,
  programs,
  semesters,
  configs,
}: {
  departmentId: string;
  programs: { id: string; name: string }[];
  semesters: { id: string; number: number }[];
  configs: Map<string, InternshipConfigEntry>;
}) {
  const [programId, setProgramId] = useState(programs[0]?.id ?? "");
  const [semesterId, setSemesterId] = useState(semesters[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<InternshipConfigEntry>(configs.get(`${programId}-${semesterId}`) ?? DEFAULT_CONFIG);

  const onPick = (nextProgramId: string, nextSemesterId: string) => {
    setProgramId(nextProgramId);
    setSemesterId(nextSemesterId);
    setForm(configs.get(`${nextProgramId}-${nextSemesterId}`) ?? DEFAULT_CONFIG);
  };

  const save = () => {
    const formData = new FormData();
    formData.set("departmentId", departmentId);
    formData.set("programId", programId);
    formData.set("semesterId", semesterId);
    formData.set("isEnabled", String(form.isEnabled));
    formData.set("eligibilityCriteria", form.eligibilityCriteria ?? "");
    formData.set("applicationOpenDate", form.applicationOpenDate ?? "");
    formData.set("applicationCloseDate", form.applicationCloseDate ?? "");
    formData.set("internshipStartDate", form.internshipStartDate ?? "");
    formData.set("internshipEndDate", form.internshipEndDate ?? "");
    formData.set("durationWeeks", String(form.durationWeeks));
    formData.set("requiredReports", String(form.requiredReports));
    formData.set("reportIntervalWeeks", String(form.reportIntervalWeeks));
    formData.set("allowCrossDepartmentSupervisor", String(form.allowCrossDepartmentSupervisor));
    startTransition(async () => {
      const result = await setInternshipConfigAction(formData);
      if (result?.error) toast.error(result.error);
      else toast.success("Internship configuration saved");
    });
  };

  if (programs.length === 0) {
    return <p className="py-6 text-center text-sm text-gray-500">No programs configured for this department yet.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-1 block text-xs">Program</Label>
          <Select value={programId} onValueChange={(v) => onPick(v, semesterId)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a program" />
            </SelectTrigger>
            <SelectContent>
              {programs.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1 block text-xs">Semester</Label>
          <Select value={semesterId} onValueChange={(v) => onPick(programId, v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  Semester {s.number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">Internship applications open</p>
          <p className="text-xs text-gray-500">Students can only apply while this is on and within the application window.</p>
        </div>
        <Switch checked={form.isEnabled} onCheckedChange={(v) => setForm({ ...form, isEnabled: v })} disabled={isPending} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-1 block text-xs">Application Opens</Label>
          <Input
            type="date"
            value={form.applicationOpenDate ?? ""}
            onChange={(e) => setForm({ ...form, applicationOpenDate: e.target.value })}
            disabled={isPending}
          />
        </div>
        <div>
          <Label className="mb-1 block text-xs">Application Closes</Label>
          <Input
            type="date"
            value={form.applicationCloseDate ?? ""}
            onChange={(e) => setForm({ ...form, applicationCloseDate: e.target.value })}
            disabled={isPending}
          />
        </div>
        <div>
          <Label className="mb-1 block text-xs">Internship Start</Label>
          <Input
            type="date"
            value={form.internshipStartDate ?? ""}
            onChange={(e) => setForm({ ...form, internshipStartDate: e.target.value })}
            disabled={isPending}
          />
        </div>
        <div>
          <Label className="mb-1 block text-xs">Internship End</Label>
          <Input
            type="date"
            value={form.internshipEndDate ?? ""}
            onChange={(e) => setForm({ ...form, internshipEndDate: e.target.value })}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label className="mb-1 block text-xs">Duration (weeks)</Label>
          <Input
            type="number"
            min={1}
            value={form.durationWeeks}
            onChange={(e) => setForm({ ...form, durationWeeks: Number(e.target.value) })}
            disabled={isPending}
          />
        </div>
        <div>
          <Label className="mb-1 block text-xs">Required Reports</Label>
          <Input
            type="number"
            min={1}
            value={form.requiredReports}
            onChange={(e) => setForm({ ...form, requiredReports: Number(e.target.value) })}
            disabled={isPending}
          />
        </div>
        <div>
          <Label className="mb-1 block text-xs">Report Interval (weeks)</Label>
          <Input
            type="number"
            min={1}
            value={form.reportIntervalWeeks}
            onChange={(e) => setForm({ ...form, reportIntervalWeeks: Number(e.target.value) })}
            disabled={isPending}
          />
        </div>
      </div>

      <div>
        <Label className="mb-1 block text-xs">Eligibility Criteria</Label>
        <Textarea
          value={form.eligibilityCriteria ?? ""}
          onChange={(e) => setForm({ ...form, eligibilityCriteria: e.target.value })}
          disabled={isPending}
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">Allow cross-department supervisors</p>
          <p className="text-xs text-gray-500">
            If off, students can only pick an academic supervisor from their own department.
          </p>
        </div>
        <Switch
          checked={form.allowCrossDepartmentSupervisor}
          onCheckedChange={(v) => setForm({ ...form, allowCrossDepartmentSupervisor: v })}
          disabled={isPending}
        />
      </div>

      <Button onClick={save} disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Configuration
      </Button>
    </div>
  );
}
