import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface AnalysisProgressProps {
  mediaType: 'image' | 'video';
}

interface Stage {
  label: string;
  detail: string;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ mediaType }) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [progressPercent, setProgressPercent] = useState(28);

  const stages: Stage[] =
    mediaType === 'video'
      ? [
          { label: 'Demuxing Video Stream', detail: 'Reading container frames with FFmpeg' },
          { label: 'Extracting Candidate Keyframes', detail: 'Sampling multi-frame keyframes across video duration' },
          { label: 'Optical ELA Evaluation', detail: 'Measuring 8x8 DCT recompression delta across candidate frames' },
          { label: 'Representative Frame Selection', detail: 'Selecting keyframe exhibiting peak compression variance' },
          { label: 'Multimodal Face Inspection', detail: 'Inspecting facial landmarks, boundaries, and lighting consistency' },
          { label: 'Forensic Synthesis', detail: 'Compiling keyframe observations and anomaly heatmap' },
        ]
      : [
          { label: 'Validating Media File', detail: 'Reading image headers and verifying dimensions' },
          { label: 'Error Level Analysis (ELA)', detail: 'Recompressing at fixed 90% quality to quantify quantization variance' },
          { label: 'Laplacian Edge & Blur Variance', detail: 'Quantifying spatial sharpness and focal blur consistency' },
          { label: 'Face Detection & Landmark Isolation', detail: 'Locating tight visible facial bounds from forehead to chin' },
          { label: 'Multimodal Neural Verification', detail: 'Inspecting corneal specularity, pores, and boundary seams' },
          { label: 'Generating Anomaly Visualization', detail: 'Constructing radial-gradient spatial anomaly overlay' },
        ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStageIdx((prev) => Math.min(stages.length - 1, prev + 1));
      setProgressPercent((prev) => Math.min(94, prev + Math.floor(Math.random() * 14 + 10)));
    }, 380);

    return () => clearInterval(interval);
  }, [stages.length]);

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Running Forensic Pipeline
            </h2>
            <p className="text-xs text-slate-400">
              Analyzing {mediaType === 'video' ? 'video keyframes' : 'facial image'} with physical & neural models
            </p>
          </div>
        </div>

        <span className="font-mono text-sm font-bold text-blue-400">
          {progressPercent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="mt-6 space-y-2.5">
        {stages.map((stage, idx) => {
          const isDone = idx < currentStageIdx;
          const isCurrent = idx === currentStageIdx;

          return (
            <div
              key={stage.label}
              className={`flex items-start space-x-3 rounded-2xl p-3 transition ${
                isCurrent
                  ? 'border border-blue-500/30 bg-blue-500/10'
                  : isDone
                  ? 'border border-white/10 bg-white/[0.03]'
                  : 'border border-transparent opacity-40'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : isCurrent ? (
                  <div className="flex h-4 w-4 items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
                  </div>
                ) : (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full border border-white/20 text-[10px] text-slate-400">
                    {idx + 1}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-xs font-semibold ${
                    isCurrent ? 'text-blue-300' : isDone ? 'text-slate-100' : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </p>
                <p className="text-[11px] text-slate-400">{stage.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
