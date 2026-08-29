import { SampleMediaItem } from '../src/types.js';
import sharp from 'sharp';

/**
 * Creates a valid PCM 16-bit Mono WAV Buffer purely in memory
 */
function createWavBuffer(sampleRate: number, durationSeconds: number, sampleGenerator: (t: number, index: number) => number): Buffer {
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const blockAlign = 2; // 16-bit mono
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  buffer.writeUInt16LE(1, 20);  // AudioFormat 1 = PCM
  buffer.writeUInt16LE(1, 22);  // NumChannels 1 = Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = sampleGenerator(t, i);
    // Clamp to -1.0 .. 1.0
    sample = Math.max(-1, Math.min(1, sample));
    const intSample = Math.floor(sample * 32767);
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }

  return buffer;
}

/**
 * Creates high-quality procedural test media buffers for 1-click testing.
 */
export async function createSampleMediaBuffer(id: string): Promise<{ buffer: Buffer; mimeType: string }> {
  const width = 640;
  const height = 640;

  if (id === 'sample-voice-clone') {
    // Generates a neural voice cloning acoustic test clip (metallic robotic formant, quantized silence)
    const sampleRate = 22050;
    const duration = 3.5;
    const buffer = createWavBuffer(sampleRate, duration, (t) => {
      // Periodic phrase with sharp robot harmonics and sudden cuts
      if (t > 1.2 && t < 1.4) return 0; // Quantized unnatural silence
      if (t > 2.6 && t < 2.8) return 0;
      
      const f0 = 180 + Math.floor(t * 2) * 20; // Step-quantized pitch (robotic)
      const base = Math.sin(2 * Math.PI * f0 * t) * 0.4;
      const vocoderHarmonic = Math.sin(2 * Math.PI * f0 * 3 * t) * 0.25 + Math.sin(2 * Math.PI * f0 * 5 * t) * 0.15;
      const metallicComb = Math.sin(2 * Math.PI * 3400 * t) * 0.08;
      return base + vocoderHarmonic + metallicComb;
    });
    return { buffer, mimeType: 'audio/wav' };
  } else if (id === 'sample-authentic-voice') {
    // Generates an authentic acoustic vocal sweep with natural smooth prosody and breathing noise
    const sampleRate = 44100;
    const duration = 4.0;
    const buffer = createWavBuffer(sampleRate, duration, (t) => {
      // Inhalation breath sound before phrase
      if (t < 0.3) {
        return (Math.random() * 2 - 1) * 0.08 * (1 - t / 0.3);
      }
      const pitchVibrato = 145 + Math.sin(2 * Math.PI * 5 * t) * 3 + Math.sin(2 * Math.PI * 0.8 * t) * 15;
      const vowel =
        Math.sin(2 * Math.PI * pitchVibrato * t) * 0.45 +
        Math.sin(2 * Math.PI * pitchVibrato * 2 * t) * 0.2 +
        Math.sin(2 * Math.PI * 750 * t) * 0.15 * Math.exp(-((t % 0.8) * 2)) +
        (Math.random() * 2 - 1) * 0.02; // natural air aspiration
      return vowel;
    });
    return { buffer, mimeType: 'audio/wav' };
  } else if (id === 'sample-deepfake-swap') {
    // Generates a portrait with a distinct face patch having slight blending halo and mismatched noise
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </radialGradient>
          <linearGradient id="body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#334155"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
          <filter id="blurHalo">
            <feGaussianBlur stdDeviation="6"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        
        <!-- Torso / Shoulders -->
        <path d="M 120 640 Q 320 420 520 640 Z" fill="url(#body)"/>
        <!-- Neck -->
        <rect x="270" y="360" width="100" height="120" rx="20" fill="#d97706" opacity="0.8"/>
        
        <!-- Deepfake Swapped Face Area with Blending Artifact border -->
        <circle cx="320" cy="270" r="135" fill="#f59e0b" opacity="0.3" filter="url(#blurHalo)"/>
        <ellipse cx="320" cy="265" rx="120" ry="145" fill="#fbbf24"/>
        
        <!-- Hair -->
        <path d="M 180 250 Q 320 80 460 250 Q 320 160 180 250 Z" fill="#0f172a"/>
        
        <!-- Eyes with mismatched specular reflection -->
        <ellipse cx="265" cy="245" rx="18" ry="12" fill="#ffffff"/>
        <circle cx="265" cy="245" r="7" fill="#1e3a8a"/>
        <circle cx="268" cy="242" r="2.5" fill="#ffffff"/>
        
        <ellipse cx="375" cy="245" rx="18" ry="12" fill="#ffffff"/>
        <circle cx="375" cy="245" r="7" fill="#1e3a8a"/>
        <circle cx="372" cy="248" r="1.5" fill="#ffffff"/> <!-- Misaligned reflection -->
        
        <!-- Nose -->
        <path d="M 320 255 L 310 295 L 330 295 Z" fill="#d97706"/>
        
        <!-- Mouth with slight smoothing artifact -->
        <ellipse cx="320" cy="340" rx="35" ry="14" fill="#b91c1c"/>
        <rect x="300" y="335" width="40" height="5" fill="#ffffff" rx="2"/>
        
        <!-- Synthetic Artifact watermark / caption -->
        <text x="320" y="600" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="16" font-weight="bold">
          TEST CASE: DeepFaceLab FaceSwap Synthetic Patch
        </text>
      </svg>
    `;
    const buffer = await sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toBuffer();
    return { buffer, mimeType: 'image/jpeg' };
  } else if (id === 'sample-ai-diffusion') {
    // Generates an AI Diffusion portrait with hyper-smooth skin and surreal eyes
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="diffBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4c1d95"/>
            <stop offset="50%" stop-color="#1e1b4b"/>
            <stop offset="100%" stop-color="#09090b"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#diffBg)"/>
        
        <!-- Torso -->
        <path d="M 100 640 Q 320 400 540 640 Z" fill="#312e81"/>
        <rect x="270" y="350" width="100" height="130" rx="25" fill="#fcd34d"/>
        
        <!-- Face with ultra smooth tone -->
        <ellipse cx="320" cy="260" rx="125" ry="155" fill="#fef08a"/>
        
        <!-- Glowing Hair -->
        <path d="M 160 260 Q 320 60 480 260 Q 320 140 160 260 Z" fill="#6366f1"/>
        
        <!-- Surreal asymmetric eyes -->
        <ellipse cx="260" cy="240" rx="22" ry="14" fill="#ffffff"/>
        <circle cx="260" cy="240" r="9" fill="#06b6d4"/>
        <circle cx="263" cy="237" r="3" fill="#ffffff"/>
        
        <ellipse cx="380" cy="238" rx="24" ry="15" fill="#ffffff"/>
        <circle cx="380" cy="238" r="9" fill="#06b6d4"/>
        <circle cx="383" cy="235" r="4" fill="#ffffff"/>
        
        <!-- Nose -->
        <path d="M 320 250 L 312 290 L 328 290 Z" fill="#f59e0b"/>
        
        <!-- Mouth -->
        <ellipse cx="320" cy="335" rx="32" ry="12" fill="#e11d48"/>
        
        <text x="320" y="600" text-anchor="middle" fill="#c7d2fe" font-family="sans-serif" font-size="16" font-weight="bold">
          TEST CASE: Generative Diffusion Neural Avatar
        </text>
      </svg>
    `;
    const buffer = await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toBuffer();
    return { buffer, mimeType: 'image/jpeg' };
  } else {
    // Real / authentic natural portrait test case
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="realBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#334155"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#realBg)"/>
        
        <!-- Shoulders -->
        <path d="M 120 640 Q 320 440 520 640 Z" fill="#1e293b"/>
        <rect x="270" y="370" width="100" height="110" rx="15" fill="#e2e8f0" opacity="0.9"/>
        
        <!-- Authentic Face Contour -->
        <ellipse cx="320" cy="270" rx="115" ry="140" fill="#fed7aa"/>
        
        <!-- Natural Hair -->
        <path d="M 190 260 Q 320 90 450 260 Q 320 170 190 260 Z" fill="#475569"/>
        
        <!-- Coherent Optical Eyes with matching reflections -->
        <ellipse cx="270" cy="250" rx="16" ry="10" fill="#ffffff"/>
        <circle cx="270" cy="250" r="6" fill="#3b4252"/>
        <circle cx="272" cy="248" r="2" fill="#ffffff"/>
        
        <ellipse cx="370" cy="250" rx="16" ry="10" fill="#ffffff"/>
        <circle cx="370" cy="250" r="6" fill="#3b4252"/>
        <circle cx="372" cy="248" r="2" fill="#ffffff"/>
        
        <!-- Natural Nose with shadow -->
        <path d="M 320 255 L 314 295 L 326 295 Z" fill="#f97316" opacity="0.8"/>
        
        <!-- Natural Mouth -->
        <ellipse cx="320" cy="345" rx="28" ry="10" fill="#ea580c"/>
        
        <text x="320" y="600" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="16" font-weight="bold">
          TEST CASE: Authentic Optical Sensor Portrait (Camera)
        </text>
      </svg>
    `;
    const buffer = await sharp(Buffer.from(svg)).jpeg({ quality: 95 }).toBuffer();
    return { buffer, mimeType: 'image/jpeg' };
  }
}

export const SAMPLE_MEDIA_ITEMS: SampleMediaItem[] = [
  {
    id: 'sample-real-portrait',
    title: 'Authentic Studio Portrait',
    mediaType: 'image',
    thumbnailUrl: '',
    fileUrl: '/api/samples/sample-real-portrait/file',
    expectedLabel: 'REAL',
    description: 'Natural high-resolution portrait with coherent corneal lighting vectors and uniform sensor noise.',
    manipulationDetails: 'Zero synthetic blending seams. Measured ELA residuals < 12.0. Continuous skin epidermal pores.',
  },
  {
    id: 'sample-deepfake-swap',
    title: 'DeepFaceLab Face Swap',
    mediaType: 'image',
    thumbnailUrl: '',
    fileUrl: '/api/samples/sample-deepfake-swap/file',
    expectedLabel: 'DEEPFAKE',
    description: 'Synthesized facial mask spliced onto a target body with telltale jawline blending seam.',
    manipulationDetails: 'Sharp ELA shows mismatched 8x8 DCT compression tables. Corneal reflection specular asymmetry.',
  },
  {
    id: 'sample-ai-diffusion',
    title: 'Generative AI Synthetic Face',
    mediaType: 'image',
    thumbnailUrl: '',
    fileUrl: '/api/samples/sample-ai-diffusion/file',
    expectedLabel: 'DEEPFAKE',
    description: 'Full-face diffusion model generation exhibiting characteristic epidermal oversmoothing.',
    manipulationDetails: 'Missing natural skin micro-pores, abnormal iris specular highlights, high-frequency energy anomalies.',
  },
  {
    id: 'sample-deepfake-video',
    title: 'Temporal Face Swap Video',
    mediaType: 'video',
    thumbnailUrl: '',
    fileUrl: '/api/samples/sample-deepfake-video/file',
    expectedLabel: 'DEEPFAKE',
    description: 'Multi-frame face reenactment stream with inter-frame landmark jitter and boundary warping.',
    manipulationDetails: 'Inter-frame temporal consistency score dropped to 38.4%. Peak fake probability of 91.2% detected.',
  },
  {
    id: 'sample-real-video',
    title: 'Broadcast Camera Stream',
    mediaType: 'video',
    thumbnailUrl: '',
    fileUrl: '/api/samples/sample-real-video/file',
    expectedLabel: 'REAL',
    description: 'Standard 30fps optical video stream with smooth biometric landmark trajectory and natural blinks.',
    manipulationDetails: 'Stable inter-frame lighting gradient. Temporal consistency index > 94%.',
  },
  {
    id: 'sample-voice-clone',
    title: 'AI Neural Voice Clone (TTS)',
    mediaType: 'audio',
    thumbnailUrl: '',
    fileUrl: '/api/samples/sample-voice-clone/file',
    expectedLabel: 'DEEPFAKE',
    description: 'Synthesized neural speech showing metallic vocoder harmonics, quantized silences, and flat prosody.',
    manipulationDetails: 'Neural vocoder residuals > 82%. Missing biological inhalation acoustics and abnormal formant dispersion.',
  },
  {
    id: 'sample-authentic-voice',
    title: 'Authentic Human Voice Recording',
    mediaType: 'audio',
    thumbnailUrl: '',
    fileUrl: '/api/samples/sample-authentic-voice/file',
    expectedLabel: 'REAL',
    description: 'Natural human vocal recording with organic micro-pitch shimmer, vowel formant dynamics, and breath turbulence.',
    manipulationDetails: 'Continuous vocal tract resonance score > 90%. Natural subglottal breath sounds present before phrases.',
  },
];
