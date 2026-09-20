export type Decision = 'KEEP' | 'REJECT';

export type MissionModeId =
  | 'army'
  | 'navy'
  | 'airforce'
  | 'satellite'
  | 'rural'
  | 'disaster';

export interface MissionMetric {
  label: string;
  value: string;
  unit: string;
}

export interface ImagePalette {
  baseHue: number;
  baseSat: number;
  baseLight: number;
  cloudHue: number;
  cloudSat: number;
  cloudLight: number;
  terrainHue: number;
  terrainSat: number;
  terrainLight: number;
  cloudProbability: number;
  gridColor: string;
}

export interface MissionMode {
  id: MissionModeId;
  label: string;
  shortLabel: string;
  icon: string;
  tagline: string;
  description: string;
  useCase: string;
  scenario: string;
  accent: string;
  cloudThreshold: number;
  context: string;
  sensorLabel: string;
  sensorIcon: string;
  transmissionLabel: string;
  transmissionIcon: string;
  metrics: MissionMetric[];
  palette: ImagePalette;
}

export interface ImageAnalysisResult {
  cloudPercent: number;
  usability: number;
  decision: Decision;
  brightness: number;
  contrast: number;
  edgeDensity: number;
  colorVariance: number;
  greenness: number;
  blueness: number;
  whiteness: number;
  estimatedPowerMw: number;
  processingTimeMs: number;
  imageSizeKB: number;
  dataSavedKB: number;
  thumbnail: string;
  timestamp: number;
}

export interface SampleImage {
  id: string;
  label: string;
  url: string;
  context: string;
}

export interface SimSettings {
  imagesPerOrbit: number;
  imageSizeMB: number;
  powerPerImageMw: number;
  processingTimeMs: number;
  orbitsPerDay: number;
  traditionalPowerPerImageMw: number;
  missionMode: MissionModeId;
}

export interface ConsoleStats {
  totalProcessed: number;
  kept: number;
  rejected: number;
  totalPowerMw: number;
  totalDataKB: number;
  dataSavedKB: number;
  dataSavedPercent: number;
}
