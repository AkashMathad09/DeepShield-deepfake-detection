import React, { useState } from 'react';
import { Eye, Flame, Layers, Sliders, Info, ArrowLeft } from 'lucide-react';
import { AnalysisResult } from '../types';

interface HeatmapViewerProps {
  result: AnalysisResult | null;
  onBackToStudio: () => void;
}

export const HeatmapViewer: React.FC<HeatmapViewerProps> = ({ result, onBackToStudio }) => {
  const [viewMode, setViewMode] = useState<'anomaly' | 'ela' | 'split'>('anomaly');
  const [opacity, setOpacity] = useState<number>(0.75);

  if (!result) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl shadow-xl">
        <Flame className="mx-auto h-12 w-12 text-slate-500" />
        <h2 className="mt-4 text-lg font-bold text-white">No Media Analyzed Yet</h2>
        <p className="mt-2 text-sm text-slate-400">
          Upload an image or video in Detector Studio to inspect Error Level Analysis (ELA) maps and anomaly overlays.
        </p>
        <button
          onClick={onBackToStudio}
          className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 transition"
        >
          Return to Detector Studio
        </button>
      </div>
    );
  }

  const isFake = result.prediction === 'DEEPFAKE';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-xl">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-blue-400 font-semibold">
            Forensic Visualization Inspector
          </span>
          <h1 className="mt-1 text-2xl font-bold text-white">
            Error Level Analysis (ELA) & Radial-Gradient Anomaly Map
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            File: <span className="font-mono font-medium text-slate-200">{result.filename}</span> • Verdict:{' '}
            <span className={isFake ? 'font-bold text-rose-400' : 'font-bold text-emerald-400'}>
              {result.prediction} ({result.confidence.toFixed(1)}%)
            </span>
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1 rounded-2xl border border-white/10 bg-slate-950/60 p-1 text-xs font-medium">
          <button
            onClick={() => setViewMode('anomaly')}
            className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 transition ${
              viewMode === 'anomaly'
                ? 'bg-blue-600 text-white shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Radial Anomaly</span>
          </button>

          <button
            onClick={() => setViewMode('ela')}
            className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 transition ${
              viewMode === 'ela'
                ? 'bg-blue-600 text-white shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>ELA Compression</span>
          </button>

          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 transition ${
              viewMode === 'split'
                ? 'bg-blue-600 text-white shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {/* Main Visual Canvas Area */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-xl">
        {viewMode === 'split' ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Original Source Media</span>
                <span className="text-slate-400 font-mono">RGB Capture</span>
              </div>
              <div className="relative flex max-h-[440px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-2">
                <img
                  src={result.previewUrl}
                  alt="Original"
                  className="max-h-[420px] w-full object-contain rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Error Level Analysis (ELA) Map</span>
                <span className="font-mono text-blue-400 font-bold">
                  Δ {result.technicalDetails.elaMeanDifference.toFixed(1)}
                </span>
              </div>
              <div className="relative flex max-h-[440px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-2">
                <img
                  src={result.elaHeatmapUrl || result.previewUrl}
                  alt="ELA Map"
                  className="max-h-[420px] w-full object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
                <Sliders className="h-4 w-4 text-blue-400" />
                <span>
                  {viewMode === 'anomaly'
                    ? 'Radial-Gradient Anomaly Layer Overlay'
                    : 'Error Level Analysis (ELA) Layer Overlay'}
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <span className="text-slate-400">Source (0%)</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="h-1.5 w-32 cursor-pointer appearance-none rounded-lg bg-white/15 accent-blue-500"
                />
                <span className="font-mono font-bold text-blue-400">
                  {Math.round(opacity * 100)}%
                </span>
                <span className="text-slate-400">Overlay (100%)</span>
              </div>
            </div>

            <div className="relative mx-auto flex max-h-[480px] max-w-2xl items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-2">
              <img
                src={result.previewUrl}
                alt="Base media"
                className="max-h-[460px] w-full object-contain rounded-lg"
              />
              <img
                src={
                  viewMode === 'anomaly'
                    ? result.gradCamHeatmapUrl || result.previewUrl
                    : result.elaHeatmapUrl || result.previewUrl
                }
                alt="Overlay"
                className="pointer-events-none absolute inset-0 max-h-[460px] w-full object-contain mix-blend-screen rounded-lg"
                style={{ opacity }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Forensic Educational Breakdown */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3 backdrop-blur-xl shadow-xl">
          <div className="flex items-center space-x-2 text-blue-400 text-sm font-bold">
            <Info className="h-4 w-4" />
            <span>How Error Level Analysis (ELA) Works</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Standard JPEG compression operates on 8×8 pixel blocks. When a synthesized facial patch is spliced over a background, the pasted region has distinct quantization characteristics compared to unmodified areas. Recompressing at 90% quality amplifies this mathematical delta, exposing spliced edges.
          </p>
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-[11px] font-mono text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">ELA Mean Difference:</span>
              <span className="text-blue-400 font-bold">{result.technicalDetails.elaMeanDifference.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Laplacian Sharpness Variance:</span>
              <span className="text-slate-200">{result.technicalDetails.laplacianBlurVariance.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3 backdrop-blur-xl shadow-xl">
          <div className="flex items-center space-x-2 text-rose-400 text-sm font-bold">
            <Flame className="h-4 w-4" />
            <span>Radial-Gradient Anomaly Visualization</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            This visualization highlights localized regions where facial biometric anomalies (corneal reflections, boundary seams, skin pore smoothing) were flagged. Warmer hues indicate concentrated evidence of synthetic manipulation.
          </p>
          <div className="flex items-center gap-4 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
              <span>Elevated Anomaly Zone</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              <span>Consistent Optical Background</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onBackToStudio}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Result Dossier</span>
        </button>
      </div>
    </div>
  );
};
