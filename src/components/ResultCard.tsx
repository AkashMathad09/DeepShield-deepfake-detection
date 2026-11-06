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
  Printer,
  ChevronDown,
  ChevronUp,
  Info,
  Flame,
  FileText,
  Eye,
  CheckCircle2,
  ExternalLink,
  Video,
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
  const [activeVisualization, setActiveVisualization] = useState<'original' | 'ela' | 'anomaly'>('original');
  const [copiedNotification, setCopiedNotification] = useState(false);

  const isFake = result.prediction === 'DEEPFAKE';
  const isReal = result.prediction === 'REAL';
  const isVideo = result.mediaType === 'video';

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
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

  const gemini = result.geminiResult;
  const efficientNet = result.efficientNetResult;

  return (
    <div className="space-y-8">
      {/* =========================================================
          SECTION A: DETECTION SUMMARY
          ========================================================= */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left Column: Verdict & Metrics */}
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Forensic Analysis Report
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-xs text-blue-600 font-bold">{result.id}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">
                {new Date(result.timestamp).toLocaleDateString()} {new Date(result.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              {isFake ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200 shadow-xs">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              ) : isReal ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200 shadow-xs">
                  <HelpCircle className="h-6 w-6" />
                </div>
              )}

              <div>
                <h1
                  className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                    isFake ? 'text-rose-700' : isReal ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {isFake
                    ? isVideo ? 'Deepfake Video Detected' : 'Deepfake Image Detected'
                    : isReal
                    ? isVideo ? 'Authentic Video Verified' : 'Authentic Image Verified'
                    : 'Inconclusive / Uncertain'}
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-600 mt-0.5">
                  {result.manipulationCategory}
                </p>
              </div>
            </div>

            {/* Confidence & Probability Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold border ${
                  isFake
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : isReal
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <span>Confidence:</span>
                <span className="font-mono font-bold">{result.confidence.toFixed(1)}%</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                <span>Fake Probability:</span>
                <span className="font-mono font-bold text-slate-900">
                  {(result.fakeProbability * 100).toFixed(1)}%
                </span>
              </span>

              <span className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs text-slate-600">
                {result.interpretation === 'STRONG_EVIDENCE'
                  ? 'Strong Evidence'
                  : result.interpretation === 'UNCERTAIN'
                  ? 'Ambiguous Evidence'
                  : 'Low Evidence'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed border-l-2 border-blue-500 pl-3">
              {result.summaryText}
            </p>
          </div>

          {/* Right Column: File & Preview Summary */}
          <div className="w-full lg:w-80 rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <div className="relative aspect-video sm:aspect-square max-h-48 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-900 flex items-center justify-center">
              <img
                src={result.previewUrl}
                alt="Analyzed media"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div>
                <span className="text-slate-400 block">Filename:</span>
                <span className="font-medium text-slate-900 truncate block" title={result.filename}>
                  {result.filename}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">File Size:</span>
                <span className="font-medium text-slate-900">
                  {(result.fileSize / 1024).toFixed(1)} KB
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Media Type:</span>
                <span className="font-medium text-slate-900 capitalize">
                  {result.mediaType}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Processing Time:</span>
                <span className="font-medium text-slate-900">
                  {(result.modelInfo.executionTimeMs / 1000).toFixed(2)}s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition"
            >
              <Download className="h-3.5 w-3.5 text-blue-600" />
              <span>Export JSON Report</span>
            </button>
            <button
              onClick={handlePrintReport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition"
            >
              <Printer className="h-3.5 w-3.5 text-slate-600" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={handleShareReport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition"
            >
              <Share2 className="h-3.5 w-3.5 text-slate-600" />
              <span>{copiedNotification ? 'Link Copied' : 'Share'}</span>
            </button>
          </div>

          <button
            onClick={onReset}
            className="font-medium text-blue-600 hover:text-blue-800 transition"
          >
            ← Analyze Another File
          </button>
        </div>
      </section>

      {/* =========================================================
          SECTION B: INDEPENDENT MODEL RESULTS
          ========================================================= */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Model Results</h2>
            <p className="text-xs text-slate-500">
              Evaluated independently by each available detection model. Probabilities are kept separate without artificial ensemble averaging.
            </p>
          </div>
          <Cpu className="h-5 w-5 text-slate-400" />
        </div>

        {/* Model Disagreement Alert if both ran and reached different conclusions */}
        {gemini?.status === 'SUCCESS' &&
          efficientNet?.status === 'SUCCESS' &&
          gemini.prediction !== efficientNet.prediction && (
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <span className="font-bold block text-sm">Model Disagreement Notice</span>
                <p className="mt-0.5 leading-relaxed">
                  Google Gemini Multimodal classified this media as <strong>{gemini.prediction}</strong> while EfficientNet-B0 (PyTorch) classified it as <strong>{efficientNet.prediction}</strong>. Both independent model results are detailed below alongside physical ELA measurements.
                </p>
              </div>
            </div>
          )}

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Model 1: Google Gemini Analysis */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    gemini?.status === 'SUCCESS' ? 'bg-blue-600' : 'bg-slate-400'
                  }`}
                ></span>
                <h3 className="text-sm font-bold text-slate-900">Google Gemini Multimodal Vision</h3>
              </div>
              <span
                className={`rounded px-2 py-0.5 text-[11px] font-semibold border ${
                  gemini?.status === 'SUCCESS'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}
              >
                {gemini?.status === 'SUCCESS'
                  ? 'Active'
                  : gemini?.status === 'NOT_CONFIGURED'
                  ? 'Unconfigured'
                  : 'Unavailable'}
              </span>
            </div>

            {gemini?.status === 'SUCCESS' ? (
              <>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-lg bg-white border border-slate-200 p-2.5">
                    <span className="text-[11px] text-slate-500 block">Model Prediction</span>
                    <span
                      className={`text-sm font-bold block ${
                        gemini.prediction === 'DEEPFAKE'
                          ? 'text-rose-700'
                          : gemini.prediction === 'REAL'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {gemini.prediction}
                    </span>
                  </div>

                  <div className="rounded-lg bg-white border border-slate-200 p-2.5">
                    <span className="text-[11px] text-slate-500 block">Fake Probability</span>
                    <span className="text-sm font-mono font-bold text-slate-900 block">
                      {typeof gemini.fakeProbability === 'number'
                        ? `${(gemini.fakeProbability * 100).toFixed(1)}%`
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 leading-relaxed bg-white rounded-lg border border-slate-200 p-3">
                  <span className="font-semibold text-slate-800">Observations: </span>
                  {gemini.summary}
                </div>
              </>
            ) : (
              <div className="rounded-lg bg-white border border-slate-200 p-3.5 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Info className="h-4 w-4 text-slate-400" />
                  <span>Gemini Cloud AI Offline</span>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  {gemini?.summary || 'Gemini API key is unconfigured. Multimodal semantic vision analysis is unavailable.'}
                </p>
              </div>
            )}
          </div>

          {/* Model 2: EfficientNet-B0 Classification */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    efficientNet?.configured && efficientNet.status === 'SUCCESS'
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`}
                ></span>
                <h3 className="text-sm font-bold text-slate-900">EfficientNet-B0 (PyTorch)</h3>
              </div>
              <span
                className={`rounded px-2 py-0.5 text-[11px] font-semibold border ${
                  efficientNet?.configured && efficientNet.status === 'SUCCESS'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {efficientNet?.configured && efficientNet.status === 'SUCCESS'
                  ? 'Configured (FF++ c23)'
                  : 'Unconfigured'}
              </span>
            </div>

            {efficientNet?.configured && efficientNet.status === 'SUCCESS' ? (
              <>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-lg bg-white border border-slate-200 p-2.5">
                    <span className="text-[11px] text-slate-500 block">Model Prediction</span>
                    <span
                      className={`text-sm font-bold block ${
                        efficientNet.prediction === 'DEEPFAKE'
                          ? 'text-rose-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {efficientNet.prediction}
                    </span>
                  </div>

                  <div className="rounded-lg bg-white border border-slate-200 p-2.5">
                    <span className="text-[11px] text-slate-500 block">Fake Probability</span>
                    <span className="text-sm font-mono font-bold text-slate-900 block">
                      {efficientNet.fakeProbability !== null
                        ? `${(efficientNet.fakeProbability * 100).toFixed(1)}%`
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 leading-relaxed bg-white rounded-lg border border-slate-200 p-3 space-y-1">
                  <div>
                    <span className="font-semibold text-slate-800">Inference Status: </span>
                    {efficientNet.message}
                  </div>
                  {efficientNet.weightsPath && (
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      Checkpoint: {efficientNet.weightsPath.split('/').slice(-2).join('/')}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <div className="rounded-lg bg-amber-50/70 border border-amber-200 p-3 text-xs text-amber-800 leading-relaxed">
                  <div className="font-semibold text-amber-900 mb-1 flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-amber-600" />
                    <span>Model Checkpoint Not Configured</span>
                  </div>
                  <p>
                    Pretrained deepfake weights (<code className="font-mono">weights/efficientnet_b0_ffpp_c23.pth</code>) were not found or service is offline.
                  </p>
                  <p className="mt-1 text-[11px] text-amber-700">
                    To maintain strict forensic integrity, no placeholder or simulated confidence score is output.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION C: IMAGE FORENSIC ANALYSIS (ELA & LAPLACIAN)
          ========================================================= */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Physical & Compression Forensics</h2>
            <p className="text-xs text-slate-500">
              Deterministic optical and spatial compression measurements independent of neural networks.
            </p>
          </div>
          <Layers className="h-5 w-5 text-slate-400" />
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Metric 1: ELA Mean Difference */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <span className="text-xs font-semibold text-slate-600 block">ELA Mean Difference</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {result.technicalDetails.elaMeanDifference.toFixed(1)}
              </span>
              <span className="text-[11px] text-slate-500">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <strong>What it measures:</strong> The pixel intensity discrepancy when recompressing at 90% JPEG quality. Higher deltas indicate spliced or re-saved regions with mismatched quantization tables.
            </p>
          </div>

          {/* Metric 2: ELA Variance */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <span className="text-xs font-semibold text-slate-600 block">Spectral High-Frequency Energy (Variance)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {result.technicalDetails.spectralHighFreqEnergy.toFixed(1)}
              </span>
              <span className="text-[11px] text-slate-500">std dev</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <strong>What it measures:</strong> Non-uniformity of high-frequency sensor noise across the image. Spliced face patches often exhibit unnatural noise smoothing.
            </p>
          </div>

          {/* Metric 3: Laplacian Variance */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <span className="text-xs font-semibold text-slate-600 block">Laplacian Blur Variance</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {result.technicalDetails.laplacianBlurVariance.toFixed(1)}
              </span>
              <span className="text-[11px] text-slate-500">focus measure</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <strong>What it measures:</strong> Edge sharpness and gradient intensity. Unusually low values indicate artificial smoothing, while inconsistent variance between face and background signals composite editing.
            </p>
          </div>
        </div>

        {/* ELA Visualization View */}
        {result.elaHeatmapUrl && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Error Level Analysis (ELA) Compression Map
              </h3>
              <button
                onClick={onOpenHeatmap}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
              >
                Open side-by-side inspector →
              </button>
            </div>
            <div className="relative mx-auto max-h-[360px] overflow-hidden rounded-lg border border-slate-200 bg-slate-950 flex items-center justify-center p-2">
              <img
                src={result.elaHeatmapUrl}
                alt="ELA Map"
                className="max-h-[340px] w-full object-contain"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Bright highlights in the ELA map represent regions that lose significant information upon recompression, revealing inconsistent editing boundaries.
            </p>
          </div>
        )}
      </section>

      {/* =========================================================
          SECTION D: FACE ANALYSIS (OR FACE NOT DETECTED)
          ========================================================= */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Face Detection & Landmark Analysis
            </h2>
            <p className="text-xs text-slate-500">
              {result.faces.length > 0
                ? `${result.faces.length} visible face${result.faces.length > 1 ? 's' : ''} detected. Bounding boxes tightly wrap forehead to chin and cheek to cheek.`
                : 'Facial detection pipeline status and observations.'}
            </p>
          </div>
          {result.faces.length > 0 ? (
            <button
              onClick={() => setShowFaceBoxes(!showFaceBoxes)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              {showFaceBoxes ? 'Hide Bounding Boxes' : 'Show Bounding Boxes'}
            </button>
          ) : (
            <span className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600">
              0 Faces Detected
            </span>
          )}
        </div>

        {result.faces.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Visual with SVG Normalized Boxes shrinkwrapped to image bounds */}
            <div className="lg:col-span-6 flex items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-950">
              <div className="relative inline-block max-w-full max-h-[420px] overflow-hidden rounded-lg">
                <img
                  src={result.previewUrl}
                  alt="Analyzed media with bounding boxes"
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
                      const strokeColor = face.label === 'DEEPFAKE' ? '#e11d48' : '#059669';

                      return (
                        <g key={face.id}>
                          <rect
                            x={face.box.xmin}
                            y={face.box.ymin}
                            width={bw}
                            height={bh}
                            fill={face.label === 'DEEPFAKE' ? 'rgba(225, 29, 72, 0.16)' : 'rgba(5, 150, 105, 0.14)'}
                            stroke={strokeColor}
                            strokeWidth="5"
                            rx="4"
                          />
                          <rect
                            x={face.box.xmin}
                            y={Math.max(6, face.box.ymin - 34)}
                            width={Math.min(260, bw + 30)}
                            height="30"
                            fill="#ffffff"
                            stroke={strokeColor}
                            strokeWidth="2"
                            rx="4"
                          />
                          <text
                            x={face.box.xmin + 8}
                            y={Math.max(26, face.box.ymin - 13)}
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
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-900">
                      Face #{face.id} • {face.manipulationType || 'Facial Bounding Region'}
                    </span>
                    <span
                      className={`font-semibold rounded px-2 py-0.5 ${
                        face.label === 'DEEPFAKE'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {face.label} ({(face.fakeProbability * 100).toFixed(0)}% Fake)
                    </span>
                  </div>

                  {face.landmarks && (
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded bg-white border border-slate-200 p-2">
                        <span className="text-slate-500 block">Eye Symmetry:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {face.landmarks.eyeSymmetryScore}/100
                        </span>
                      </div>
                      <div className="rounded bg-white border border-slate-200 p-2">
                        <span className="text-slate-500 block">Boundary Seam Artifact:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {face.landmarks.boundarySeamArtifact}/100
                        </span>
                      </div>
                      <div className="rounded bg-white border border-slate-200 p-2">
                        <span className="text-slate-500 block">Skin Texture Naturalness:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {face.landmarks.skinTextureNaturalness}/100
                        </span>
                      </div>
                      <div className="rounded bg-white border border-slate-200 p-2">
                        <span className="text-slate-500 block">Lighting Consistency:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {face.landmarks.lightingConsistency}/100
                        </span>
                      </div>
                    </div>
                  )}

                  {face.notes && face.notes.length > 0 && (
                    <div className="text-[11px] text-slate-600 pt-1">
                      <span className="font-semibold text-slate-700">Observations: </span>
                      {face.notes.join(' • ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-6 text-center space-y-2.5">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-500">
              <ScanFace className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Face Not Detected</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              No human facial boundaries were identified by the facial detection pipeline in this media file. Facial landmark metrics and bounding box overlays are omitted instead of drawing estimated rectangles.
            </p>
          </div>
        )}
      </section>

      {/* =========================================================
          SECTION E: HEATMAP VISUALIZATION (RADIAL-GRADIENT ANOMALY)
          ========================================================= */}
      {result.gradCamHeatmapUrl && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Radial-Gradient Anomaly Visualization
              </h2>
              <p className="text-xs text-slate-500">
                Visual overlay highlighting regions with concentrated biometric or optical anomalies.
              </p>
            </div>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              Spatial Anomaly Overlay
            </span>
          </div>

          <div className="mt-5 space-y-3">
            <div className="relative mx-auto max-h-[420px] overflow-hidden rounded-xl border border-slate-200 bg-slate-950 flex items-center justify-center p-2">
              <img
                src={result.gradCamHeatmapUrl}
                alt="Radial-Gradient Anomaly Visualization"
                className="max-h-[400px] w-full object-contain"
              />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Technical Description:</strong> This overlay applies a radial-gradient color map focused on detected facial bounding coordinates when manipulation markers are identified. Warm/red hues designate regions of anomalous compression variance, while neutral areas indicate standard background optical consistency.
            </p>
          </div>
        </section>
      )}

      {/* =========================================================
          SECTION F: DETAILED EXPLANATION & SUMMARY
          ========================================================= */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Forensic Explanation & Interpretation</h2>
            <p className="text-xs text-slate-500">
              Detailed distinction between neural model predictions and optical forensic measurements.
            </p>
          </div>
          <FileText className="h-5 w-5 text-slate-400" />
        </div>

        <div className="mt-5 space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Understanding Neural Predictions vs. Physical Forensics</h3>
            <p>
              DeepShield separates forensic analysis into two distinct pillars:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li>
                <strong>Neural AI Models (Gemini Multimodal & EfficientNet-B0):</strong> Inspect high-level semantic features including eye corneal specular reflections, facial boundary blending seams, ear and hair boundary coherence, and skin micro-pores.
              </li>
              <li>
                <strong>Optical & Compression Forensics (ELA & Laplacian Variance):</strong> Calculate low-level mathematical properties directly from the digital image file. Error Level Analysis (ELA) isolates discrepancies in 8x8 block discrete cosine transform (DCT) quantization tables, while Laplacian blur variance checks for artificial spatial smoothing.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <h4 className="font-bold text-slate-800">Final Verification Guidance</h4>
            <p>
              When both neural vision and physical compression measurements agree (e.g., elevated ELA mean difference alongside facial boundary warping notes), evidence strongly supports digital tampering. If an image is heavily compressed through social media re-encoding, optical ELA scores may reflect universal compression rather than localized manipulation.
            </p>
          </div>
        </div>
      </section>

      {/* Video specific controls if video analysis */}
      {isVideo && (
        <div className="text-center">
          <button
            onClick={onOpenVideoTimeline}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
          >
            <Video className="h-4 w-4" />
            <span>Open Detailed Video Keyframe Timeline →</span>
          </button>
        </div>
      )}
    </div>
  );
};
