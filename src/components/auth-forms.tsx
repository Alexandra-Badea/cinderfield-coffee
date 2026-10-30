"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "@/app/account/actions";
import { buttonClass } from "./ui/button";

const field = "h-12 w-full rounded-2xl border border-line bg-paper px-4 outline-none transition focus:border-espresso/50";

export function AuthForms({ next = "/account" }: { next?: string }) {
  const [tab, setTab] = useState<"in" | "up">("in");
  const [inState, inAction, inPending] = useActionState<AuthState, FormData>(signIn, null);
  const [upState, upAction, upPending] = useActionState<AuthState, FormData>(signUp, null);
  return (
    <div className="mx-auto max-w-md rounded-card bg-cream p-6 shadow-soft sm:p-8">
      <div role="tablist" aria-label="Sign in or create an account" className="grid grid-cols-2 rounded-full bg-sand/70 p-1">
        {(["in", "up"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)} className={`rounded-full py-2.5 text-sm font-semibold transition ${tab === t ? "bg-cream shadow-soft" : "text-muted"}`}>
            {t === "in" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>
      {tab === "in" ? (
        <form action={inAction} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label htmlFor="in-email" className="mb-1.5 block text-sm font-semibold">Email</label>
            <input id="in-email" name="email" type="email" required autoComplete="email" className={field} />
          </div>
          <div>
            <label htmlFor="in-password" className="mb-1.5 block text-sm font-semibold">Password</label>
            <input id="in-password" name="password" type="password" required autoComplete="current-password" className={field} />
          </div>
          {inState?.error && <p role="alert" className="text-sm text-ember">{inState.error}</p>}
          <button type="submit" disabled={inPending} className={buttonClass("dark", "lg", "w-full")}>{inPending ? "Signing in…" : "Sign in"}</button>
        </form>
      ) : upState?.message ? (
        <p role="status" className="mt-6 rounded-2xl bg-sage/15 p-4">{upState.message}</p>
      ) : (
        <form action={upAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="up-name" className="mb-1.5 block text-sm font-semibold">Your name</label>
            <input id="up-name" name="name" required autoComplete="name" className={field} />
          </div>
          <div>
            <label htmlFor="up-email" className="mb-1.5 block text-sm font-semibold">Email</label>
            <input id="up-email" name="email" type="email" required autoComplete="email" className={field} />
          </div>
          <div>
            <label htmlFor="up-password" className="mb-1.5 block text-sm font-semibold">Password <span className="font-normal text-muted">(8+ characters)</span></label>
            <input id="up-password" name="password" type="password" required minLength={8} autoComplete="new-password" className={field} />
          </div>
          {upState?.error && <p role="alert" className="text-sm text-ember">{upState.error}</p>}
          <button type="submit" disabled={upPending} className={buttonClass("dark", "lg", "w-full")}>{upPending ? "Creating…" : "Create account"}</button>
        </form>
      )}
    </div>
  );
}
