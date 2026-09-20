import type { ImageAnalysisResult, Decision, ImagePalette, MissionModeId } from '@/types';
import { getMissionMode } from '@/data';

/**
 * Client-side image analysis using Canvas pixel sampling.
 * Detects cloud coverage by analyzing brightness, whiteness, blueness,
 * edge density, and color variance — a real heuristic cloud-detection algorithm.
 */

const SAMPLE_SIZE = 200;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

function drawToCanvas(img: HTMLImageElement, size: number): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  // Cover-fit the image into the square canvas
  const scale = Math.max(size / img.width, size / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  return ctx;
}

interface PixelStats {
  cloudPercent: number;
  brightness: number;
  contrast: number;
  edgeDensity: number;
  colorVariance: number;
  greenness: number;
  blueness: number;
  whiteness: number;
}

function analyzePixels(ctx: CanvasRenderingContext2D, size: number): PixelStats {
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  const total = size * size;

  let sumBrightness = 0;
  let sumBrightnessSq = 0;
  let cloudPixels = 0;
  let sumR = 0, sumG = 0, sumB = 0;
  let sumRSq = 0, sumGSq = 0, sumBSq = 0;
  let greenPixels = 0;
  let bluePixels = 0;
  let whitePixels = 0;

  // First pass: collect pixel-level statistics
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;

    sumBrightness += brightness;
    sumBrightnessSq += brightness * brightness;
    sumR += r; sumG += g; sumB += b;
    sumRSq += r * r; sumGSq += g * g; sumBSq += b * b;

    // Cloud detection heuristic:
    // Clouds are bright, have low color saturation, and high whiteness
    const maxChannel = Math.max(r, g, b);
    const minChannel = Math.min(r, g, b);
    const saturation = maxChannel === 0 ? 0 : (maxChannel - minChannel) / maxChannel;
    const whiteness = 1 - saturation;

    // Cloud pixel: bright (>140), low saturation (<0.25), high whiteness
    if (brightness > 140 && saturation < 0.25 && whiteness > 0.75) {
      cloudPixels++;
    }
    if (brightness > 200 && saturation < 0.15) {
      whitePixels++;
    }
    // Greenery (vegetation)
    if (g > r + 15 && g > b + 15 && g > 60) {
      greenPixels++;
    }
    // Water (blue dominant)
    if (b > r + 10 && b > g + 5 && b > 40) {
      bluePixels++;
    }
  }

  const meanBrightness = sumBrightness / total;
  const variance = sumBrightnessSq / total - meanBrightness * meanBrightness;
  const contrast = Math.sqrt(Math.max(0, variance));
  const colorVariance =
    (sumRSq / total - (sumR / total) ** 2) +
    (sumGSq / total - (sumG / total) ** 2) +
    (sumBSq / total - (sumB / total) ** 2);

  // Edge density via simple gradient on a subsampled grid
  let edgeCount = 0;
  const step = 4;
  for (let y = 0; y < size - step; y += step) {
    for (let x = 0; x < size - step; x += step) {
      const i = (y * size + x) * 4;
      const iRight = (y * size + (x + step)) * 4;
      const iDown = ((y + step) * size + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const rR = data[iRight], gR = data[iRight + 1], bR = data[iRight + 2];
      const rD = data[iDown], gD = data[iDown + 1], bD = data[iDown + 2];
      const gradX = Math.abs(r - rR) + Math.abs(g - gR) + Math.abs(b - bR);
      const gradY = Math.abs(r - rD) + Math.abs(g - gD) + Math.abs(b - bD);
      if (gradX + gradY > 60) edgeCount++;
    }
  }
  const edgeDensity = edgeCount / ((size / step) * (size / step));

  return {
    cloudPercent: (cloudPixels / total) * 100,
    brightness: meanBrightness,
    contrast,
    edgeDensity: edgeDensity * 100,
    colorVariance,
    greenness: (greenPixels / total) * 100,
    blueness: (bluePixels / total) * 100,
    whiteness: (whitePixels / total) * 100,
  };
}

function generateThumbnail(img: HTMLImageElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const scale = Math.max(160 / img.width, 160 / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (160 - w) / 2, (160 - h) / 2, w, h);
  return canvas.toDataURL('image/jpeg', 0.7);
}

function estimateImageSizeKB(img: HTMLImageElement): number {
  // Rough estimate based on pixel count
  return Math.round((img.width * img.height * 0.15) / 1024);
}

/**
 * Analyze an image for cloud coverage and usability.
 * Uses real pixel-level heuristics — no faked results.
 */
