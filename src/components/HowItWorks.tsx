import React from 'react';
import {
  UploadCloud,
  Layers,
  ScanFace,
  Cpu,
  CheckCircle2,
  ShieldAlert,
  Activity,
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Upload & Ingestion',
      icon: UploadCloud,
      desc: 'Users upload images (JPG, PNG, WEBP) or video streams (MP4, MOV, WEBM). File headers are validated to verify media container integrity and prevent format spoofing.',
      subpoints: ['MIME type verification', 'Buffer size validation', 'EXIF & container metadata inspection'],
    },
    {
      num: '02',
      title: 'Preprocessing & Keyframe Sampling',
      icon: Layers,
      desc: 'Static images are normalized for multi-resolution tensor ingestion. For videos, an FFmpeg keyframe extraction pipeline evenly samples temporal frames to track dynamic motion.',
      subpoints: ['Temporal frame sampling (1–3 FPS)', 'Color space calibration (sRGB / YUV)', 'Pixel matrix normalization'],
    },
    {
      num: '03',
      title: 'Face Detection & Landmark Alignment',
      icon: ScanFace,
      desc: 'Computer vision algorithms locate facial bounding boxes [ymin, xmin, ymax, xmax]. 68-point facial landmarks map eyes, iris contours, nasal bridge, jawline perimeter, and neck boundaries.',
      subpoints: ['Multi-face extraction', 'Iris & corneal highlight geometry', 'Perimeter boundary isolation'],
    },
    {
      num: '04',
      title: 'Dual-Branch Neural & ELA Forensics',
      icon: Cpu,
      desc: 'The core pipeline pairs Error Level Analysis (ELA) with Multimodal Vision Transformers. ELA exposes JPEG quantization discontinuities, while the neural model inspects micro-textures and synthetic lighting.',
      subpoints: ['8x8 DCT compression error delta', 'Corneal reflection symmetry physics', 'High-frequency Laplacian noise analysis'],
    },
    {
      num: '05',
      title: 'Synthesis & Confidence Aggregation',
      icon: CheckCircle2,
      desc: 'Frame-level and face-level predictions are synthesized into a calibrated confidence score. The system outputs a definitive REAL/DEEPFAKE verdict with an explainable Grad-CAM heatmap.',
      subpoints: ['Confidence calibration (0–100%)', 'Multi-frame temporal risk curve', 'Actionable forensic dossier generation'],
    },
  ];

  const techniques = [
    {
      name: 'Face Swapping (DeepFaceLab / SimSwap)',
      category: 'Autoencoder & Inpainting',
      flaw: 'Leaves distinct blending halos and boundary blurring along the jawline where the synthesized face mask joins the target neck.',
      detection: 'Error Level Analysis (ELA) exposes mismatched 8x8 DCT quantization tables between the swapped face patch and the background.',
    },
    {
      name: 'Generative Diffusion (Midjourney / Flux / SD)',
      category: 'Full Synthetic Portraits',
      flaw: 'Often produces hyper-smooth plastic skin textures lacking natural epidermal micro-pores, irregular teeth boundaries, or unnatural iris specularity.',
      detection: 'Spatial-frequency residual analysis reveals anomalous high-frequency noise distributions and asymmetric corneal light source vectors.',
    },
    {
      name: 'Facial Reenactment & Puppeteering',
      category: 'Motion Warping GANs',
      flaw: 'Causes inter-frame micro-jitters, landmark warping, and lighting flicker across consecutive video keyframes during rapid head movements.',
      detection: 'Multi-frame temporal consistency tracking detects abnormal optical flow variance and sudden frame-to-frame confidence dips.',
    },
    {
      name: 'Voice-Driven Lip Sync (Wav2Lip)',
      category: 'Audio-Visual GANs',
      flaw: 'Concentrates synthesis strictly on the lower jaw and oral cavity, introducing localized blurring around lips and unnatural dental geometry.',
      detection: 'Grad-CAM heatmaps highlight high localized anomaly scores isolated exclusively around the mouth region.',
    },
  ];

  return (
    <div className="space-y-12 py-4">
      {/* Top Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-blue-300 backdrop-blur-md shadow-sm">
          <Activity className="h-3.5 w-3.5 text-blue-400" />
          <span>Forensic Architecture & Pipeline</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 sm:text-4xl">
          How the Deepfake Detection Engine Works
        </h1>
        <p className="text-sm text-slate-300 sm:text-base leading-relaxed">
          DeepShield leverages a multi-layered defense architecture that evaluates both physical optical properties (compression quantization, corneal reflection physics) and deep neural biometric signatures.
        </p>
      </div>

      {/* 5-Step Process Pipeline */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center sm:text-left">
          End-to-End Detection Pipeline
        </h2>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition hover:border-white/25 hover:bg-white/10 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="font-mono text-xs font-bold text-blue-400">
                      STEP {step.num}
                    </span>
                    <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-2 text-blue-400">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-slate-100">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-4 border-t border-white/10 pt-3">
                  <ul className="space-y-1 text-[11px] text-slate-400 font-mono">
                    {step.subpoints.map((pt, i) => (
                      <li key={i} className="flex items-center space-x-1.5">
                        <span className="h-1 w-1 rounded-full bg-blue-400"></span>
                        <span className="truncate">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deepfake Manipulation Vector Matrix */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-6 backdrop-blur-xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            <span>Manipulation Vector Analysis & Telltale Artifacts</span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            How our computer vision algorithms expose specific generative synthesis mechanics.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {techniques.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-white/5 bg-white/5 p-4 space-y-3 backdrop-blur-md"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-xs font-bold text-slate-200">{t.name}</h3>
                <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 font-mono text-[10px] text-blue-300 backdrop-blur-md">
                  {t.category}
                </span>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-rose-400">Synthesis Flaw:</p>
                <p className="mt-0.5 text-xs text-slate-400">{t.flaw}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-emerald-400">DeepShield Detection Mechanism:</p>
                <p className="mt-0.5 text-xs text-slate-300">{t.detection}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

