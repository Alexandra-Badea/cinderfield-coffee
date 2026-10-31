"use client";

/** The last resort, when even the page layout fails: plain, self-contained HTML */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-GB">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#16100c", color: "#fcfbf8", fontFamily: "system-ui, sans-serif", textAlign: "center", padding: 24 }}>
        <div>
          <p style={{ color: "#ff7a2e", letterSpacing: "0.16em", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>Cinderfield Coffee Roasters</p>
          <h1 style={{ fontSize: 40, margin: "12px 0" }}>We&apos;ll be right back</h1>
          <p style={{ opacity: 0.7, maxWidth: 420 }}>Something went wrong on our side. Please try again in a moment.</p>
          <button type="button" onClick={reset} style={{ marginTop: 24, background: "#d9480f", color: "#fff", border: 0, borderRadius: 999, padding: "14px 28px", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
