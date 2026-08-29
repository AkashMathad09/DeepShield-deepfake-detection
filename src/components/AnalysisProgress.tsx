import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Cpu, Radio, Sparkles } from 'lucide-react';

interface AnalysisProgressProps {
  mediaType: 'image' | 'video' | 'audio';
}

interface Stage {
  label: string;
  detail: string;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ mediaType }) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [progressPercent, setProgressPercent] = useState(28);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    'Initializing DeepShield Forensic Inference Pipeline v4.2...',
    'Allocating GPU memory buffers and validating media format headers...',
  ]);

  const stages: Stage[] =
    mediaType === 'audio'
      ? [
          { label: 'Demuxing Audio Track', detail: 'Validating sampling rate, channels, and PCM codec parameters' },
          { label: 'FFmpeg Spectrogram Generation', detail: 'Computing logarithmic STFT bi-spectral frequency matrix' },
          { label: 'Formant Dispersion Analysis', detail: 'Extracting F1-F4 vocal tract resonances and glottal flow' },
          { label: 'Neural Vocoder Residual Check', detail: 'Scanning high-frequency phase artifacts & HiFi-GAN signatures' },
          { label: 'Breath & Prosody Calibration', detail: 'Evaluating biological inhalation pauses and micro-jitter' },
        ]
      : mediaType === 'video'
      ? [
          { label: 'Ingesting Video Stream', detail: 'Validating container format & demuxing tracks' },
          { label: 'FFmpeg Keyframe Extraction', detail: 'Sampling multi-frame keyframes across timeline' },
          { label: 'Biometric Face Localization', detail: 'Extracting bounding coordinates & facial landmarks' },
          { label: 'Physical & ELA Forensics', detail: 'Computing 8x8 DCT recompression error levels & Laplacian variance' },
          { label: 'Multimodal AI Neural Inference', detail: 'Inspecting corneal reflections, blending seams, and skin pores' },
          { label: 'Temporal Consistency Aggregation', detail: 'Calculating multi-frame probability curve & confidence index' },
        ]
      : [
          { label: 'Ingesting Media & Format Check', detail: 'Validating MIME headers and spatial resolution' },
          { label: 'Error Level Analysis (ELA) Core', detail: 'Recompressing at 90% JPEG quality to measure quantization delta' },
          { label: 'Face Detection & Landmark Alignment', detail: 'Isolating facial patches, eye irises, and mouth contours' },
          { label: 'Dual-Branch Neural Forensics', detail: 'Evaluating spatial frequency noise and generative GAN signatures' },
          { label: 'Confidence Score Calibration', detail: 'Synthesizing forensic metrics into calibrated verdict' },
        ];

  useEffect(() => {
    // Fast, responsive progression interval for instant user feedback
    const interval = setInterval(() => {
      setCurrentStageIdx((prev) => {
        const next = Math.min(stages.length - 1, prev + 1);
        return next;
      });

      setProgressPercent((prev) => Math.min(96, prev + Math.floor(Math.random() * 18 + 14)));
    }, 280);

    const logInterval = setInterval(() => {
      const logs =
        mediaType === 'audio'
          ? [
              'Extracting Short-Time Fourier Transform (STFT) spectrogram coefficients...',
              'Calculating vocal tract formant dispersion (F1-F4 frequencies)...',
              'Checking for phase quantization and neural vocoder cutoff bands...',
              'Scanning for biological glottal air pulses and inhalation breath noise...',
              'Cross-correlating micro-pitch jitter against ASVspoof benchmarks...',
              'Analyzing ambient room impulse acoustic continuity...',
            ]
          : [
              'Computing discrete cosine transform (DCT) spectral residuals...',
              'Checking left/right corneal specular highlight geometry...',
              'Scanning facial boundary perimeter for warping & alpha blend halos...',
              'Analyzing high-frequency noise variance across RGB channels...',
              'Correlating inter-frame optical flow vectors for micro-jitters...',
              'Cross-verifying biometric landmarks with DeepShield benchmark database...',
              'Generating Grad-CAM attention heatmap overlay...',
            ];
      setTelemetryLogs((prev) => [...prev.slice(-4), logs[Math.floor(Math.random() * logs.length)]]);
    }, 350);

    return () => {
      clearInterval(interval);
      clearInterval(logInterval);
    };
  }, [stages.length, mediaType]);

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      {/* Header with Radar Icon */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Analyzing Detection Pipeline...</span>
              <Sparkles className="h-4 w-4 text-blue-400 animate-spin" />
            </h2>
            <p className="text-xs text-slate-400">
              Running deep computer vision & neural forensic models
            </p>
          </div>
        </div>

        <div className="font-mono text-sm font-bold text-blue-400">
          {progressPercent}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/5 border border-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Stages Checklist */}
      <div className="mt-6 space-y-2.5">
        {stages.map((stage, idx) => {
          const isDone = idx < currentStageIdx;
          const isCurrent = idx === currentStageIdx;

          return (
            <div
              key={stage.label}
              className={`flex items-start space-x-3 rounded-2xl p-3 backdrop-blur-md transition-all ${
                isCurrent
                  ? 'border border-blue-500/40 bg-blue-500/10'
                  : isDone
                  ? 'border border-white/5 bg-white/5'
                  : 'border border-transparent opacity-40'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isDone ? (
                  <div className="w-5 h-5 rounded-full border border-green-500 flex items-center justify-center text-[10px] text-green-400 font-bold">
                    ✓
                  </div>
                ) : isCurrent ? (
                  <div className="w-5 h-5 rounded-full border border-blue-500 flex items-center justify-center text-[10px] text-blue-500">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div>
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-600 font-mono">
                    {idx + 1}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-xs font-semibold ${
                    isCurrent ? 'text-blue-400' : isDone ? 'text-slate-200' : 'text-slate-500'
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

      {/* Live Telemetry Log Feed */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 font-mono text-[11px] backdrop-blur-xl">
        <div className="flex items-center space-x-2 text-slate-400 pb-2 border-b border-white/5">
          <Cpu className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Inference Telemetry Feed
          </span>
        </div>
        <div className="mt-2.5 space-y-1.5 text-slate-300">
          {telemetryLogs.map((log, i) => (
            <div key={i} className="flex items-center space-x-2 text-blue-300/90 truncate">
              <span className="text-blue-500">›</span>
              <span className="truncate">{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

