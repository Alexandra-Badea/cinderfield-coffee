import { AuthForms } from "@/components/auth-forms";
import type { AdminData } from "@/lib/admin";

/** What non-admins see instead of the admin pages */
export function AdminGate({ data }: { data: Extract<AdminData, { ok: false }> }) {
  if (data.reason === "signin")
    return (
      <div>
        <p className="mb-6 text-lg text-roast">Please sign in with an admin account.</p>
        <AuthForms next="/admin" />
      </div>
    );
  return (
    <div className="rounded-card bg-cream p-10 text-center shadow-soft">
      <p className="font-display text-2xl">This area is for the shop team</p>
      <p className="mt-2 text-muted">Your account doesn&apos;t have admin access. An existing admin can give it to you in Supabase.</p>
    </div>
  );
}
