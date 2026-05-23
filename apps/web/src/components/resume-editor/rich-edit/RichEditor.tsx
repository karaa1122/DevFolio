'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useMemo, useRef } from 'react';
import { markdownToHtml, isResumeHtml } from '@devfolio/renderer';

export interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** When true, enables block-level formatting (lists, alignment). */
  block?: boolean;
  autoFocus?: boolean;
  /** Minimum editor body height in px. */
  minHeight?: number;
}

/**
 * Tiptap-backed rich text editor. Stores its value as HTML so that:
 *   • The renderer can sanitize + dangerouslySetInnerHTML it into the resume.
 *   • Legacy markdown content is migrated transparently on first edit via
 *     `markdownToHtml` — we never overwrite the DB until the user commits.
 *
 * Two modes:
 *   - `block` (default): paragraphs + lists + alignment. Used for prose fields.
 *   - inline (`block={false}`): no <p> wrapping, no list/alignment buttons.
 *     Used inside bullet rows where the parent already provides the <li>.
 */
export function RichEditor({
  value,
  onChange,
  placeholder,
  block = true,
  autoFocus,
  minHeight = 120,
}: RichEditorProps) {
  // Migrate markdown → HTML once at mount. After that, the editor's own HTML
  // round-trips on every keystroke, so we never need to re-detect.
  const initialContent = useMemo(() => {
    if (!value) return '';
    return isResumeHtml(value) ? value : markdownToHtml(value);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- value is the seed; ignore later changes

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // We don't ship heading/code blocks in resumes — keep the schema tight.
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      ...(block
        ? [
            TextAlign.configure({
              types: ['paragraph'],
              defaultAlignment: 'left',
            }),
          ]
        : []),
      Placeholder.configure({
        placeholder: placeholder ?? 'Start typing…',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: initialContent,
    autofocus: autoFocus ? 'end' : false,
    immediatelyRender: false, // Next.js — avoids hydration mismatch
    editorProps: {
      attributes: {
        class: 'rich-prose focus:outline-none',
        spellcheck: 'true',
        style: `min-height: ${minHeight}px;`,
      },
    },
    onUpdate: ({ editor }) => {
      let html = editor.getHTML();
      // Tiptap emits `<p></p>` for an empty doc — normalize to '' so the parent
      // can treat the field as cleared (renderer skips empty bodies).
      if (html === '<p></p>') {
        onChange('');
        return;
      }
      // Inline mode (bullets): strip the auto-wrapping <p> so the renderer
      // doesn't end up with <li><p>text</p></li>. Only strips if the doc is
      // exactly one paragraph with no block siblings.
      if (!block) {
        const match = html.match(/^<p(?:\s+[^>]*)?>([\s\S]*)<\/p>$/);
        if (match && !match[1].includes('</p>')) {
          html = match[1];
        }
      }
      onChange(html);
    },
  });

  // Keep the editor in sync if the parent updates the value externally
  // (e.g. undo/redo from the resume store).
  const lastValueRef = useRef(value);
  useEffect(() => {
    if (!editor) return;
    if (value === lastValueRef.current) return;
    lastValueRef.current = value;
    const current = editor.getHTML();
    const next = isResumeHtml(value) ? value : markdownToHtml(value);
    if (current === next) return;
    editor.commands.setContent(next || '', { emitUpdate: false });
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="rich-editor flex flex-col">
      <RichToolbar editor={editor} block={block} />
      <div className="flex-1 overflow-y-auto px-4 py-3 bg-slate-900/50">
        <EditorContent editor={editor} />
      </div>
      <RichEditorStyles />
    </div>
  );
}

// ─── Toolbar ──────────────────────────────────────────────────────────────

function RichToolbar({ editor, block }: { editor: Editor; block: boolean }) {
  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-slate-800 bg-slate-950/70 flex-wrap">
      <ToolbarGroup>
        <ToolbarButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        >
          <strong className="text-sm">B</strong>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        >
          <em className="text-sm font-serif">I</em>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline (Ctrl+U)"
        >
          <span className="text-sm underline">U</span>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <span className="text-sm line-through">S</span>
        </ToolbarButton>
      </ToolbarGroup>

      {block && (
        <>
          <Divider />
          <ToolbarGroup>
            <ToolbarButton
              active={editor.isActive('bulletList')}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bulleted list"
            >
              <ListIcon />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive('orderedList')}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered list"
            >
              <OrderedListIcon />
            </ToolbarButton>
          </ToolbarGroup>
        </>
      )}

      <Divider />
      <ToolbarGroup>
        <ToolbarButton
          active={editor.isActive('link')}
          onClick={() => promptForLink(editor)}
          title="Insert / edit link"
        >
          <LinkIcon />
        </ToolbarButton>
      </ToolbarGroup>

      {block && (
        <>
          <Divider />
          <ToolbarGroup>
            <ToolbarButton
              active={editor.isActive({ textAlign: 'left' })}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              title="Align left"
            >
              <AlignIcon dir="left" />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive({ textAlign: 'center' })}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              title="Align center"
            >
              <AlignIcon dir="center" />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive({ textAlign: 'right' })}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              title="Align right"
            >
              <AlignIcon dir="right" />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive({ textAlign: 'justify' })}
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              title="Justify"
            >
              <AlignIcon dir="justify" />
            </ToolbarButton>
          </ToolbarGroup>
        </>
      )}
    </div>
  );
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function Divider() {
  return <span className="w-px h-5 bg-slate-800 mx-1" />;
}

