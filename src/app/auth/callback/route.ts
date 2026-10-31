import { NextResponse, type NextRequest } from "next/server";
import { siteUrl } from "@/lib/config";
import { userClient } from "@/lib/supabase/clients";

/**
 * Links in Supabase's emails (confirm your account, reset your password) land here:
 * swap the one-time code for a session, then carry on to the page the link was for.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "";
  // only ever send people to a page on this site
  const to = next.startsWith("/") && !next.startsWith("//") ? next : "/account?welcome=1";
  if (code) {
    const supabase = await userClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${siteUrl}${to}`);
  }
  return NextResponse.redirect(`${siteUrl}/account?error=link`);
}
