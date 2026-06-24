interface LogoProps {
  /** Sizes the mark, e.g. "h-7 w-7". */
  className?: string;
  /** Render the "DevFolio" wordmark next to the mark. */
  withWordmark?: boolean;
  wordmarkClassName?: string;
}

/**
 * DevFolio brand mark — a rounded "app tile" carrying the aurora gradient
 * with an ink-colored `>_` terminal-prompt glyph. Reads clearly from 16px up.
 */
export function LogoMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="df-aurora" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#BEF264" />
          <stop offset="0.5" stopColor="#34D399" />
          <stop offset="1" stopColor="#67E8F9" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#df-aurora)" />
      {/* subtle top sheen */}
      <rect width="40" height="20" rx="11" fill="#ffffff" fillOpacity="0.12" />
      {/* terminal prompt  >_ */}
      <path
        d="M13 13.5 L20.5 20 L13 26.5"
        stroke="#0A0A0C"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M23 26.5 H30" stroke="#0A0A0C" strokeWidth="3.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({
  className = 'h-7 w-7',
  withWordmark = false,
  wordmarkClassName = 'font-display text-lg font-bold tracking-tight text-content',
}: LogoProps) {
  if (!withWordmark) return <LogoMark className={className} />;
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark className={className} />
      <span className={wordmarkClassName}>DevFolio</span>
    </span>
  );
}
