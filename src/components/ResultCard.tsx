import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Clock,
  ScanFace,
  Layers,
  Cpu,
  Download,
  Share2,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Info,
  Flame,
  FileText,
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface ResultCardProps {
  result: AnalysisResult;
  onOpenHeatmap: () => void;
  onOpenVideoTimeline: () => void;
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onOpenHeatmap,
  onOpenVideoTimeline,
  onReset,
}) => {
  const [showFaceBoxes, setShowFaceBoxes] = useState(true);
  const [expandedMetrics, setExpandedMetrics] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const isFake = result.prediction === 'DEEPFAKE';
  const isReal = result.prediction === 'REAL';
  const isUncertain = result.prediction === 'UNCERTAIN';

  const getInterpretationBadge = () => {
    if (result.confidence >= 70) {
      return {
        label: 'Strong Evidence (70–100%)',
        color: isFake ? 'text-rose-300 bg-rose-950/80 ring-rose-800' : 'text-emerald-300 bg-emerald-950/80 ring-emerald-800',
        desc: isFake
          ? 'High-confidence indicators of synthetic or manipulated biometric structures detected.'
          : 'High-confidence optical congruence with authentic optical capture physics.',
      };
    } else if (result.confidence >= 30) {
      return {
        label: 'Uncertain / Low Quality (30–70%)',
        color: 'text-amber-300 bg-amber-950/80 ring-amber-800',
        desc: 'Ambiguous indicators. Heavy compression, low resolution, or partial occlusion obscures decisive artifacts.',
      };
    } else {
      return {
        label: 'Low Evidence (0–30%)',
        color: 'text-slate-300 bg-slate-800 ring-slate-700',
        desc: 'Minimal anomalous markers detected; evidence insufficient to establish manipulation.',
      };
    }
  };

  const interp = getInterpretationBadge();

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `deepshield-forensics-${result.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleShareReport = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card / Verdict Hero */}
      <div
        className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 shadow-2xl backdrop-blur-xl ${
          isFake
            ? 'border-rose-500/30 bg-rose-500/10 shadow-rose-500/10'
            : isReal
            ? 'border-emerald-500/30 bg-emerald-500/10 shadow-emerald-500/10'
            : 'border-amber-500/30 bg-amber-500/10 shadow-amber-500/10'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left Column: Prediction & Confidence */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs uppercase tracking-widest text-slate-400">
                DEEPSHIELD FORENSIC VERDICT
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-xs text-blue-400 font-semibold">{result.id}</span>
            </div>

            <div className="flex items-center space-x-3">
              {isFake ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-lg shadow-rose-500/20">
                  <AlertTriangle className="h-7 w-7" />
                </div>
              ) : isReal ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
                  <ShieldCheck className="h-7 w-7" />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-500/20">
                  <HelpCircle className="h-7 w-7" />
                </div>
              )}

              <div>
                <h1
                  className={`text-3xl sm:text-4xl font-black tracking-tight ${
                    isFake
                      ? 'text-rose-400'
                      : isReal
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {isFake
                    ? 'DEEPFAKE DETECTED'
                    : isReal
                    ? 'AUTHENTIC / REAL'
                    : 'UNCERTAIN / INCONCLUSIVE'}
                </h1>
                <p className="text-sm font-medium text-slate-300">
                  {result.manipulationCategory}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span
                className={`inline-flex items-center space-x-1.5 rounded-full px-3 py-1 font-mono text-xs font-bold border ${interp.color}`}
              >
                <span>Confidence:</span>
                <span className="text-sm font-black">{result.confidence.toFixed(1)}%</span>
              </span>

              <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-slate-300 backdrop-blur-md">
                {interp.label}
              </span>
            </div>

            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              {interp.desc}
            </p>
          </div>

          {/* Right Column: Quick Stats Matrix */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:w-80">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <ScanFace className="h-4 w-4 text-blue-400" />
                <span className="text-[11px] font-medium">Faces Detected</span>
              </div>
              <p className="mt-1 text-xl font-bold text-slate-100">
                {result.facesDetected}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <Clock className="h-4 w-4 text-indigo-400" />
                <span className="text-[11px] font-medium">Processing Time</span>
              </div>
              <p className="mt-1 text-xl font-bold text-slate-100">
                {(result.modelInfo.executionTimeMs / 1000).toFixed(2)}s
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <Layers className="h-4 w-4 text-amber-400" />
                <span className="text-[11px] font-medium">
                  {result.mediaType === 'video' ? 'Frames Analyzed' : 'Media Type'}
                </span>
              </div>
              <p className="mt-1 text-lg font-bold text-slate-100 truncate">
                {result.mediaType === 'video'
                  ? `${result.videoSummary?.framesAnalyzedCount || 16} Keyframes`
                  : 'Image (Static)'}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <Flame className="h-4 w-4 text-rose-400" />
                <span className="text-[11px] font-medium">Fake Probability</span>
              </div>
              <p className="mt-1 text-xl font-bold text-slate-100">
                {(result.fakeProbability * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Forensic Summary Callout */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 flex-shrink-0 text-blue-400 mt-0.5" />
            <div className="text-xs leading-relaxed text-slate-300">
              <span className="font-semibold text-slate-100">AI Forensic Summary: </span>
              {result.summaryText}
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual Grid: Visual Inspector & Key Indicators */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Visual Media with Bounding Box Inspector (7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center space-x-2">
                <ScanFace className="h-4 w-4 text-blue-400" />
                <h2 className="text-sm font-semibold text-slate-200">
                  Spatial Media & Face Bounding Coordinates
                </h2>
              </div>
              <button
                onClick={() => setShowFaceBoxes(!showFaceBoxes)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium backdrop-blur-md transition ${
                  showFaceBoxes
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                {showFaceBoxes ? 'Hide Bounding Boxes' : 'Show Bounding Boxes'}
              </button>
            </div>

            {/* Interactive Image with SVG Normalized Box Overlays */}
            <div className="relative mx-auto max-h-[460px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 flex items-center justify-center">
              <img
                src={result.previewUrl}
                alt="Analyzed media"
                className="max-h-[460px] w-full object-contain"
              />

              {/* SVG Bounding Boxes */}
              {showFaceBoxes && result.faces.length > 0 && (
                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  viewBox="0 0 1000 1000"
                  preserveAspectRatio="none"
                >
                  {result.faces.map((face) => {
                    const bw = Math.max(20, face.box.xmin ? (face.box.xmax - face.box.xmin) : 200);
                    const bh = Math.max(20, face.box.ymin ? (face.box.ymax - face.box.ymin) : 200);
                    const strokeColor = face.label === 'DEEPFAKE' ? '#f43f5e' : '#10b981';

                    return (
                      <g key={face.id}>
                        {/* Bounding Box Rect */}
                        <rect
                          x={face.box.xmin}
                          y={face.box.ymin}
                          width={bw}
                          height={bh}
                          fill={face.label === 'DEEPFAKE' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.12)'}
                          stroke={strokeColor}
                          strokeWidth="6"
                          strokeDasharray={face.label === 'DEEPFAKE' ? '12 6' : undefined}
                          rx="8"
                        />
                        {/* Tag Label */}
                        <rect
                          x={face.box.xmin}
                          y={Math.max(10, face.box.ymin - 50)}
                          width={Math.min(320, bw + 40)}
                          height="44"
                          fill="#090d16"
                          stroke={strokeColor}
                          strokeWidth="2"
                          rx="6"
                        />
                        <text
                          x={face.box.xmin + 12}
                          y={Math.max(38, face.box.ymin - 20)}
                          fill="#ffffff"
                          fontSize="24"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {face.label} ({(face.fakeProbability * 100).toFixed(0)}% Fake)
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenHeatmap}
                className="flex items-center space-x-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-blue-300 backdrop-blur-md transition hover:bg-white/10 hover:border-white/20 hover:text-white"
              >
                <Flame className="h-4 w-4 text-blue-400" />
                <span>Inspect ELA & Anomaly Heatmap</span>
              </button>

              {result.mediaType === 'video' && (
                <button
                  onClick={onOpenVideoTimeline}
                  className="flex items-center space-x-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-indigo-300 backdrop-blur-md transition hover:bg-white/10 hover:border-white/20 hover:text-white"
                >
                  <Layers className="h-4 w-4 text-indigo-400" />
                  <span>View Frame-by-Frame Timeline</span>
                </button>
              )}
            </div>
          </div>

          {/* Individual Face Artifact Inspection */}
          {result.faces.length > 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-xl">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Face Biometric Landmark Analysis ({result.faces.length} Detected)
              </h2>

              <div className="mt-3 space-y-3">
                {result.faces.map((face) => (
                  <div
                    key={face.id}
                    className="rounded-2xl border border-white/5 bg-white/5 p-4 text-xs backdrop-blur-md"
                  >
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="font-semibold text-slate-200">
                        Face #{face.id} • {face.manipulationType || 'Spatial Patch'}
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          face.label === 'DEEPFAKE' ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {face.label} ({(face.fakeProbability * 100).toFixed(1)}% Fake)
                      </span>
                    </div>

                    {face.landmarks && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
                        <div className="rounded-xl border border-white/5 bg-white/5 p-2.5">
                          <span className="text-slate-400">Eye Symmetry:</span>
                          <p className="font-mono font-bold text-slate-200">
                            {face.landmarks.eyeSymmetryScore}/100
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/5 p-2.5">
                          <span className="text-slate-400">Boundary Seam:</span>
                          <p
                            className={`font-mono font-bold ${
                              face.landmarks.boundarySeamArtifact > 50 ? 'text-rose-400' : 'text-slate-200'
                            }`}
                          >
                            {face.landmarks.boundarySeamArtifact}/100
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/5 p-2.5">
                          <span className="text-slate-400">Skin Texture:</span>
                          <p className="font-mono font-bold text-slate-200">
                            {face.landmarks.skinTextureNaturalness}/100
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/5 p-2.5">
                          <span className="text-slate-400">Lighting Angle:</span>
                          <p className="font-mono font-bold text-slate-200">
                            {face.landmarks.lightingConsistency}/100
                          </p>
                        </div>
                      </div>
                    )}

                    {face.notes.length > 0 && (
                      <div className="mt-2.5 text-[11px] text-slate-400">
                        <span className="text-slate-500 font-medium">Notes: </span>
                        {face.notes.join(' • ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Forensic Breakdown Scores & Export (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          {/* Forensic Indicator Breakdown */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between pb-3">
              <h2 className="text-sm font-bold text-slate-100">
                Detailed Forensic Indicators
              </h2>
              <span className="text-[11px] font-mono text-slate-400">0 (Normal) - 100 (Critical)</span>
            </div>

            <div className="space-y-3.5">
              {result.metrics.map((metric) => {
                const isCrit = metric.status === 'critical';
                const isSusp = metric.status === 'suspicious';

                return (
                  <div key={metric.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200">{metric.name}</span>
                      <span
                        className={`font-mono font-bold ${
                          isCrit
                            ? 'text-rose-400'
                            : isSusp
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {metric.score}/100
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isCrit
                            ? 'bg-rose-500'
                            : isSusp
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${metric.score}%` }}
                      ></div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-tight">
                      {metric.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Specification Card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-xl">
            <div className="flex items-center space-x-2 pb-2 text-slate-200">
              <Cpu className="h-4 w-4 text-blue-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Inference Architecture Specs
              </h2>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Model Engine:</span>
                <span className="font-mono text-slate-200 text-right truncate ml-2">
                  {result.modelInfo.name}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Architecture:</span>
                <span className="font-mono text-slate-200 text-right truncate ml-2">
                  {result.modelInfo.architecture}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Benchmark Datasets:</span>
                <span className="font-mono text-slate-200 text-right truncate ml-2">
                  {result.modelInfo.trainedOn}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">ELA Difference Score:</span>
                <span className="font-mono font-bold text-blue-400">
                  {result.technicalDetails.elaMeanDifference} (Laplacian: {result.technicalDetails.laplacianBlurVariance})
                </span>
              </div>
            </div>
          </div>

          {/* Report Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportJson}
              className="flex-1 flex items-center justify-center space-x-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-slate-200 backdrop-blur-md transition hover:bg-white/10 hover:border-white/20 hover:text-white"
            >
              <Download className="h-4 w-4 text-blue-400" />
              <span>Export JSON Report</span>
            </button>

            <button
              onClick={handleShareReport}
              className="flex-1 flex items-center justify-center space-x-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-slate-200 backdrop-blur-md transition hover:bg-white/10 hover:border-white/20 hover:text-white"
            >
              <Share2 className="h-4 w-4 text-indigo-400" />
              <span>{copiedNotification ? 'Link Copied!' : 'Share Dossier'}</span>
            </button>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onReset}
              className="text-xs font-medium text-slate-400 hover:text-blue-400 underline underline-offset-4 transition"
            >
              ← Analyze Another File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
