/** The shared layout for plain text pages: delivery, privacy, terms */
export function InfoPage({ eyebrow, title, intro, updated, children }: { eyebrow: string; title: string; intro: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="container-x pb-8 pt-12 md:pt-20">
      <header className="max-w-3xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 text-[2.6rem] leading-[1.05] sm:text-6xl">{title}</h1>
        <p className="mt-5 text-lg text-roast">{intro}</p>
        {updated && <p className="mt-3 text-sm text-muted">Last updated {updated}</p>}
      </header>
      <div className="prose-cf mt-4">{children}</div>
    </div>
  );
}
