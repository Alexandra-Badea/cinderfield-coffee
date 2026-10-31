import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseKey as key, supabaseUrl as url } from "@/lib/config";

/** Keeps the Supabase sign-in fresh on every request. Does nothing without Supabase. */
export async function proxy(request: NextRequest) {
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = {
  // only pages that care who you are
  matcher: ["/account/:path*", "/admin/:path*", "/checkout/:path*", "/cart", "/coffee/:path*", "/api/checkout"],
};
