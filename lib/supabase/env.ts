/**
 * Supabase connection settings, read in one place.
 *
 * Supabase now labels the browser-safe key "publishable" and the privileged
 * key "secret"; older projects call them "anon" and "service_role". Either
 * variable name works. Each NEXT_PUBLIC_ variable is referenced literally so
 * Next.js can inline it into the browser bundle at build time — on Vercel
 * they must therefore be set BEFORE the build (redeploy after changing them).
 */
function required(value: string | undefined, names: string): string {
  if (!value) {
    throw new Error(
      `Missing Supabase configuration: set ${names} in the environment (Vercel → Project → Settings → Environment Variables), then redeploy.`,
    );
  }
  return value;
}

export function supabaseUrl(): string {
  return required(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL");
}

export function supabasePublishableKey(): string {
  return required(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)",
  );
}

/** Server-only: the privileged key. Never import this from client code. */
export function supabaseSecretKey(): string {
  return required(
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    "SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)",
  );
}
