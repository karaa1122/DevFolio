import React from 'react';
import {
  baseCraftCss,
  Css,
  FONT_FAMILY,
  FooterCredit,
  getBrandLabel,
  RenderedSections,
  visibleSections,
  type TemplateProps,
} from './_chrome';

/**
 * Dimension — deep-space chrome with real 3D. A dependency-free canvas
 * starfield (perspective-projected points) streams behind the content while
 * cards tilt into view with scroll-driven 3D transforms and tilt on hover.
 * Skips all motion under prefers-reduced-motion.
 */
export function DimensionTemplate({ portfolio, isExport = false }: TemplateProps) {
  const { theme } = portfolio;
  const orderedSections = visibleSections(portfolio);
  const brandLabel = getBrandLabel(portfolio, orderedSections);

  // Inline, self-contained starfield: ~1.5k chars, no libraries. Runs on the
  // public page, the editor preview, and inside the static ZIP export alike.
  const warpScript = `
(function () {
  var c = document.getElementById('pf-warp');
  if (!c || c.dataset.init) return;
  c.dataset.init = '1';
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var x = c.getContext('2d');
  if (!x) return;
  var W, H, N = 240, stars = [];
  function resize() { W = c.width = innerWidth; H = c.height = innerHeight; }
  addEventListener('resize', resize);
  resize();
  for (var i = 0; i < N; i++) stars.push([Math.random() * W - W / 2, Math.random() * H - H / 2, Math.random() * W]);
  if (window.__pfWarpRaf) cancelAnimationFrame(window.__pfWarpRaf);
  (function tick() {
    x.clearRect(0, 0, W, H);
    for (var i = 0; i < N; i++) {
      var s = stars[i];
      s[2] -= 1.6;
      if (s[2] < 1) { s[0] = Math.random() * W - W / 2; s[1] = Math.random() * H - H / 2; s[2] = W; }
      var k = 130 / s[2], px = s[0] * k + W / 2, py = s[1] * k + H / 2;
      if (px >= 0 && px < W && py >= 0 && py < H) {
        var d = 1 - s[2] / W;
        x.globalAlpha = d * 0.9;
        x.fillStyle = i % 7 === 0 ? '${theme.colors.accent}' : '${theme.colors.primary}';
        x.fillRect(px, py, d * 2.4 + 0.3, d * 2.4 + 0.3);
      }
    }
    x.globalAlpha = 1;
    window.__pfWarpRaf = requestAnimationFrame(tick);
  })();
})();`;

  return (
    <div
      style={{
        fontFamily: FONT_FAMILY[theme.font] ?? "'Inter', sans-serif",
        backgroundColor: theme.colors.background,
        color: theme.colors.foreground,
        minHeight: '100vh',
        position: 'relative',
      }}
      data-portfolio-id={portfolio.id}
    >
      <Css css={baseCraftCss(theme, isExport)} />
      <Css css={`
        /* The starfield sits behind everything; content stacks above it */
        [data-portfolio-id] #pf-warp {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
        }
        [data-portfolio-id] nav,
        [data-portfolio-id] section,
        [data-portfolio-id] footer { position: relative; z-index: 1; }
        /* Let the space show through — sections keep only a translucent wash */
        [data-portfolio-id] section {
          background-color: color-mix(in srgb, ${theme.colors.background} 62%, transparent) !important;
        }
        /* Soft glow on the big headline */
        [data-portfolio-id] h1 {
          text-shadow: 0 0 24px color-mix(in srgb, var(--pf-primary) 55%, transparent),
                       0 0 64px color-mix(in srgb, var(--pf-accent) 30%, transparent);
        }
        /* 3D tilt-in on scroll — progressive enhancement */
        @supports (animation-timeline: view()) {
          @media (prefers-reduced-motion: no-preference) {
            [data-portfolio-id] .pf-card,
            [data-portfolio-id] .pf-project-card {
              animation: pf-tilt-in linear both;
              animation-timeline: view();
              animation-range: entry 0% cover 32%;
            }
          }
        }
        @keyframes pf-tilt-in {
          from { opacity: 0; transform: perspective(1100px) rotateX(26deg) translateY(52px) scale(0.94); }
          to { opacity: 1; transform: none; }
        }
        /* 3D tilt + glow on hover */
        [data-portfolio-id] .pf-project-card:hover,
        [data-portfolio-id] .pf-card:hover {
          transform: perspective(900px) rotateX(4deg) rotateY(-5deg) translateY(-6px) !important;
          box-shadow: 0 0 0 1px color-mix(in srgb, var(--pf-primary) 55%, transparent),
                      0 24px 60px -20px color-mix(in srgb, var(--pf-primary) 45%, #000000) !important;
        }
      `} />

      <canvas id="pf-warp" aria-hidden="true" />
      <script dangerouslySetInnerHTML={{ __html: warpScript }} />

      {/* Navigation */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: `${theme.colors.background}b3`,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${theme.colors.border}`,
          padding: '0.9rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '2rem',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.55rem',
            minWidth: 0,
            fontWeight: '700',
            fontSize: '1rem',
            letterSpacing: '0.01em',
            color: theme.colors.foreground,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <span
            style={{
              width: '0.6rem',
              height: '0.6rem',
              flexShrink: 0,
              transform: 'rotate(45deg)',
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              boxShadow: `0 0 14px ${theme.colors.primary}`,
            }}
          />
          {brandLabel}
        </span>
        <div className="pf-nav-links" style={{ display: 'flex', gap: '1.75rem', flexShrink: 0 }}>
          {orderedSections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="pf-nav-link"
              style={{
                color: theme.colors.muted,
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: '500',
                textTransform: 'capitalize',
                transition: 'color 0.2s',
              }}
            >
              {s.type}
            </a>
          ))}
        </div>
      </nav>

      <RenderedSections sections={orderedSections} theme={theme} />

      {/* Footer */}
      {!isExport && (
        <footer
          style={{
            borderTop: `1px solid ${theme.colors.border}`,
            padding: '2rem',
            textAlign: 'center',
            color: theme.colors.muted,
            fontSize: '0.875rem',
            backgroundColor: `${theme.colors.background}b3`,
          }}
        >
          <FooterCredit color={theme.colors.primary} />
        </footer>
      )}
    </div>
  );
}
