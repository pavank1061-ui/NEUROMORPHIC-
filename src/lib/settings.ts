import type { SimSettings, MissionModeId } from '@/types';

const STORAGE_KEY = 'neuromorphic-sim-settings';

export const DEFAULT_SETTINGS: SimSettings = {
  imagesPerOrbit: 120,
  imageSizeMB: 8,
  powerPerImageMw: 20,
  processingTimeMs: 45,
  orbitsPerDay: 14,
  traditionalPowerPerImageMw: 350,
  missionMode: 'satellite',
};

export function loadSettings(): SimSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<SimSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: SimSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage may be unavailable — silently ignore
  }
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return Math.round(n).toString();
}

export function formatBytes(kb: number): string {
  if (kb >= 1_048_576) return (kb / 1_048_576).toFixed(2) + ' TB';
  if (kb >= 1024) return (kb / 1024).toFixed(2) + ' GB';
  return Math.round(kb) + ' MB';
}

export function formatPower(mw: number): string {
  if (mw >= 1000) return (mw / 1000).toFixed(2) + ' W';
  return Math.round(mw) + ' mW';
}
