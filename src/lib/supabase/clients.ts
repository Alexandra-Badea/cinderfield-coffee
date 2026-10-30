import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Anonymous client with no cookies: for public, cacheable reads like the catalogue */
export function publicClient() {
  return createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Client acting as the signed-in visitor (reads their session cookie). Row Level Security applies. */
export async function userClient() {
  const store = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component: the proxy refreshes the session instead
        }
      },
    },
  });
}

/** Service-role client for trusted server work only (checkout and the Stripe webhook). Bypasses RLS. */
export function serviceClient() {
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
