'use client';

import React, { useRef, useEffect, useCallback } from 'react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

type ToolbarButtonProps = {
  title: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function TB({ title, active, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      className={`w-7 h-7 flex items-center justify-center rounded text-xs transition-colors ${
        active
          ? 'bg-violet-100 text-violet-700'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

const Sep = () => <div className="w-px h-4 bg-slate-200 mx-0.5" />;

export function RichTextArea({ value, onChange, placeholder, minHeight = 80 }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef(value);

  // Sync external value → DOM only when it actually changes from outside
  useEffect(() => {
    if (!editorRef.current) return;
    if (value === lastValueRef.current) return;
    // Only update DOM if the editor doesn't have focus (avoid cursor jump)
    if (document.activeElement !== editorRef.current) {
      editorRef.current.innerHTML = value || '';
      lastValueRef.current = value;
    }
  }, [value]);

  const emit = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    lastValueRef.current = html;
    onChange(html);
  }, [onChange]);

  const exec = useCallback((cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    emit();
  }, [emit]);

  const handleInput = useCallback(() => emit(), [emit]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-slate-50 border-b border-slate-200 flex-wrap">
        <TB title="Bold (Ctrl+B)" onClick={() => exec('bold')}>
          <span className="font-bold text-sm">B</span>
        </TB>
        <TB title="Italic (Ctrl+I)" onClick={() => exec('italic')}>
          <span className="italic text-sm font-serif">I</span>
        </TB>
        <TB title="Underline (Ctrl+U)" onClick={() => exec('underline')}>
          <span className="underline text-sm">U</span>
        </TB>
        <TB title="Strikethrough" onClick={() => exec('strikeThrough')}>
          <span className="line-through text-sm">S</span>
        </TB>

        <Sep />

        <TB title="Align left" onClick={() => exec('justifyLeft')}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="2" width="14" height="1.5" rx=".75" />
            <rect x="1" y="5.5" width="9" height="1.5" rx=".75" />
            <rect x="1" y="9" width="14" height="1.5" rx=".75" />
            <rect x="1" y="12.5" width="9" height="1.5" rx=".75" />
          </svg>
        </TB>
        <TB title="Align center" onClick={() => exec('justifyCenter')}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="2" width="14" height="1.5" rx=".75" />
            <rect x="3.5" y="5.5" width="9" height="1.5" rx=".75" />
            <rect x="1" y="9" width="14" height="1.5" rx=".75" />
            <rect x="3.5" y="12.5" width="9" height="1.5" rx=".75" />
          </svg>
        </TB>
        <TB title="Align right" onClick={() => exec('justifyRight')}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="2" width="14" height="1.5" rx=".75" />
            <rect x="6" y="5.5" width="9" height="1.5" rx=".75" />
            <rect x="1" y="9" width="14" height="1.5" rx=".75" />
            <rect x="6" y="12.5" width="9" height="1.5" rx=".75" />
          </svg>
        </TB>
        <TB title="Justify" onClick={() => exec('justifyFull')}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="2" width="14" height="1.5" rx=".75" />
            <rect x="1" y="5.5" width="14" height="1.5" rx=".75" />
            <rect x="1" y="9" width="14" height="1.5" rx=".75" />
            <rect x="1" y="12.5" width="14" height="1.5" rx=".75" />
          </svg>
        </TB>

        <Sep />

        <TB title="Bullet list" onClick={() => exec('insertUnorderedList')}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="2.5" cy="3.5" r="1.5" />
            <rect x="5" y="2.5" width="10" height="1.5" rx=".75" />
            <circle cx="2.5" cy="8" r="1.5" />
            <rect x="5" y="7" width="10" height="1.5" rx=".75" />
            <circle cx="2.5" cy="12.5" r="1.5" />
            <rect x="5" y="11.5" width="10" height="1.5" rx=".75" />
          </svg>
        </TB>
        <TB title="Numbered list" onClick={() => exec('insertOrderedList')}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
            <text x="1" y="5" fontSize="5" fontFamily="sans-serif">1.</text>
            <rect x="6" y="2.5" width="9" height="1.5" rx=".75" />
            <text x="1" y="9.5" fontSize="5" fontFamily="sans-serif">2.</text>
            <rect x="6" y="7" width="9" height="1.5" rx=".75" />
            <text x="1" y="14" fontSize="5" fontFamily="sans-serif">3.</text>
            <rect x="6" y="11.5" width="9" height="1.5" rx=".75" />
          </svg>
        </TB>

        <Sep />

        <TB title="Clear formatting" onClick={() => exec('removeFormat')}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 3l10 10M5 2h8l-4 6h3l-5 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </TB>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={() => {
          // Set initial content if empty
          if (editorRef.current && !editorRef.current.innerHTML && value) {
            editorRef.current.innerHTML = value;
          }
        }}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className={`
          px-3 py-2.5 text-sm text-slate-800 outline-none leading-relaxed
          [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4
          [&_li]:my-0.5 [&_b]:font-semibold [&_strong]:font-semibold
          empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none
        `}
      />
    </div>
  );
}
