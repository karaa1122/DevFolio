'use client';

import { useResumeStore } from '@/store/resume.store';
import type { ResumeHeaderSection } from '@devfolio/shared';
import { Field, TextInput, TwoCol, Toggle } from './primitives';

interface Props {
  section: ResumeHeaderSection;
}

export function HeaderForm({ section }: Props) {
  const updateSectionData = useResumeStore((s) => s.updateSectionData);
  const d = section.data;
  const socials = d.socials ?? {};

  const patch = (data: Partial<ResumeHeaderSection['data']>) =>
    updateSectionData(section.id, data);

  return (
    <div className="space-y-4">
      <Field label="Full name">
        <TextInput value={d.name} onChange={(v) => patch({ name: v })} placeholder="Karaa Kamaran" />
      </Field>

      <Field label="Headline / current role">
        <TextInput
          value={d.title ?? ''}
          onChange={(v) => patch({ title: v })}
          placeholder="Senior Backend Engineer"
        />
      </Field>

      <TwoCol>
        <Field label="Email">
          <TextInput
            value={d.email ?? ''}
            onChange={(v) => patch({ email: v })}
            placeholder="you@example.com"
            type="email"
          />
        </Field>
        <Field label="Phone">
          <TextInput
            value={d.phone ?? ''}
            onChange={(v) => patch({ phone: v })}
            placeholder="+964 750 000 0000"
          />
        </Field>
      </TwoCol>

      <TwoCol>
        <Field label="Location">
          <TextInput
            value={d.location ?? ''}
            onChange={(v) => patch({ location: v })}
            placeholder="City, Country"
          />
        </Field>
        <Field label="Website">
          <TextInput
            value={d.website ?? ''}
            onChange={(v) => patch({ website: v })}
            placeholder="https://you.dev"
          />
        </Field>
      </TwoCol>

      <div className="pt-2 border-t border-slate-800 space-y-3">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
          Profiles
        </div>
        <Field label="GitHub">
          <TextInput
            value={socials.github ?? ''}
            onChange={(v) => patch({ socials: { ...socials, github: v } })}
            placeholder="github.com/yourusername"
          />
        </Field>
        <Field label="LinkedIn">
          <TextInput
            value={socials.linkedin ?? ''}
            onChange={(v) => patch({ socials: { ...socials, linkedin: v } })}
            placeholder="linkedin.com/in/yourusername"
          />
        </Field>
        <TwoCol>
          <Field label="Twitter / X">
            <TextInput
              value={socials.twitter ?? ''}
              onChange={(v) => patch({ socials: { ...socials, twitter: v } })}
              placeholder="x.com/yourusername"
            />
          </Field>
          <Field label="dev.to">
            <TextInput
              value={socials.devto ?? ''}
              onChange={(v) => patch({ socials: { ...socials, devto: v } })}
              placeholder="dev.to/yourusername"
            />
          </Field>
        </TwoCol>
      </div>

      <div className="pt-2 border-t border-slate-800">
        <Toggle
          checked={d.showPhoto}
          onChange={(v) => patch({ showPhoto: v })}
          label="Show photo (some templates)"
        />
      </div>
    </div>
  );
}
