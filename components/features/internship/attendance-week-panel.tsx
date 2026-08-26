"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { markInternshipAttendanceAction, lockInternshipAttendanceWeekAction } from "@/lib/actions/internship";
import { getWorkingDatesForWeek, getWeekDateRange, ATTENDANCE_STATUS_LABELS, ATTENDANCE_STATUS_VARIANT, type InternshipAttendanceStatus } from "@/lib/utils/internship";

type ExistingRow = { date: string; status: InternshipAttendanceStatus; locked: boolean };

export function AttendanceWeekPanel({
  assignmentId,
  startDate,
  durationWeeks,
  workingDays,
  existing,
}: {
  assignmentId: string;
  startDate: string;
  durationWeeks: number;
  workingDays: number[];
  existing: ExistingRow[];
}) {
  const [week, setWeek] = useState(1);
  const [isPending, startTransition] = useTransition();
  const existingByDate = useMemo(() => new Map(existing.map((e) => [e.date, e])), [existing]);

  const dates = useMemo(() => getWorkingDatesForWeek(startDate, week, workingDays), [startDate, week, workingDays]);
  const [draft, setDraft] = useState<Record<string, InternshipAttendanceStatus>>({});

  const statusFor = (date: string): InternshipAttendanceStatus | "" => draft[date] ?? existingByDate.get(date)?.status ?? "";
  const isLocked = (date: string) => existingByDate.get(date)?.locked ?? false;
  const allLocked = dates.length > 0 && dates.every((d) => isLocked(d.date));

  const save = () => {
    const entries = dates
      .filter((d) => !isLocked(d.date) && statusFor(d.date))
      .map((d) => ({ date: d.date, status: statusFor(d.date) as InternshipAttendanceStatus }));
    if (entries.length === 0) {
      toast.error("Mark at least one day first");
      return;
    }
    const formData = new FormData();
    formData.set("assignmentId", assignmentId);
    formData.set("entries", JSON.stringify(entries));
    startTransition(async () => {
      const result = await markInternshipAttendanceAction(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Attendance saved");
        setDraft({});
      }
    });
  };

  const lockWeek = () => {
    const { weekStart, weekEnd } = getWeekDateRange(startDate, week);
    const formData = new FormData();
    formData.set("assignmentId", assignmentId);
    formData.set("weekStart", weekStart);
    formData.set("weekEnd", weekEnd);
    startTransition(async () => {
      const result = await lockInternshipAttendanceWeekAction(formData);
      if (result?.error) toast.error(result.error);
      else toast.success(`Week ${week} locked`);
    });
  };

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <Select value={String(week)} onValueChange={(v) => setWeek(Number(v))} disabled={isPending}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: durationWeeks }, (_, i) => i + 1).map((w) => (
              <SelectItem key={w} value={String(w)}>
                Week {w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {allLocked && (
          <Badge variant="outline">
            <Lock className="mr-1 h-3 w-3" />
            Locked
          </Badge>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Day</TableHead>
            <TableHead>Attendance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dates.map((d) => {
            const locked = isLocked(d.date);
            const value = statusFor(d.date);
            return (
              <TableRow key={d.date}>
                <TableCell className="text-sm">{d.date}</TableCell>
                <TableCell className="text-sm">{d.dayName}</TableCell>
                <TableCell>
                  {locked ? (
                    <Badge variant={ATTENDANCE_STATUS_VARIANT[existingByDate.get(d.date)!.status]}>
                      {ATTENDANCE_STATUS_LABELS[existingByDate.get(d.date)!.status]}
                    </Badge>
                  ) : (
                    <Select value={value} onValueChange={(v) => setDraft({ ...draft, [d.date]: v as InternshipAttendanceStatus })} disabled={isPending}>
                      <SelectTrigger className="h-8 w-32">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {(["present", "absent", "leave", "half_day"] as const).map((s) => (
                          <SelectItem key={s} value={s}>
                            {ATTENDANCE_STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          {dates.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="py-4 text-center text-sm text-gray-500">
                No working days configured for this week.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {!allLocked && dates.length > 0 && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={save} disabled={isPending}>
            {isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            Save
          </Button>
          <Button size="sm" onClick={lockWeek} disabled={isPending}>
            {isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            Submit &amp; Lock Week
          </Button>
        </div>
      )}
    </div>
  );
}
