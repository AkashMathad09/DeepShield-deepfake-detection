import React from 'react';
import { ShieldAlert, ScanFace, FileSearch, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onAnalyzeClick: () => void;
  onHowItWorksClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onAnalyzeClick, onHowItWorksClick }) => {
  return (
    <div className="relative overflow-hidden py-12 sm:py-16">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Frosted Badge */}
        <div className="inline-flex items-center space-x-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-blue-400 backdrop-blur-xl shadow-inner">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          <span>Next-Gen Computer Vision & Neural Forensic Shield</span>
        </div>

        {/* Hero Title */}
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          AI-Powered{' '}
          <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            Deepfake Detection
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg sm:leading-relaxed">
          Detect manipulated images and video streams using spatial-frequency computer vision.
          Combines Error Level Analysis (ELA), corneal reflection physics, and multi-frame temporal consistency tracking.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onAnalyzeClick}
            className="group inline-flex items-center space-x-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:bg-blue-500 hover:shadow-blue-600/40 active:scale-[0.98]"
          >
            <ScanFace className="h-4 w-4" />
            <span>Analyze Media</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={onHowItWorksClick}
            className="inline-flex items-center space-x-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-xl transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:text-white"
          >
            <FileSearch className="h-4 w-4 text-blue-400" />
            <span>Pipeline Architecture</span>
          </button>
        </div>

        {/* Frosted Feature Highlights Grid */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 text-left">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-lg transition hover:bg-white/8 hover:border-white/20">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400 border border-blue-500/20">
                <ScanFace className="h-5 w-5" />
              </div>
              <h2 className="text-sm font-semibold text-slate-100">Multi-Face & Spatial Inspection</h2>
            </div>
            <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
              Isolates facial bounding boxes, eye corneal reflection specularity, and sub-pixel boundary blend halos.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-lg transition hover:bg-white/8 hover:border-white/20">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h2 className="text-sm font-semibold text-slate-100">Error Level Analysis (ELA)</h2>
            </div>
            <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
              Exposes recompression error disparities across 8x8 DCT quantization tables to uncover spliced face patches.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-lg transition hover:bg-white/8 hover:border-white/20">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h2 className="text-sm font-semibold text-slate-100">Multi-Frame Video Timeline</h2>
            </div>
            <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
              FFmpeg keyframe extraction tracks temporal micro-jitter, landmark drift, and inter-frame probability curves.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

