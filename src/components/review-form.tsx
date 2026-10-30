"use client";

import { useActionState, useState } from "react";
import { addReview, type ReviewState } from "@/app/coffee/[slug]/actions";

export function ReviewForm({ productId, enabled }: { productId: string; enabled: boolean }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(addReview, null);
  const [rating, setRating] = useState(0);
  if (state?.ok) return <p role="status" className="rounded-2xl bg-sage/15 p-4">{state.message}</p>;
  return (
    <form action={action} className="space-y-4 rounded-card bg-cream p-6 shadow-soft">
      <h3 className="text-2xl">Write a review</h3>
      {!enabled && <p className="rounded-xl bg-sand/70 p-3 text-sm text-roast">In this demo, reviews are read-only. With the database connected, signed-in customers can post them here.</p>}
      <input type="hidden" name="productId" value={productId} />
      <fieldset disabled={!enabled}>
        <legend className="mb-2 text-sm font-semibold">Your rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer text-3xl leading-none" title={`${n} star${n > 1 ? "s" : ""}`}>
              <input type="radio" name="rating" value={n} className="sr-only" onChange={() => setRating(n)} />
              <span className={n <= rating ? "text-ember" : "text-espresso/20"} aria-hidden="true">
                ★
              </span>
              <span className="sr-only">{n} stars</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="review-body" className="mb-2 block text-sm font-semibold">
          What did you think?
        </label>
        <textarea id="review-body" name="body" rows={4} disabled={!enabled} maxLength={800} placeholder="How did you brew it, and how did it taste?" className="w-full rounded-2xl border border-line bg-paper p-4 outline-none focus:border-espresso/50 disabled:opacity-60" />
      </div>
      {state && !state.ok && <p role="alert" className="text-sm text-ember">{state.message}</p>}
      <button type="submit" disabled={!enabled || pending} className="rounded-full bg-espresso px-6 py-3 font-semibold text-cream disabled:opacity-40">
        {pending ? "Posting…" : "Post review"}
      </button>
    </form>
  );
}
