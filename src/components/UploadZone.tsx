import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileVideo,
  FileImage,
  X,
  AlertCircle,
  Zap,
  Sliders,
  ScanFace,
} from 'lucide-react';
import { SampleMediaItem } from '../types';

interface UploadZoneProps {
  onAnalyzeFile: (file: File, sampleFrames: number) => void;
  onSelectSample: (sampleId: string) => void;
  samples: SampleMediaItem[];
  isAnalyzing: boolean;
  defaultMediaType?: 'image' | 'video';
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onAnalyzeFile,
  onSelectSample,
  samples,
  isAnalyzing,
  defaultMediaType = 'image',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [videoSamplingCount, setVideoSamplingCount] = useState<number>(16);
  const [activeMediaTab, setActiveMediaTab] = useState<'image' | 'video'>(defaultMediaType);

  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/avi'];

  const handleFile = (file: File) => {
    setErrorMsg(null);
    const isVid = allowedVideoTypes.includes(file.type) || /\.(mp4|mov|webm|avi)$/i.test(file.name);
    const isImg = allowedImageTypes.includes(file.type) || /\.(jpg|jpeg|png|webp|avif)$/i.test(file.name);

    if (!isVid && !isImg) {
      setErrorMsg('Unsupported format. Please upload an image (JPG, PNG, WEBP, AVIF) or video (MP4, MOV, WEBM, AVI).');
      return;
    }

    const maxSize = isVid ? 30 * 1024 * 1024 : 25 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg(`File size exceeds preview upload limit (${isVid ? '30MB' : '25MB'}).`);
      return;
    }

    if (isVid) setActiveMediaTab('video');
    else setActiveMediaTab('image');

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isVideo = selectedFile
    ? selectedFile.type.startsWith('video/') || /\.(mp4|mov|webm|avi)$/i.test(selectedFile.name)
    : activeMediaTab === 'video';

