"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createWebsiteNewsAction, updateWebsiteNewsAction } from "@/lib/actions/website-news";

export type NewsDraft = { id: string; title: string; body: string | null; category: string | null; published_at: string };

export function WebsiteNewsDialog({ item }: { item?: NewsDraft }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const today = new Date().toISOString().slice(0, 10);

  const onSubmit = (formData: FormData) => {
    setError("");
    startTransition(async () => {
      const result = item ? await updateWebsiteNewsAction(item.id, formData) : await createWebsiteNewsAction(formData);
      if (result?.error) setError(result.error);
      else {
        toast.success(item ? "Announcement updated" : "Announcement published");
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {item ? (
          <Button variant="outline" size="sm">
            <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
          </Button>
        ) : (
          <Button>
            <Plus className="mr-1 h-4 w-4" /> New announcement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{item ? "Edit announcement" : "New website announcement"}</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" defaultValue={item?.title} disabled={isPending} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" defaultValue={item?.category ?? ""} placeholder="e.g. Admissions, Examinations" disabled={isPending} />
            </div>
            <div>
              <Label htmlFor="publishedAt">Publish date *</Label>
              <Input id="publishedAt" name="publishedAt" type="date" defaultValue={item?.published_at ?? today} disabled={isPending} required />
            </div>
          </div>
          <div>
            <Label htmlFor="body">Content</Label>
            <Textarea id="body" name="body" rows={8} defaultValue={item?.body ?? ""} disabled={isPending} />
            <p className="mt-1 text-xs text-muted-foreground">Separate paragraphs with a blank line.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {item ? "Save" : "Publish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
