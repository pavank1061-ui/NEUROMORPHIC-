import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Shield,
  Anchor,
  Plane,
  Satellite,
  Wheat,
  Siren,
  Video,
  Camera,
  Waves,
  Radio,
  Wifi,
  Brain,
  GitBranch,
  Database,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Zap,
  CheckCircle2,
  XCircle,
  Activity,
  Cpu,
  type LucideIcon,
} from 'lucide-react';
import type { ConsoleStats, MissionModeId, SimSettings } from '@/types';
import { MISSION_MODES, getMissionMode } from '@/data';
import { analyzeImage, generateSyntheticImage } from '@/lib/imageAnalysis';
import { formatPower, formatBytes } from '@/lib/settings';
import { Counter } from './Counter';
import { useInView } from './useInView';

const ICONS: Record<string, LucideIcon> = {
  Shield,
  Anchor,
  Plane,
  Satellite,
  Wheat,
  Siren,
  Video,
  Camera,
  Waves,
  Radio,
  Wifi,
};

const ACCENT_MAP: Record<
  string,
  { text: string; border: string; bg: string; glow: string; from: string; to: string }
> = {
  cyan: {
    text: 'text-cyan-400',
    border: 'border-cyan-400/30',
    bg: 'bg-cyan-400/5',
    glow: 'glow-cyan',
    from: 'from-cyan-400',
    to: 'to-cyan-500',
  },
  teal: {
    text: 'text-teal-400',
    border: 'border-teal-400/30',
    bg: 'bg-teal-400/5',
    glow: 'glow-teal',
    from: 'from-teal-400',
    to: 'to-teal-500',
  },
  amber: {
    text: 'text-amber-400',
    border: 'border-amber-400/30',
    bg: 'bg-amber-400/5',
    glow: 'glow-amber',
    from: 'from-amber-400',
    to: 'to-amber-500',
  },
  sky: {
    text: 'text-sky-400',
    border: 'border-sky-400/30',
    bg: 'bg-sky-400/5',
    glow: 'glow-sky',
    from: 'from-sky-400',
    to: 'to-sky-500',
  },
  green: {
    text: 'text-green-400',
    border: 'border-green-400/30',
    bg: 'bg-green-400/5',
    glow: 'glow-green',
    from: 'from-green-400',
    to: 'to-green-500',
  },
  rose: {
    text: 'text-rose-400',
    border: 'border-rose-400/30',
    bg: 'bg-rose-400/5',
    glow: 'glow-rose',
    from: 'from-rose-400',
    to: 'to-rose-500',
  },
};

const PIPELINE_STAGES = [
  { icon: Camera, label: 'Sensor / Image' },
  { icon: Brain, label: 'Neuromorphic Edge AI' },
  { icon: Activity, label: 'Local Analysis' },
  { icon: GitBranch, label: 'KEEP / REJECT' },
  { icon: Database, label: 'Useful Data' },
  { icon: Radio, label: 'Transmission' },
];

interface Props {
  settings: SimSettings;
  onModeChange: (mode: MissionModeId) => void;
}

interface StreamEntry {
  id: number;
  label: string;
  thumbnail: string;
  cloudPercent: number;
  decision: 'KEEP' | 'REJECT';
  powerMw: number;
  timeMs: number;
  sizeKB: number;
}

