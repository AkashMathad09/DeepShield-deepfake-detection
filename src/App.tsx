import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { UploadZone } from './components/UploadZone';
import { AnalysisProgress } from './components/AnalysisProgress';
import { ResultCard } from './components/ResultCard';
import { HeatmapViewer } from './components/HeatmapViewer';
import { VideoAnalysisChart } from './components/VideoAnalysisChart';
import { HistoryView } from './components/HistoryView';
import { AnalysisResult, SampleMediaItem, HistoryRecord } from './types';
import { AlertCircle, Shield, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'deepshield_analysis_history_v5';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMediaType, setAnalysisMediaType] = useState<'image' | 'video'>('image');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [samples, setSamples] = useState<SampleMediaItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
    } catch (e) {
      console.warn('Could not persist history:', e);
    }
  }, [history]);

  // Load sample test fixtures from backend
  useEffect(() => {
    fetch('/api/samples')
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success && data.samples) {
          // Filter out any non-image/video samples just in case
          setSamples(data.samples.filter((s: SampleMediaItem) => s.mediaType === 'image' || s.mediaType === 'video'));
        }
      })
      .catch((err) => {
        console.warn('Could not load samples from API:', err);
      });
  }, []);

  const addRecordToHistory = (result: AnalysisResult) => {
    const record: HistoryRecord = {
      id: result.id,
      timestamp: result.timestamp,
      filename: result.filename,
      mediaType: result.mediaType,
      prediction: result.prediction,
      confidence: result.confidence,
      fakeProbability: result.fakeProbability,
      result,
    };
    setHistory((prev) => [record, ...prev.filter((h) => h.id !== record.id)]);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  // Safe JSON response parsing helper
  const parseJsonResponse = async (response: globalThis.Response) => {
    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      const isHtml = text.trim().startsWith('<') || text.includes('<!DOCTYPE') || text.includes('<html>');
      if (isHtml) {
        throw new Error(
          `Server returned an HTML status page (${response.status}). Please check server status.`
        );
      }
      throw new Error(
        response.ok
          ? 'Invalid JSON response from server'
          : `Server error (${response.status}): ${text.slice(0, 120)}`
      );
    }
    return data;
  };

  // Handle uploaded file analysis
  const handleAnalyzeFile = async (file: File, sampleFrames: number) => {
    setErrorMsg(null);
    setIsAnalyzing(true);
    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|avi)$/i.test(file.name);
    setAnalysisMediaType(isVideo ? 'video' : 'image');

    const formData = new FormData();
    formData.append('media', file);
    if (isVideo) {
      formData.append('sampleFrames', sampleFrames.toString());
    }

    try {
      const endpoint = isVideo ? '/api/detect/video' : '/api/detect/image';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await parseJsonResponse(response);
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete forensic analysis.');
      }

      setAnalysisResult(data.result);
      addRecordToHistory(data.result);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle 1-click sample test fixture analysis
  const handleSelectSample = async (sampleId: string) => {
    setErrorMsg(null);
    setIsAnalyzing(true);
    const sample = samples.find((s) => s.id === sampleId);
    setAnalysisMediaType(sample?.mediaType || 'image');

    try {
      const response = await fetch(`/api/samples/${sampleId}/analyze`, {
        method: 'POST',
      });
      const data = await parseJsonResponse(response);
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze sample.');
      }

      setAnalysisResult(data.result);
      addRecordToHistory(data.result);
    } catch (err: any) {
      console.error('Sample analysis error:', err);
      setErrorMsg(err.message || 'Failed to analyze selected test fixture.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setErrorMsg(null);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'dashboard' || tab === 'image' || tab === 'video') {
            // Keep analysis result if reviewing, or allow tab navigation
          }
        }}
        hasResult={!!analysisResult}
        historyCount={history.length}
      />

      {/* Main Container */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="font-bold text-rose-700 hover:text-rose-900 transition"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading Progress State */}
        {isAnalyzing ? (
          <AnalysisProgress mediaType={analysisMediaType} />
        ) : analysisResult && (activeTab === 'image' || activeTab === 'video' || (activeTab === 'dashboard' && analysisResult)) ? (
          /* Active Result Display */
          <ResultCard
            result={analysisResult}
            onOpenHeatmap={() => setActiveTab('heatmap')}
            onOpenVideoTimeline={() => setActiveTab('video')}
            onReset={handleReset}
          />
        ) : (
          /* Tab Specific Views */
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <DashboardView
                history={history}
                samples={samples}
                onNavigateToImage={() => {
                  setAnalysisResult(null);
                  setActiveTab('image');
                }}
                onNavigateToVideo={() => {
                  setAnalysisResult(null);
                  setActiveTab('video');
                }}
                onSelectSample={handleSelectSample}
                onViewHistoryResult={(res) => {
                  setAnalysisResult(res);
                  setActiveTab('dashboard');
                }}
                onClearHistory={handleClearHistory}
                isAnalyzing={isAnalyzing}
              />
            )}

            {/* Image Detection Tab */}
            {activeTab === 'image' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h1 className="text-xl font-bold text-slate-900">Image Deepfake Detection</h1>
                  <p className="mt-1 text-xs text-slate-500">
                    Upload a high-resolution image to run independent neural classification and Error Level Analysis (ELA).
                  </p>
                </div>
                <UploadZone
                  onAnalyzeFile={handleAnalyzeFile}
                  onSelectSample={handleSelectSample}
                  samples={samples}
                  isAnalyzing={isAnalyzing}
                  defaultMediaType="image"
                />
              </div>
            )}

            {/* Video Detection Tab */}
            {activeTab === 'video' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h1 className="text-xl font-bold text-slate-900">Video Deepfake Detection</h1>
                  <p className="mt-1 text-xs text-slate-500">
                    Upload an MP4, MOV, or WEBM video. Keyframes will be sampled via FFmpeg and evaluated for optical compression variance.
                  </p>
                </div>
                <UploadZone
                  onAnalyzeFile={handleAnalyzeFile}
                  onSelectSample={handleSelectSample}
                  samples={samples}
                  isAnalyzing={isAnalyzing}
                  defaultMediaType="video"
                />
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <HistoryView
                history={history}
                onSelectResult={(res) => {
                  setAnalysisResult(res);
                  setActiveTab('dashboard');
                }}
                onClearHistory={handleClearHistory}
                onNavigateToUpload={() => setActiveTab('image')}
              />
            )}

            {/* Heatmap / Detailed Inspection Tab */}
            {activeTab === 'heatmap' && (
              <HeatmapViewer
                result={analysisResult}
                onBackToStudio={() => setActiveTab('dashboard')}
              />
            )}
          </>
        )}
      </main>

      {/* Clean Minimalist Light Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-4 sm:px-8 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">DeepShield</span>
            <span>•</span>
            <span>AI Forensic Verification Platform</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-500">
            <span>Image & Video Verification</span>
            <span>•</span>
            <span>Google Gemini + PyTorch EfficientNet-B0 + ELA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
