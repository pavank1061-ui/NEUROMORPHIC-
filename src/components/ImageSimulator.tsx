import { useCallback, useRef, useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Cloud,
  CheckCircle2,
  XCircle,
  Zap,
  Clock,
  HardDrive,
  Activity,
  RefreshCw,
  AlertCircle,
  Cpu,
} from 'lucide-react';
import type { ImageAnalysisResult, SimSettings } from '@/types';
import { analyzeImage } from '@/lib/imageAnalysis';
import { SAMPLE_IMAGES, getMissionMode } from '@/data';
import { formatPower } from '@/lib/settings';
import { useInView } from './useInView';

interface Props {
  settings: SimSettings;
  onSettingsChange: (s: SimSettings) => void;
}

type Status = 'idle' | 'loading' | 'done' | 'error';

export function ImageSimulator({ settings, onSettingsChange }: Props) {
  const { ref, inView } = useInView();
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mode = getMissionMode(settings.missionMode);

  const processImage = useCallback(
    async (src: string) => {
      setStatus('loading');
      setErrorMsg('');
      setPreviewUrl(src);
      try {
        const res = await analyzeImage(
          src,
          mode.cloudThreshold,
          settings.powerPerImageMw,
          settings.processingTimeMs
        );
        setResult(res);
        setStatus('done');
      } catch {
        setStatus('error');
        setErrorMsg('Could not analyze this image. Try another sample or upload a different file.');
      }
    },
    [mode.cloudThreshold, settings.powerPerImageMw, settings.processingTimeMs]
  );

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setStatus('error');
      setErrorMsg('Please select an image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setStatus('error');
      setErrorMsg('Image too large. Please use an image under 10 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => processImage(reader.result as string);
    reader.onerror = () => {
      setStatus('error');
      setErrorMsg('Failed to read the file.');
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setStatus('idle');
    setResult(null);
    setPreviewUrl('');
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <section id="simulator" className="relative py-20 lg:py-28">
      <div className="section-pad mx-auto max-w-[1600px]" ref={ref}>
        <SectionHeader
          badge="01 · AI Image Simulator"
          title="Analyze Satellite Imagery On-Board"
          subtitle="Upload an image or use a sample. The neuromorphic AI analyzes cloud coverage and makes a KEEP/REJECT decision — all in your browser, using real pixel-level image analysis."
        />

        <div className="grid lg:grid-cols-2 gap-6 mt-12">
          {/* Left: Input panel */}
          <div className="glass-strong p-6 lg:p-8 space-y-6">
            <div>
              <h3 className="font-display font-semibold text-lg text-white mb-1">
                Image Input
              </h3>
              <p className="text-sm text-slate-500">
                Current mode: <span className="text-cyan-400 font-medium">{mode.label}</span> — threshold {mode.cloudThreshold}% cloud
              </p>
            </div>

            {/* Upload zone */}
            <div
              className="relative border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-cyan-400/40 transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => processImage(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="pointer-events-none w-6 h-6 text-cyan-400" aria-hidden="true" focusable="false" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-300">
                    Drop an image or click to upload
                  </p>
                  <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 10 MB</p>
                </div>
              </div>
            </div>

            {/* Sample images */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                  Sample Satellite Images
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {SAMPLE_IMAGES.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => processImage(img.url)}
                    disabled={status === 'loading'}
                    className="group relative aspect-square rounded-lg overflow-hidden border border-white/5 hover:border-cyan-400/40 transition-all disabled:opacity-50"
                    title={img.label}
                  >
                    <img
                      src={img.url}
                      alt={img.label}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-1 left-1 right-1 text-[10px] font-mono text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {img.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Config */}
            <div className="border-t border-white/5 pt-4 space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-500">
                Demo Assumptions (adjustable)
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs text-slate-400">Power / image (mW)</span>
                  <input
                    type="number"
                    value={settings.powerPerImageMw}
                    min={1}
                    max={500}
                    onChange={(e) =>
                      onSettingsChange({ ...settings, powerPerImageMw: Number(e.target.value) })
                    }
                    className="mt-1 w-full bg-ink-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-cyan-400/50 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-400">Proc. time (ms)</span>
                  <input
                    type="number"
                    value={settings.processingTimeMs}
                    min={1}
                    max={1000}
                    onChange={(e) =>
                      onSettingsChange({ ...settings, processingTimeMs: Number(e.target.value) })
                    }
                    className="mt-1 w-full bg-ink-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-cyan-400/50 focus:outline-none"
                  />
                </label>
              </div>
            </div>

            {status === 'done' && (
              <button onClick={handleReset} className="btn-ghost text-sm w-full">
                <RefreshCw className="w-4 h-4" />
                Reset & Analyze Another
              </button>
            )}
          </div>

          {/* Right: Results panel */}
          <div className="glass-strong p-6 lg:p-8 min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg text-white">
                Analysis Results
              </h3>
              {status === 'done' && result && (
                <div
                  className={`chip ${
                    result.decision === 'KEEP'
                      ? 'border-green-400/30 text-green-400 bg-green-400/5'
                      : 'border-rose-400/30 text-rose-400 bg-rose-400/5'
                  }`}
                >
                  {result.decision === 'KEEP' ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {result.decision}
                </div>
              )}
            </div>

            {/* States */}
            {status === 'idle' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <Cloud className="w-7 h-7 text-slate-600" />
                </div>
                <p className="text-sm text-slate-500 max-w-xs">
                  Upload an image or select a sample to begin the neuromorphic analysis.
                </p>
              </div>
            )}

            {status === 'loading' && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin" />
                  <div className="absolute inset-3 rounded-full border-2 border-teal-400/20" />
                  <div className="absolute inset-3 rounded-full border-2 border-transparent border-t-teal-400 animate-spin" style={{ animationDuration: '1.5s' }} />
                  <Cpu className="absolute inset-0 m-auto w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
                <p className="text-sm font-mono text-cyan-400 animate-pulse">
                  Processing image...
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Running pixel-level cloud detection
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-rose-400/10 border border-rose-400/20 flex items-center justify-center mb-4">
                  <AlertCircle className="w-7 h-7 text-rose-400" />
                </div>
                <p className="text-sm text-rose-300 max-w-xs">{errorMsg}</p>
                <button onClick={handleReset} className="btn-ghost text-sm mt-4">
                  Try Again
                </button>
              </div>
            )}

            {status === 'done' && result && (
              <div className="flex-1 flex flex-col gap-4 animate-fade-in-up">
                {/* Preview */}
                <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video">
                  <img src={previewUrl} alt="Analyzed" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
                  {/* Scan line effect */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute left-0 right-0 h-0.5 bg-cyan-400/60 animate-scan" />
                  </div>
                  <div className="absolute bottom-2 left-2 flex gap-2">
                    <span className="chip border-cyan-400/30 text-cyan-300 bg-ink-950/80 text-[10px]">
                      {mode.context}
                    </span>
                  </div>
                </div>

                {/* Decision banner */}
                <div
                  className={`rounded-xl p-4 border ${
                    result.decision === 'KEEP'
                      ? 'border-green-400/30 bg-green-400/5'
                      : 'border-rose-400/30 bg-rose-400/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {result.decision === 'KEEP' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      )}
                      <span
                        className={`font-display font-bold text-lg ${
                          result.decision === 'KEEP' ? 'text-green-400' : 'text-rose-400'
                        }`}
                      >
                        {result.decision === 'KEEP'
                          ? 'KEEP — Transmit to Ground'
                          : 'REJECT — Discard On-Board'}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">
                      Threshold: {mode.cloudThreshold}%
                    </span>
                  </div>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard
                    icon={Cloud}
                    label="Cloud Coverage"
                    value={`${result.cloudPercent}%`}
                    color={
                      result.cloudPercent < mode.cloudThreshold ? 'text-green-400' : 'text-rose-400'
                    }
                    bar={result.cloudPercent}
                  />
                  <MetricCard
                    icon={Activity}
                    label="Usability Score"
                    value={`${result.usability}%`}
                    color="text-cyan-400"
                    bar={result.usability}
                  />
                  <MetricCard
                    icon={Zap}
                    label="Est. Power"
                    value={formatPower(result.estimatedPowerMw)}
                    color="text-amber-400"
                    simulated
                  />
                  <MetricCard
                    icon={Clock}
                    label="Proc. Time"
                    value={`${result.processingTimeMs} ms`}
                    color="text-teal-400"
                    simulated
                  />
                </div>

                {/* Pixel analysis details */}
                <div className="glass p-4 space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                    Pixel-Level Analysis (Real)
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    <DetailRow label="Brightness" value={`${result.brightness}/255`} />
                    <DetailRow label="Contrast" value={`${result.contrast}`} />
                    <DetailRow label="Edge Density" value={`${result.edgeDensity}%`} />
                    <DetailRow label="Color Variance" value={`${result.colorVariance}`} />
                    <DetailRow label="Greenness" value={`${result.greenness}%`} />
                    <DetailRow label="Blueness" value={`${result.blueness}%`} />
                    <DetailRow label="Whiteness" value={`${result.whiteness}%`} />
                    <DetailRow
                      label="Image Size"
                      value={`${(result.imageSizeKB / 1024).toFixed(1)} MB`}
                    />
                  </div>
                </div>

                {result.decision === 'REJECT' && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <HardDrive className="w-3.5 h-3.5 text-green-400" />
                    Data saved by onboard filtering: ~{(result.imageSizeKB / 1024).toFixed(1)} MB
                  </div>
                )}

                <p className="text-[10px] text-slate-600 font-mono">
                  * Power and processing time are simulated/demo values. Cloud detection uses
                  real pixel-level image analysis in your browser.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="max-w-2xl">
      <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">
        {badge}
      </div>
      <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
        {title}
      </h2>
      <p className="text-base text-slate-400 mt-3 leading-relaxed">{subtitle}</p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
  bar,
  simulated,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  bar?: number;
  simulated?: boolean;
}) {
  return (
    <div className="glass p-3.5">
      <div className="flex items-center justify-between mb-1.5">
        <Icon className={`w-4 h-4 ${color}`} />
        {simulated && (
          <span className="text-[9px] font-mono text-slate-600">SIM</span>
        )}
      </div>
      <div className="stat-label">{label}</div>
      <div className={`font-display font-bold text-lg mt-0.5 ${color}`}>{value}</div>
      {bar !== undefined && (
        <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full bg-current ${color}`}
            style={{ width: `${Math.min(100, bar)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono text-slate-300">{value}</span>
    </div>
  );
}
