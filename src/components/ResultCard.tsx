import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  ScanFace,
  Layers,
  Activity,
  Download,
  Share2,
  Printer,
  Flame,
  Video,
  Clock,
  Film,
  CheckCircle2,
  ShieldAlert,
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
  const [copiedNotification, setCopiedNotification] = useState(false);

  const isFake = result.prediction === 'DEEPFAKE';
  const isReal = result.prediction === 'REAL';
  const isVideo = result.mediaType === 'video';

  const hasCalibratedFakeProb =
    typeof result.fakeProbability === 'number' &&
    !Number.isNaN(result.fakeProbability) &&
    (result.prediction !== 'UNCERTAIN' || result.confidence > 0);

  const visibleMetrics = isVideo
    ? result.metrics
    : result.metrics.filter((m) => m.category !== 'Temporal');

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `deepshield-forensics-${result.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleShareReport = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const evidenceLabel =
    result.interpretation === 'STRONG_EVIDENCE'
      ? 'Strong Evidence'
      : result.interpretation === 'UNCERTAIN'
      ? 'Moderate / Uncertain Evidence'
      : 'Low Evidence';

  return (
    <div className="space-y-8">
      {/* =========================================================
          SECTION A: SINGLE FORENSIC VERDICT & SUMMARY
          ========================================================= */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left Column: Verdict, Stats & Summary */}
          <div className="space-y-4 max-w-2xl flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Forensic Dossier
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-xs text-blue-400 font-bold">{result.id}</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">
                {new Date(result.timestamp).toLocaleDateString()}{' '}
                {new Date(result.timestamp).toLocaleTimeString()}
              </span>
            </div>

            {/* Primary Verdict Banner */}
            <div className="flex items-center gap-4">
              {isFake ? (
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-lg">
                  <ShieldAlert className="h-7 w-7" />
                </div>
              ) : isReal ? (
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-lg">
                  <ShieldCheck className="h-7 w-7" />
                </div>
              ) : (
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-lg">
                  <HelpCircle className="h-7 w-7" />
                </div>
              )}

              <div>
                <h1
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                    isFake ? 'text-rose-400' : isReal ? 'text-emerald-400' : 'text-amber-300'
                  }`}
                >
                  {isFake
                    ? 'DEEPFAKE DETECTED'
                    : isReal
                    ? 'AUTHENTIC MEDIA DETECTED'
                    : 'INCONCLUSIVE / UNCERTAIN'}
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-300 mt-0.5">
                  {result.manipulationCategory}
                </p>
              </div>
            </div>

            {/* Confidence & Evidence Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold border ${
                  isFake
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    : isReal
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}
              >
                <span>Confidence:</span>
                <span className="font-mono font-bold">
                  {result.confidence > 0 ? `${result.confidence.toFixed(1)}%` : 'N/A'}
                </span>
              </span>

              <span className="rounded-xl bg-white/5 border border-white/10 px-3.5 py-1.5 text-xs font-medium text-slate-300">
                {evidenceLabel}
              </span>

              {hasCalibratedFakeProb && result.fakeProbability !== null && (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950/60 border border-white/10 px-3.5 py-1.5 text-xs font-medium text-slate-300">
                  <span>Fake Probability:</span>
                  <span className="font-mono font-bold text-white">
                    {(result.fakeProbability * 100).toFixed(1)}%
                  </span>
                </span>
              )}
            </div>

            {/* Key Forensic Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="h-3 w-3 text-blue-400" />
                  <span>Processing Time</span>
                </span>
                <span className="mt-1 block font-mono text-sm font-bold text-white">
                  {(result.modelInfo.executionTimeMs / 1000).toFixed(2)}s
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <ScanFace className="h-3 w-3 text-cyan-400" />
                  <span>Faces Detected</span>
                </span>
                <span className="mt-1 block font-mono text-sm font-bold text-white">
                  {result.facesDetected}
                </span>
              </div>

              {isVideo && result.videoSummary ? (
                <>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Film className="h-3 w-3 text-indigo-400" />
                      <span>Frames Analyzed</span>
                    </span>
                    <span className="mt-1 block font-mono text-sm font-bold text-white">
                      {result.videoSummary.framesAnalyzedCount}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Activity className="h-3 w-3 text-emerald-400" />
                      <span>Temporal Score</span>
                    </span>
                    <span className="mt-1 block font-mono text-sm font-bold text-white">
                      {result.videoSummary.temporalConsistencyScore.toFixed(1)}%
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Layers className="h-3 w-3 text-blue-400" />
                      <span>ELA Mean Delta</span>
                    </span>
                    <span className="mt-1 block font-mono text-sm font-bold text-white">
                      {result.technicalDetails.elaMeanDifference.toFixed(1)}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Activity className="h-3 w-3 text-indigo-400" />
                      <span>Laplacian Blur</span>
                    </span>
                    <span className="mt-1 block font-mono text-sm font-bold text-white">
                      {result.technicalDetails.laplacianBlurVariance.toFixed(1)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Forensic Analysis Summary */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 border-l-2 border-l-blue-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
                Forensic Analysis Summary
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {result.summaryText}
              </p>
            </div>
          </div>

          {/* Right Column: File & Preview Summary */}
          <div className="w-full lg:w-80 rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-3 flex-shrink-0">
            <div className="relative aspect-video sm:aspect-square max-h-52 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-950 flex items-center justify-center">
              <img
                src={result.previewUrl}
                alt="Analyzed media"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-[11px] text-slate-300">
              <div>
                <span className="text-slate-400 block">Filename:</span>
                <span className="font-semibold text-white truncate block" title={result.filename}>
                  {result.filename}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">File Size:</span>
                <span className="font-mono font-semibold text-white">
                  {(result.fileSize / 1024).toFixed(1)} KB
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Media Type:</span>
                <span className="font-semibold text-white capitalize">
                  {result.mediaType}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Resolution / Input:</span>
                <span className="font-mono font-semibold text-blue-300 truncate block">
                  {result.modelInfo.inputDimensions}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-medium text-slate-200 hover:bg-white/10 transition"
            >
              <Download className="h-3.5 w-3.5 text-blue-400" />
              <span>Export JSON Report</span>
            </button>
            <button
              onClick={handlePrintReport}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-medium text-slate-200 hover:bg-white/10 transition"
            >
              <Printer className="h-3.5 w-3.5 text-slate-300" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={handleShareReport}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-medium text-slate-200 hover:bg-white/10 transition"
            >
              <Share2 className="h-3.5 w-3.5 text-slate-300" />
              <span>{copiedNotification ? 'Link Copied' : 'Share'}</span>
            </button>
            <button
              onClick={onOpenHeatmap}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3.5 py-2 font-medium text-blue-300 hover:bg-blue-500/20 transition"
            >
              <Flame className="h-3.5 w-3.5 text-blue-400" />
              <span>ELA & Anomaly Inspector</span>
            </button>
            {isVideo && (
              <button
                onClick={onOpenVideoTimeline}
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2 font-medium text-indigo-300 hover:bg-indigo-500/20 transition"
              >
                <Video className="h-3.5 w-3.5 text-indigo-400" />
                <span>Video Keyframe Timeline</span>
              </button>
            )}
          </div>

          <button
            onClick={onReset}
            className="font-semibold text-blue-400 hover:text-blue-300 transition"
          >
            ← Analyze Another Media
          </button>
        </div>
      </section>

      {/* =========================================================
          SECTION B: SPATIAL MEDIA & FACE BOUNDING COORDINATES
          ========================================================= */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ScanFace className="h-5 w-5 text-cyan-400" />
              <span>Spatial Media & Face Bounding Coordinates</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {result.faces.length > 0
                ? `${result.faces.length} visible face${result.faces.length > 1 ? 's' : ''} detected. Bounding boxes tightly outline forehead to chin and cheek to cheek.`
                : 'Facial detection pipeline status and spatial coordinates.'}
            </p>
          </div>
          {result.faces.length > 0 ? (
            <button
              onClick={() => setShowFaceBoxes(!showFaceBoxes)}
              className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 transition self-start sm:self-auto"
            >
              {showFaceBoxes ? 'Hide Bounding Boxes' : 'Show Bounding Boxes'}
            </button>
          ) : (
            <span className="rounded-xl bg-white/5 border border-white/10 px-3 py-1 text-xs font-medium text-slate-400 self-start sm:self-auto">
              0 Faces Detected
            </span>
          )}
        </div>

        {result.faces.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Shrinkwrapped SVG Normalized Face Bounding Boxes */}
            <div className="lg:col-span-6 flex items-center justify-center p-3 rounded-2xl border border-white/10 bg-slate-950">
              <div className="relative inline-block max-w-full max-h-[420px] overflow-hidden rounded-xl">
                <img
                  src={result.previewUrl}
                  alt="Analyzed media with face bounding boxes"
                  className="max-h-[420px] max-w-full block object-contain mx-auto"
                />

                {showFaceBoxes && (
                  <svg
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    viewBox="0 0 1000 1000"
                    preserveAspectRatio="none"
                  >
                    {result.faces.map((face) => {
                      const bw = Math.max(15, face.box.xmax - face.box.xmin);
                      const bh = Math.max(15, face.box.ymax - face.box.ymin);
                      const strokeColor = face.label === 'DEEPFAKE' ? '#fb7185' : '#34d399';
                      const labelWidth = Math.min(340, Math.max(210, bw + 40));

                      return (
                        <g key={face.id}>
                          <rect
                            x={face.box.xmin}
                            y={face.box.ymin}
                            width={bw}
                            height={bh}
                            fill={
                              face.label === 'DEEPFAKE'
                                ? 'rgba(244, 63, 94, 0.14)'
                                : 'rgba(16, 185, 129, 0.12)'
                            }
                            stroke={strokeColor}
                            strokeWidth="5"
                            rx="4"
                          />
                          <rect
                            x={Math.min(1000 - labelWidth, face.box.xmin)}
                            y={Math.max(4, face.box.ymin - 36)}
                            width={labelWidth}
                            height="32"
                            fill="#0f172a"
                            stroke={strokeColor}
                            strokeWidth="2"
                            rx="4"
                          />
                          <text
                            x={Math.min(1000 - labelWidth, face.box.xmin) + 8}
                            y={Math.max(25, face.box.ymin - 14)}
                            fill={strokeColor}
                            fontSize="18"
                            fontWeight="bold"
                            fontFamily="sans-serif"
                          >
                            Face #{face.id} • {face.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>
            </div>

            {/* Face Cards List */}
            <div className="lg:col-span-6 space-y-3">
              {result.faces.map((face) => (
                <div
                  key={face.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 gap-2">
                    <span className="font-bold text-white">
                      Face #{face.id} • {face.manipulationType || 'Facial Bounding Region'}
                    </span>
                    <span
                      className={`font-semibold rounded-lg px-2.5 py-0.5 border ${
                        face.label === 'DEEPFAKE'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {face.label} ({(face.fakeProbability * 100).toFixed(0)}% Fake)
                    </span>
                  </div>

                  {face.landmarks && (
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded-xl bg-white/5 border border-white/10 p-2.5">
                        <span className="text-slate-400 block">Eye Symmetry:</span>
                        <span className="font-mono font-bold text-slate-100">
                          {face.landmarks.eyeSymmetryScore}/100
                        </span>
                      </div>
                      <div className="rounded-xl bg-white/5 border border-white/10 p-2.5">
                        <span className="text-slate-400 block">Boundary Seam Artifact:</span>
                        <span className="font-mono font-bold text-slate-100">
                          {face.landmarks.boundarySeamArtifact}/100
                        </span>
                      </div>
                      <div className="rounded-xl bg-white/5 border border-white/10 p-2.5">
                        <span className="text-slate-400 block">Skin Texture Naturalness:</span>
                        <span className="font-mono font-bold text-slate-100">
                          {face.landmarks.skinTextureNaturalness}/100
                        </span>
                      </div>
                      <div className="rounded-xl bg-white/5 border border-white/10 p-2.5">
                        <span className="text-slate-400 block">Lighting Consistency:</span>
                        <span className="font-mono font-bold text-slate-100">
                          {face.landmarks.lightingConsistency}/100
                        </span>
                      </div>
                    </div>
                  )}

                  {face.notes && face.notes.length > 0 && (
                    <div className="text-[11px] text-slate-300 pt-1">
                      <span className="font-semibold text-white">Observations: </span>
                      {face.notes.join(' • ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/60 p-8 text-center space-y-2.5">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-400">
              <ScanFace className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Face Not Detected</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              No human facial boundaries were identified in this media file. Bounding box overlays and facial landmark metrics are omitted.
            </p>
          </div>
        )}
      </section>

      {/* =========================================================
          SECTION C: DETAILED FORENSIC INDICATORS
          ========================================================= */}
      {visibleMetrics.length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-400" />
                <span>Detailed Forensic Indicators</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isVideo
                  ? 'Inter-frame temporal stability, facial boundary blending, corneal reflections, ELA residuals, and epidermal texture integrity.'
                  : 'Facial boundary blending, corneal specularity, Error Level Analysis (ELA) residuals, and skin micro-texture integrity.'}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleMetrics.map((metric) => {
              const isCritical = metric.status === 'critical';
              const isSuspicious = metric.status === 'suspicious';
              const barColor = isCritical
                ? 'bg-rose-500'
                : isSuspicious
                ? 'bg-amber-400'
                : 'bg-emerald-400';
              const badgeClass = isCritical
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : isSuspicious
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';

              return (
                <div
                  key={metric.name}
                  className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-blue-400">
                        {metric.category}
                      </span>
                      <h3 className="text-sm font-bold text-white">{metric.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-mono text-sm font-bold text-white">
                        {metric.score}/100
                      </span>
                      <span
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase border ${badgeClass}`}
                      >
                        {metric.status === 'normal' ? (
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Normal
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {metric.status}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Anomaly Level Bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${Math.min(100, Math.max(4, metric.score))}%` }}
                    />
                  </div>

                  {metric.description && (
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {metric.description}
                    </p>
                  )}
                  {metric.explanation && (
                    <p className="text-xs text-slate-200 leading-relaxed pt-0.5 border-t border-white/5">
                      {metric.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =========================================================
          SECTION D: PHYSICAL & OPTICAL FORENSICS (ELA & ANOMALY MAPS)
          ========================================================= */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">Physical & Optical Forensics</h2>
            <p className="text-xs text-slate-400">
              Deterministic Error Level Analysis (ELA) residuals, Laplacian edge variance, and spatial anomaly maps.
            </p>
          </div>
          <Layers className="h-5 w-5 text-indigo-400" />
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">ELA Mean Difference</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-blue-400">
                {result.technicalDetails.elaMeanDifference.toFixed(1)}
              </span>
              <span className="text-[11px] text-slate-400">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Pixel intensity discrepancy when recompressing at 90% JPEG quality. Higher deltas signal spliced or re-saved facial regions.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Spectral High-Frequency Energy
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-indigo-400">
                {result.technicalDetails.spectralHighFreqEnergy.toFixed(1)}
              </span>
              <span className="text-[11px] text-slate-400">std dev</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Non-uniformity of high-frequency sensor noise across the frame. Spliced patches often exhibit abnormal noise smoothing.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Laplacian Blur Variance
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-cyan-400">
                {result.technicalDetails.laplacianBlurVariance.toFixed(1)}
              </span>
              <span className="text-[11px] text-slate-400">focus measure</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Edge sharpness and gradient intensity. Low variance reveals artificial smoothing; divergent variance signals compositing.
            </p>
          </div>
        </div>

        {/* ELA Map & Radial-Gradient Anomaly Visualization Side-by-Side */}
        {(result.elaHeatmapUrl || result.gradCamHeatmapUrl) && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {result.elaHeatmapUrl && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Error Level Analysis (ELA) Map
                  </h3>
                  <button
                    onClick={onOpenHeatmap}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
                  >
                    Open Inspector →
                  </button>
                </div>
                <div className="relative mx-auto max-h-[300px] overflow-hidden rounded-xl border border-white/10 bg-slate-950 flex items-center justify-center p-2">
                  <img
                    src={result.elaHeatmapUrl}
                    alt="ELA Map"
                    className="max-h-[280px] w-full object-contain"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Bright highlights show regions with higher 8x8 DCT recompression error delta.
                </p>
              </div>
            )}

            {result.gradCamHeatmapUrl && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Radial-Gradient Anomaly Map
                  </h3>
                  <span className="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                    Spatial Overlay
                  </span>
                </div>
                <div className="relative mx-auto max-h-[300px] overflow-hidden rounded-xl border border-white/10 bg-slate-950 flex items-center justify-center p-2">
                  <img
                    src={result.gradCamHeatmapUrl}
                    alt="Radial-Gradient Anomaly Visualization"
                    className="max-h-[280px] w-full object-contain"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Highlights detected facial zones where compression or biometric anomalies are concentrated.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
