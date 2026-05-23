'use client';

import { useState } from 'react';
import { renderResumeContent } from '@devfolio/renderer';
import { RichEditModal } from './RichEditModal';

interface Props {
  value: string;
  onChange: (html: string) => void;
  /** Title shown in the modal header. */
  label: string;
  placeholder?: string;
  /** Min preview height when empty. */
  emptyHint?: string;
}

/**
 * Shows a compact, click-to-edit preview of a rich-text resume field. Opens
 * a modal with the full editor when activated. Renders the sanitized HTML
 * (or legacy markdown) inline so the user sees real formatting in the form
 * without having to open the modal.
 */
export function RichEditField({
  value,
  onChange,
  label,
  placeholder,
  emptyHint = 'Click to add content',
}: Props) {
  const [open, setOpen] = useState(false);
  const isEmpty = !value || value === '<p></p>';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative w-full min-h-[88px] text-left rounded-lg border bg-slate-800/70 hover:border-violet-500/40 hover:bg-slate-800 transition-colors px-3.5 py-3 cursor-text ${
          isEmpty ? 'border-dashed border-slate-700' : 'border-slate-700'
        }`}
      >
        {isEmpty ? (
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <PencilIcon />
            <span>{emptyHint}</span>
          </div>
        ) : (
          <div className="resume-field-preview text-sm text-slate-200">
            {renderResumeContent(value, { as: 'fragment' })}
          </div>
        )}

        <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] uppercase tracking-wider font-semibold text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded">
          Edit
        </span>
      </button>

      <RichEditModal
        open={open}
        title={label}
        initialValue={value}
        placeholder={placeholder}
        onSave={onChange}
        onClose={() => setOpen(false)}
      />

      <style>{`
        .resume-field-preview p { margin: 0; }
        .resume-field-preview p + p { margin-top: 0.5em; }
        .resume-field-preview strong { font-weight: 600; color: rgb(241, 245, 249); }
        .resume-field-preview em { font-style: italic; }
        .resume-field-preview u { text-decoration: underline; text-underline-offset: 2px; }
        .resume-field-preview s { text-decoration: line-through; }
        .resume-field-preview a {
          color: rgb(167, 139, 250);
          text-decoration: underline;
        }
        .resume-field-preview ul, .resume-field-preview ol {
          padding-left: 1.2em;
          margin: 0.3em 0;
        }
        .resume-field-preview ul li { list-style: disc; }
        .resume-field-preview ol li { list-style: decimal; }
        .resume-field-preview ul li::marker,
        .resume-field-preview ol li::marker { color: rgb(167, 139, 250); }
        .resume-field-preview .text-left   { text-align: left; }
        .resume-field-preview .text-center { text-align: center; }
        .resume-field-preview .text-right  { text-align: right; }
        .resume-field-preview .text-justify { text-align: justify; }
      `}</style>
    </>
  );
}

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}