function ToolbarButton({
  children,
  active,
  onClick,
  title,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        // Keep selection alive in the editor when the toolbar takes focus.
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={`w-8 h-8 rounded-md grid place-items-center transition-colors ${
        active
          ? 'bg-violet-500/20 text-violet-100 shadow-[0_0_0_1px_rgba(167,139,250,0.3)_inset]'
          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
      }`}
    >
      {children}
    </button>
  );
}

function promptForLink(editor: Editor) {
  const previous = editor.getAttributes('link').href ?? '';
  const url = window.prompt('URL (leave empty to remove):', previous);
  if (url === null) return; // cancelled
  if (url === '') {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }
  const normalized = /^https?:\/\//i.test(url) || /^mailto:|^tel:/i.test(url)
    ? url
    : `https://${url}`;
  editor.chain().focus().extendMarkRange('link').setLink({ href: normalized }).run();
}

// ─── Icons ────────────────────────────────────────────────────────────────

function ListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="8" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="20" y2="12" />
      <line x1="8" y1="18" x2="20" y2="18" />
      <circle cx="4" cy="6" r="1.2" fill="currentColor" />
      <circle cx="4" cy="12" r="1.2" fill="currentColor" />
      <circle cx="4" cy="18" r="1.2" fill="currentColor" />
    </svg>
  );
}

function OrderedListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="10" y1="6" x2="20" y2="6" />
      <line x1="10" y1="12" x2="20" y2="12" />
      <line x1="10" y1="18" x2="20" y2="18" />
      <text x="3" y="8" fontSize="6" fill="currentColor" stroke="none">1.</text>
      <text x="3" y="14" fontSize="6" fill="currentColor" stroke="none">2.</text>
      <text x="3" y="20" fontSize="6" fill="currentColor" stroke="none">3.</text>
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function AlignIcon({ dir }: { dir: 'left' | 'center' | 'right' | 'justify' }) {
  const long = <line x1="3" y1="6" x2="21" y2="6" />;
  const short =
    dir === 'left' ? <line x1="3" y1="14" x2="14" y2="14" /> :
    dir === 'right' ? <line x1="10" y1="14" x2="21" y2="14" /> :
    dir === 'center' ? <line x1="6" y1="14" x2="18" y2="14" /> :
    <line x1="3" y1="14" x2="21" y2="14" />;
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      {long}
      {short}
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

// ─── Editor styles (scoped to .rich-prose) ────────────────────────────────

function RichEditorStyles() {
  return (
    <style>{`
      .rich-prose {
        font-size: 14px;
        line-height: 1.6;
        color: rgb(226, 232, 240); /* slate-200 */
      }
      .rich-prose p { margin: 0; }
      .rich-prose p + p { margin-top: 0.6em; }
      .rich-prose strong { font-weight: 600; color: rgb(241, 245, 249); }
      .rich-prose em { font-style: italic; }
      .rich-prose u { text-decoration: underline; text-underline-offset: 2px; }
      .rich-prose s { text-decoration: line-through; }
      .rich-prose a {
        color: rgb(167, 139, 250);
        text-decoration: underline;
        text-underline-offset: 2px;
        cursor: pointer;
      }
      .rich-prose ul, .rich-prose ol {
        padding-left: 1.25em;
        margin: 0.4em 0;
      }
      .rich-prose ul li { list-style: disc; }
      .rich-prose ol li { list-style: decimal; }
      .rich-prose ul li::marker, .rich-prose ol li::marker {
        color: rgb(167, 139, 250);
      }
      .rich-prose .text-left   { text-align: left; }
      .rich-prose .text-center { text-align: center; }
      .rich-prose .text-right  { text-align: right; }
      .rich-prose .text-justify { text-align: justify; }
      .rich-prose p.is-editor-empty:first-child::before {
        content: attr(data-placeholder);
        float: left;
        color: rgb(71, 85, 105); /* slate-600 */
        pointer-events: none;
        height: 0;
      }
    `}</style>
  );
}
