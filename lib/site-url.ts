/**
 * Resolve the public-facing site URL for og:image, share links, etc.
 *
 * Precedence:
 *   1. NEXT_PUBLIC_SITE_URL (manually set on Vercel/Render)
 *   2. NEXT_PUBLIC_VERCEL_URL / VERCEL_URL (auto-set by Vercel)
 *   3. window.location.origin (client-side runtime)
 *   4. localhost fallback (dev/SSR)
 *
 * Accepts user-supplied URLs without protocol and prepends https://.
 */
export function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return /^https?:\/\//.test(explicit) ? explicit : `https://${explicit}`;
  }
  const vercelUrl =
    process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}
