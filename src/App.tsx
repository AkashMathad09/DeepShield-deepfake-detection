import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { Hero } from './components/Hero';
import { UploadZone } from './components/UploadZone';
import { AnalysisProgress } from './components/AnalysisProgress';
import { ResultCard } from './components/ResultCard';
import { HeatmapViewer } from './components/HeatmapViewer';
import { VideoAnalysisChart } from './components/VideoAnalysisChart';
import { HowItWorks } from './components/HowItWorks';
import { TechnologySection } from './components/TechnologySection';
import { ApiDocs } from './components/ApiDocs';
import { AnalysisResult, SampleMediaItem } from './types';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('studio');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMediaType, setAnalysisMediaType] = useState<'image' | 'video'>('image');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [samples, setSamples] = useState<SampleMediaItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load sample test fixtures from backend
  useEffect(() => {
    fetch('/api/samples')
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success && data.samples) {
          setSamples(data.samples);
        }
      })
      .catch((err) => {
        console.warn('Could not load samples from API:', err);
      });
  }, []);

  // Safe JSON response parsing helper
  const parseJsonResponse = async (response: globalThis.Response) => {
    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      // If HTML was returned (e.g. 502/504 proxy page or unhandled route), provide a readable message
      const isHtml = text.trim().startsWith('<') || text.includes('<!DOCTYPE') || text.includes('<html>');
      if (isHtml) {
        throw new Error(
          `Server returned an HTML status page (${response.status}). Please verify server connectivity and retry.`
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
    const isVideo = file.type.startsWith('video/');
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
      setActiveTab('studio');
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
    setAnalysisMediaType(sample?.mediaType === 'video' ? 'video' : 'image');

    try {
      const response = await fetch(`/api/samples/${sampleId}/analyze`, {
        method: 'POST',
      });
      const data = await parseJsonResponse(response);
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze sample.');
      }

      setAnalysisResult(data.result);
      setActiveTab('studio');
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
    setActiveTab('studio');
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white flex flex-col font-sans overflow-x-hidden">
      {/* Frosted Glass Background Ambient Glowing Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px]"></div>
        <div className="absolute top-2/3 left-1/3 w-[380px] h-[380px] bg-cyan-600/8 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        hasResult={!!analysisResult}
        isVideoResult={analysisResult?.mediaType === 'video'}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {/* Error Notification Toast */}
        {errorMsg && (
          <div className="mx-auto mt-4 max-w-4xl px-4">
            <div className="flex items-center justify-between rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-200 shadow-xl backdrop-blur-xl">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
              <button
                onClick={() => setErrorMsg(null)}
                className="font-bold text-rose-400 hover:text-white transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Detector Studio */}
        {activeTab === 'studio' && (
          <div>
            {!analysisResult && !isAnalyzing && (
              <Hero
                onAnalyzeClick={() => {
                  const uploadEl = document.getElementById('upload-section');
                  uploadEl?.scrollIntoView({ behavior: 'smooth' });
                }}
                onHowItWorksClick={() => setActiveTab('how-it-works')}
              />
            )}

            <div id="upload-section" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {isAnalyzing ? (
                <AnalysisProgress mediaType={analysisMediaType} />
              ) : analysisResult ? (
                <ResultCard
                  result={analysisResult}
                  onOpenHeatmap={() => setActiveTab('heatmap')}
                  onOpenVideoTimeline={() => setActiveTab('video')}
                  onReset={handleReset}
                />
              ) : (
                <div className="mx-auto max-w-4xl">
                  <UploadZone
                    onAnalyzeFile={handleAnalyzeFile}
                    onSelectSample={handleSelectSample}
                    samples={samples}
                    isAnalyzing={isAnalyzing}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: ELA & Heatmap Inspector */}
        {activeTab === 'heatmap' && (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <HeatmapViewer
              result={analysisResult}
              onBackToStudio={() => setActiveTab('studio')}
            />
          </div>
        )}

        {/* Tab 3: Video Timeline */}
        {activeTab === 'video' && (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <VideoAnalysisChart
              result={analysisResult}
              onBackToStudio={() => setActiveTab('studio')}
            />
          </div>
        )}

        {/* Tab 4: How It Works */}
        {activeTab === 'how-it-works' && (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <HowItWorks />
          </div>
        )}

        {/* Tab 5: Technology & Specs */}
        {activeTab === 'tech' && (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <TechnologySection />
          </div>
        )}

        {/* Tab 6: API Docs */}
        {activeTab === 'api' && (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <ApiDocs />
          </div>
        )}
      </main>

      {/* Frosted Glass Footer */}
      <footer className="mt-auto border-t border-white/5 bg-slate-950/80 backdrop-blur-xl py-4 px-4 sm:px-8 text-[11px] text-slate-500 z-10">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-slate-400">SESSION_ID: 9X72-KJ9M-L003</span>
            <span>•</span>
            <span className="font-mono text-slate-400">LATENCY: 142ms</span>
          </div>
          <div className="flex items-center space-x-4 uppercase tracking-wider text-[10px]">
            <span>ISO/IEC 27001 COMPLIANT</span>
            <span>•</span>
            <span className="text-blue-400 font-bold">DEEPSHIELD FORENSICS v4.2 PRO</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
