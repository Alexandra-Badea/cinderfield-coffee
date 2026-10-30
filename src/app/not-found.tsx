import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <svg viewBox="0 0 160 140" className="mx-auto w-40" aria-hidden="true">
          {/* an empty cup, gone cold: no steam */}
          <ellipse cx="74" cy="122" rx="62" ry="10" fill="#2a1c15" opacity=".08" />
          <path d="M28 52h92l-8 52a18 18 0 0 1-18 16H54a18 18 0 0 1-18-16z" fill="#fbf8f3" stroke="#2a1c15" strokeWidth="4" strokeLinejoin="round" />
          <path d="M120 62h8a16 16 0 0 1 0 32h-12" fill="none" stroke="#2a1c15" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="74" cy="52" rx="46" ry="7" fill="#4a3428" />
          <path d="M62 90q12-7 24 0" fill="none" stroke="#c85a2a" strokeWidth="4" strokeLinecap="round" />
          <circle cx="60" cy="74" r="3.5" fill="#2a1c15" />
          <circle cx="88" cy="74" r="3.5" fill="#2a1c15" />
          <path d="M60 30q6-8 0-16M80 28q6-8 0-16" fill="none" stroke="#2a1c15" strokeOpacity=".15" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 7" />
        </svg>
        <p className="eyebrow mt-8">404</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">This page has gone cold</h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-roast">It may have moved, or the link has a typo. Let&apos;s get you something fresh.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className={buttonClass("primary", "lg")}>Shop coffee</Link>
          <Link href="/" className={buttonClass("outline", "lg")}>Go home</Link>
        </div>
      </div>
    </div>
  );
}
