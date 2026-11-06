import React from 'react';
import { History, Image as ImageIcon, Video, Trash2, ArrowRight, ShieldCheck, AlertTriangle, Clock } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Session Archive
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Analysis History</h1>
          <p className="mt-1 text-xs text-slate-500">
            {history.length} analysis records saved locally in this browser session.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* History List */}
      {history.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {history.map((item) => {
              const isFake = item.prediction === 'DEEPFAKE';
              const isReal = item.prediction === 'REAL';

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectResult(item.result)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-slate-50/70 transition cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 flex-shrink-0">
                      {item.mediaType === 'video' ? (
                        <Video className="h-6 w-6 text-blue-600" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-blue-600" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                          {item.filename}
                        </h2>
                        <span className="text-[11px] font-mono text-slate-400 capitalize">
                          • {item.mediaType}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-600">ID: {item.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold ${
                        isFake
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isReal
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.prediction} ({item.confidence.toFixed(1)}%)
                    </span>

                    <button className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition">
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
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <History className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-3 text-base font-bold text-slate-900">No History Recorded Yet</h2>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Files analyzed in this session will be preserved here so you can revisit past forensic reports.
          </p>
          <button
            onClick={onNavigateToUpload}
            className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            Start an Analysis
          </button>
        </div>
      )}
    </div>
  );
};
