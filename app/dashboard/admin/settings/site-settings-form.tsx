"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveSiteSettingAction } from "@/lib/actions/site-settings";

export function SiteSettingsForm({
  fields,
  values,
  collegeId,
}: {
  fields: { key: string; label: string; multiline?: boolean; hint?: string }[];
  values: Record<string, string>;
  collegeId: string;
}) {
  const [state, setState] = useState(values);
  const [isPending, startTransition] = useTransition();

  const saveAll = () => {
    startTransition(async () => {
      // Only write fields that changed, so untouched keys are never created empty.
      for (const field of fields) {
        if ((state[field.key] ?? "") === (values[field.key] ?? "")) continue;
        const result = await saveSiteSettingAction(field.key, state[field.key] ?? "", collegeId);
        if (result?.error) {
          toast.error(`${field.label}: ${result.error}`);
          return;
        }
      }
      toast.success("Settings saved");
    });
  };

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.key}>
          <Label htmlFor={field.key}>{field.label}</Label>
          <Textarea
            id={field.key}
            value={state[field.key] ?? ""}
            onChange={(e) => setState((prev) => ({ ...prev, [field.key]: e.target.value }))}
            disabled={isPending}
            rows={field.multiline ? 3 : 1}
            aria-describedby={field.hint ? `${field.key}-hint` : undefined}
          />
          {field.hint && (
            <p id={`${field.key}-hint`} className="mt-1 text-xs text-muted-foreground">
              {field.hint}
            </p>
          )}
        </div>
      ))}
      <Button onClick={saveAll} disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Settings
      </Button>
    </div>
  );
}
