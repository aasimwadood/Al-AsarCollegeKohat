"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Download, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadInternshipMouDocumentAction, getInternshipMouDocumentUrlAction } from "@/lib/actions/internship";

export function MouDocumentCell({ mouId, hasDocument, canUpload }: { mouId: string; hasDocument: boolean; canUpload: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();

  const upload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.set("mouId", mouId);
    formData.set("file", file);
    startTransition(async () => {
      const result = await uploadInternshipMouDocumentAction(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Document uploaded");
        setFile(null);
      }
    });
  };

  const download = () => {
    startTransition(async () => {
      const url = await getInternshipMouDocumentUrlAction(mouId);
      if (!url) {
        toast.error("Could not generate a download link");
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    });
  };

  return (
    <div className="flex items-center gap-2">
      {hasDocument && (
        <Button size="sm" variant="outline" onClick={download} disabled={isPending}>
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
        </Button>
      )}
      {canUpload && (
        <>
          <Input
            type="file"
            accept="application/pdf,image/png,image/jpeg"
            className="h-8 w-40 text-xs"
            disabled={isPending}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Button size="sm" variant="ghost" onClick={upload} disabled={isPending || !file}>
            <Upload className="h-3 w-3" />
          </Button>
        </>
      )}
    </div>
  );
}
