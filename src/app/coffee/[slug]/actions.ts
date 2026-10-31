"use server";

import { updateTag } from "next/cache";
import { hasSupabase } from "@/lib/config";
import { userClient } from "@/lib/supabase/clients";

export type ReviewState = { ok: boolean; message: string } | null;

/** Leaves a review. Only signed-in customers can, and the database checks that too (Row Level Security). */
export async function addReview(_prev: ReviewState, form: FormData): Promise<ReviewState> {
  if (!hasSupabase) return { ok: false, message: "Reviews open once customer accounts are switched on." };
  const productId = String(form.get("productId") ?? "");
  const rating = Number(form.get("rating"));
  const body = String(form.get("body") ?? "").trim();
  if (!(rating >= 1 && rating <= 5)) return { ok: false, message: "Please choose a star rating." };
  if (body.length < 10) return { ok: false, message: "Tell us a little more: at least a sentence." };
  if (body.length > 800) return { ok: false, message: "That's a bit long. Please keep it under 800 characters." };

  const supabase = await userClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Please sign in to leave a review." };
  const name = (auth.user.user_metadata?.full_name as string | undefined)?.split(" ")[0] || auth.user.email?.split("@")[0] || "Customer";
  const { error } = await supabase.from("reviews").insert({ product_id: productId, user_id: auth.user.id, author_name: name, rating, body });
  if (error) return { ok: false, message: error.code === "23505" ? "You've already reviewed this coffee." : "Couldn't save your review. Please try again." };
  updateTag("reviews");
  return { ok: true, message: "Thank you! Your review is up." };
}
