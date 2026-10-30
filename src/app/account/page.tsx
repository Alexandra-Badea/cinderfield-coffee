import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForms } from "@/components/auth-forms";
import { DemoAccount } from "@/components/demo-account";
import { OrdersList } from "@/components/orders-list";
import { buttonClass } from "@/components/ui/button";
import { hasSupabase } from "@/lib/config";
import { userClient } from "@/lib/supabase/clients";
import { toOrder, type OrderRow } from "@/lib/supabase/map";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default function AccountPage() {
  return (
    <div className="container-x pt-12 md:pt-16">
      <p className="eyebrow">Your account</p>
      <h1 className="mt-3 text-5xl md:text-6xl">Hello there</h1>
      <div className="mt-10">
        {hasSupabase ? (
          <Suspense fallback={<div className="h-64 animate-pulse rounded-card bg-cream" aria-hidden="true" />}>
            <LiveAccount />
          </Suspense>
        ) : (
          <DemoAccount />
        )}
      </div>
    </div>
  );
}

async function LiveAccount() {
  const supabase = await userClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return <AuthForms />;
  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("full_name, role").eq("id", auth.user.id).single(),
    supabase.from("orders").select("*, order_items(*)").neq("status", "pending").order("created_at", { ascending: false }),
  ]);
  const list = ((orders ?? []) as OrderRow[]).map(toOrder);
  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-cream p-6 shadow-soft">
        <div>
          <p className="font-display text-2xl">{profile?.full_name || auth.user.email}</p>
          <p className="text-muted">{auth.user.email}</p>
        </div>
        <div className="flex gap-2">
          {profile?.role === "admin" && <Link href="/admin" className={buttonClass("outline")}>Shop admin</Link>}
          <form action={signOut}>
            <button type="submit" className={buttonClass("ghost")}>Sign out</button>
          </form>
        </div>
      </div>
      <section>
        <h2 className="text-3xl">Your orders</h2>
        <div className="mt-5">
          {list.length ? <OrdersList orders={list} /> : <p className="text-muted">No orders yet. <Link href="/shop" className="underline underline-offset-2">Find a coffee you&apos;ll love</Link>.</p>}
        </div>
      </section>
    </div>
  );
}
