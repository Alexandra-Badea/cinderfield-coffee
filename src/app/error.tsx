"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { StirredCup } from "@/components/stirred-cup";
import { buttonClass } from "@/components/ui/button";

/** When a page fails to load: say so plainly and offer to try again */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <StirredCup className="h-44 w-44 animate-float sm:h-56 sm:w-56" />
      <p className="eyebrow mt-8">Something went wrong</p>
      <h1 className="mt-3 text-5xl sm:text-6xl">
        That one <em>boiled over</em>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-lg text-roast">
        This page didn&apos;t load properly. It&apos;s usually a blip: try again, and if it keeps happening, let us know.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className={buttonClass("primary", "lg")}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Try again
        </button>
        <Link href="/" className={buttonClass("outline", "lg")}>
          Go home
        </Link>
      </div>
      {error.digest && <p className="mt-8 text-xs text-muted">Reference: {error.digest}</p>}
    </div>
  );
}
