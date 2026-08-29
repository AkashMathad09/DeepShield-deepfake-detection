export type MediaPrediction = 'REAL' | 'DEEPFAKE' | 'UNCERTAIN';

export type ConfidenceInterpretation = 'LOW_EVIDENCE' | 'UNCERTAIN' | 'STRONG_EVIDENCE';

export interface BoundingBox {
  ymin: number; // 0..1000 normalized
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface LandmarkArtifacts {
  eyeSymmetryScore: number; // 0..100 (100 = completely natural/symmetric)
  boundarySeamArtifact: number; // 0..100 (100 = heavy distortion/blending artifact)
  skinTextureNaturalness: number; // 0..100 (100 = natural pores, 0 = plastic smoothing)
  lightingConsistency: number; // 0..100
  compressionAnomaly: number; // 0..100
}

export interface DetectedFace {
  id: number;
  box: BoundingBox;
  fakeProbability: number; // 0..1
  confidence: number; // 0..100
  label: MediaPrediction;
  manipulationType?: string;
  notes: string[];
  landmarks?: LandmarkArtifacts;
  cropBase64?: string;
}

export interface ForensicMetric {
  name: string;
  category: 'Spatial' | 'Frequency' | 'Biometric' | 'Compression' | 'Temporal';
  score: number; // 0..100 (higher = more anomaly/risk)
  status: 'normal' | 'suspicious' | 'critical';
  description: string;
  explanation: string;
}

export interface FramePrediction {
  frameIndex: number;
  timestampSeconds: number;
  fakeProbability: number; // 0..1
  confidence: number;
  facesDetected: number;
  status: MediaPrediction;
  keyAnomaly?: string;
  thumbnailBase64?: string;
}

export interface VideoAnalysisSummary {
  totalDurationSeconds: number;
  fps: number;
  resolution: string;
  totalVideoFrames: number;
  framesAnalyzedCount: number;
  facesDetectedCount: number;
  averageFakeProbability: number;
  maxRiskFrame: {
    frameIndex: number;
    timestampSeconds: number;
    fakeProbability: number;
  };
  minRiskFrame: {
    frameIndex: number;
    timestampSeconds: number;
    fakeProbability: number;
  };
  temporalConsistencyScore: number; // 0..100
  jitterIndex: number; // 0..100
}

export interface AudioForensicDetails {
  durationSeconds: number;
  sampleRate: number;
  channels: number;
  format: string;
  voiceSynthesisProbability: number; // 0..100
  vocalTractNaturalness: number; // 0..100 (100 = completely natural)
  backgroundNoiseContinuity: number; // 0..100
  breathingAcousticScore: number; // 0..100 (100 = natural biological breathing)
  formantDispersionScore: number; // 0..100
  pitchProsodyNaturalness: number; // 0..100
  neuralVocoderArtifacts: number; // 0..100 (higher = more robotic artifacts)
  spectrogramUrl?: string;
  waveformUrl?: string;
}

export interface ModelMetadata {
  name: string;
  architecture: string;
  trainedOn: string;
  inputDimensions: string;
  inferenceEngine: string;
  executionTimeMs: number;
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  filename: string;
  fileSize: number;
  mediaType: 'image' | 'video' | 'audio';
  mimeType: string;
  previewUrl: string;
  prediction: MediaPrediction;
  confidence: number; // 0..100
  fakeProbability: number; // 0..1
  interpretation: ConfidenceInterpretation;
  manipulationCategory: string;
  summaryText: string;
  facesDetected: number;
  faces: DetectedFace[];
  metrics: ForensicMetric[];
  elaHeatmapUrl?: string;
  gradCamHeatmapUrl?: string;
  frequencySpectrumUrl?: string;
  videoTimeline?: FramePrediction[];
  videoSummary?: VideoAnalysisSummary;
  audioSummary?: AudioForensicDetails;
  modelInfo: ModelMetadata;
  technicalDetails: {
    elaMeanDifference: number;
    laplacianBlurVariance: number;
    spectralHighFreqEnergy: number;
    colorChannelInconsistency: number;
  };
}

export interface SampleMediaItem {
  id: string;
  title: string;
  mediaType: 'image' | 'video' | 'audio';
  thumbnailUrl: string;
  fileUrl: string;
  expectedLabel: MediaPrediction;
  description: string;
  manipulationDetails: string;
}
