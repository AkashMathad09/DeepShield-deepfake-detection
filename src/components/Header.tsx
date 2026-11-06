import React from 'react';
import { Shield, LayoutDashboard, Image as ImageIcon, Video, History, Eye } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'image' | 'video' | 'history' | 'heatmap';

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
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand & Logo */}
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex cursor-pointer items-center gap-2.5 transition hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Deep<span className="text-blue-600">Shield</span>
              </span>
              <span className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                Forensics
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 text-sm font-medium">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${
              activeTab === 'dashboard'
                ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onSelectTab('image')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${
              activeTab === 'image'
                ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Image Detection</span>
          </button>

          <button
            onClick={() => onSelectTab('video')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${
              activeTab === 'video'
                ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Video className="h-4 w-4" />
            <span>Video Detection</span>
          </button>

          <button
            onClick={() => onSelectTab('history')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${
              activeTab === 'history'
                ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="h-4 w-4" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-700">
                {historyCount}
              </span>
            )}
          </button>

          {hasResult && (
            <button
              onClick={() => onSelectTab('heatmap')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition ${
                activeTab === 'heatmap'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Eye className="h-4 w-4 text-blue-600" />
              <span>Inspection View</span>
            </button>
          )}
        </nav>

        {/* System Status Pill */}
        <div className="hidden items-center gap-2 md:flex text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-emerald-700 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            System Ready
          </span>
        </div>
      </div>
    </header>
  );
};
