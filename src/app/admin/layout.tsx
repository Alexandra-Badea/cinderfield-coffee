import type { Metadata } from "next";
import { Info } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { hasSupabase } from "@/lib/config";

export const metadata: Metadata = { title: { default: "Shop admin", template: "%s | Shop admin" }, robots: { index: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-x pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Behind the counter</p>
          <h1 className="mt-2 text-4xl md:text-5xl">Shop admin</h1>
        </div>
      </div>
      {!hasSupabase && (
        <p className="mt-6 flex gap-3 rounded-2xl bg-sand/70 p-4 text-sm text-roast">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-ember" aria-hidden="true" />
          <span>
            Preview admin: there&apos;s no database connected, so anyone can look around. The orders are a generated month of sales plus any orders placed from this browser, and changes are saved in this browser only. With Supabase connected, the admin is locked to admin accounts.
          </span>
        </p>
      )}
      <div className="mt-8 grid gap-8 lg:grid-cols-[210px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <AdminNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
