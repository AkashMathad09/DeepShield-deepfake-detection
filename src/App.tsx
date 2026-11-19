import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { Hero } from './components/Hero';
import { UploadZone } from './components/UploadZone';
import { AnalysisProgress } from './components/AnalysisProgress';
import { ResultCard } from './components/ResultCard';
import { HeatmapViewer } from './components/HeatmapViewer';
import { VideoAnalysisChart } from './components/VideoAnalysisChart';
import { HistoryView } from './components/HistoryView';
import { HowItWorks } from './components/HowItWorks';
import { TechnologySection } from './components/TechnologySection';
import { ApiDocs } from './components/ApiDocs';
import { AnalysisResult, SampleMediaItem, HistoryRecord } from './types';
import { AlertCircle, Shield } from 'lucide-react';

const STORAGE_KEY = 'deepshield_analysis_history_v5';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('studio');
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

  // Refresh proxy session cookie via a hidden same-origin iframe when preview auth returns a Cookie check HTML page
  const refreshProxyAuthCookie = (): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof document === 'undefined') {
        resolve();
        return;
      }

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      iframe.setAttribute('aria-hidden', 'true');

      let settled = false;
      const cleanup = () => {
        if (settled) return;
        settled = true;
        clearTimeout(hardTimeout);
        setTimeout(() => {
          iframe.remove();
        }, 100);
        resolve();
      };

      const hardTimeout = setTimeout(cleanup, 3500);

      iframe.onload = () => {
        try {
          const title = iframe.contentDocument?.title || '';
          const bodyText = iframe.contentDocument?.body?.innerText || '';
          if (bodyText.includes('"status":"ok"')) {
            cleanup();
            return;
          }
          if (/cookie\s*check/i.test(title)) {
            setTimeout(cleanup, 1200);
            return;
          }
        } catch {
          // Cross-origin redirect inside iframe; allow brief settle before retrying
        }
        setTimeout(cleanup, 600);
      };

      iframe.onerror = cleanup;
      iframe.src = `/api/health?_auth=${Date.now()}`;
      document.body.appendChild(iframe);
    });
  };

  // Fetch JSON API endpoint with automatic retry on proxy warmup or Cookie check interstitials
  const fetchApiJson = async (
    url: string,
    initOrFactory: RequestInit | (() => RequestInit) = {}
  ): Promise<any> => {
    const maxAttempts = 4;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const init = typeof initOrFactory === 'function' ? initOrFactory() : initOrFactory;
      const response = await fetch(url, {
        ...init,
        credentials: 'include',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          ...(init.headers || {}),
        },
      });

      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
        if (!response.ok || !data.success) {
          throw new Error(data.error || `Request failed with status ${response.status}.`);
        }
        return data;
      } catch (err: any) {
        if (err instanceof SyntaxError || !text.trim().startsWith('{')) {
          const isHtml =
            text.trim().startsWith('<') ||
            text.includes('<!DOCTYPE') ||
            text.includes('<html');

          if (isHtml) {
            const titleMatch = text.match(/<title>([^<]+)<\/title>/i);
            const htmlTitle = titleMatch ? titleMatch[1].trim() : 'HTML response';
            const isCookieCheck =
              /cookie\s*check/i.test(htmlTitle) || /cookie\s*check/i.test(text);
            const isWarmup =
              text.includes('Starting Server') ||
              response.status === 502 ||
              response.status === 503 ||
              response.status === 504;

            if (isCookieCheck && attempt < maxAttempts) {
              await refreshProxyAuthCookie();
              await new Promise((r) => setTimeout(r, 500));
              continue;
            }

            if (isWarmup && attempt < maxAttempts) {
              await new Promise((r) => setTimeout(r, 1500 * attempt));
              continue;
            }

            if (isCookieCheck) {
              throw new Error(
                'Preview session cookie verification expired. Please click "Refresh Preview" or reload the browser tab and try again.'
              );
            }

            throw new Error(
              `Server returned an HTML page (${response.status}: ${htmlTitle}) instead of JSON. Please wait a moment and try again.`
            );
          }

          if (!response.ok) {
            throw new Error(`Server error (${response.status}): ${text.slice(0, 120)}`);
          }
          throw new Error('Invalid JSON response from server.');
        }
        throw err;
      }
    }

    throw new Error('Server remained unavailable after retries. Please try again.');
  };

  // Load sample test fixtures from backend (Images & Videos only)
  useEffect(() => {
    let cancelled = false;
    fetchApiJson('/api/samples', { method: 'GET' })
      .then((data) => {
        if (!cancelled && data.success && data.samples) {
          setSamples(
            data.samples.filter(
              (s: SampleMediaItem) => s.mediaType === 'image' || s.mediaType === 'video'
            )
          );
        }
      })
      .catch((err) => {
        console.warn('Could not load samples from API:', err);
      });
    return () => {
      cancelled = true;
    };
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

  // Handle uploaded file analysis
  const handleAnalyzeFile = async (file: File, sampleFrames: number) => {
    setErrorMsg(null);
    setIsAnalyzing(true);
    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|avi)$/i.test(file.name);
    setAnalysisMediaType(isVideo ? 'video' : 'image');

    try {
      const endpoint = isVideo ? '/api/detect/video' : '/api/detect/image';
      const data = await fetchApiJson(endpoint, () => {
        const fd = new FormData();
        fd.append('media', file);
        if (isVideo) {
          fd.append('sampleFrames', sampleFrames.toString());
        }
        return {
          method: 'POST',
          body: fd,
        };
      });

      setAnalysisResult(data.result);
      addRecordToHistory(data.result);
      setActiveTab('studio');
    } catch (err: any) {
      const rawMessage = err?.message || 'An unexpected error occurred during analysis.';
      if (/session cookie|refresh preview/i.test(rawMessage)) {
        console.warn('Preview session refresh needed:', rawMessage);
      } else {
        console.error('Analysis error:', err);
      }
      const msg =
        err instanceof TypeError && /fetch/i.test(err.message)
          ? 'Network error: Unable to reach the DeepShield backend API. Please verify the server is running.'
          : rawMessage;
      setErrorMsg(msg);
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
      const data = await fetchApiJson(`/api/samples/${sampleId}/analyze`, {
        method: 'POST',
      });

      setAnalysisResult(data.result);
      addRecordToHistory(data.result);
      setActiveTab('studio');
    } catch (err: any) {
      const rawMessage = err?.message || 'Failed to analyze selected test fixture.';
      if (/session cookie|refresh preview/i.test(rawMessage)) {
        console.warn('Preview session refresh needed:', rawMessage);
      } else {
        console.error('Sample analysis error:', err);
      }
      const msg =
        err instanceof TypeError && /fetch/i.test(err.message)
          ? 'Network error: Unable to reach the DeepShield backend API.'
          : rawMessage;
      setErrorMsg(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setErrorMsg(null);
    setActiveTab('studio');
  };

  const scrollToUploadStudio = () => {
    setActiveTab('studio');
    setTimeout(() => {
      document.getElementById('upload-studio')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-500/30 selection:text-blue-200">
      {/* Subtle Ambient Background Radial Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/12 blur-[130px]" />
        <div className="absolute top-1/3 right-1/6 h-[420px] w-[420px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        hasResult={!!analysisResult}
        historyCount={history.length}
      />

      {/* Main Container */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200 backdrop-blur-xl shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <div className="flex items-center gap-3">
              {/session cookie|refresh preview|html/i.test(errorMsg) && (
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-lg border border-rose-400/40 bg-rose-500/20 px-3 py-1 font-semibold text-rose-100 hover:bg-rose-500/30 transition"
                >
                  Refresh Preview
                </button>
              )}
              <button
                onClick={() => setErrorMsg(null)}
                className="font-bold text-rose-300 hover:text-white transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Loading Progress State */}
        {isAnalyzing ? (
          <AnalysisProgress mediaType={analysisMediaType} />
        ) : (
          <>
            {/* Studio Tab: Result OR Hero + UploadZone */}
            {activeTab === 'studio' && (
              analysisResult ? (
                <ResultCard
                  result={analysisResult}
                  onOpenHeatmap={() => setActiveTab('heatmap')}
                  onOpenVideoTimeline={() => setActiveTab('video')}
                  onReset={handleReset}
                />
              ) : (
                <div className="space-y-6">
                  <Hero
                    onAnalyzeClick={scrollToUploadStudio}
                    onHowItWorksClick={() => setActiveTab('how-it-works')}
                  />
                  <UploadZone
                    onAnalyzeFile={handleAnalyzeFile}
                    onSelectSample={handleSelectSample}
                    samples={samples}
                    isAnalyzing={isAnalyzing}
                    defaultMediaType="image"
                  />
                </div>
              )
            )}

            {/* Heatmap / ELA Inspector Tab */}
            {activeTab === 'heatmap' && (
              <HeatmapViewer
                result={analysisResult}
                onBackToStudio={() => setActiveTab('studio')}
              />
            )}

            {/* Video Keyframe Timeline Tab */}
            {activeTab === 'video' && (
              <VideoAnalysisChart
                result={analysisResult}
                onBackToStudio={() => setActiveTab('studio')}
              />
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <HistoryView
                history={history}
                onSelectResult={(res) => {
                  setAnalysisResult(res);
                  setActiveTab('studio');
                }}
                onClearHistory={handleClearHistory}
                onNavigateToUpload={() => {
                  setAnalysisResult(null);
                  setActiveTab('studio');
                }}
              />
            )}

            {/* How It Works Tab */}
            {activeTab === 'how-it-works' && <HowItWorks />}

            {/* Technology & Benchmarks Tab */}
            {activeTab === 'technology' && <TechnologySection />}

            {/* REST API Docs Tab */}
            {activeTab === 'api' && <ApiDocs />}
          </>
        )}
      </main>

      {/* Dark Glassmorphic Footer */}
      <footer className="mt-auto border-t border-white/10 bg-slate-950/70 backdrop-blur-xl py-4 px-4 sm:px-8 text-xs text-slate-400 no-print">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-3.5 w-3.5 text-blue-400" />
            <span className="font-bold text-slate-200">DeepShield</span>
            <span>•</span>
            <span>AI Forensic Verification Studio</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span>Human Face Image & Video Deepfake Detection</span>
            <span>•</span>
            <span>Multimodal Vision + Error Level Analysis (ELA)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
