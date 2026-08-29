import React, { useState } from 'react';
import { Eye, Flame, Layers, Sliders, Info } from 'lucide-react';
import { AnalysisResult } from '../types';

interface HeatmapViewerProps {
  result: AnalysisResult | null;
  onBackToStudio: () => void;
}

export const HeatmapViewer: React.FC<HeatmapViewerProps> = ({ result, onBackToStudio }) => {
  const [viewMode, setViewMode] = useState<'gradcam' | 'ela' | 'split'>('gradcam');
  const [opacity, setOpacity] = useState<number>(0.75);

  if (!result) {
    return (
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl shadow-2xl">
        <Flame className="mx-auto h-12 w-12 text-slate-500" />
        <h2 className="mt-4 text-lg font-bold text-slate-100">No Media Analyzed Yet</h2>
        <p className="mt-2 text-sm text-slate-400">
          Upload an image or video in the Detector Studio to inspect ELA compression maps and Grad-CAM anomaly heatmaps.
        </p>
        <button
          onClick={onBackToStudio}
          className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
        >
          Go to Detector Studio
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
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-blue-400"></span>
            <span className="font-mono text-xs uppercase tracking-wider text-slate-400">
              PHYSICAL & NEURAL HEATMAP INSPECTOR
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-100">
            Error Level Analysis (ELA) & Grad-CAM Anomaly Map
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            File: <span className="font-mono text-slate-300">{result.filename}</span> • Verdict:{' '}
            <span className={isFake ? 'font-bold text-rose-400' : 'font-bold text-emerald-400'}>
              {result.prediction} ({result.confidence}%)
            </span>
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-2 rounded-2xl border border-white/10 bg-white/5 p-1 text-xs font-medium backdrop-blur-md">
          <button
            onClick={() => setViewMode('gradcam')}
            className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 transition ${
              viewMode === 'gradcam'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Grad-CAM Heatmap</span>
          </button>

          <button
            onClick={() => setViewMode('ela')}
            className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 transition ${
              viewMode === 'ela'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>ELA Compression</span>
          </button>

          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 transition ${
              viewMode === 'split'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {/* Main Canvas View Area */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-xl">
        {viewMode === 'split' ? (
          /* Side-by-Side Dual View */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Original Source Media</span>
                <span className="text-slate-400 font-mono">RGB Channel</span>
              </div>
              <div className="relative flex max-h-[440px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 p-2">
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
                <span className="font-mono text-blue-400">
                  Δ {result.technicalDetails.elaMeanDifference}
                </span>
              </div>
              <div className="relative flex max-h-[440px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 p-2">
                <img
                  src={result.elaHeatmapUrl || result.previewUrl}
                  alt="ELA Map"
                  className="max-h-[420px] w-full object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Blended Layer View with Opacity Slider */
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
                <Sliders className="h-4 w-4 text-blue-400" />
                <span>
                  {viewMode === 'gradcam'
                    ? 'Grad-CAM Attention Overlay Blend'
                    : 'ELA Compression Layer Blend'}
                </span>
              </div>

              {/* Opacity Slider */}
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-slate-400">Original (0%)</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="h-1.5 w-32 cursor-pointer appearance-none rounded-lg bg-white/10 accent-blue-500"
                />
                <span className="font-mono font-bold text-blue-400">
                  {Math.round(opacity * 100)}%
                </span>
                <span className="text-slate-400">Heatmap (100%)</span>
              </div>
            </div>

            {/* Overlaid Canvas */}
            <div className="relative mx-auto flex max-h-[480px] max-w-2xl items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 p-2">
              {/* Base Image */}
              <img
                src={result.previewUrl}
                alt="Base media"
                className="max-h-[460px] w-full object-contain rounded-lg"
              />

              {/* Heatmap Overlay with Opacity */}
              <img
                src={
                  viewMode === 'gradcam'
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
          <div className="flex items-center space-x-2 text-blue-300 text-sm font-semibold">
            <Info className="h-4 w-4" />
            <span>How Error Level Analysis (ELA) Exposes Deepfakes</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            When an image is saved as a JPEG, each 8×8 pixel grid is compressed according to specific quantization tables.
            When a deepfake model pastes a synthesized facial patch over a source body, the face and background undergo
            divergent compression cycles. Recompressing at 90% quality amplifies this error delta, making spliced boundaries glow brightly in ELA.
          </p>
          <div className="rounded-2xl border border-white/5 bg-white/5 p-3.5 font-mono text-[11px] text-slate-300 backdrop-blur-md">
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Measured ELA Delta:</span>
              <span className="text-blue-400 font-bold">{result.technicalDetails.elaMeanDifference}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Laplacian Sharpness Var:</span>
              <span className="text-slate-200">{result.technicalDetails.laplacianBlurVariance}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Spatial Noise Energy:</span>
              <span className="text-slate-200">{result.technicalDetails.spectralHighFreqEnergy}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3 backdrop-blur-xl shadow-xl">
          <div className="flex items-center space-x-2 text-indigo-300 text-sm font-semibold">
            <Flame className="h-4 w-4" />
            <span>Grad-CAM Attention & Suspicious Zones</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Gradient-weighted Class Activation Mapping (Grad-CAM) visualizes the spatial regions in the convolutional layers
            that produced the highest neural activation towards the "DEEPFAKE" classification.
            Hot zones (red/orange) highlight jawline blending halos, mismatched corneal light reflections, and lack of epidermal pores.
          </p>
          <div className="flex items-center space-x-2 pt-1 text-xs text-slate-300">
            <span className="flex h-3 w-3 rounded-full bg-rose-500"></span>
            <span>Red/Amber: High Anomaly Zone</span>
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 ml-3"></span>
            <span>Emerald: Natural Gradient</span>
          </div>
        </div>
      </div>
    </div>
  );
};

