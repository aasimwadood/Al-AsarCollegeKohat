"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { updateInternshipActivityLogAction, signInternshipActivityLogAction } from "@/lib/actions/internship";

type Row = { weekNumber: number; tasksPerformed: string; hours: string };

export function ActivityLogPanel({
  assignmentId,
  durationWeeks,
  existing,
  viewerRole,
  studentSignedAt,
  siteSupervisorSignedAt,
  academicSignedAt,
}: {
  assignmentId: string;
  durationWeeks: number;
  existing: { week_number: number; tasks_performed: string | null; hours: number | null }[];
  viewerRole: "student" | "site_supervisor" | "faculty";
  studentSignedAt: string | null;
  siteSupervisorSignedAt: string | null;
  academicSignedAt: string | null;
}) {
  const existingByWeek = new Map(existing.map((e) => [e.week_number, e]));
  const [rows, setRows] = useState<Row[]>(
    Array.from({ length: durationWeeks }, (_, i) => {
      const week = i + 1;
      const e = existingByWeek.get(week);
      return { weekNumber: week, tasksPerformed: e?.tasks_performed ?? "", hours: e?.hours != null ? String(e.hours) : "" };
    }),
  );
  const [savingWeek, setSavingWeek] = useState<number | null>(null);
  const [isSigning, startSignTransition] = useTransition();

  const studentLocked = !!studentSignedAt;
  const canEdit = viewerRole === "student" && !studentLocked;

  const saveRow = (row: Row) => {
    setSavingWeek(row.weekNumber);
    const formData = new FormData();
    formData.set("assignmentId", assignmentId);
    formData.set("weekNumber", String(row.weekNumber));
    formData.set("tasksPerformed", row.tasksPerformed);
    if (row.hours) formData.set("hours", row.hours);
    updateInternshipActivityLogAction(formData).then((result) => {
      setSavingWeek(null);
      if (result?.error) toast.error(result.error);
      else toast.success(`Week ${row.weekNumber} saved`);
    });
  };

  const sign = () => {
    const formData = new FormData();
    formData.set("assignmentId", assignmentId);
    startSignTransition(async () => {
      const result = await signInternshipActivityLogAction(formData);
      if (result?.error) toast.error(result.error);
      else toast.success("Signed");
    });
  };

  const alreadySignedByViewer =
    (viewerRole === "student" && studentLocked) ||
    (viewerRole === "site_supervisor" && !!siteSupervisorSignedAt) ||
    (viewerRole === "faculty" && !!academicSignedAt);
  const canSign = viewerRole === "student" ? !studentLocked : studentLocked && !alreadySignedByViewer;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant={studentSignedAt ? "default" : "outline"}>Student {studentSignedAt ? "signed" : "pending"}</Badge>
        <Badge variant={siteSupervisorSignedAt ? "default" : "outline"}>Site Supervisor {siteSupervisorSignedAt ? "signed" : "pending"}</Badge>
        <Badge variant={academicSignedAt ? "default" : "outline"}>Academic Supervisor {academicSignedAt ? "signed" : "pending"}</Badge>
      </div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.weekNumber} className="grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-[80px_1fr_100px_auto] sm:items-start">
            <p className="text-sm font-medium text-gray-700">Week {row.weekNumber}</p>
            <Textarea
              rows={2}
              placeholder="Tasks performed"
              value={row.tasksPerformed}
              disabled={!canEdit}
              onChange={(e) =>
                setRows((prev) => prev.map((r) => (r.weekNumber === row.weekNumber ? { ...r, tasksPerformed: e.target.value } : r)))
              }
            />
            <Input
              type="number"
              min={0}
              max={168}
              placeholder="Hours"
              value={row.hours}
              disabled={!canEdit}
              onChange={(e) => setRows((prev) => prev.map((r) => (r.weekNumber === row.weekNumber ? { ...r, hours: e.target.value } : r)))}
            />
            {canEdit && (
              <Button size="sm" variant="outline" onClick={() => saveRow(row)} disabled={savingWeek === row.weekNumber}>
                {savingWeek === row.weekNumber ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            )}
          </div>
        ))}
      </div>
      {canSign && (
        <Button size="sm" onClick={sign} disabled={isSigning}>
          {isSigning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
          Sign as {viewerRole === "student" ? "Student" : viewerRole === "site_supervisor" ? "Site Supervisor" : "Academic Supervisor"}
        </Button>
      )}
      {viewerRole !== "student" && !studentLocked && <p className="text-sm text-gray-500">The student must sign first.</p>}
    </div>
  );
}
