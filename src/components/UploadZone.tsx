import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileVideo,
  FileImage,
  X,
  AlertCircle,
  Zap,
  Sliders,
  CheckCircle2,
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

    const maxSize = isVid ? 100 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg(`File size exceeds limit (${isVid ? '100MB' : '50MB'}).`);
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
    <div className="space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => {
            setActiveMediaTab('image');
            if (selectedFile && isVideo) {
              setSelectedFile(null);
              setPreviewUrl(null);
            }
          }}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition ${
            activeMediaTab === 'image'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
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
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition ${
            activeMediaTab === 'video'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileVideo className="h-4 w-4" />
          <span>Video Detection</span>
        </button>
      </div>

      {/* Primary Light Dropzone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`relative flex min-h-[260px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/60'
            : selectedFile
            ? 'border-slate-200 bg-white'
            : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50/50 cursor-pointer shadow-xs'
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
            <div className="relative mx-auto max-h-64 overflow-hidden rounded-xl border border-slate-200 bg-slate-900 p-2">
              {isVideo ? (
                <video
                  src={previewUrl || ''}
                  controls
                  className="mx-auto max-h-56 w-full object-contain rounded"
                />
              ) : (
                <img
                  src={previewUrl || ''}
                  alt="Upload preview"
                  className="mx-auto max-h-56 w-full object-contain rounded"
                />
              )}
              <button
                onClick={handleRemove}
                disabled={isAnalyzing}
                className="absolute right-3 top-3 rounded-full bg-slate-900/80 p-1.5 text-white transition hover:bg-rose-600"
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs">
              <div className="flex items-center space-x-3 overflow-hidden">
                {isVideo ? (
                  <FileVideo className="h-5 w-5 flex-shrink-0 text-blue-600" />
                ) : (
                  <FileImage className="h-5 w-5 flex-shrink-0 text-blue-600" />
                )}
                <div className="truncate">
                  <p className="truncate font-semibold text-slate-900">{selectedFile.name}</p>
                  <p className="text-slate-500 font-mono text-[11px]">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type || 'FILE'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemove}
                disabled={isAnalyzing}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Change
              </button>
            </div>

            {/* Video Sampling Density Configuration */}
            {isVideo && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center space-x-1.5 font-semibold text-slate-800">
                    <Sliders className="h-3.5 w-3.5 text-blue-600" />
                    <span>Keyframe Sampling Density:</span>
                  </span>
                  <span className="font-mono font-bold text-blue-600">
                    {videoSamplingCount} candidate frames
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
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {count} frames {count === 16 ? '(Standard)' : count === 24 ? '(Dense)' : '(Fast)'}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Keyframes will be ranked by optical Error Level Analysis (ELA) variance to identify the most suspicious candidate frame.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UploadCloud className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {activeMediaTab === 'video'
                  ? 'Upload Video File for Keyframe Analysis'
                  : 'Upload Image for Deepfake & ELA Forensic Inspection'}
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Drag and drop your file here, or{' '}
                <span className="font-semibold text-blue-600 underline underline-offset-2">
                  browse files
                </span>
              </p>
            </div>
            <div className="inline-flex items-center space-x-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-[11px] text-slate-600">
              <span>Formats:</span>
              <span className="font-semibold text-slate-800">
                {activeMediaTab === 'video' ? 'MP4, MOV, WEBM, AVI (up to 100MB)' : 'JPG, PNG, WEBP, AVIF (up to 50MB)'}
              </span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 flex items-center space-x-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs text-rose-700">
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
          className={`inline-flex w-full sm:w-auto items-center justify-center space-x-2 rounded-xl px-8 py-3 text-sm font-semibold shadow-sm transition active:scale-[0.98] ${
            !selectedFile || isAnalyzing
              ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'
          }`}
        >
          <Zap className="h-4 w-4" />
          <span>{isAnalyzing ? 'Running Forensic Analysis...' : 'Start Forensic Analysis'}</span>
        </button>
      </div>

      {/* Presets filtered to active media type */}
      {samples.filter((s) => s.mediaType === activeMediaTab).length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1-Click {activeMediaTab === 'video' ? 'Video' : 'Image'} Test Fixtures
            </span>
            <span className="text-[11px] text-slate-500">Pre-computed benchmarks</span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {samples
              .filter((s) => s.mediaType === activeMediaTab)
              .map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => onSelectSample(sample.id)}
                  disabled={isAnalyzing}
                  className="flex items-start space-x-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-left transition hover:border-blue-400 hover:bg-white active:scale-[0.99] cursor-pointer"
                >
                  <div
                    className={`mt-0.5 rounded-lg p-2 border ${
                      sample.expectedLabel === 'DEEPFAKE'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
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
                      <p className="truncate text-xs font-bold text-slate-900">
                        {sample.title}
                      </p>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                          sample.expectedLabel === 'DEEPFAKE'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {sample.expectedLabel}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
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
