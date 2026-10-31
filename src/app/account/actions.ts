"use server";

import { redirect } from "next/navigation";
import { hasSupabase, isLive, siteUrl } from "@/lib/config";
import { stripe } from "@/lib/stripe";
import { userClient } from "@/lib/supabase/clients";

/** resendTo: set when sign-in failed only because the email isn't confirmed yet */
export type AuthState = { error?: string; message?: string; resendTo?: string } | null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD = 8;

export async function signIn(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!hasSupabase) return { error: "Customer accounts aren't switched on for this store yet." };
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const supabase = await userClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "email_not_confirmed" || /confirm/i.test(error.message)) return { error: "Please confirm your email first: the link is in your inbox.", resendTo: email };
    return { error: "That email and password don't match." };
  }
  // only ever send people to a page on this site
  const next = String(form.get("next") ?? "");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/account");
}

export async function signUp(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!hasSupabase) return { error: "Customer accounts aren't switched on for this store yet." };
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!name) return { error: "Please tell us your name." };
  if (!EMAIL.test(email)) return { error: "Please enter a valid email address." };
  if (password.length < MIN_PASSWORD) return { error: `Please use at least ${MIN_PASSWORD} characters for your password.` };
  const supabase = await userClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name }, emailRedirectTo: `${siteUrl}/auth/callback` },
  });
  if (error) return { error: /registered|exists/i.test(error.message) ? "There's already an account with that email. Try signing in, or reset your password." : error.message };
  if (!data.session) return { message: `Nearly done: we've sent a link to ${email}. Click it to confirm your account.` };
  const next = String(form.get("next") ?? "");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/account");
}

export async function signOut() {
  if (hasSupabase) await (await userClient()).auth.signOut();
  redirect("/");
}


/** Sends a password reset link. Always answers the same way, so it can't be used to find out who has an account. */
export async function requestReset(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!hasSupabase) return { error: "Customer accounts aren't switched on for this store yet." };
  const email = String(form.get("email") ?? "").trim();
  if (!EMAIL.test(email)) return { error: "Please enter a valid email address." };
  const supabase = await userClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl}/auth/callback?next=/account/password` });
  return { message: `If there's an account for ${email}, a link to choose a new password is on its way. It works for an hour.` };
}

/** Sets a new password for the signed-in customer (also used after following a reset link) */
export async function updatePassword(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!hasSupabase) return { error: "Customer accounts aren't switched on for this store yet." };
  const password = String(form.get("password") ?? "");
  if (password.length < MIN_PASSWORD) return { error: `Please use at least ${MIN_PASSWORD} characters.` };
  if (password !== String(form.get("confirm") ?? "")) return { error: "The two passwords don't match." };
  const supabase = await userClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Your link has expired. Please ask for a new one." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message.includes("different") ? "Please choose a password you haven't used here before." : "We couldn't change your password. Please try again." };
  redirect("/account?updated=password");
}

/** Changes the name on the account (the database only lets customers change their own name) */
export async function updateName(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!hasSupabase) return { error: "Customer accounts aren't switched on for this store yet." };
  const name = String(form.get("name") ?? "").trim().slice(0, 80);
  if (!name) return { error: "Please enter your name." };
  const supabase = await userClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Please sign in again." };
  const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", auth.user.id);
  if (error) return { error: "We couldn't save that. Please try again." };
  await supabase.auth.updateUser({ data: { full_name: name } });
  return { message: "Saved." };
}

/** Opens Stripe's customer portal, where customers update their card or cancel a subscription */
export async function manageSubscription() {
  if (!isLive) redirect("/account");
  const supabase = await userClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/account");
  const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", auth.user.id).maybeSingle();
  if (!profile?.stripe_customer_id) redirect("/account?error=no-subscription");
  let url: string;
  try {
    const portal = await stripe().billingPortal.sessions.create({ customer: profile.stripe_customer_id, return_url: `${siteUrl}/account` });
    url = portal.url;
  } catch {
    redirect("/account?error=portal");
  }
  redirect(url);
}

/** Sends the sign-up confirmation email again (it may have expired, or gone to spam) */
export async function resendConfirmation(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!hasSupabase) return { error: "Customer accounts aren't switched on for this store yet." };
  const email = String(form.get("email") ?? "").trim();
  if (!EMAIL.test(email)) return { error: "Please enter a valid email address." };
  const supabase = await userClient();
  const { error } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: `${siteUrl}/auth/callback` } });
  if (error) return { error: /rate|seconds/i.test(error.message) ? "We've just sent one. Please wait a minute before asking again." : "We couldn't send it just now. Please try again in a minute." };
  return { message: `We've sent a new confirmation link to ${email}.` };
}
