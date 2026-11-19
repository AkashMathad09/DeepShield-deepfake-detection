import React from 'react';
import { History, Image as ImageIcon, Video, Trash2, ArrowRight, Clock } from 'lucide-react';
import { HistoryRecord, AnalysisResult } from '../types';

interface HistoryViewProps {
  history: HistoryRecord[];
  onSelectResult: (result: AnalysisResult) => void;
  onClearHistory: () => void;
  onNavigateToUpload: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectResult,
  onClearHistory,
  onNavigateToUpload,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-xl">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-blue-400 font-semibold">
            Session Archive
          </span>
          <h1 className="mt-1 text-2xl font-bold text-white">Analysis History</h1>
          <p className="mt-1 text-xs text-slate-400">
            {history.length} forensic verification records saved locally in this browser session.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* History List */}
      {history.length > 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl overflow-hidden">
          <div className="divide-y divide-white/10">
            {history.map((item) => {
              const isFake = item.prediction === 'DEEPFAKE';
              const isReal = item.prediction === 'REAL';

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectResult(item.result)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-white/[0.04] transition cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/70 text-blue-400 flex-shrink-0">
                      {item.mediaType === 'video' ? (
                        <Video className="h-6 w-6 text-indigo-400" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-blue-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                          {item.filename}
                        </h2>
                        <span className="text-[11px] font-mono text-slate-400 capitalize">
                          • {item.mediaType}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-300">ID: {item.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                    <span
                      className={`inline-flex items-center gap-1 rounded-xl px-3 py-1 text-xs font-bold border ${
                        isFake
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : isReal
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {item.prediction} ({item.confidence.toFixed(1)}%)
                    </span>

                    <button className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition">
                      <span>View Dossier</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl shadow-xl">
          <History className="mx-auto h-12 w-12 text-slate-500" />
          <h2 className="mt-3 text-base font-bold text-white">No History Recorded Yet</h2>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            Files analyzed in this session will be preserved here so you can revisit past forensic reports.
          </p>
          <button
            onClick={onNavigateToUpload}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 transition"
          >
            Open Detector Studio
          </button>
        </div>
      )}
    </div>
  );
};
