import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Video, AlertTriangle, ShieldCheck, Layers, Flame } from 'lucide-react';
import { AnalysisResult, FramePrediction } from '../types';

interface VideoAnalysisChartProps {
  result: AnalysisResult | null;
  onBackToStudio: () => void;
}

export const VideoAnalysisChart: React.FC<VideoAnalysisChartProps> = ({
  result,
  onBackToStudio,
}) => {
  const [selectedFrame, setSelectedFrame] = useState<FramePrediction | null>(null);

  if (!result || result.mediaType !== 'video' || !result.videoTimeline) {
    return (
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl shadow-2xl">
        <Video className="mx-auto h-12 w-12 text-slate-500" />
        <h2 className="mt-4 text-lg font-bold text-slate-100">No Video Analysis Available</h2>
        <p className="mt-2 text-sm text-slate-400">
          Upload an MP4, MOV, or WEBM video in the Detector Studio to inspect multi-frame temporal consistency and frame risk curves.
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

  const summary = result.videoSummary;
  const timeline = result.videoTimeline;
  const activeFrame = selectedFrame || timeline[0];

  const chartData = timeline.map((f) => ({
    frame: `F#${f.frameIndex}`,
    time: `${f.timestampSeconds}s`,
    probability: Math.round(f.fakeProbability * 100),
    confidence: f.confidence,
    status: f.status,
    anomaly: f.keyAnomaly,
    raw: f,
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner with Video Metrics Summary */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
              <span className="font-mono text-xs uppercase tracking-wider text-slate-400">
                MULTI-FRAME TEMPORAL FORENSIC MATRIX
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-slate-100">
              Video Frame-by-Frame Anomaly Timeline
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Sampled at {summary?.fps || 30} FPS • Duration: {summary?.totalDurationSeconds}s •{' '}
              {summary?.framesAnalyzedCount} Keyframes Processed
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`rounded-full px-3 py-1 font-mono text-xs font-bold border ${
                result.prediction === 'DEEPFAKE'
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              }`}
            >
              Overall: {result.prediction} ({result.confidence}%)
            </span>
          </div>
        </div>

        {/* 4-Stat Metric Strip */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
              <Layers className="h-4 w-4 text-blue-400" />
              <span>Frames Sampled</span>
            </div>
            <p className="mt-1 text-xl font-bold text-slate-100">
              {summary?.framesAnalyzedCount} / {summary?.totalVideoFrames}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
              <Flame className="h-4 w-4 text-rose-400" />
              <span>Avg Fake Probability</span>
            </div>
            <p className="mt-1 text-xl font-bold text-slate-100">
              {((summary?.averageFakeProbability ?? 0) * 100).toFixed(1)}%
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span>Highest-Risk Frame</span>
            </div>
            <p className="mt-1 text-lg font-bold text-rose-400 truncate">
              Frame #{summary?.maxRiskFrame.frameIndex} (
              {((summary?.maxRiskFrame.fakeProbability ?? 0) * 100).toFixed(0)}%)
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Temporal Consistency</span>
            </div>
            <p className="mt-1 text-xl font-bold text-slate-100">
              {summary?.temporalConsistencyScore}%
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Waveform & Frame Viewer */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Recharts Line/Area Chart (7 cols) */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-xl lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <span>Frame Manipulation Probability Curve</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              Threshold: 50% Fake Line
            </span>
          </div>

          {/* Chart Container */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]?.payload?.raw) {
                    setSelectedFrame(e.activePayload[0].payload.raw);
                  }
                }}
              >
                <defs>
                  <linearGradient id="probGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                    <stop offset="60%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.06} />
                <XAxis dataKey="frame" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} unit="%" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-2xl border border-white/10 bg-slate-950/90 backdrop-blur-md p-3 text-xs shadow-xl">
                          <p className="font-mono font-bold text-slate-200">
                            {data.frame} ({data.time})
                          </p>
                          <p
                            className={`mt-1 font-bold ${
                              data.probability > 50 ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            Fake Probability: {data.probability}%
                          </p>
                          {data.anomaly && (
                            <p className="mt-1 text-[10px] text-amber-300">
                              Anomaly: {data.anomaly}
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '50% Threshold', fill: '#f59e0b', fontSize: 10 }} />
                <Area
                  type="monotone"
                  dataKey="probability"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#probGradient)"
                  activeDot={{ r: 6, fill: '#38bdf8' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Click on any frame node in the graph or the strip below to inspect frame details.
          </p>

          {/* Keyframe Scrubber Strip */}
          <div className="space-y-2 pt-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sampled Keyframe Scrubber ({timeline.length} Frames)
            </h2>
            <div className="flex space-x-2.5 overflow-x-auto pb-2">
              {timeline.map((f) => {
                const isSelected = activeFrame.frameIndex === f.frameIndex;
                const isFrameFake = f.fakeProbability > 0.5;

                return (
                  <button
                    key={f.frameIndex}
                    onClick={() => setSelectedFrame(f)}
                    className={`relative flex-shrink-0 w-20 rounded-xl border p-1 text-left transition backdrop-blur-md ${
                      isSelected
                        ? 'border-blue-400 bg-blue-500/20 ring-2 ring-blue-500/40'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="h-12 w-full overflow-hidden rounded-lg bg-slate-900">
                      <img
                        src={f.thumbnailBase64 || result.previewUrl}
                        alt={`Frame ${f.frameIndex}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">#{f.frameIndex}</span>
                      <span
                        className={`font-bold ${
                          isFrameFake ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {(f.fakeProbability * 100).toFixed(0)}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Frame Deep Dive Inspector (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-200">
                  Keyframe #{activeFrame.frameIndex} Inspection
                </h2>
                <p className="text-xs text-slate-400">Timestamp: {activeFrame.timestampSeconds}s</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 font-mono text-xs font-bold border ${
                  activeFrame.fakeProbability > 0.5
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {activeFrame.status}
              </span>
            </div>

            {/* Frame Thumbnail Preview */}
            <div className="relative mx-auto max-h-56 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
              <img
                src={activeFrame.thumbnailBase64 || result.previewUrl}
                alt={`Keyframe ${activeFrame.frameIndex}`}
                className="max-h-56 w-full object-contain"
              />
            </div>

            {/* Metrics for this Frame */}
            <div className="space-y-2 rounded-2xl border border-white/5 bg-white/5 p-4 text-xs font-mono backdrop-blur-md">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Frame Fake Probability:</span>
                <span
                  className={`font-bold ${
                    activeFrame.fakeProbability > 0.5 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {(activeFrame.fakeProbability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Biometric Faces Isolated:</span>
                <span className="text-slate-200">{activeFrame.facesDetected} Face</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Model Confidence:</span>
                <span className="text-blue-400">{activeFrame.confidence.toFixed(1)}%</span>
              </div>
            </div>

            {/* Anomaly Callout if flagged */}
            {activeFrame.keyAnomaly && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300 flex items-start space-x-2 backdrop-blur-md">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Detected Temporal Artifact: </span>
                  {activeFrame.keyAnomaly}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