  return (
    <div id="upload-studio" className="mx-auto max-w-4xl space-y-6">
      {/* Human-Face Deepfake Detection Label & Description */}
      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-5 py-3.5 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/15 px-3 py-1 text-[11px] font-bold tracking-wider text-cyan-300 uppercase">
            <ScanFace className="h-3.5 w-3.5 text-cyan-300" />
            <span>HUMAN FACE DEEPFAKE DETECTION</span>
          </span>
        </div>
        <p className="text-xs text-slate-300">
          AI-powered forensic analysis for identifying potentially manipulated human facial media.
        </p>
      </div>

      {/* Mode Switcher Tabs (Image & Video Only) */}
      <div className="flex items-center justify-center">
        <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => {
              setActiveMediaTab('image');
              if (selectedFile && isVideo) {
                setSelectedFile(null);
                setPreviewUrl(null);
              }
            }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs sm:text-sm font-semibold transition ${
              activeMediaTab === 'image'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileImage className="h-4 w-4" />
            <span>Image Detection</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMediaTab('video');
              if (selectedFile && !isVideo) {
                setSelectedFile(null);
                setPreviewUrl(null);
              }
            }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs sm:text-sm font-semibold transition ${
              activeMediaTab === 'video'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileVideo className="h-4 w-4" />
            <span>Video Detection</span>
          </button>
        </div>
      </div>

      {/* Primary Dark Glassmorphic Dropzone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`relative flex min-h-[270px] flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 sm:p-8 text-center backdrop-blur-xl transition-all duration-200 shadow-2xl ${
          isDragOver
            ? 'border-blue-400 bg-blue-500/10 scale-[1.01]'
            : selectedFile
            ? 'border-white/15 bg-white/5'
            : 'border-white/15 bg-white/5 hover:border-blue-400/60 hover:bg-white/[0.07] cursor-pointer'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={
            activeMediaTab === 'video'
              ? '.mp4,.mov,.webm,.avi'
              : '.jpg,.jpeg,.png,.webp,.avif'
          }
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {selectedFile ? (
          <div className="w-full max-w-lg space-y-4">
            <div className="relative mx-auto max-h-64 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/90 p-2">
              {isVideo ? (
                <video
                  src={previewUrl || ''}
                  controls
                  className="mx-auto max-h-56 w-full object-contain rounded-lg"
                />
              ) : (
                <img
                  src={previewUrl || ''}
                  alt="Upload preview"
                  className="mx-auto max-h-56 w-full object-contain rounded-lg"
                />
              )}
              <button
                onClick={handleRemove}
                disabled={isAnalyzing}
                className="absolute right-3 top-3 rounded-full bg-slate-900/90 border border-white/15 p-1.5 text-slate-200 transition hover:bg-rose-600 hover:text-white"
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-left text-xs">
              <div className="flex items-center space-x-3 overflow-hidden">
                {isVideo ? (
                  <FileVideo className="h-5 w-5 flex-shrink-0 text-indigo-400" />
                ) : (
                  <FileImage className="h-5 w-5 flex-shrink-0 text-blue-400" />
                )}
                <div className="truncate">
                  <p className="truncate font-semibold text-slate-100">{selectedFile.name}</p>
                  <p className="text-slate-400 font-mono text-[11px]">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type || 'FILE'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemove}
                disabled={isAnalyzing}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 hover:underline"
              >
                Change
              </button>
            </div>

            {/* Video Sampling Density Configuration */}
            {isVideo && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center space-x-1.5 font-semibold text-slate-200">
                    <Sliders className="h-3.5 w-3.5 text-blue-400" />
                    <span>Keyframe Sampling Density:</span>
                  </span>
                  <span className="font-mono font-bold text-blue-400">
                    {videoSamplingCount} candidate frames
                  </span>
                </div>
                <div className="mt-2.5 flex space-x-2">
                  {[8, 16, 24].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setVideoSamplingCount(count)}
                      className={`flex-1 rounded-xl py-1.5 text-xs font-semibold transition ${
                        videoSamplingCount === count
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                          : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {count} frames {count === 16 ? '(Standard)' : count === 24 ? '(Dense)' : '(Fast)'}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Keyframes will be sampled via FFmpeg and ranked by optical Error Level Analysis (ELA) variance.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/25 bg-blue-500/10 text-blue-400 shadow-inner">
              <UploadCloud className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {activeMediaTab === 'video'
                  ? 'Drop Video Clip for Multi-Frame Deepfake Analysis'
                  : 'Drop Facial Portrait or Image for Deepfake & ELA Inspection'}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Drag and drop your media here, or{' '}
                <span className="font-semibold text-blue-400 underline underline-offset-2">
                  browse local files
                </span>
              </p>
            </div>
            <div className="inline-flex items-center space-x-2 rounded-full border border-white/10 bg-slate-950/60 px-3.5 py-1 font-mono text-[11px] text-slate-400">
              <span>Supported:</span>
              <span className="font-semibold text-slate-200">
                {activeMediaTab === 'video' ? 'MP4, MOV, WEBM, AVI (up to 30MB)' : 'JPG, PNG, WEBP, AVIF (up to 25MB)'}
              </span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 flex items-center space-x-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="flex justify-center">
        <button
          onClick={() => selectedFile && onAnalyzeFile(selectedFile, videoSamplingCount)}
          disabled={!selectedFile || isAnalyzing}
          className={`inline-flex w-full sm:w-auto items-center justify-center space-x-2 rounded-xl px-8 py-3.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
            !selectedFile || isAnalyzing
              ? 'cursor-not-allowed border border-white/10 bg-white/5 text-slate-500'
              : 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:shadow-blue-500/40'
          }`}
        >
          <Zap className="h-4 w-4" />
          <span>{isAnalyzing ? 'Running Forensic Pipeline...' : 'Run Deepfake Detection'}</span>
        </button>
      </div>

      {/* 1-Click Sample Test Fixtures */}
      {samples.filter((s) => s.mediaType === activeMediaTab).length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              1-Click {activeMediaTab === 'video' ? 'Video' : 'Image'} Test Fixtures
            </span>
            <span className="font-mono text-[11px] text-slate-400">Live Server Verification</span>
          </div>

          <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {samples
              .filter((s) => s.mediaType === activeMediaTab)
              .map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => onSelectSample(sample.id)}
                  disabled={isAnalyzing}
                  className="flex items-start space-x-3 rounded-2xl border border-white/10 bg-slate-950/50 p-3.5 text-left transition hover:border-blue-400/50 hover:bg-white/[0.07] active:scale-[0.99] cursor-pointer"
                >
                  <div
                    className={`mt-0.5 rounded-xl p-2 border ${
                      sample.expectedLabel === 'DEEPFAKE'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                    }`}
                  >
                    {sample.mediaType === 'video' ? (
                      <FileVideo className="h-4 w-4" />
                    ) : (
                      <FileImage className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-bold text-slate-100">
                        {sample.title}
                      </p>
                      <span
                        className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold border ${
                          sample.expectedLabel === 'DEEPFAKE'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/25'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                        }`}
                      >
                        {sample.expectedLabel}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-[11px] text-slate-400">
                      {sample.description}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
