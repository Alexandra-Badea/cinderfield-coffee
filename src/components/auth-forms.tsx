"use client";

import { useActionState, useState } from "react";
import { requestReset, resendConfirmation, signIn, signUp, type AuthState } from "@/app/account/actions";
import { buttonClass } from "./ui/button";

const field = "h-12 w-full rounded-2xl border border-line bg-paper px-4 outline-none transition focus:border-espresso/50";
type View = "in" | "up" | "reset";

export function AuthForms({ next = "/account" }: { next?: string }) {
  const [view, setView] = useState<View>("in");
  const [inState, inAction, inPending] = useActionState<AuthState, FormData>(signIn, null);
  const [upState, upAction, upPending] = useActionState<AuthState, FormData>(signUp, null);
  const [resetState, resetAction, resetPending] = useActionState<AuthState, FormData>(requestReset, null);
  const [resendState, resendAction, resendPending] = useActionState<AuthState, FormData>(resendConfirmation, null);

  return (
    <div className="mx-auto max-w-md rounded-card bg-cream p-6 shadow-soft sm:p-8">
      {view === "reset" ? (
        <>
          <h2 className="text-2xl">Reset your password</h2>
          <p className="mt-2 text-sm text-muted">Enter the email you signed up with and we&apos;ll send you a link to choose a new password.</p>
          {resetState?.message ? (
            <p role="status" className="mt-6 rounded-2xl bg-sage/15 p-4">{resetState.message}</p>
          ) : (
            <form action={resetAction} className="mt-6 space-y-4">
              <div>
                <label htmlFor="reset-email" className="mb-1.5 block text-sm font-semibold">Email</label>
                <input id="reset-email" name="email" type="email" required autoComplete="email" className={field} />
              </div>
              {resetState?.error && <p role="alert" className="text-sm text-ember">{resetState.error}</p>}
              <button type="submit" disabled={resetPending} className={buttonClass("dark", "lg", "w-full")}>{resetPending ? "Sending…" : "Send the link"}</button>
            </form>
          )}
          <button type="button" onClick={() => setView("in")} className="mt-5 text-sm font-semibold underline decoration-line underline-offset-2 hover:text-ember">
            Back to sign in
          </button>
        </>
      ) : (
        <>
          <div role="tablist" aria-label="Sign in or create an account" className="grid grid-cols-2 rounded-full bg-sand/70 p-1">
            {(["in", "up"] as const).map((t) => (
              <button key={t} role="tab" aria-selected={view === t} type="button" onClick={() => setView(t)} className={`rounded-full py-2.5 text-sm font-semibold transition ${view === t ? "bg-cream shadow-soft" : "text-muted"}`}>
                {t === "in" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>
          {view === "in" ? (
            <form action={inAction} className="mt-6 space-y-4">
              <input type="hidden" name="next" value={next} />
              <div>
                <label htmlFor="in-email" className="mb-1.5 block text-sm font-semibold">Email</label>
                <input id="in-email" name="email" type="email" required autoComplete="email" className={field} />
              </div>
              <div>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <label htmlFor="in-password" className="text-sm font-semibold">Password</label>
                  <button type="button" onClick={() => setView("reset")} className="text-sm text-muted underline decoration-line underline-offset-2 hover:text-ember">
                    Forgot it?
                  </button>
                </div>
                <input id="in-password" name="password" type="password" required autoComplete="current-password" className={field} />
              </div>
              {inState?.error && <p role="alert" className="text-sm text-ember">{inState.error}</p>}
              <button type="submit" disabled={inPending} className={buttonClass("dark", "lg", "w-full")}>{inPending ? "Signing in…" : "Sign in"}</button>
            </form>
          ) : null}
          {view === "in" && inState?.resendTo ? (
            resendState?.message ? (
              <p role="status" className="mt-4 rounded-2xl bg-sage/15 p-4 text-sm">{resendState.message}</p>
            ) : (
              <form action={resendAction} className="mt-4 text-sm">
                <input type="hidden" name="email" value={inState.resendTo} />
                <button type="submit" disabled={resendPending} className="font-semibold underline decoration-line underline-offset-2 hover:text-ember">
                  {resendPending ? "Sending…" : "Send the confirmation link again"}
                </button>
                {resendState?.error && <p role="alert" className="mt-1 text-ember">{resendState.error}</p>}
              </form>
            )
          ) : null}
          {view === "in" ? null : upState?.message ? (
            <p role="status" className="mt-6 rounded-2xl bg-sage/15 p-4">{upState.message}</p>
          ) : (
            <form action={upAction} className="mt-6 space-y-4">
              <input type="hidden" name="next" value={next} />
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
              <p className="text-center text-xs text-muted">Your orders and subscriptions will be kept together in your account.</p>
            </form>
          )}
        </>
      )}
    </div>
  );
}
