import React from 'react';
import {
  Shield,
  ScanFace,
  Flame,
  Video,
  History,
  BookOpen,
  Cpu,
  Code2,
} from 'lucide-react';

export type ActiveTab =
  | 'studio'
  | 'heatmap'
  | 'video'
  | 'history'
  | 'how-it-works'
  | 'technology'
  | 'api';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  hasResult: boolean;
  historyCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  hasResult,
  historyCount = 0,
}) => {
  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    disabled?: boolean;
  }> = [
    { id: 'studio', label: 'Detector Studio', icon: ScanFace },
    { id: 'heatmap', label: 'Forensics / ELA', icon: Flame, disabled: !hasResult && activeTab !== 'heatmap' },
    { id: 'video', label: 'Video Timeline', icon: Video },
    { id: 'history', label: 'History', icon: History, badge: historyCount > 0 ? historyCount : undefined },
    { id: 'how-it-works', label: 'How It Works', icon: BookOpen },
    { id: 'technology', label: 'Technology', icon: Cpu },
    { id: 'api', label: 'API Docs', icon: Code2 },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl no-print">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand & Logo */}
        <div
          onClick={() => onSelectTab('studio')}
          className="flex cursor-pointer items-center gap-2.5 transition hover:opacity-90 flex-shrink-0"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-white/15">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-extrabold tracking-tight text-white">
                Deep<span className="text-blue-400">Shield</span>
              </span>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-cyan-300 hidden sm:inline-flex items-center gap-1">
                <ScanFace className="h-2.5 w-2.5" />
                Face Forensics
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-0.5 text-xs font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 transition ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-inner font-semibold'
                    : 'text-slate-400 border border-transparent hover:text-slate-100 hover:bg-white/5'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 px-1.5 py-0.2 font-mono text-[10px] font-bold text-blue-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Status Pill */}
        <div className="hidden items-center gap-2 xl:flex text-xs flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-emerald-300 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            System Ready
          </span>
        </div>
      </div>
    </header>
  );
};
