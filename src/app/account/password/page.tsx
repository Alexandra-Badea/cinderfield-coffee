import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PasswordForm } from "@/components/account-forms";
import { hasSupabase } from "@/lib/config";
import { userClient } from "@/lib/supabase/clients";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default function PasswordPage() {
  return (
    <div className="container-x pt-12 md:pt-16">
      <p className="eyebrow">Your account</p>
      <h1 className="mt-3 text-5xl md:text-6xl">Choose a new password</h1>
      <div className="mt-10">
        <Suspense fallback={<div className="mx-auto h-72 max-w-md animate-pulse rounded-card bg-cream" aria-hidden="true" />}>
          <Content />
        </Suspense>
      </div>
    </div>
  );
}

async function Content() {
  if (!hasSupabase) return <p className="text-roast">Customer accounts aren&apos;t switched on for this store yet.</p>;
  const { data } = await (await userClient()).auth.getUser();
  if (!data.user)
    return (
      <p className="max-w-xl text-lg text-roast">
        That link has expired or has already been used. You can ask for a new one from the{" "}
        <Link href="/account" className="font-semibold underline decoration-line underline-offset-2 hover:text-ember">sign-in page</Link>: choose &ldquo;Forgot it?&rdquo;.
      </p>
    );
  return <PasswordForm email={data.user.email ?? ""} />;
}
