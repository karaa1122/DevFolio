'use client';

import { useResumeStore } from '@/store/resume.store';
import { ResumeSectionList } from './ResumeSectionList';
import { ResumeThemePanel } from './ResumeThemePanel';
import { ResumeSectionEditor } from './ResumeSectionEditor';

type Tab = 'sections' | 'theme' | 'settings';

interface Props {
  resumeId: string;
}

export function ResumeSidebar({ resumeId: _resumeId }: Props) {
  const { activePanel, selectedSectionId, setActivePanel, resume, updateTitle, updateMetadata } = useResumeStore();

  const tabs: { id: Tab; label: string }[] = [
    { id: 'sections', label: 'Sections' },
    { id: 'theme', label: 'Theme' },
    { id: 'settings', label: 'Settings' },
  ];

  const inputCls = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500';

  return (
    <aside className="w-72 border-r border-slate-800 bg-slate-900 flex flex-col overflow-hidden shrink-0">
      <div className="flex border-b border-slate-800 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePanel(tab.id)}
            className={`flex-1 py-3 text-xs font-medium transition-colors ${
              activePanel === tab.id
                ? 'text-violet-400 border-b-2 border-violet-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activePanel === 'sections' && (
          selectedSectionId
            ? <ResumeSectionEditor sectionId={selectedSectionId} />
            : <ResumeSectionList />
        )}
        {activePanel === 'theme' && <ResumeThemePanel />}
        {activePanel === 'settings' && resume && (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Resume Title</label>
              <input
                className={inputCls}
                value={resume.title ?? ''}
                onChange={(e) => updateTitle(e.target.value)}
                placeholder="My Resume"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Target Role</label>
              <input
                className={inputCls}
                value={resume.metadata.targetRole ?? ''}
                onChange={(e) => updateMetadata({ targetRole: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Target Company</label>
              <input
                className={inputCls}
                value={resume.metadata.targetCompany ?? ''}
                onChange={(e) => updateMetadata({ targetCompany: e.target.value })}
                placeholder="Acme Corp (optional)"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
