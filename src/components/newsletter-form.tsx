"use client";

import { useActionState } from "react";
import { subscribe, type NewsletterState } from "@/app/actions";

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [state, action, pending] = useActionState<NewsletterState, FormData>(subscribe, null);
  if (state?.ok) {
    return (
      <p role="status" className={`rounded-2xl px-4 py-3 text-sm ${dark ? "bg-cream/10 text-cream" : "bg-sage/15 text-espresso"}`}>
        {state.message}
      </p>
    );
  }
  return (
    <form action={action} className="w-full">
      <label htmlFor={dark ? "nl-email-dark" : "nl-email"} className="sr-only">
        Email address
      </label>
      <div className={`flex rounded-full p-1 ${dark ? "bg-cream/10" : "border border-line bg-cream"}`}>
        <input
          id={dark ? "nl-email-dark" : "nl-email"}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={`w-0 min-w-0 flex-1 bg-transparent px-4 text-[0.95rem] outline-none ${dark ? "text-cream placeholder:text-cream/45" : "placeholder:text-muted/70"}`}
        />
        <button type="submit" disabled={pending} className="h-10 shrink-0 rounded-full bg-ember px-5 text-sm font-semibold text-white transition hover:bg-ember-dark disabled:opacity-60">
          {pending ? "Joining…" : "Join"}
        </button>
      </div>
      {state && !state.ok && (
        <p role="alert" className={`mt-2 px-4 text-sm ${dark ? "text-[#f3a37e]" : "text-ember"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
