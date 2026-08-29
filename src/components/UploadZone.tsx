import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileVideo,
  FileImage,
  X,
  AlertCircle,
  Zap,
  Sliders,
} from 'lucide-react';
import { SampleMediaItem } from '../types';

interface UploadZoneProps {
  onAnalyzeFile: (file: File, sampleFrames: number) => void;
  onSelectSample: (sampleId: string) => void;
  samples: SampleMediaItem[];
  isAnalyzing: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onAnalyzeFile,
  onSelectSample,
  samples,
  isAnalyzing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [videoSamplingCount, setVideoSamplingCount] = useState<number>(16);

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'video/x-msvideo',
    'video/avi',
  ];

  const handleFile = (file: File) => {
    setErrorMsg(null);
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Unsupported format. Please upload JPG, PNG, WEBP, MP4, MOV, or WEBM.');
      return;
    }

    const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg(`File size exceeds limit (${file.type.startsWith('video/') ? '100MB' : '50MB'}).`);
      return;
    }

    setSelectedFile(file);

    // Generate local preview URL
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

  const isVideo = selectedFile?.type.startsWith('video/');

  return (
    <div className="space-y-6">
      {/* Primary Frosted Dropzone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`relative flex min-h-[280px] flex-col items-center justify-center rounded-3xl border p-6 sm:p-8 text-center backdrop-blur-xl transition-all ${
          isDragOver
            ? 'border-blue-400 bg-blue-500/10 shadow-xl shadow-blue-500/20'
            : selectedFile
            ? 'border-white/15 bg-white/5'
            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8 cursor-pointer shadow-lg'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,.webm,.avi"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {selectedFile ? (
          <div className="w-full max-w-lg space-y-4">
            <div className="relative mx-auto max-h-56 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-inner">
              {isVideo ? (
                <video
                  src={previewUrl || ''}
                  controls
                  className="mx-auto max-h-56 w-full object-contain"
                />
              ) : (
                <img
                  src={previewUrl || ''}
                  alt="Upload preview"
                  className="mx-auto max-h-56 w-full object-contain"
                />
              )}
              <button
                onClick={handleRemove}
                disabled={isAnalyzing}
                className="absolute right-3 top-3 rounded-full bg-slate-950/80 p-1.5 text-slate-300 backdrop-blur-md transition hover:bg-rose-600 hover:text-white"
                title="Remove media"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-xs backdrop-blur-md">
              <div className="flex items-center space-x-3 overflow-hidden">
                {isVideo ? (
                  <FileVideo className="h-5 w-5 flex-shrink-0 text-blue-400" />
                ) : (
                  <FileImage className="h-5 w-5 flex-shrink-0 text-blue-400" />
                )}
                <div className="truncate">
                  <p className="truncate font-medium text-slate-200">{selectedFile.name}</p>
                  <p className="text-slate-400 font-mono text-[11px]">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemove}
                disabled={isAnalyzing}
                className="text-xs font-semibold text-rose-400 hover:underline"
              >
                Change
              </button>
            </div>

            {/* Video Sampling Configuration */}
            {isVideo && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 text-left backdrop-blur-md">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center space-x-1.5 font-medium text-blue-300">
                    <Sliders className="h-3.5 w-3.5" />
                    <span>Multi-Frame Extraction Density:</span>
                  </span>
                  <span className="font-mono font-bold text-blue-200">
                    {videoSamplingCount} keyframes
                  </span>
                </div>
                <div className="mt-2.5 flex space-x-2">
                  {[8, 16, 24].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setVideoSamplingCount(count)}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
                        videoSamplingCount === count
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      {count} frames {count === 16 ? '(Standard)' : count === 24 ? '(High Precision)' : '(Fast)'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/10">
              <UploadCloud className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Upload Media Stream or Portrait Image
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Drag and drop your file here, or{' '}
                <span className="font-semibold text-blue-400 underline underline-offset-2">
                  browse files
                </span>
              </p>
            </div>
            <div className="inline-flex items-center space-x-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 font-mono text-[11px] text-slate-400 backdrop-blur-md">
              <span>Supported formats:</span>
              <span className="font-semibold text-slate-200">JPG, PNG, WEBP, MP4, MOV, WEBM</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 flex items-center space-x-2 rounded-xl border border-rose-500/30 bg-rose-950/40 px-3.5 py-2 text-xs text-rose-300 backdrop-blur-md">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="flex justify-center">
        <button
          onClick={() => selectedFile && onAnalyzeFile(selectedFile, videoSamplingCount)}
          disabled={!selectedFile || isAnalyzing}
          className={`inline-flex w-full sm:w-auto items-center justify-center space-x-2 rounded-xl px-8 py-3.5 text-base font-semibold shadow-lg transition-all active:scale-[0.98] ${
            !selectedFile || isAnalyzing
              ? 'cursor-not-allowed border border-white/5 bg-white/5 text-slate-500 shadow-none'
              : 'bg-blue-600 text-white shadow-blue-600/30 hover:bg-blue-500'
          }`}
        >
          <Zap className="h-5 w-5" />
          <span>{isAnalyzing ? 'Executing Neural Inference...' : 'Initiate Deepfake Analysis'}</span>
        </button>
      </div>

      {/* Preset Test Cases / Samples */}
      {samples.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                1-Click Forensic Test Fixtures
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Instant Demonstration</span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {samples.map((sample) => (
              <button
                key={sample.id}
                onClick={() => onSelectSample(sample.id)}
                disabled={isAnalyzing}
                className="group flex items-start space-x-3 rounded-2xl border border-white/5 bg-white/5 p-3.5 text-left transition hover:border-blue-500/40 hover:bg-white/10 backdrop-blur-md active:scale-[0.99]"
              >
                <div
                  className={`mt-0.5 rounded-xl p-2 border ${
                    sample.expectedLabel === 'DEEPFAKE'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 group-hover:bg-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/20'
                  }`}
                >
                  {sample.mediaType === 'video' ? (
                    <FileVideo className="h-4 w-4" />
                  ) : (
                    <FileImage className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-xs font-semibold text-slate-200 group-hover:text-blue-400">
                      {sample.title}
                    </p>
                    <span
                      className={`rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${
                        sample.expectedLabel === 'DEEPFAKE'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {sample.expectedLabel}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] text-slate-400 leading-tight">
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

