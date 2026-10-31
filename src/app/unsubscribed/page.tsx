import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { StirredCup } from "@/components/stirred-cup";
import { buttonClass } from "@/components/ui/button";

export const metadata: Metadata = { title: "Unsubscribed", robots: { index: false } };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default function UnsubscribedPage({ searchParams }: { searchParams: SP }) {
  return (
    <div className="container-x flex min-h-[64vh] flex-col items-center justify-center py-20 text-center">
      <StirredCup cold className="h-40 w-40 animate-float" />
      <Suspense fallback={<h1 className="mt-8 text-5xl">Unsubscribed</h1>}>
        <Message searchParams={searchParams} />
      </Suspense>
      <Link href="/" className={buttonClass("outline", "lg", "mt-8")}>
        Back to the shop
      </Link>
    </div>
  );
}

async function Message({ searchParams }: { searchParams: SP }) {
  const failed = Boolean((await searchParams).error);
  return failed ? (
    <>
      <h1 className="mt-8 text-5xl">That link <em>didn&apos;t work</em></h1>
      <p className="mx-auto mt-4 max-w-md text-lg text-roast">It may have been cut short by your email app. Reply to any of our emails with &ldquo;unsubscribe&rdquo; and we&apos;ll take you off the list by hand.</p>
    </>
  ) : (
    <>
      <h1 className="mt-8 text-5xl">You&apos;re <em>unsubscribed</em></h1>
      <p className="mx-auto mt-4 max-w-md text-lg text-roast">You won&apos;t get our monthly email any more. If you change your mind, you can join again at the bottom of any page.</p>
    </>
  );
}
