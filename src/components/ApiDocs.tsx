import React, { useState } from 'react';
import { Code2, Terminal, Copy, Check } from 'lucide-react';

export const ApiDocs: React.FC = () => {
  const [activeLang, setActiveLang] = useState<'curl' | 'python' | 'node'>('python');
  const [activeEndpoint, setActiveEndpoint] = useState<'image' | 'video' | 'audio'>('image');
  const [copiedCode, setCopiedCode] = useState(false);

  const curlCodeImage = `curl -X POST http://localhost:3000/api/detect/image \\
  -H "Accept: application/json" \\
  -F "media=@portrait_sample.jpg"`;

  const curlCodeVideo = `curl -X POST http://localhost:3000/api/detect/video \\
  -H "Accept: application/json" \\
  -F "media=@interview_clip.mp4" \\
  -F "sampleFrames=16"`;

  const curlCodeAudio = `curl -X POST http://localhost:3000/api/detect/audio \\
  -H "Accept: application/json" \\
  -F "media=@voice_recording.wav"`;

  const pythonCodeImage = `import requests

url = "http://localhost:3000/api/detect/image"
files = {"media": open("portrait_sample.jpg", "rb")}

response = requests.post(url, files=files)
data = response.json()

print(f"Prediction: {data['prediction']}")
print(f"Confidence: {data['confidence']}%")
print(f"Faces Detected: {data['faces_detected']}")
print(f"Forensic Summary: {data['result']['summaryText']}")`;

  const pythonCodeVideo = `import requests

url = "http://localhost:3000/api/detect/video"
files = {"media": open("interview_clip.mp4", "rb")}
data_payload = {"sampleFrames": 16}

response = requests.post(url, files=files, data=data_payload)
result = response.json()

print(f"Video Verdict: {result['prediction']}")
print(f"Avg Fake Probability: {result['result']['videoSummary']['averageFakeProbability']}")
print(f"Highest Risk Frame: #{result['result']['videoSummary']['maxRiskFrame']['frameIndex']}")`;

  const pythonCodeAudio = `import requests

url = "http://localhost:3000/api/detect/audio"
files = {"media": open("voice_recording.wav", "rb")}

response = requests.post(url, files=files)
data = response.json()

print(f"Audio Verdict: {data['prediction']}")
print(f"Fake Probability: {data['result']['fakeProbability']}")
print(f"Vocoder Residuals: {data['result']['audioDetails']['neuralVocoderResiduals']}/100")
print(f"Biological Breath Present: {data['result']['audioDetails']['breathInhalationPresent']}")`;

  const nodeCodeImage = `const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function analyzeMedia() {
  const form = new FormData();
  form.append('media', fs.createReadStream('portrait_sample.jpg'));

  const response = await axios.post('http://localhost:3000/api/detect/image', form, {
    headers: form.getHeaders(),
  });

  console.log('Result:', response.data);
}

analyzeMedia();`;

  const nodeCodeVideo = `const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function analyzeVideo() {
  const form = new FormData();
  form.append('media', fs.createReadStream('interview_clip.mp4'));
  form.append('sampleFrames', '16');

  const response = await axios.post('http://localhost:3000/api/detect/video', form, {
    headers: form.getHeaders(),
  });

  console.log('Timeline:', response.data.result.videoTimeline);
}

analyzeVideo();`;

  const nodeCodeAudio = `const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function analyzeAudio() {
  const form = new FormData();
  form.append('media', fs.createReadStream('voice_recording.wav'));

  const response = await axios.post('http://localhost:3000/api/detect/audio', form, {
    headers: form.getHeaders(),
  });

  console.log('Audio Forensics:', response.data.result.audioDetails);
}

analyzeAudio();`;

  const getCodeSnippet = () => {
    if (activeLang === 'curl') {
      return activeEndpoint === 'image'
        ? curlCodeImage
        : activeEndpoint === 'video'
        ? curlCodeVideo
        : curlCodeAudio;
    } else if (activeLang === 'python') {
      return activeEndpoint === 'image'
        ? pythonCodeImage
        : activeEndpoint === 'video'
        ? pythonCodeVideo
        : pythonCodeAudio;
    } else {
      return activeEndpoint === 'image'
        ? nodeCodeImage
        : activeEndpoint === 'video'
        ? nodeCodeVideo
        : nodeCodeAudio;
    }
  };

  const sampleJsonResponse = `{
  "success": true,
  "prediction": "DEEPFAKE",
  "confidence": 94.7,
  "media_type": "image",
  "faces_detected": 1,
  "processing_time": 1.84,
  "result": {
    "id": "forensic-1740001234",
    "filename": "swapped_face.jpg",
    "mediaType": "image",
    "fakeProbability": 0.947,
    "manipulationCategory": "Face Swap (DeepFaceLab/SimSwap)",
    "summaryText": "Significant boundary seam blending and mismatched 8x8 DCT compression tables detected along the jawline.",
    "metrics": [
      {
        "name": "Error Level Analysis (ELA)",
        "score": 88,
        "status": "critical",
        "explanation": "High residual compression delta between facial patch and background."
      },
      {
        "name": "Corneal Reflection Symmetry",
        "score": 79,
        "status": "critical",
        "explanation": "Left and right pupil specular highlights indicate conflicting light angles."
      }
    ],
    "faces": [
      {
        "id": "face_1",
        "box": { "ymin": 180, "xmin": 210, "ymax": 490, "xmax": 480 },
        "fakeProbability": 0.95,
        "label": "DEEPFAKE"
      }
    ]
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-10 py-4">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-blue-300 backdrop-blur-md shadow-sm">
          <Code2 className="h-3.5 w-3.5 text-blue-400" />
          <span>Developer Documentation</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 sm:text-4xl">
          REST API & Integration SDK
        </h1>
        <p className="text-sm text-slate-300 sm:text-base leading-relaxed">
          Seamlessly integrate DeepShield Deepfake detection into your media publishing pipelines, KYC workflows, or verification microservices.
        </p>
      </div>

      {/* Endpoint Selector & Code Viewer */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-4 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
          {/* Endpoint Choice */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveEndpoint('image')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition backdrop-blur-md ${
                activeEndpoint === 'image'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              POST /api/detect/image
            </button>
            <button
              onClick={() => setActiveEndpoint('video')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition backdrop-blur-md ${
                activeEndpoint === 'video'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              POST /api/detect/video
            </button>
            <button
              onClick={() => setActiveEndpoint('audio')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition backdrop-blur-md ${
                activeEndpoint === 'audio'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              POST /api/detect/audio
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center space-x-1.5 rounded-2xl border border-white/10 bg-white/5 p-1 text-xs backdrop-blur-md">
            {(['python', 'curl', 'node'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`rounded-xl px-3 py-1 uppercase font-mono font-bold transition ${
                  activeLang === lang
                    ? 'bg-white/10 text-blue-300 shadow-sm border border-white/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="relative rounded-2xl border border-white/10 bg-slate-950/80 p-5 font-mono text-xs text-slate-200 backdrop-blur-md">
          <button
            onClick={handleCopy}
            className="absolute right-4 top-4 flex items-center space-x-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-slate-300 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
          >
            {copiedCode ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>Copy Code</span>
              </>
            )}
          </button>
          <pre className="overflow-x-auto pt-4 leading-relaxed">{getCodeSnippet()}</pre>
        </div>
      </div>

      {/* JSON Schema Response Reference */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-3 backdrop-blur-xl shadow-xl">
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Standard JSON Response Payload Schema
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 p-5 font-mono text-xs text-emerald-400 backdrop-blur-md">
          <pre className="overflow-x-auto leading-relaxed">{sampleJsonResponse}</pre>
        </div>
      </div>
    </div>
  );
};

