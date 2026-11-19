import type { EfficientNetResult } from '../src/types.js';

const EFFICIENTNET_URL =
  process.env.EFFICIENTNET_SERVICE_URL || 'http://127.0.0.1:8001';

export async function analyzeWithEfficientNet(
  imageBuffer: Buffer,
  filename: string
): Promise<EfficientNetResult> {
  try {
    const formData = new FormData();

    const imageBlob = new Blob([new Uint8Array(imageBuffer)]);

    formData.append('file', imageBlob, filename);

    const response = await fetch(
      `${EFFICIENTNET_URL}/predict`,
      {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!response.ok) {
      throw new Error(`EfficientNet service returned ${response.status}`);
    }

    const result = await response.json();

    console.log('EfficientNet prediction:', result);
    
    return {
      status: 'available',
      model: result.model,
      prediction:
        result.prediction === 'FAKE' ? 'DEEPFAKE' : 'REAL',
      realProbability: result.real_probability,
      fakeProbability: result.fake_probability,
      inferenceTimeMs: result.inference_time_ms,
    };
  } catch (error) {
    console.error('EfficientNet connection failed:', error);

    return {
      status: 'unavailable',
      model: 'EfficientNet-B0',
      error:
        error instanceof Error
          ? error.message
          : 'Unknown EfficientNet service error',
    };
  }
}