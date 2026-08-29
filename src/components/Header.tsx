import React from 'react';
import { Shield, Activity, Eye, Video, BookOpen, Cpu, Code2 } from 'lucide-react';

export type ActiveTab = 'studio' | 'heatmap' | 'video' | 'how-it-works' | 'tech' | 'api';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  hasResult: boolean;
  isVideoResult: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  hasResult,
  isVideoResult,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/50 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
        {/* Brand */}
        <div
          onClick={() => onSelectTab('studio')}
          className="flex cursor-pointer items-center gap-3 transition hover:opacity-90"
        >
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="w-4 h-4 border-2 border-white rounded-sm flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-xs"></div>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white">
                DEEP<span className="text-blue-500">SHIELD</span>
              </span>
              <span className="rounded-md bg-white/5 border border-white/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-blue-400">
                v4.2.0
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 text-sm font-medium text-slate-400">
          <button
            onClick={() => onSelectTab('studio')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'studio'
                ? 'bg-white/10 text-blue-400 border border-white/10 backdrop-blur-md shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onSelectTab('heatmap')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'heatmap'
                ? 'bg-white/10 text-blue-400 border border-white/10 backdrop-blur-md shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>ELA & Heatmap</span>
            {hasResult && (
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('video')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'video'
                ? 'bg-white/10 text-blue-400 border border-white/10 backdrop-blur-md shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Batch & Video</span>
            {isVideoResult && (
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('how-it-works')}
            className={`hidden items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all sm:flex ${
              activeTab === 'how-it-works'
                ? 'bg-white/10 text-blue-400 border border-white/10 backdrop-blur-md shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Pipeline</span>
          </button>

          <button
            onClick={() => onSelectTab('tech')}
            className={`hidden items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all md:flex ${
              activeTab === 'tech'
                ? 'bg-white/10 text-blue-400 border border-white/10 backdrop-blur-md shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Model Registry</span>
          </button>

          <button
            onClick={() => onSelectTab('api')}
            className={`hidden items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all lg:flex ${
              activeTab === 'api'
                ? 'bg-white/10 text-blue-400 border border-white/10 backdrop-blur-md shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Code2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Audit API</span>
          </button>
        </nav>

        {/* Live Status */}
        <div className="hidden items-center gap-4 sm:flex">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">System Status</span>
            <span className="text-[10px] text-green-400 flex items-center gap-1.5 font-mono font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              GPU ONLINE
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 text-xs font-mono">
            AI
          </div>
        </div>
      </div>
    </header>
  );
};

