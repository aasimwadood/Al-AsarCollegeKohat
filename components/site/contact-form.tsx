"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { contactMessageSchema, type ContactMessageInput } from "@/lib/validations/contact";
import { sendContactMessageAction } from "@/lib/actions/contact";

const field =
  "mt-1.5 block w-full rounded-[3px] border border-line bg-white px-3.5 py-2.5 text-[0.9375rem] text-ink placeholder:text-ink-muted/70 focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20 focus:outline-none disabled:opacity-60 aria-[invalid=true]:border-clay-700";

/** Enquiry form — posts to the existing `messages` table via sendContactMessageAction. */
export function SiteContactForm() {
  const [serverError, setServerError] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactMessageInput>({ resolver: zodResolver(contactMessageSchema) });

  const onSubmit = (values: ContactMessageInput) => {
    setServerError("");
    setSent(false);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.set(key, value ?? ""));
    startTransition(async () => {
      const result = await sendContactMessageAction(formData);
      if (result?.error) setServerError(result.error);
      else {
        reset();
        setSent(true);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div role="status" aria-live="polite">
        {sent && (
          <p className="flex items-center gap-2 border-l-[3px] border-forest-700 bg-forest-100/60 p-4 text-forest-900">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> Thank you — your message has been sent to the college.
          </p>
        )}
        {serverError && <p className="border-l-[3px] border-clay-700 bg-clay-50 p-4 text-clay-700">{serverError}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-forest-900">
            Full name <span className="text-clay-700" aria-hidden="true">*</span>
          </label>
          <input id="name" autoComplete="name" disabled={isPending} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} className={field} {...register("name")} />
          {errors.name && <p id="name-error" className="mt-1 text-sm text-clay-700">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-forest-900">
            Email <span className="text-clay-700" aria-hidden="true">*</span>
          </label>
          <input id="email" type="email" autoComplete="email" disabled={isPending} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} className={field} {...register("email")} />
          {errors.email && <p id="email-error" className="mt-1 text-sm text-clay-700">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="phoneNumber" className="text-sm font-medium text-forest-900">
            Phone <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <input id="phoneNumber" type="tel" autoComplete="tel" disabled={isPending} className={field} {...register("phoneNumber")} />
        </div>
        <div>
          <label htmlFor="subject" className="text-sm font-medium text-forest-900">
            Subject <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <input id="subject" disabled={isPending} className={field} {...register("subject")} />
        </div>
      </div>
      <div>
        <label htmlFor="body" className="text-sm font-medium text-forest-900">
          Message <span className="text-clay-700" aria-hidden="true">*</span>
        </label>
        <textarea id="body" rows={6} disabled={isPending} aria-invalid={!!errors.body} aria-describedby={errors.body ? "body-error" : undefined} className={cn(field, "resize-y")} {...register("body")} />
        {errors.body && <p id="body-error" className="mt-1 text-sm text-clay-700">{errors.body.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-11 items-center gap-2 rounded-[3px] bg-forest-800 px-6 py-2.5 font-medium text-sand-50 transition-colors hover:bg-forest-900 disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
        {isPending ? "Sending…" : "Send message"}
      </button>
      <p className="text-xs text-ink-muted">
        <span className="text-clay-700">*</span> Required
      </p>
    </form>
  );
}
