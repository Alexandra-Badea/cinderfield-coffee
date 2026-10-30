import { NextResponse, type NextRequest } from "next/server";
import { siteUrl } from "@/lib/config";
import { userClient } from "@/lib/supabase/clients";

/** The link in the sign-up email lands here: swap the one-time code for a session, then go to the account page */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await userClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${siteUrl}/account?welcome=1`);
  }
  return NextResponse.redirect(`${siteUrl}/account?error=link`);
}
