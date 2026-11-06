import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Shield, Eye, Cpu } from 'lucide-react';

interface AnalysisProgressProps {
  mediaType: 'image' | 'video';
}

interface Stage {
  label: string;
  detail: string;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ mediaType }) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [progressPercent, setProgressPercent] = useState(30);

  const stages: Stage[] =
    mediaType === 'video'
      ? [
          { label: 'Demuxing Video Stream', detail: 'Reading container frames with FFmpeg' },
          { label: 'Extracting Candidate Keyframes', detail: 'Sampling multi-frame keyframes across video duration' },
          { label: 'Optical ELA Evaluation', detail: 'Measuring 8x8 DCT recompression delta across candidate frames' },
          { label: 'Representative Frame Selection', detail: 'Selecting keyframe exhibiting peak compression variance' },
          { label: 'Multimodal Neural Inspection', detail: 'Inspecting facial landmarks, boundaries, and lighting consistency' },
          { label: 'Forensic Synthesis', detail: 'Compiling keyframe observations and metric report' },
        ]
      : [
          { label: 'Validating Media File', detail: 'Reading image headers and verifying dimensions' },
          { label: 'Error Level Analysis (ELA)', detail: 'Recompressing at fixed 90% quality to quantify quantization variance' },
          { label: 'Laplacian Edge & Blur Variance', detail: 'Quantifying spatial sharpness and focal blur consistency' },
          { label: 'Google Gemini Multimodal Vision', detail: 'Deep biometric inspection of facial boundaries, pores, and reflections' },
          { label: 'PyTorch EfficientNet-B0 Verification', detail: 'Querying dedicated visual neural classification microservice' },
          { label: 'Generating Anomaly Visualization', detail: 'Constructing radial-gradient spatial anomaly overlay' },
        ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStageIdx((prev) => Math.min(stages.length - 1, prev + 1));
      setProgressPercent((prev) => Math.min(94, prev + Math.floor(Math.random() * 15 + 12)));
    }, 380);

    return () => clearInterval(interval);
  }, [stages.length]);

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Running Forensic Pipeline
            </h2>
            <p className="text-xs text-slate-500">
              Analyzing {mediaType === 'video' ? 'video keyframes' : 'image'} with physical & neural models
            </p>
          </div>
        </div>

        <span className="font-mono text-sm font-bold text-blue-600">
          {progressPercent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
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
              className={`flex items-start space-x-3 rounded-xl p-3 transition ${
                isCurrent
                  ? 'border border-blue-200 bg-blue-50/60'
                  : isDone
                  ? 'border border-slate-100 bg-slate-50/50'
                  : 'border border-transparent opacity-40'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : isCurrent ? (
                  <div className="flex h-4 w-4 items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                  </div>
                ) : (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] text-slate-500">
                    {idx + 1}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-xs font-semibold ${
                    isCurrent ? 'text-blue-700' : isDone ? 'text-slate-800' : 'text-slate-500'
                  }`}
                >
                  {stage.label}
                </p>
                <p className="text-[11px] text-slate-500">{stage.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
