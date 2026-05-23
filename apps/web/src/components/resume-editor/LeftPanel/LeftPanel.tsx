'use client';

import { useResumeStore } from '@/store/resume.store';
import { SectionsList } from './SectionsList';
import { SectionForm } from './SectionForm';
import { DesignPanel } from './DesignPanel';
import { ImportPanel } from './ImportPanel';
import { SettingsPanel } from './SettingsPanel';

interface TabDef {
  id: 'sections' | 'design' | 'import' | 'settings';
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  {
    id: 'sections',
    label: 'Content',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="4" rx="1" />
        <rect x="3" y="11" width="18" height="4" rx="1" />
        <rect x="3" y="18" width="18" height="3" rx="1" />
      </svg>
    ),
  },
  {
    id: 'design',
    label: 'Design',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.5 1.5-1.5 0-.4-.1-.6-.4-.9-.2-.3-.3-.5-.3-.8 0-.6.4-1 1-1H15c2.7 0 5-2.3 5-5 0-5.5-3.6-9.8-8-9.8Z" />
      </svg>
    ),
  },
  {
    id: 'import',
    label: 'Import',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </svg>
    ),
  },
];

interface Props {
  resumeId: string;
}

export function LeftPanel({ resumeId }: Props) {
  const activePanel = useResumeStore((s) => s.activePanel);
  const setActivePanel = useResumeStore((s) => s.setActivePanel);
  const selectedSectionId = useResumeStore((s) => s.selectedSectionId);

  return (
    <aside className="w-[420px] border-r border-slate-800/70 bg-slate-950/80 backdrop-blur-xl flex flex-col overflow-hidden shrink-0">
      <nav className="flex items-stretch border-b border-slate-800/70 px-1.5 pt-1.5 shrink-0">
        {TABS.map((tab) => {
          const active = activePanel === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActivePanel(tab.id)}
              className={`relative flex-1 py-2.5 px-2 text-[11px] font-medium flex flex-col items-center gap-1 rounded-t-md transition-all ${
                active
                  ? 'text-violet-200 bg-slate-900/70'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/40'
              }`}
            >
              <span className={active ? 'text-violet-300' : ''}>{tab.icon}</span>
              <span>{tab.label}</span>
              {active && (
                <span className="absolute bottom-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activePanel === 'sections' &&
          (selectedSectionId ? <SectionForm sectionId={selectedSectionId} /> : <SectionsList />)}
        {activePanel === 'design' && <DesignPanel />}
        {activePanel === 'import' && <ImportPanel resumeId={resumeId} />}
        {activePanel === 'settings' && <SettingsPanel resumeId={resumeId} />}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.18);
          border-radius: 999px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.32);
          background-clip: content-box;
        }
      `}</style>
    </aside>
  );
}
