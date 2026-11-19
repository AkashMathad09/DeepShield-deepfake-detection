import React, { useState } from 'react';
import {
  Video as VideoIcon,
  AlertTriangle,
  Info,
  ArrowLeft,
} from 'lucide-react';
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

  if (!result || result.mediaType !== 'video') {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl shadow-xl">
        <VideoIcon className="mx-auto h-12 w-12 text-slate-500" />
        <h2 className="mt-4 text-lg font-bold text-white">No Video Analysis Available</h2>
        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
          Upload an MP4, MOV, or WEBM video in Detector Studio to inspect keyframe extraction, ELA candidate scores, and forensic metrics.
        </p>
        <button
          onClick={onBackToStudio}
          className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 transition"
        >
          Go to Detector Studio
        </button>
      </div>
    );
  }

  const summary = result.videoSummary;
  const timeline = result.videoTimeline || [];
  const candidateFrames = summary?.candidateFrames || [];
  const activeFrame = selectedFrame || timeline[0];

  const isFake = result.prediction === 'DEEPFAKE';
  const isReal = result.prediction === 'REAL';

  return (
    <div className="space-y-8">
      {/* Top Banner: Video Metrics & Final Prediction */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-blue-400 font-semibold">
                Video Keyframe Forensics
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-xs text-slate-300 font-bold">{result.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Video Detection & Keyframe Analysis
            </h1>
            <p className="text-xs text-slate-400">
              Analyzed with FFmpeg Keyframe Extractor & Optical Error Level Analysis
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold border ${
                isFake
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  : isReal
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}
            >
              <span>Final Verdict:</span>
              <span>{result.prediction}</span>
              <span className="text-xs font-mono font-normal">({result.confidence.toFixed(1)}% conf)</span>
            </span>
          </div>
        </div>

        {/* 4 Essential Video Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <span className="text-xs font-semibold text-slate-400 block">Video Duration</span>
            <span className="mt-1 text-xl font-bold font-mono text-white block">
              {summary?.totalDurationSeconds || 0}s
            </span>
            <span className="text-[11px] text-slate-400">
              {summary?.fps || 30} FPS • {summary?.resolution || 'Original'}
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <span className="text-xs font-semibold text-slate-400 block">Extracted Frames</span>
            <span className="mt-1 text-xl font-bold font-mono text-white block">
              {summary?.totalVideoFrames || 0}
            </span>
            <span className="text-[11px] text-slate-400">Total stream frames</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <span className="text-xs font-semibold text-slate-400 block">Sampled Keyframes</span>
            <span className="mt-1 text-xl font-bold font-mono text-white block">
              {summary?.framesAnalyzedCount || timeline.length}
            </span>
            <span className="text-[11px] text-slate-400">Evaluated candidates</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <span className="text-xs font-semibold text-slate-400 block">Representative Keyframe</span>
            <span className="mt-1 text-xl font-bold font-mono text-blue-400 block">
              Frame #{summary?.representativeFrameIndex || 1}
            </span>
            <span className="text-[11px] text-slate-400">Peak ELA deviation</span>
          </div>
        </div>

        {/* Summary Narrative */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-white">Analysis Summary: </span>
          {result.summaryText}
        </div>
      </section>

      {/* Representative Keyframe Selection Explanation */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-white/10">
          <Info className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-bold text-white">
            How the Representative Frame was Selected
          </h2>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Rather than relying on arbitrary single-frame screenshots, DeepShield samples candidate keyframes across the video stream using FFmpeg. Each candidate is tested for physical compression discrepancies using Error Level Analysis (ELA). The frame with the highest ELA mean difference is isolated as the representative frame and subjected to full multimodal neural inspection.
        </p>

        {summary?.selectionMethodExplanation && (
          <div className="rounded-2xl bg-blue-500/10 border border-blue-500/25 p-3.5 text-xs text-blue-200">
            <strong>Selection Log: </strong> {summary.selectionMethodExplanation}
          </div>
        )}

        {/* Candidate Frames ELA Comparison Table */}
        {candidateFrames.length > 0 && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-semibold font-mono">
                  <th className="py-2.5">Candidate Frame</th>
                  <th className="py-2.5">Timestamp</th>
                  <th className="py-2.5">ELA Mean Difference</th>
                  <th className="py-2.5">Laplacian Blur Variance</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {candidateFrames.map((c) => (
                  <tr
                    key={c.index}
                    className={c.isRepresentative ? 'bg-blue-500/10 font-semibold' : 'hover:bg-white/[0.03]'}
                  >
                    <td className="py-2.5 font-mono text-slate-100">Frame #{c.index}</td>
                    <td className="py-2.5 text-slate-300">{c.timestampSeconds}s</td>
                    <td className="py-2.5 font-mono text-slate-200">{c.elaMeanDifference.toFixed(1)}</td>
                    <td className="py-2.5 font-mono text-slate-200">{c.laplacianVariance.toFixed(1)}</td>
                    <td className="py-2.5">
                      {c.isRepresentative ? (
                        <span className="rounded-md bg-blue-600 text-white px-2 py-0.5 text-[10px] font-bold">
                          Selected Representative
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Evaluated</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Frame Scrubber & Inspection */}
      {timeline.length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-white">
              Sampled Keyframe Scrubber ({timeline.length} Frames)
            </h2>
            <p className="text-xs text-slate-400">
              Optical anomaly variance recorded across extracted keyframes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Scrubber Cards */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex gap-2.5 overflow-x-auto pb-3">
                {timeline.map((f) => {
                  const isSelected = activeFrame?.frameIndex === f.frameIndex;
                  const isFrameFake = f.fakeProbability > 0.5;

                  return (
                    <button
                      key={f.frameIndex}
                      onClick={() => setSelectedFrame(f)}
                      className={`flex-shrink-0 w-24 rounded-2xl border p-1.5 text-left transition ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/15 ring-2 ring-blue-500/30'
                          : 'border-white/10 bg-slate-950/60 hover:border-white/25'
                      }`}
                    >
                      <div className="h-14 w-full overflow-hidden rounded-xl bg-slate-950">
                        <img
                          src={f.thumbnailBase64 || result.previewUrl}
                          alt={`Frame ${f.frameIndex}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
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

              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3.5 text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-slate-200">Forensic Note:</strong> Frame probabilities reflect localized optical compression variance across sampled keyframes anchored to the representative keyframe inspection.
              </div>
            </div>

            {/* Selected Keyframe Detail */}
            {activeFrame && (
              <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-bold text-white text-xs">
                    Frame #{activeFrame.frameIndex} Details
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    Timestamp: {activeFrame.timestampSeconds}s
                  </span>
                </div>

                <div className="relative mx-auto max-h-56 overflow-hidden rounded-xl border border-white/10 bg-slate-950 flex items-center justify-center">
                  <img
                    src={activeFrame.thumbnailBase64 || result.previewUrl}
                    alt={`Frame ${activeFrame.frameIndex}`}
                    className="max-h-52 w-full object-contain"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-slate-400">Status:</span>
                    <span
                      className={`font-semibold ${
                        activeFrame.fakeProbability > 0.5 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {activeFrame.status}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-slate-400">Fake Probability:</span>
                    <span className="font-mono font-bold text-white">
                      {(activeFrame.fakeProbability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Faces Detected:</span>
                    <span className="font-mono font-semibold text-slate-200">
                      {activeFrame.facesDetected}
                    </span>
                  </div>
                </div>

                {activeFrame.keyAnomaly && (
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-2.5 text-xs text-amber-300 flex items-start gap-1.5">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-400 mt-0.5" />
                    <span>{activeFrame.keyAnomaly}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Return Button */}
      <div className="text-center">
        <button
          onClick={onBackToStudio}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Detector Studio</span>
        </button>
      </div>
    </div>
  );
};
