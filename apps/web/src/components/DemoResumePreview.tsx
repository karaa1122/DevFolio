import { ResumeRenderer, buildResumeCss, buildResumeFontLink } from '@devfolio/renderer';
import type { Resume } from '@devfolio/shared';

/**
 * Server-rendered resume preview: an A4 page rendered by the real
 * ResumeRenderer, scaled down to fit its container. Styles are scoped by the
 * renderer's own class names, so multiple previews can coexist on one page.
 */
export function DemoResumePreview({
  resume,
  scale = 0.42,
}: {
  resume: Resume;
  scale?: number;
}) {
  // A4 at 96dpi ≈ 794×1123px — the same page box the print CSS targets.
  const W = 794;
  const H = 1123;
  return (
    <div
      className="pointer-events-none select-none overflow-hidden rounded-lg"
      style={{ width: W * scale, height: H * scale }}
      aria-hidden
    >
      <link rel="stylesheet" href={buildResumeFontLink(resume)} />
      <style dangerouslySetInnerHTML={{ __html: buildResumeCss(resume) }} />
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <div style={{ width: W, minHeight: H, background: '#ffffff' }}>
          <ResumeRenderer resume={resume} mode="screen" />
        </div>
      </div>
    </div>
  );
}
