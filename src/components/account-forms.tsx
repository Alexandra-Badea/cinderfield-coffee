"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { updateName, updatePassword, type AuthState } from "@/app/account/actions";
import { buttonClass } from "./ui/button";

const field = "h-12 w-full rounded-2xl border border-line bg-paper px-4 outline-none transition focus:border-espresso/50";

export function PasswordForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, null);
  return (
    <form action={action} className="mx-auto max-w-md space-y-4 rounded-card bg-cream p-6 shadow-soft sm:p-8">
      {/* lets password managers save the new password against the right account */}
      <input type="email" name="username" value={email} autoComplete="username" readOnly hidden />
      <div>
        <label htmlFor="new-password" className="mb-1.5 block text-sm font-semibold">New password <span className="font-normal text-muted">(8+ characters)</span></label>
        <input id="new-password" name="password" type="password" required minLength={8} autoComplete="new-password" className={field} />
      </div>
      <div>
        <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-semibold">Type it again</label>
        <input id="confirm-password" name="confirm" type="password" required minLength={8} autoComplete="new-password" className={field} />
      </div>
      {state?.error && <p role="alert" className="text-sm text-ember">{state.error}</p>}
      <button type="submit" disabled={pending} className={buttonClass("dark", "lg", "w-full")}>{pending ? "Saving…" : "Save new password"}</button>
    </form>
  );
}

export function NameForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(updateName, null);
  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="account-name" className="mb-1.5 block text-sm font-semibold">Name</label>
        <input id="account-name" name="name" defaultValue={name} required maxLength={80} autoComplete="name" className={field} />
      </div>
      <button type="submit" disabled={pending} className={buttonClass("outline", "lg")}>
        {state?.message && !pending ? (<><Check className="h-4 w-4 text-sage" aria-hidden="true" /> Saved</>) : pending ? "Saving…" : "Save"}
      </button>
      {state?.error && <p role="alert" className="text-sm text-ember sm:basis-full">{state.error}</p>}
    </form>
  );
}
