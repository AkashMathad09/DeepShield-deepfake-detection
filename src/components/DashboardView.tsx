import React from 'react';
import {
  Shield,
  Image as ImageIcon,
  Video,
  FileCheck,
  AlertTriangle,
  History,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { HistoryRecord, SampleMediaItem, AnalysisResult } from '../types';

interface DashboardViewProps {
  history: HistoryRecord[];
  samples: SampleMediaItem[];
  onNavigateToImage: () => void;
  onNavigateToVideo: () => void;
  onSelectSample: (sampleId: string) => void;
  onViewHistoryResult: (result: AnalysisResult) => void;
  onClearHistory?: () => void;
  isAnalyzing: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  history,
  samples,
  onNavigateToImage,
  onNavigateToVideo,
  onSelectSample,
  onViewHistoryResult,
  onClearHistory,
  isAnalyzing,
}) => {
  const totalAnalyses = history.length;
  const realDetections = history.filter((h) => h.prediction === 'REAL').length;
  const deepfakeDetections = history.filter((h) => h.prediction === 'DEEPFAKE').length;
  const recentHistory = history.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              <Shield className="h-3.5 w-3.5" />
              <span>DeepShield Forensic Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              AI-Powered Deepfake Detection & Forensic Verification
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Verify the authenticity of digital images and videos using independent neural inspection,
              physical Error Level Analysis (ELA), and pixel-level compression artifact forensics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onNavigateToImage}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <ImageIcon className="h-4 w-4" />
              <span>Analyze Image</span>
            </button>
            <button
              onClick={onNavigateToVideo}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <Video className="h-4 w-4 text-blue-600" />
              <span>Analyze Video</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Metrics Cards (Grounded strictly in actual analysis history) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Total Analyses</span>
            <FileCheck className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalAnalyses}</span>
            <span className="text-xs text-slate-500">
              {totalAnalyses === 0 ? 'No analyses yet' : 'Files processed'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {totalAnalyses === 0
              ? 'Upload an image or video to begin tracking.'
              : 'Recorded in your current session history.'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Authentic (Real)</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">{realDetections}</span>
            <span className="text-xs text-slate-500">
              {totalAnalyses > 0 ? `${((realDetections / totalAnalyses) * 100).toFixed(0)}% of total` : '0%'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Files verified with authentic compression physics.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Deepfakes Detected</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-700">{deepfakeDetections}</span>
            <span className="text-xs text-slate-500">
              {totalAnalyses > 0 ? `${((deepfakeDetections / totalAnalyses) * 100).toFixed(0)}% of total` : '0%'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Files exhibiting manipulation or synthetic cues.
          </p>
        </div>
      </div>

      {/* Primary Action Upload Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div
          onClick={onNavigateToImage}
          className="group relative cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
              <ImageIcon className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium text-blue-600 group-hover:translate-x-0.5 transition flex items-center gap-1">
              Start analysis <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">Image Deepfake Detection</h2>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            Upload JPG, PNG, WEBP, or AVIF images for multi-model inspection. Analyzes facial landmarks,
            discrete cosine transform (DCT) compression tables, and Error Level Analysis (ELA) maps.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
              Multimodal AI
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
              EfficientNet-B0
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
              ELA Difference Map
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
              Laplacian Blur Variance
            </span>
          </div>
        </div>

        <div
          onClick={onNavigateToVideo}
          className="group relative cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
              <Video className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium text-blue-600 group-hover:translate-x-0.5 transition flex items-center gap-1">
              Start analysis <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">Video Deepfake Detection</h2>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            Extract candidate keyframes using FFmpeg. Ranks keyframes by optical Error Level Analysis variance
            to locate high-risk frames for in-depth biometric and neural inspection.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
              FFmpeg Sampling
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
              Keyframe Ranking
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
              Representative Frame ELA
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
              Video Summary
            </span>
          </div>
        </div>
      </div>

      {/* Recent History Table (Displayed only when actual data is present) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-slate-600" />
            <h2 className="text-base font-bold text-slate-900">Recent Detection History</h2>
          </div>
          {history.length > 0 && onClearHistory && (
            <button
              onClick={onClearHistory}
              className="text-xs font-medium text-slate-500 hover:text-rose-600 transition"
            >
              Clear History
            </button>
          )}
        </div>

        {recentHistory.length > 0 ? (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="py-3 font-medium">File Name</th>
                  <th className="py-3 font-medium">Type</th>
                  <th className="py-3 font-medium">Verdict</th>
                  <th className="py-3 font-medium">Confidence</th>
                  <th className="py-3 font-medium">Analyzed At</th>
                  <th className="py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentHistory.map((item) => {
                  const isFake = item.prediction === 'DEEPFAKE';
                  const isReal = item.prediction === 'REAL';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 font-medium text-slate-900 max-w-[200px] truncate">
                        {item.filename}
                      </td>
                      <td className="py-3 text-slate-600 capitalize">{item.mediaType}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                            isFake
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : isReal
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.prediction}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-semibold text-slate-700">
                        {item.confidence.toFixed(1)}%
                      </td>
                      <td className="py-3 text-slate-500 text-[11px]">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onViewHistoryResult(item.result)}
                          className="font-medium text-blue-600 hover:text-blue-800 transition"
                        >
                          View Results →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-slate-500">
            <Clock className="h-8 w-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-700">No detection history yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Analyses performed during your session will appear here with full forensic details.
            </p>
          </div>
        )}
      </div>

      {/* 1-Click Sample Test Cases (Images and Videos only) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">1-Click Test Fixtures</h2>
            <p className="text-xs text-slate-500">
              Run benchmark test cases directly without uploading your own files.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {samples.filter((s) => s.mediaType !== ('audio' as any)).length} samples available
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-3">
          {samples
            .filter((s) => s.mediaType === 'image' || s.mediaType === 'video')
            .map((sample) => (
              <div
                key={sample.id}
                onClick={() => !isAnalyzing && onSelectSample(sample.id)}
                className={`group flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition ${
                  isAnalyzing
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:border-blue-400 hover:bg-white hover:shadow-sm cursor-pointer'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">
                      {sample.mediaType}
                    </span>
                    <span
                      className={`text-[10px] font-bold rounded px-1.5 py-0.5 ${
                        sample.expectedLabel === 'DEEPFAKE'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      Expected: {sample.expectedLabel}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {sample.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2">{sample.description}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-blue-600">
                  <span>Run verification</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