export function OneChipModule({ settings, onModeChange }: Props) {
  const { ref, inView } = useInView();
  const mode = getMissionMode(settings.missionMode);
  const accent = ACCENT_MAP[mode.accent] ?? ACCENT_MAP.cyan;

  // Live simulator state
  const [running, setRunning] = useState(false);
  const [stream, setStream] = useState<StreamEntry[]>([]);
  const [stats, setStats] = useState<ConsoleStats>({
    totalProcessed: 0,
    kept: 0,
    rejected: 0,
    totalPowerMw: 0,
    totalDataKB: 0,
    dataSavedKB: 0,
    dataSavedPercent: 0,
  });
  const idCounter = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Reset stream when mode changes
  useEffect(() => {
    setRunning(false);
    setStream([]);
    setStats({
      totalProcessed: 0,
      kept: 0,
      rejected: 0,
      totalPowerMw: 0,
      totalDataKB: 0,
      dataSavedKB: 0,
      dataSavedPercent: 0,
    });
    idCounter.current = 0;
  }, [settings.missionMode]);

  const processNext = useCallback(async () => {
    const { dataUrl, label } = generateSyntheticImage(mode.id);
    if (!dataUrl) return;

    try {
      const result = await analyzeImage(
        dataUrl,
        mode.cloudThreshold,
        settings.powerPerImageMw,
        settings.processingTimeMs
      );

      const entry: StreamEntry = {
        id: idCounter.current++,
        label,
        thumbnail: result.thumbnail,
        cloudPercent: result.cloudPercent,
        decision: result.decision,
        powerMw: result.estimatedPowerMw,
        timeMs: result.processingTimeMs,
        sizeKB: result.imageSizeKB,
      };

      setStream((prev) => [entry, ...prev].slice(0, 10));
      setStats((prev) => {
        const totalProcessed = prev.totalProcessed + 1;
        const kept = prev.kept + (result.decision === 'KEEP' ? 1 : 0);
        const rejected = prev.rejected + (result.decision === 'REJECT' ? 1 : 0);
        const totalPowerMw = prev.totalPowerMw + result.estimatedPowerMw;
        const totalDataKB = prev.totalDataKB + (result.decision === 'KEEP' ? result.imageSizeKB : 0);
        const dataSavedKB = prev.dataSavedKB + (result.decision === 'REJECT' ? result.imageSizeKB : 0);
        const allDataKB = totalDataKB + dataSavedKB;
        const dataSavedPercent = allDataKB > 0 ? (dataSavedKB / allDataKB) * 100 : 0;

        return {
          totalProcessed,
          kept,
          rejected,
          totalPowerMw,
          totalDataKB,
          dataSavedKB,
          dataSavedPercent,
        };
      });
    } catch {
      // Silently skip failed synthetic images
    }
  }, [mode.id, mode.cloudThreshold, settings.powerPerImageMw, settings.processingTimeMs]);

  useEffect(() => {
    if (running && inView) {
      intervalRef.current = setInterval(processNext, 1500);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, inView, processNext]);

  const handleReset = () => {
    setRunning(false);
    setStream([]);
    setStats({
      totalProcessed: 0,
      kept: 0,
      rejected: 0,
      totalPowerMw: 0,
      totalDataKB: 0,
      dataSavedKB: 0,
      dataSavedPercent: 0,
    });
    idCounter.current = 0;
  };

  const SensorIcon = ICONS[mode.sensorIcon] ?? Camera;
  const TransmissionIcon = ICONS[mode.transmissionIcon] ?? Radio;

  return (
    <section id="one-chip" className="relative py-20 lg:py-28">
      {/* Mode-reactive ambient glow */}
      <div
        className={`absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl opacity-20 transition-all duration-1000 ${accent.bg}`}
      />

      <div className="section-pad mx-auto max-w-[1600px] relative z-10" ref={ref}>
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className={`text-xs font-mono uppercase tracking-widest ${accent.text} mb-3`}>
            04 · One Chip · Multiple Missions
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
            ONE CHIP.{' '}
            <span className={`bg-gradient-to-r ${accent.from} ${accent.to} bg-clip-text text-transparent`}>
              MULTIPLE MISSIONS.
            </span>
          </h2>
          <p className="text-base text-slate-400 mt-4 leading-relaxed">
            The same neuromorphic core powers every operational context. Switch modes to
            see how the pipeline adapts — different sensors, scenarios, and thresholds,
            all running on the same brain-inspired architecture.
          </p>
        </div>

        {/* Mode selector tabs */}
        <div className="flex flex-wrap justify-center gap-2 mt-10">
          {MISSION_MODES.map((m) => {
            const a = ACCENT_MAP[m.accent] ?? ACCENT_MAP.cyan;
            const Icon = ICONS[m.icon] ?? Satellite;
            const active = settings.missionMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id)}
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl border font-display font-medium text-sm transition-all duration-300 ${
                  active
                    ? `${a.border} ${a.bg} ${a.text} ${a.glow}`
                    : 'border-white/5 bg-ink-850/40 text-slate-400 hover:border-white/15 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? a.text : 'text-slate-500'}`} />
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Main dashboard grid */}
        <div className="grid lg:grid-cols-12 gap-6 mt-10">
          {/* Left: Scenario + Pipeline (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Scenario card */}
            <div
              className={`glass-strong p-6 border ${accent.border} animate-fade-in-up`}
              key={`scenario-${mode.id}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-11 h-11 rounded-xl ${accent.bg} ${accent.border} border flex items-center justify-center`}>
                  {(() => {
                    const Icon = ICONS[mode.icon] ?? Satellite;
                    return <Icon className={`w-5 h-5 ${accent.text}`} />;
                  })()}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">{mode.label}</h3>
                  <p className={`text-xs font-mono ${accent.text}`}>{mode.tagline}</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{mode.scenario}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className={`chip ${accent.border} ${accent.text} ${accent.bg} text-[10px]`}>
                  Threshold: {mode.cloudThreshold}% obscurity
                </span>
                <span className="chip border-white/10 text-slate-400 bg-white/5 text-[10px]">
                  {mode.context}
                </span>
              </div>
            </div>

            {/* Shared pipeline */}
            <div className="glass-strong p-6">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className={`w-4 h-4 ${accent.text}`} />
                <h3 className="font-display font-semibold text-sm text-white">
                  Shared Core Pipeline
                </h3>
                <span className="ml-auto text-[10px] font-mono text-slate-500">
                  Same chip · all modes
                </span>
              </div>

              {/* Pipeline flow */}
              <div className="space-y-1">
                {PIPELINE_STAGES.map((stage, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-3 py-2">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
                          i === 1 || i === 2
                            ? `${accent.border} ${accent.bg}`
                            : 'border-white/10 bg-white/5'
                        }`}
                      >
                        <stage.icon
                          className={`w-4 h-4 ${i === 1 || i === 2 ? accent.text : 'text-slate-400'}`}
                        />
                      </div>
                      <span className="text-sm text-slate-300 font-medium">{stage.label}</span>
                      {i === 1 && (
                        <span className={`ml-auto text-[9px] font-mono ${accent.text}`}>
                          CORE
                        </span>
                      )}
                    </div>
                    {i < PIPELINE_STAGES.length - 1 && (
                      <div className="ml-[18px] w-px h-3 bg-white/10" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <SensorIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{mode.sensorLabel}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <TransmissionIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{mode.transmissionLabel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mode metrics */}
            <div className="glass-strong p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className={`w-4 h-4 ${accent.text}`} />
                <h3 className="font-display font-semibold text-sm text-white">
                  Target Specifications
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {mode.metrics.map((metric) => (
                  <div key={metric.label} className="text-center">
                    <div className={`font-display font-bold text-xl ${accent.text}`}>
                      {metric.value}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      {metric.unit}
                    </div>
                    <div className="stat-label mt-1 text-[9px]">{metric.label}</div>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-slate-600 font-mono mt-3 text-center">
                * Target / simulated values — not measured hardware performance.
              </p>
            </div>
          </div>

          {/* Right: Live Mission Simulator (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Controls bar */}
            <div className="glass-strong p-5 flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setRunning(!running)}
                className={running ? 'btn-ghost text-sm' : 'btn-primary text-sm py-2.5'}
              >
                {running ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Stream
                  </>
                )}
              </button>
              <button onClick={handleReset} className="btn-ghost text-sm py-2.5">
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <div className="ml-auto flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    running ? 'bg-green-400 animate-pulse' : 'bg-slate-600'
                  }`}
                />
                <span className="text-xs font-mono text-slate-500">
                  {running ? 'STREAMING' : 'IDLE'} · {mode.shortLabel}
                </span>
              </div>
            </div>

            {/* Live counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <CounterCard
                icon={Activity}
                label="Processed"
                value={stats.totalProcessed}
                color="text-cyan-400"
              />
              <CounterCard
                icon={CheckCircle2}
                label="Useful"
                value={stats.kept}
                color="text-green-400"
              />
              <CounterCard
                icon={XCircle}
                label="Rejected"
                value={stats.rejected}
                color="text-rose-400"
              />
              <CounterCard
                icon={Zap}
                label="Energy (mW)"
                value={stats.totalPowerMw}
                color="text-amber-400"
                simulated
              />
            </div>

            {/* Data + bandwidth row */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="glass p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-teal-400" />
                  <span className="text-xs text-slate-400">Data Transmitted</span>
                  <span className="ml-auto font-mono font-semibold text-sm text-teal-400">
                    <Counter value={stats.totalDataKB} format={formatBytes} />
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-400 transition-all duration-700"
                    style={{
                      width: `${stats.totalProcessed > 0 ? (stats.kept / stats.totalProcessed) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="glass p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-slate-400">Data Saved</span>
                  <span className="ml-auto font-mono font-semibold text-sm text-green-400">
                    <Counter value={stats.dataSavedKB} format={formatBytes} />
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-teal-400 transition-all duration-700"
                    style={{ width: `${stats.dataSavedPercent}%` }}
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">Reduction rate</span>
                  <span className="text-green-400 font-bold">
                    <Counter value={stats.dataSavedPercent} format={(n) => `${n.toFixed(1)}%`} />
                  </span>
                </div>
              </div>
            </div>

            {/* Stream feed */}
            <div className="glass-strong p-5 min-h-[300px]">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className={`w-4 h-4 ${accent.text}`} />
                <h3 className="font-display font-semibold text-sm text-white">
                  Incoming {mode.label} Image Stream
                </h3>
                <span className="ml-auto text-xs font-mono text-slate-500">
                  {stream.length} / 10 shown
                </span>
              </div>

              {stream.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                    <Activity className="w-6 h-6 text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-500">
                    {running
                      ? 'Waiting for first image...'
                      : 'Press "Start Stream" to begin processing'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
                  {stream.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-ink-850/60 border border-white/5 animate-slide-in"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                        {entry.thumbnail ? (
                          <img
                            src={entry.thumbnail}
                            alt={entry.label}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-ink-700" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-300 truncate">
                            {entry.label}
                          </span>
                          <span
                            className={`chip text-[9px] flex-shrink-0 ${
                              entry.decision === 'KEEP'
                                ? 'border-green-400/30 text-green-400 bg-green-400/5'
                                : 'border-rose-400/30 text-rose-400 bg-rose-400/5'
                            }`}
                          >
                            {entry.decision === 'KEEP' ? (
                              <CheckCircle2 className="w-2.5 h-2.5" />
                            ) : (
                              <XCircle className="w-2.5 h-2.5" />
                            )}
                            {entry.decision}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-slate-500">
                          <span>Obscured: {entry.cloudPercent}%</span>
                          <span>Power: {entry.powerMw}mW</span>
                          <span>Time: {entry.timeMs}ms</span>
                          <span>Size: {(entry.sizeKB / 1024).toFixed(1)}MB</span>
                        </div>
                      </div>
                      <div
                        className={`w-1 h-9 rounded-full flex-shrink-0 ${
                          entry.decision === 'KEEP' ? 'bg-green-400' : 'bg-rose-400'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-slate-600 font-mono mt-4">
                * Synthetic {mode.label.toLowerCase()} images generated in-browser using
                mode-specific color palettes. Power and timing are simulated target values.
                Obscuration detection uses real pixel-level image analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CounterCard({
  icon: Icon,
  label,
  value,
  color,
  simulated,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  simulated?: boolean;
}) {
  return (
    <div className="glass p-4">
      <div className="flex items-center justify-between mb-1.5">
        <Icon className={`w-4 h-4 ${color}`} />
        {simulated && <span className="text-[9px] font-mono text-slate-600">SIM</span>}
      </div>
      <div className="stat-label text-[10px]">{label}</div>
      <div className={`font-display font-bold text-xl mt-0.5 ${color}`}>
        <Counter value={value} />
      </div>
    </div>
  );
}
