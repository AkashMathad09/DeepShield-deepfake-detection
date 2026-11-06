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
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <Flame className="mx-auto h-12 w-12 text-slate-400" />
        <h2 className="mt-4 text-lg font-bold text-slate-900">No Media Analyzed Yet</h2>
        <p className="mt-2 text-sm text-slate-500">
          Upload an image or video in the dashboard to inspect Error Level Analysis (ELA) maps and anomaly overlays.
        </p>
        <button
          onClick={onBackToStudio}
          className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isFake = result.prediction === 'DEEPFAKE';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Forensic Visualization Inspector
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Error Level Analysis (ELA) & Radial-Gradient Anomaly Map
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            File: <span className="font-mono font-medium text-slate-800">{result.filename}</span> • Verdict:{' '}
            <span className={isFake ? 'font-bold text-rose-700' : 'font-bold text-emerald-700'}>
              {result.prediction} ({result.confidence.toFixed(1)}%)
            </span>
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-medium">
          <button
            onClick={() => setViewMode('anomaly')}
            className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 transition ${
              viewMode === 'anomaly'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-rose-600" />
            <span>Radial Anomaly</span>
          </button>

          <button
            onClick={() => setViewMode('ela')}
            className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 transition ${
              viewMode === 'ela'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-blue-600" />
            <span>ELA Compression</span>
          </button>

          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 transition ${
              viewMode === 'split'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="h-3.5 w-3.5 text-slate-600" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {/* Main Visual Canvas Area */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {viewMode === 'split' ? (
          /* Side-by-Side View */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Original Source Media</span>
                <span className="text-slate-400 font-mono">RGB Capture</span>
              </div>
              <div className="relative flex max-h-[440px] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-900 p-2">
                <img
                  src={result.previewUrl}
                  alt="Original"
                  className="max-h-[420px] w-full object-contain rounded"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Error Level Analysis (ELA) Map</span>
                <span className="font-mono text-blue-600 font-bold">
                  Δ {result.technicalDetails.elaMeanDifference.toFixed(1)}
                </span>
              </div>
              <div className="relative flex max-h-[440px] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-950 p-2">
                <img
                  src={result.elaHeatmapUrl || result.previewUrl}
                  alt="ELA Map"
                  className="max-h-[420px] w-full object-contain rounded"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Blended Layer View with Opacity Slider */
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
                <Sliders className="h-4 w-4 text-blue-600" />
                <span>
                  {viewMode === 'anomaly'
                    ? 'Radial-Gradient Anomaly Layer Overlay'
                    : 'Error Level Analysis (ELA) Layer Overlay'}
                </span>
              </div>

              {/* Opacity Slider */}
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-slate-500">Source (0%)</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="h-1.5 w-32 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600"
                />
                <span className="font-mono font-bold text-blue-600">
                  {Math.round(opacity * 100)}%
                </span>
                <span className="text-slate-500">Overlay (100%)</span>
              </div>
            </div>

            {/* Overlaid Canvas */}
            <div className="relative mx-auto flex max-h-[480px] max-w-2xl items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-900 p-2">
              <img
                src={result.previewUrl}
                alt="Base media"
                className="max-h-[460px] w-full object-contain rounded"
              />
              <img
                src={
                  viewMode === 'anomaly'
                    ? result.gradCamHeatmapUrl || result.previewUrl
                    : result.elaHeatmapUrl || result.previewUrl
                }
                alt="Overlay"
                className="pointer-events-none absolute inset-0 max-h-[460px] w-full object-contain mix-blend-screen rounded"
                style={{ opacity }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Forensic Educational Breakdown */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm">
          <div className="flex items-center space-x-2 text-blue-700 text-sm font-bold">
            <Info className="h-4 w-4" />
            <span>How Error Level Analysis (ELA) Works</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Standard JPEG compression operates on 8×8 pixel blocks. When a synthesized facial patch is spliced over a background, the pasted region has distinct quantization characteristics compared to unmodified areas. Recompressing at 90% quality amplifies this mathematical delta, exposing spliced edges.
          </p>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-[11px] font-mono text-slate-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">ELA Mean Difference:</span>
              <span className="text-blue-600 font-bold">{result.technicalDetails.elaMeanDifference.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Laplacian Sharpness Variance:</span>
              <span className="text-slate-800">{result.technicalDetails.laplacianBlurVariance.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm">
          <div className="flex items-center space-x-2 text-rose-700 text-sm font-bold">
            <Flame className="h-4 w-4" />
            <span>Radial-Gradient Anomaly Visualization</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            This visualization highlights localized regions where facial biometric anomalies (corneal reflections, boundary seams, skin pore smoothing) were flagged. Warmer hues indicate concentrated evidence of synthetic manipulation.
          </p>
          <div className="flex items-center gap-3 pt-2 text-xs text-slate-600">
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Result Dossier</span>
        </button>
      </div>
    </div>
  );
};
