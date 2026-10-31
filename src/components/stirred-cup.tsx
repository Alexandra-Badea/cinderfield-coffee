/**
 * A cup of coffee seen from above: the latte art turns slowly while a spoon stirs and ripples spread.
 * Drawn in SVG with CSS animation, so it costs nothing to load and stills itself for reduced motion.
 */
export function StirredCup({ className, cold = false }: { className?: string; cold?: boolean }) {
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="cup-coffee" cx="45%" cy="40%" r="60%">
          <stop offset="0" stopColor={cold ? "#6b4a37" : "#7a4a2b"} />
          <stop offset=".6" stopColor={cold ? "#3f2a1f" : "#4a2a17"} />
          <stop offset="1" stopColor="#2a170d" />
        </radialGradient>
        <radialGradient id="cup-crema" cx="50%" cy="50%" r="50%">
          <stop offset=".72" stopColor="#c58a55" stopOpacity="0" />
          <stop offset=".9" stopColor="#d9a06b" stopOpacity=".75" />
          <stop offset="1" stopColor="#b9773f" stopOpacity=".9" />
        </radialGradient>
        <filter id="cup-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#16100c" floodOpacity=".28" />
        </filter>
      </defs>
      {/* saucer */}
      <circle cx="120" cy="120" r="112" fill="#fcfbf8" filter="url(#cup-shadow)" />
      <circle cx="120" cy="120" r="96" fill="none" stroke="#16100c" strokeOpacity=".06" strokeWidth="2" />
      {/* handle */}
      <rect x="186" y="104" width="44" height="32" rx="16" fill="#f4f1ec" stroke="#16100c" strokeOpacity=".08" />
      {/* cup */}
      <circle cx="120" cy="120" r="78" fill="#f4f1ec" />
      <circle cx="120" cy="120" r="66" fill="url(#cup-coffee)" />
      <circle cx="120" cy="120" r="66" fill="url(#cup-crema)" />
      {/* ripples */}
      <g fill="none" stroke="#e8c39b" strokeWidth="1.4">
        {[0, 1, 2].map((i) => (
          <circle key={i} cx="120" cy="120" r="10" className="origin-center [animation:cup-ripple_3.6s_ease-out_infinite] [transform-box:fill-box]" style={{ animationDelay: `${i * 1.2}s` }} />
        ))}
      </g>
      {/* latte art: a rosetta leaf, turning slowly */}
      <g className="origin-[120px_120px] [animation:cup-turn_14s_linear_infinite]">
        <path d="M120 72c20 14 30 34 22 54-6 15-16 22-22 30-6-8-16-15-22-30-8-20 2-40 22-54z" fill="#f6e3cc" opacity=".92" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${104 + i * 0.5} ${88 + i * 11}q16 ${6 - i} 32 0`} stroke="#8a5a36" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".55" />
        ))}
        <path d="M120 156v18" stroke="#f6e3cc" strokeWidth="3" strokeLinecap="round" opacity=".9" />
      </g>
      {/* the spoon, stirring */}
      <g className="origin-[120px_120px] [animation:cup-stir_2.8s_cubic-bezier(.45,.05,.55,.95)_infinite_alternate]">
        <ellipse cx="146" cy="120" rx="11" ry="7" fill="#d9d4cc" stroke="#16100c" strokeOpacity=".15" />
        <rect x="152" y="117" width="78" height="6" rx="3" fill="#cfc9c0" />
        <rect x="152" y="117" width="78" height="2" rx="1" fill="#fff" opacity=".6" />
      </g>
    </svg>
  );
}
