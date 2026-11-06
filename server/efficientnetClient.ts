import { EfficientNetResult } from '../src/types.js';

const EFFICIENTNET_BASE_URL = process.env.EFFICIENTNET_SERVICE_URL || 'http://127.0.0.1:5050';

/**
 * Checks the health and configuration state of the Python EfficientNet-B0 microservice.
 */
export async function checkEfficientNetHealth(): Promise<{
  isOnline: boolean;
  configured: boolean;
  model: string;
  message: string;
  weightsPath?: string | null;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${EFFICIENTNET_BASE_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return {
        isOnline: false,
        configured: false,
        model: 'EfficientNet-B0 (PyTorch)',
        message: `EfficientNet service responded with status ${res.status}`,
      };
    }

    const data = await res.json();
    return {
      isOnline: true,
      configured: Boolean(data.weights_configured),
      model: data.model || 'EfficientNet-B0',
      message: data.message || '',
      weightsPath: data.weights_path,
    };
  } catch (err: any) {
    return {
      isOnline: false,
      configured: false,
      model: 'EfficientNet-B0 (PyTorch)',
      message: `EfficientNet service offline or unreachable: ${err.message}`,
    };
  }
}

/**
 * Sends an image buffer to the Python FastAPI microservice for EfficientNet-B0 inference.
 */
export async function runEfficientNetInference(
  imageBuffer: Buffer,
  filename: string,
  mimeType: string
): Promise<EfficientNetResult> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    // Build standard multi-part form data
    const blob = new Blob([imageBuffer], { type: mimeType });
    const formData = new FormData();
    formData.append('file', blob, filename);

    const res = await fetch(`${EFFICIENTNET_BASE_URL}/predict`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Unknown error');
      return {
        model: 'EfficientNet-B0 (PyTorch)',
        configured: false,
        status: 'ERROR',
        prediction: 'UNCERTAIN',
        confidence: 0,
        fakeProbability: null,
        executionTimeMs: Date.now() - startTime,
        message: `Microservice returned HTTP ${res.status}: ${errText}`,
      };
    }

    const data = await res.json();

    return {
      model: data.model || 'EfficientNet-B0 (PyTorch FF++ c23)',
      configured: Boolean(data.configured),
      status: data.status || (data.configured ? 'SUCCESS' : 'NOT_CONFIGURED'),
      prediction: data.prediction || 'UNCERTAIN',
      confidence: typeof data.confidence === 'number' ? data.confidence : 0,
      realProbability: typeof data.real_probability === 'number' ? data.real_probability : null,
      fakeProbability: typeof data.fake_probability === 'number' ? data.fake_probability : null,
      executionTimeMs: data.execution_time_ms || (Date.now() - startTime),
      weightsPath: data.weights_path || null,
      message: data.message || 'EfficientNet analysis completed.',
      facesDetected: typeof data.faces_detected === 'number' ? data.faces_detected : (data.faces ? data.faces.length : 0),
      faces: Array.isArray(data.faces) ? data.faces : [],
    };
  } catch (err: any) {
    return {
      model: 'EfficientNet-B0 (PyTorch)',
      configured: false,
      status: 'OFFLINE',
      prediction: 'UNCERTAIN',
      confidence: 0,
      fakeProbability: null,
      executionTimeMs: Date.now() - startTime,
      message: `EfficientNet service unavailable (${err.message}). Gemini Flash Multimodal remains active.`,
    };
  }
}
