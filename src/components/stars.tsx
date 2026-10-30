import clsx from "clsx";

export function Stars({ rating, size = "sm", className }: { rating: number; size?: "sm" | "md"; className?: string }) {
  const px = size === "sm" ? 14 : 18;
  return (
    <span className={clsx("inline-flex items-center gap-0.5", className)} role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, rating - n + 1));
        return (
          <svg key={n} width={px} height={px} viewBox="0 0 20 20" aria-hidden="true">
            <defs>
              <linearGradient id={`star-${n}-${Math.round(fill * 10)}`}>
                <stop offset={fill} stopColor="#c85a2a" />
                <stop offset={fill} stopColor="#c85a2a" stopOpacity=".2" />
              </linearGradient>
            </defs>
            <path d="M10 1.6l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.9l-5.2 2.8 1-5.8L1.5 7.8l5.9-.8z" fill={`url(#star-${n}-${Math.round(fill * 10)})`} />
          </svg>
        );
      })}
    </span>
  );
}
