import type { Product } from "@/lib/types";

type Art = Pick<Product, "slug" | "name" | "origin" | "roastLevel" | "art" | "decaf">;

/** Splits a coffee name onto at most two lines, breaking at the space nearest the middle */
function twoLines(name: string): string[] {
  if (name.length <= 11 || !name.includes(" ")) return [name];
  const mid = name.length / 2;
  let best = -1;
  for (let i = 0; i < name.length; i++) if (name[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  return [name.slice(0, best), name.slice(best + 1)];
}

function Pattern({ art, id }: { art: Art["art"]; id: string }) {
  const { accent, ink, pattern } = art;
  switch (pattern) {
    case "waves":
      return (
        <g fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round">
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M30 ${150 + i * 17} q18 -12 36 0 t36 0 t36 0 t36 0 t36 0`} opacity={1 - i * 0.18} />
          ))}
        </g>
      );
    case "hills":
      return (
        <g>
          <path d="M28 214 L28 176 Q70 140 112 168 T212 150 L212 214 Z" fill={accent} opacity=".35" />
          <path d="M28 214 L28 190 Q86 158 140 186 T212 176 L212 214 Z" fill={accent} opacity=".7" />
          <circle cx="170" cy="152" r="11" fill={accent} />
        </g>
      );
    case "sun":
      return (
        <g>
          <circle cx="120" cy="200" r="46" fill={accent} opacity=".9" />
          {Array.from({ length: 9 }, (_, i) => {
            const a = Math.PI + (i * Math.PI) / 8;
            return <path key={i} d={`M${120 + Math.cos(a) * 56} ${200 + Math.sin(a) * 56}L${120 + Math.cos(a) * 72} ${200 + Math.sin(a) * 72}`} stroke={accent} strokeWidth="5" strokeLinecap="round" />;
          })}
        </g>
      );
    case "dots":
      return (
        <g fill={accent}>
          {Array.from({ length: 30 }, (_, i) => (
            <circle key={i} cx={40 + (i % 6) * 32 + (Math.floor(i / 6) % 2) * 16} cy={142 + Math.floor(i / 6) * 15} r={4.2} opacity={0.35 + (i % 3) * 0.25} />
          ))}
        </g>
      );
    case "stripes":
      return (
        <g stroke={accent} strokeWidth="9" opacity=".75">
          {Array.from({ length: 10 }, (_, i) => (
            <path key={i} d={`M${i * 26 - 20} 220 L${i * 26 + 40} 130`} />
          ))}
        </g>
      );
    case "moon":
      return (
        <g>
          <circle cx="150" cy="170" r="26" fill={accent} />
          <circle cx="162" cy="162" r="23" fill={`url(#bg-${id})`} />
          {[
            [62, 150], [92, 182], [74, 202], [190, 200], [118, 146],
          ].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y - 6}l1.8 4.2 4.2 1.8-4.2 1.8-1.8 4.2-1.8-4.2-4.2-1.8 4.2-1.8z`} fill={accent} />
          ))}
          <path d="M28 214 Q120 196 212 214" stroke={ink} strokeOpacity=".15" strokeWidth="2" fill="none" />
        </g>
      );
  }
}

/** A coffee bag, drawn in SVG from the product's colours. Decorative: the product name is always in the page text too. */
export function BagArt({ product, className }: { product: Art; className?: string }) {
  const { art } = product;
  const id = product.slug;
  const lines = twoLines(product.name);
  const top = lines.length === 2 ? 238 : 252;
  return (
    <svg viewBox="0 0 240 340" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`shade-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".16" />
          <stop offset=".12" stopColor="#000" stopOpacity="0" />
          <stop offset=".86" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".2" />
        </linearGradient>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={art.label} />
          <stop offset="1" stopColor={art.label} />
        </linearGradient>
        {/* the pattern stays in the top of the label, above the name */}
        <clipPath id={`label-${id}`}>
          <path d="M40 120 H200 A12 12 0 0 1 212 132 V216 H28 V132 A12 12 0 0 1 40 120 Z" />
        </clipPath>
      </defs>
      {/* shadow on the ground */}
      <ellipse cx="120" cy="330" rx="92" ry="8" fill="#2a1c15" opacity=".14" />
      {/* bag body with a crimped top */}
      <path
        d="M16 44 L22 36 L28 44 L34 36 L40 44 L46 36 L52 44 L58 36 L64 44 L70 36 L76 44 L82 36 L88 44 L94 36 L100 44 L106 36 L112 44 L118 36 L124 44 L130 36 L136 44 L142 36 L148 44 L154 36 L160 44 L166 36 L172 44 L178 36 L184 44 L190 36 L196 44 L202 36 L208 44 L214 36 L224 44 L228 318 Q228 326 220 326 L20 326 Q12 326 12 318 Z"
        fill={art.bag}
      />
      <path d="M12 44 H228 L228 318 Q228 326 220 326 L20 326 Q12 326 12 318 Z" fill={`url(#shade-${id})`} />
      {/* folded top and tin tie */}
      <path d="M14 58 H226 V84 H14 Z" fill="#000" opacity=".08" />
      <rect x="10" y="66" width="220" height="9" rx="4.5" fill={art.ink} opacity=".85" />
      {/* label */}
      <rect x="28" y="120" width="184" height="190" rx="12" fill={art.label} />
      <g clipPath={`url(#label-${id})`}>
        <Pattern art={art} id={id} />
      </g>
      <text x="120" y="104" textAnchor="middle" fill={art.ink} opacity=".75" style={{ font: "600 10px var(--font-sans), sans-serif", letterSpacing: "3px" }}>
        CINDERFIELD
      </text>
      {lines.map((l, i) => (
        <text key={i} x="120" y={top + i * 22} textAnchor="middle" fill={art.ink} style={{ font: "500 21px var(--font-display), Georgia, serif" }}>
          {l}
        </text>
      ))}
      <text x="120" y={top + lines.length * 22 - 2} textAnchor="middle" fill={art.ink} opacity=".7" style={{ font: "500 9.5px var(--font-sans), sans-serif", letterSpacing: "1.5px" }}>
        {(product.decaf ? "DECAF · " : "") + product.origin.toUpperCase()}
      </text>
      {/* roast level */}
      <g transform="translate(83 296)">
        {[1, 2, 3, 4, 5].map((n) => (
          <circle key={n} cx={(n - 1) * 18.5} cy="0" r="4.5" fill={n <= product.roastLevel ? art.ink : "none"} stroke={art.ink} strokeWidth="1.5" opacity=".8" />
        ))}
      </g>
    </svg>
  );
}
