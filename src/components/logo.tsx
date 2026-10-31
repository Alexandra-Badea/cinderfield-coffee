import clsx from "clsx";

/** An ember-coloured coffee bean with a glowing seam: roasting, in one mark */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <circle cx="20" cy="20" r="20" fill="#c85a2a" />
      <ellipse cx="20" cy="20" rx="9.5" ry="13" transform="rotate(28 20 20)" fill="#fbf8f3" />
      <path d="M15.2 9.6c4.6 3.8 1.4 9.4 4.6 11.6 3 2 1.6 6.8-1.6 9.4" fill="none" stroke="#c85a2a" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <Mark className="h-8 w-8 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className={clsx("font-display text-[1.3rem] font-semibold tracking-[-0.03em]", light ? "text-cream" : "text-espresso")}>Cinderfield</span>
        <span className={clsx("mt-0.5 text-[0.55rem] font-semibold tracking-[0.28em]", light ? "text-cream/60" : "text-muted")}>COFFEE ROASTERS</span>
      </span>
    </span>
  );
}
