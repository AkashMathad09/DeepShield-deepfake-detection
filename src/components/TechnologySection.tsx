import React from 'react';
import { Cpu, Database, Shield, Award, Lock, Globe } from 'lucide-react';

export const TechnologySection: React.FC = () => {
  const models = [
    {
      name: 'Dual-Branch Spatial-Frequency Vision Engine',
      type: 'Hybrid ViT + ResNet-50 / EfficientNet',
      desc: 'Simultaneously analyzes spatial pixel coherence (RGB domain) and Discrete Cosine Transform (DCT) frequency distributions to catch subtle generative noise discrepancies.',
      accuracy: '98.4% AUC',
    },
    {
      name: 'Neural Audio & ASVspoof Bi-Spectral Engine',
      type: 'Logarithmic STFT Spectrogram + ResNet Classifier',
      desc: 'Extracts 2048-point Short-Time Fourier Transform frequency matrices to detect neural vocoder cutoffs, metallic phase artifacts, synthetic prosody, and missing biological breath acoustics.',
      accuracy: '97.2% AUC',
    },
    {
      name: 'Error Level Analysis (ELA) Core Engine',
      type: '8x8 DCT Compression Quantization Analysis',
      desc: 'Measures residual compression divergence between local image regions by recompressing at a fixed 90% quality level and evaluating spatial delta matrices.',
      accuracy: 'Deterministic CV',
    },
    {
      name: 'Corneal Reflection & Biometric Symmetry Net',
      type: 'Physics-Based Geometric Optics',
      desc: 'Computes specular highlight vectors on left and right pupils to check if corneal light reflections match a unified physical 3D light source.',
      accuracy: '96.1% AUC',
    },
    {
      name: 'Temporal LSTM & Multi-Frame Transformer',
      type: 'Sequential Optical Flow Recurrent Network',
      desc: 'Analyzes frame-to-frame landmark trajectories and biological micro-signals (natural blink rates, pulse photoplethysmography rPPG) across video timelines.',
      accuracy: '97.8% AUC',
    },
  ];

  const datasets = [
    {
      name: 'FaceForensics++ (FF++)',
      samples: '1.8M+ frames',
      manipulations: 'Deepfakes, Face2Face, FaceSwap, NeuralTextures',
      benchmark: '0.982 AUC',
    },
    {
      name: 'ASVspoof (2019/2021)',
      samples: '250K+ audio utterances',
      manipulations: 'Neural TTS voice clones, voice conversion (VC), replay attacks',
      benchmark: '0.974 AUC',
    },
    {
      name: 'Deepfake Detection Challenge (DFDC)',
      samples: '100K+ full videos',
      manipulations: 'Diverse facial replacements, lighting conditions, and augmentations',
      benchmark: '0.945 AUC',
    },
    {
      name: 'Celeb-DF (v2)',
      samples: '5.6K videos',
      manipulations: 'High-quality celebrity deepfakes with reduced visual artifacts',
      benchmark: '0.971 AUC',
    },
    {
      name: 'WildDeepfake',
      samples: '7.3K in-the-wild clips',
      manipulations: 'Real-world internet deepfakes with varied compression and social media noise',
      benchmark: '0.918 AUC',
    },
  ];

  const useCases = [
    {
      icon: Globe,
      title: 'Journalism & Fact-Checking',
      desc: 'Verify the authenticity of breaking news footage, political speeches, and viral social media clips before publication.',
    },
    {
      icon: Shield,
      title: 'KYC & Biometric Identity Verification',
      desc: 'Prevent biometric spoofing and synthetic identity fraud during bank onboarding, passport scanning, and remote authentication.',
    },
    {
      icon: Lock,
      title: 'Digital Forensics & Law Enforcement',
      desc: 'Generate court-admissible forensic dossiers with objective ELA and spectral residual measurements for criminal investigations.',
    },
    {
      icon: Award,
      title: 'Platform Moderation & Fake News Defense',
      desc: 'Automate high-throughput video ingestion pipelines to flag non-consensual deepfake media and malicious disinformation campaigns.',
    },
  ];

  return (
    <div className="space-y-12 py-4">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-md shadow-sm">
          <Cpu className="h-3.5 w-3.5 text-indigo-400" />
          <span>Architectural Specifications</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 sm:text-4xl">
          Deepfake Detection AI Engine & Benchmarks
        </h1>
        <p className="text-sm text-slate-300 sm:text-base leading-relaxed">
          Engineered for high accuracy and low false-positive rates across diverse media compression types, lighting conditions, and resolutions.
        </p>
      </div>

      {/* Model Architectures */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Cpu className="h-4 w-4 text-blue-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Forensic Model Architectures
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {models.map((m) => (
            <div
              key={m.name}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3 backdrop-blur-xl shadow-xl hover:border-white/20 transition"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="text-sm font-bold text-slate-100">{m.name}</h3>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {m.accuracy}
                </span>
              </div>
              <span className="inline-block rounded-full bg-white/5 border border-white/10 px-3 py-0.5 font-mono text-[10px] text-blue-300 backdrop-blur-md">
                {m.type}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benchmark Datasets Matrix */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-4 backdrop-blur-xl shadow-xl">
        <div className="flex items-center space-x-2">
          <Database className="h-4 w-4 text-indigo-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Training & Validation Benchmark Datasets
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 font-mono text-slate-400">
                <th className="pb-3 font-semibold">Dataset</th>
                <th className="pb-3 font-semibold">Volume</th>
                <th className="pb-3 font-semibold">Manipulation Methods</th>
                <th className="pb-3 font-semibold text-right">AUC Benchmark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {datasets.map((d) => (
                <tr key={d.name} className="hover:bg-white/5 transition">
                  <td className="py-3 font-bold text-slate-200">{d.name}</td>
                  <td className="py-3 text-slate-400">{d.samples}</td>
                  <td className="py-3 text-slate-300 font-sans text-xs">{d.manipulations}</td>
                  <td className="py-3 text-right font-bold text-blue-400">{d.benchmark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Industrial Use Cases */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Enterprise & Real-World Deployments
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((u) => {
            const Icon = u.icon;
            return (
              <div
                key={u.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3 backdrop-blur-xl shadow-xl hover:border-white/20 transition"
              >
                <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-3 w-fit text-blue-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-100">{u.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{u.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

