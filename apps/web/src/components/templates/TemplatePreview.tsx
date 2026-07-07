'use client';

import type { PortfolioTemplateMeta } from '@devfolio/shared';

const FONT_STACK: Record<PortfolioTemplateMeta['typography'], string> = {
  sans: "'Inter', system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
};

/**
 * A stylized wireframe mockup of a portfolio rendered with the template's
 * suggested palette — cheap to render (pure divs) but instantly communicates
 * each template's character. Scales with the container via `em` sizing.
 */
export function TemplatePreview({
  meta,
  className = '',
}: {
  meta: PortfolioTemplateMeta;
  className?: string;
}) {
  const { colors, radius } = meta.suggestedTheme;
  const r = radius === 'none' ? '0' : radius === 'sm' ? '0.25em' : '0.5em';
  const font = FONT_STACK[meta.typography];
  const isBrutal = meta.id === 'brutalist';
  const isRetro = meta.id === 'retro-os';
  const isDimension = meta.id === 'dimension';

  const brand =
    meta.id === 'terminal' ? (
      <span style={{ color: colors.foreground }}>
        <span style={{ color: colors.primary }}>~/</span>jordan
        <span style={{ color: colors.primary }}>▋</span>
      </span>
    ) : (
      <span
        style={{
          color: colors.foreground,
          fontStyle: meta.id === 'editorial' ? 'italic' : 'normal',
          textTransform: isBrutal ? 'uppercase' : 'none',
          fontWeight: isBrutal ? 900 : undefined,
        }}
      >
        Jordan Doe
      </span>
    );

  return (
    <div
      aria-hidden
      className={`pointer-events-none select-none overflow-hidden ${className}`}
      style={{
        backgroundColor: colors.background,
        fontFamily: font,
        aspectRatio: '4 / 3',
        backgroundImage: isRetro
          ? `radial-gradient(60% 50% at 15% 0%, ${colors.primary}52, transparent), radial-gradient(50% 45% at 90% 100%, ${colors.accent}3d, transparent)`
          : isDimension
            ? `radial-gradient(circle at 18% 28%, ${colors.foreground} 0.5px, transparent 1px), radial-gradient(circle at 72% 16%, ${colors.primary} 0.6px, transparent 1.2px), radial-gradient(circle at 44% 64%, ${colors.foreground} 0.4px, transparent 1px), radial-gradient(circle at 88% 52%, ${colors.accent} 0.6px, transparent 1.2px), radial-gradient(circle at 8% 78%, ${colors.foreground} 0.4px, transparent 1px), radial-gradient(circle at 60% 88%, ${colors.primary} 0.5px, transparent 1px)`
            : undefined,
      }}
    >
      {/* Nav strip */}
      <div
        className="flex items-center justify-between px-[8%]"
        style={{
          height: '13%',
          borderTop: meta.id === 'editorial' ? `0.2em solid ${colors.foreground}` : 'none',
          borderBottom: `1px solid ${colors.border}`,
          fontSize: '0.62em',
          fontWeight: 600,
        }}
      >
        {brand}
        <div className="flex items-center gap-[0.9em]" style={{ fontSize: '0.82em' }}>
          {(meta.id === 'terminal' ? ['./work', './about'] : ['Work', 'About']).map((l) => (
            <span key={l} style={{ color: colors.muted }}>
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div className="px-[8%] pt-[9%]">
        <div
          style={{
            color: colors.foreground,
            fontSize: '1.15em',
            fontWeight: meta.typography === 'serif' ? 550 : isBrutal ? 900 : 750,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            textTransform: isBrutal ? 'uppercase' : 'none',
            textShadow: isDimension ? `0 0 0.8em ${colors.primary}b3` : undefined,
          }}
        >
          {meta.id === 'terminal' ? '$ whoami' : 'Design engineer'}
        </div>
        <div
          className="mt-[0.6em]"
          style={{ color: colors.muted, fontSize: '0.55em', lineHeight: 1.5 }}
        >
          Building thoughtful interfaces
          <br />
          and the systems behind them.
        </div>
        <div className="mt-[0.9em] flex items-center gap-[0.5em]">
          <span
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
              borderRadius: r,
              fontSize: '0.5em',
              fontWeight: 600,
              padding: '0.5em 1.1em',
            }}
          >
            {meta.id === 'terminal' ? './contact' : 'Get in touch'}
          </span>
          <span
            style={{
              border: `1px solid ${colors.border}`,
              color: colors.muted,
              borderRadius: r,
              fontSize: '0.5em',
              padding: '0.5em 1.1em',
            }}
          >
            Projects
          </span>
        </div>
      </div>

      {/* Project cards */}
      <div className="mt-[7%] grid grid-cols-2 gap-[4%] px-[8%]">
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              backgroundColor: colors.card,
              border: isBrutal ? `2px solid ${colors.foreground}` : `1px solid ${colors.border}`,
              borderRadius: r,
              padding: '0.7em',
              boxShadow: isBrutal
                ? `0.35em 0.35em 0 ${colors.foreground}`
                : isRetro
                  ? '0 1em 2em -1em rgba(0,0,0,0.5)'
                  : undefined,
              paddingTop: isRetro ? '1.5em' : '0.7em',
              position: 'relative',
            }}
          >
            {isRetro && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '1em',
                  borderBottom: `1px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25em',
                  paddingLeft: '0.4em',
                }}
              >
                {['#ff5f57', '#febc2e', '#28c840'].map((dot) => (
                  <span
                    key={dot}
                    style={{
                      width: '0.35em',
                      height: '0.35em',
                      borderRadius: '50%',
                      backgroundColor: dot,
                    }}
                  />
                ))}
              </div>
            )}
            <div
              style={{
                backgroundColor: colors.border,
                borderRadius: r,
                height: '1.6em',
                marginBottom: '0.55em',
                opacity: 0.6,
              }}
            />
            <div
              style={{
                backgroundColor: colors.foreground,
                borderRadius: '1em',
                height: '0.3em',
                width: '70%',
                opacity: 0.85,
                marginBottom: '0.4em',
              }}
            />
            <div className="flex gap-[0.3em]">
              <span
                style={{
                  backgroundColor: `${colors.primary}26`,
                  color: colors.primary,
                  borderRadius: r,
                  fontSize: '0.42em',
                  padding: '0.2em 0.7em',
                }}
              >
                {i === 0 ? 'react' : 'node'}
              </span>
              <span
                style={{
                  backgroundColor: `${colors.accent}26`,
                  color: colors.accent,
                  borderRadius: r,
                  fontSize: '0.42em',
                  padding: '0.2em 0.7em',
                }}
              >
                ts
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
