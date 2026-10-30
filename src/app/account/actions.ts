"use server";

import { redirect } from "next/navigation";
import { hasSupabase, siteUrl } from "@/lib/config";
import { userClient } from "@/lib/supabase/clients";

export type AuthState = { error?: string; message?: string } | null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function signIn(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!hasSupabase) return { error: "Accounts need the database, which isn't connected in this demo." };
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const supabase = await userClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message.includes("confirm") ? "Please confirm your email first: check your inbox." : "That email and password don't match." };
  // only ever send people to a page on this site
  const next = String(form.get("next") ?? "");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/account");
}

export async function signUp(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!hasSupabase) return { error: "Accounts need the database, which isn't connected in this demo." };
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!name) return { error: "Please tell us your name." };
  if (!EMAIL.test(email)) return { error: "Please enter a valid email address." };
  if (password.length < 8) return { error: "Please use at least 8 characters for your password." };
  const supabase = await userClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name }, emailRedirectTo: `${siteUrl}/auth/callback` },
  });
  if (error) return { error: error.message };
  if (!data.session) return { message: `Nearly done: we've sent a link to ${email}. Click it to confirm your account.` };
  redirect("/account");
}

export async function signOut() {
  if (hasSupabase) await (await userClient()).auth.signOut();
  redirect("/");
}
