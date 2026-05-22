'use client';

import { useState } from 'react';
import { useResumeStore } from '@/store/resume.store';
import { ResumeSectionList } from './ResumeSectionList';
import { ResumeThemePanel } from './ResumeThemePanel';
import { ResumeSectionEditor } from './ResumeSectionEditor';

type Tab = 'content' | 'style' | 'settings';

interface Props {
  resumeId: string;
}

// ─── Personal Details (contact section pinned at top) ─────────────────────────

function PersonalDetailsCard() {
  const { resume, selectedSectionId, selectSection } = useResumeStore();
  if (!resume) return null;

  const contactSection = resume.sections.find(s => s.type === 'contact');
  if (!contactSection) return null;

  const isExpanded = selectedSectionId === contactSection.id;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-3">
      <button
        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
        onClick={() => selectSection(isExpanded ? null : contactSection.id)}
      >
        <span className="text-base">👤</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-800">Personal Details</div>
          <div className="text-xs text-slate-400 mt-0.5">Name, title, contact info</div>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div className="border-t border-slate-100">
          <ResumeSectionEditor sectionId={contactSection.id} />
        </div>
      )}
    </div>
  );
}

// ─── Settings panel ───────────────────────────────────────────────────────────

function SettingsPanel({ resumeId: _resumeId }: { resumeId: string }) {
  const { resume, updateTitle, updateMetadata, updateTheme } = useResumeStore();
  if (!resume) return null;

  const inputCls = 'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all';
  const labelCls = 'block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide';

  return (
    <div className="p-4 space-y-5">
      <div>
        <label className={labelCls}>Resume Title</label>
        <input
          className={inputCls}
          value={resume.title ?? ''}
          onChange={e => updateTitle(e.target.value)}
          placeholder="My Resume"
        />
      </div>
      <div>
        <label className={labelCls}>Target Role</label>
        <input
          className={inputCls}
          value={resume.metadata?.targetRole ?? ''}
          onChange={e => updateMetadata({ targetRole: e.target.value })}
          placeholder="Software Engineer"
        />
      </div>
      <div>
        <label className={labelCls}>Target Company</label>
        <input
          className={inputCls}
          value={resume.metadata?.targetCompany ?? ''}
          onChange={e => updateMetadata({ targetCompany: e.target.value })}
          placeholder="Google, Meta..."
        />
      </div>
      <div className="border-t border-slate-100 pt-4">
        <label className={labelCls}>Page Size</label>
        <div className="flex gap-2">
          {(['a4', 'letter'] as const).map(size => (
            <button
              key={size}
              onClick={() => updateTheme({ pageSize: size })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                (resume.theme.pageSize ?? 'a4') === size
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600'
              }`}
            >
              {size === 'a4' ? 'A4' : 'US Letter'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main sidebar ─────────────────────────────────────────────────────────────

export function ResumeSidebar({ resumeId }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('content');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'content',  label: 'Content'  },
    { id: 'style',    label: 'Style'    },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <aside className="w-[360px] shrink-0 bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-slate-200 bg-white shrink-0 px-2 pt-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors mr-0.5 ${
              activeTab === tab.id
                ? 'text-violet-600 border-b-2 border-violet-600 bg-slate-50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'content' && (
          <div className="p-3">
            <PersonalDetailsCard />
            <div className="mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Sections</p>
              <ResumeSectionList />
            </div>
          </div>
        )}

        {activeTab === 'style' && <ResumeThemePanel />}

        {activeTab === 'settings' && <SettingsPanel resumeId={resumeId} />}
      </div>
    </aside>
  );
}
