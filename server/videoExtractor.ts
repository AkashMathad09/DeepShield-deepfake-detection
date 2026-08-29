import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface VideoMetadata {
  durationSeconds: number;
  fps: number;
  resolution: string;
  width: number;
  height: number;
  totalFrames: number;
}

export interface ExtractedFrame {
  index: number;
  timestampSeconds: number;
  filePath: string;
  buffer: Buffer;
  base64DataUri: string;
}

/**
 * Extracts metadata and evenly sampled keyframes from a video file using ffmpeg.
 */
export async function processVideoFile(videoPath: string, maxFrames: number = 16): Promise<{
  metadata: VideoMetadata;
  frames: ExtractedFrame[];
  cleanup: () => Promise<void>;
}> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'veritas-vid-'));

  const cleanup = async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }
  };

  try {
    // 1. Probe video metadata with ffprobe / ffmpeg
    let durationSeconds = 10;
    let fps = 30;
    let width = 1280;
    let height = 720;

    try {
      const { stdout } = await execAsync(
        `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`
      );
      const probeData = JSON.parse(stdout || '{}');
      const videoStream = (probeData.streams || []).find((s: any) => s.codec_type === 'video');

      if (probeData.format?.duration) {
        const d = parseFloat(probeData.format.duration);
        if (!isNaN(d) && d > 0) durationSeconds = d;
      } else if (videoStream?.duration) {
        const d = parseFloat(videoStream.duration);
        if (!isNaN(d) && d > 0) durationSeconds = d;
      }

      if (videoStream?.width && videoStream?.height) {
        width = parseInt(videoStream.width, 10);
        height = parseInt(videoStream.height, 10);
      }

      if (videoStream?.r_frame_rate) {
        const parts = videoStream.r_frame_rate.split('/');
        if (parts.length === 2 && parseFloat(parts[1]) > 0) {
          const calculatedFps = Math.round(parseFloat(parts[0]) / parseFloat(parts[1]));
          if (calculatedFps > 0 && calculatedFps < 120) fps = calculatedFps;
        } else {
          const directFps = parseFloat(videoStream.r_frame_rate);
          if (!isNaN(directFps) && directFps > 0) fps = Math.round(directFps);
        }
      }
    } catch {
      try {
        const probeOutput = await new Promise<string>((resolve) => {
          exec(`ffmpeg -i "${videoPath}"`, (_err, _stdout, stderr) => {
            resolve(stderr || '');
          });
        });

        const durMatch = probeOutput.match(/Duration:\s*(\d+):(\d+):(\d+\.?\d*)/);
        if (durMatch) {
          const hours = parseFloat(durMatch[1]);
          const mins = parseFloat(durMatch[2]);
          const secs = parseFloat(durMatch[3]);
          durationSeconds = Math.max(1, hours * 3600 + mins * 60 + secs);
        }

        const fpsMatch = probeOutput.match(/(\d+\.?\d*)\s*fps/);
        if (fpsMatch) {
          fps = Math.round(parseFloat(fpsMatch[1])) || 30;
        }

        const resMatch = probeOutput.match(/(\d{3,4})x(\d{3,4})/);
        if (resMatch) {
          width = parseInt(resMatch[1], 10);
          height = parseInt(resMatch[2], 10);
        }
      } catch {
        // Safe default bounds maintained
      }
    }

    const totalFrames = Math.max(1, Math.round(durationSeconds * fps));
    const resolution = `${width}x${height}`;

    // 2. Calculate frame extraction rate
    // Extract at most `maxFrames` keyframes across the duration
    const targetFps = Math.max(0.2, Math.min(2.0, maxFrames / durationSeconds));
    const outputPattern = path.join(tempDir, 'frame_%03d.jpg');

    // Extract frames scaled to max 720p width for speed and consistency
    const extractCmd = `ffmpeg -i "${videoPath}" -vf "fps=${targetFps.toFixed(3)},scale='min(720,iw)':-2" -q:v 3 -vframes ${maxFrames} "${outputPattern}"`;
    await execAsync(extractCmd);

    // Read generated frames
    const files = await fs.readdir(tempDir);
    const frameFiles = files
      .filter((f) => f.startsWith('frame_') && f.endsWith('.jpg'))
      .sort();

    const frames: ExtractedFrame[] = [];
    const intervalSec = durationSeconds / Math.max(1, frameFiles.length);

    for (let i = 0; i < frameFiles.length; i++) {
      const fPath = path.join(tempDir, frameFiles[i]);
      const buffer = await fs.readFile(fPath);
      const base64DataUri = `data:image/jpeg;base64,${buffer.toString('base64')}`;
      const timestampSeconds = parseFloat((i * intervalSec).toFixed(2));

      frames.push({
        index: i + 1,
        timestampSeconds,
        filePath: fPath,
        buffer,
        base64DataUri,
      });
    }

    return {
      metadata: {
        durationSeconds: parseFloat(durationSeconds.toFixed(2)),
        fps,
        resolution,
        width,
        height,
        totalFrames,
      },
      frames,
      cleanup,
    };
  } catch (err) {
    await cleanup();
    throw err;
  }
}
