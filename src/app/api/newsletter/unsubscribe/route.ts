import { NextResponse, type NextRequest } from "next/server";
import { hasSupabase, siteUrl, supabaseSecret } from "@/lib/config";
import { validUnsubscribe } from "@/lib/email";
import { serviceClient } from "@/lib/supabase/clients";

/**
 * The unsubscribe link in newsletter emails. The token proves the link came from us, so nobody
 * can unsubscribe someone else. POST is the one-click unsubscribe that email apps send by themselves.
 */
async function unsubscribe(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("e") ?? "";
  const token = request.nextUrl.searchParams.get("t") ?? "";
  if (!email || !validUnsubscribe(email, token)) return NextResponse.redirect(`${siteUrl}/unsubscribed?error=1`, 303);
  if (hasSupabase && supabaseSecret) await serviceClient().from("newsletter").delete().eq("email", email.toLowerCase());
  return NextResponse.redirect(`${siteUrl}/unsubscribed`, 303);
}

export const GET = unsubscribe;
export const POST = unsubscribe;