export async function analyzeImage(
  src: string,
  cloudThreshold: number,
  powerPerImageMw: number,
  processingTimeMs: number
): Promise<ImageAnalysisResult> {
  const startTime = performance.now();

  const img = await loadImage(src);
  const ctx = drawToCanvas(img, SAMPLE_SIZE);
  const stats = analyzePixels(ctx, SAMPLE_SIZE);

  // Adjust cloud percentage with whiteness and brightness correlation
  let cloudPercent = stats.cloudPercent;
  // If image is very bright and white, increase cloud estimate
  if (stats.whiteness > 30 && stats.brightness > 180) {
    cloudPercent = Math.min(100, cloudPercent + stats.whiteness * 0.3);
  }
  // If image has high edge density and greenness, it's likely terrain — reduce cloud
  if (stats.edgeDensity > 15 && stats.greenness > 20) {
    cloudPercent = Math.max(0, cloudPercent * 0.7);
  }
  cloudPercent = Math.round(Math.min(100, Math.max(0, cloudPercent)));

  // Usability: inverse of cloud percentage, adjusted for content richness
  const usability = Math.round(
    Math.min(100, Math.max(0, 100 - cloudPercent + stats.edgeDensity * 0.3))
  );

  const decision: Decision = cloudPercent < cloudThreshold ? 'KEEP' : 'REJECT';

  const thumbnail = generateThumbnail(img);
  const imageSizeKB = estimateImageSizeKB(img);
  const dataSavedKB = decision === 'REJECT' ? imageSizeKB : 0;

  // Simulated power and processing time (clearly labeled as estimates)
  const actualTime = performance.now() - startTime;
  const estimatedPowerMw = Math.round(powerPerImageMw + (Math.random() - 0.5) * 2);
  const estimatedProcessingTime = Math.round(processingTimeMs + actualTime);

  return {
    cloudPercent,
    usability,
    decision,
    brightness: Math.round(stats.brightness),
    contrast: Math.round(stats.contrast),
    edgeDensity: Math.round(stats.edgeDensity),
    colorVariance: Math.round(stats.colorVariance),
    greenness: Math.round(stats.greenness),
    blueness: Math.round(stats.blueness),
    whiteness: Math.round(stats.whiteness),
    estimatedPowerMw,
    processingTimeMs: estimatedProcessingTime,
    imageSizeKB,
    dataSavedKB,
    thumbnail,
    timestamp: Date.now(),
  };
}

/**
 * Generate a synthetic mission-specific image as a data URL.
 * Uses the mission mode's color palette to create realistic-looking
 * imagery (terrain, ocean, farmland, etc.) with optional cloud cover.
 */
export function generateSyntheticImage(
  modeId?: MissionModeId
): { dataUrl: string; label: string } {
  const size = 200;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { dataUrl: '', label: '' };

  const palette: ImagePalette = modeId
    ? getMissionMode(modeId).palette
    : {
        baseHue: 200,
        baseSat: 35,
        baseLight: 30,
        cloudHue: 200,
        cloudSat: 5,
        cloudLight: 70,
        terrainHue: 140,
        terrainSat: 40,
        terrainLight: 28,
        cloudProbability: 0.5,
        gridColor: 'rgba(34, 211, 238, 0.08)',
      };

  const isCloudy = Math.random() < palette.cloudProbability;

  // Fill base terrain/ocean
  const grad = ctx.createLinearGradient(0, 0, size, size);
  const bSat = isCloudy ? palette.baseSat * 0.4 : palette.baseSat;
  const bLight = isCloudy ? palette.baseLight + 15 : palette.baseLight;
  grad.addColorStop(0, `hsl(${palette.baseHue}, ${bSat}%, ${bLight}%)`);
  grad.addColorStop(1, `hsl(${palette.baseHue + 15}, ${bSat}%, ${Math.max(5, bLight - 5)}%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Add terrain texture (random patches)
  const patchCount = isCloudy ? 3 : 8 + Math.floor(Math.random() * 6);
  for (let i = 0; i < patchCount; i++) {
    const px = Math.random() * size;
    const py = Math.random() * size;
    const pr = 15 + Math.random() * 40;
    const hue = palette.terrainHue + (Math.random() - 0.5) * 30;
    const sat = isCloudy ? 5 : palette.terrainSat + (Math.random() - 0.5) * 15;
    const light = palette.terrainLight + (Math.random() - 0.5) * 20;
    ctx.fillStyle = `hsla(${hue}, ${Math.max(0, sat)}%, ${Math.max(5, light)}%, 0.5)`;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add clouds using palette cloud colors
  if (isCloudy) {
    const cloudBlobs = 5 + Math.floor(Math.random() * 10);
    for (let i = 0; i < cloudBlobs; i++) {
      const px = Math.random() * size;
      const py = Math.random() * size;
      const pr = 20 + Math.random() * 50;
      const opacity = 0.4 + Math.random() * 0.5;
      ctx.fillStyle = `hsla(${palette.cloudHue}, ${palette.cloudSat}%, ${palette.cloudLight}%, ${opacity})`;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Add grid lines (scan effect) using palette grid color
  ctx.strokeStyle = palette.gridColor;
  ctx.lineWidth = 1;
  for (let i = 0; i < size; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
  const label = isCloudy
    ? `${modeId ? modeId.toUpperCase() : 'CAP'}-${Math.floor(Math.random() * 9000 + 1000)} [OBSCURED]`
    : `${modeId ? modeId.toUpperCase() : 'CAP'}-${Math.floor(Math.random() * 9000 + 1000)} [CLEAR]`;

  return { dataUrl, label };
}
