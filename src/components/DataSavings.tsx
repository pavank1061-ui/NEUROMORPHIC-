import { useMemo, useState } from 'react';
import {
  Database,
  Zap,
  HardDrive,
  Radio,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Settings,
} from 'lucide-react';
import type { SimSettings } from '@/types';
import { Counter } from './Counter';
import { useInView } from './useInView';
import { formatBytes, formatPower, formatNumber } from '@/lib/settings';

interface Props {
  settings: SimSettings;
  onSettingsChange: (s: SimSettings) => void;
}

export function DataSavings({ settings, onSettingsChange }: Props) {
  const { ref, inView } = useInView();
  const [showConfig, setShowConfig] = useState(false);

  // Assume ~55% of images are cloud-covered/useless on average
  const rejectRate = 0.55;

  const stats = useMemo(() => {
    const totalImages = settings.imagesPerOrbit * settings.orbitsPerDay;
    const rejectedImages = Math.round(totalImages * rejectRate);
    const usefulImages = totalImages - rejectedImages;

    const imageSizeKB = settings.imageSizeMB * 1024;

    // Traditional: transmit ALL images
    const traditionalDataKB = totalImages * imageSizeKB;
    const traditionalPowerMw = totalImages * settings.traditionalPowerPerImageMw;

    // Neuromorphic: only transmit useful images
    const neuromorphicDataKB = usefulImages * imageSizeKB;
    const neuromorphicPowerMw = totalImages * settings.powerPerImageMw;

    const dataSavedKB = traditionalDataKB - neuromorphicDataKB;
    const dataSavedPercent = (dataSavedKB / traditionalDataKB) * 100;
    const powerSavedMw = traditionalPowerMw - neuromorphicPowerMw;
    const powerSavedPercent = (powerSavedMw / traditionalPowerMw) * 100;

    return {
      totalImages,
      rejectedImages,
      usefulImages,
      traditionalDataKB,
      neuromorphicDataKB,
      dataSavedKB,
      dataSavedPercent,
      traditionalPowerMw,
      neuromorphicPowerMw,
      powerSavedMw,
      powerSavedPercent,
    };
  }, [settings]);

  return (
    <section id="data-savings" className="relative py-20 lg:py-28">
      <div className="section-pad mx-auto max-w-[1600px]" ref={ref}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="max-w-2xl">
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">
              02 · Data-Saving Simulator
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
              Traditional vs. Onboard Filtering
            </h2>
            <p className="text-base text-slate-400 mt-3 leading-relaxed">
              Compare the cost of transmitting every captured image versus filtering
              on-board with neuromorphic AI. Adjust the assumptions to see the impact.
            </p>
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="btn-ghost text-sm"
          >
            <Settings className="w-4 h-4" />
            {showConfig ? 'Hide' : 'Configure'} Assumptions
          </button>
        </div>

        {/* Config panel */}
        {showConfig && (
          <div className="glass-strong p-6 mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
            <ConfigField
              label="Images per orbit"
              value={settings.imagesPerOrbit}
              min={10}
              max={500}
              onChange={(v) => onSettingsChange({ ...settings, imagesPerOrbit: v })}
            />
            <ConfigField
              label="Image size (MB)"
              value={settings.imageSizeMB}
              min={1}
              max={50}
              step={0.5}
              onChange={(v) => onSettingsChange({ ...settings, imageSizeMB: v })}
            />
            <ConfigField
              label="Orbits per day"
              value={settings.orbitsPerDay}
              min={1}
              max={30}
              onChange={(v) => onSettingsChange({ ...settings, orbitsPerDay: v })}
            />
            <ConfigField
              label="Traditional power/img (mW)"
              value={settings.traditionalPowerPerImageMw}
              min={50}
              max={2000}
              step={10}
              onChange={(v) => onSettingsChange({ ...settings, traditionalPowerPerImageMw: v })}
            />
            <div className="col-span-2 lg:col-span-4 text-xs font-mono text-slate-500 border-t border-white/5 pt-3">
              Demo assumption: ~55% of captured images are cloud-covered or unusable.
              This is configurable in a real deployment.
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <BigStat
            icon={Database}
            label="Images Processed / Day"
            value={stats.totalImages}
            format={(n) => formatNumber(n)}
            color="text-cyan-400"
            inView={inView}
          />
          <BigStat
            icon={CheckCircle2}
            label="Useful Images (Transmitted)"
            value={stats.usefulImages}
            format={(n) => formatNumber(n)}
            color="text-green-400"
            inView={inView}
          />
          <BigStat
            icon={XCircle}
            label="Rejected Images (Discarded)"
            value={stats.rejectedImages}
            format={(n) => formatNumber(n)}
            color="text-rose-400"
            inView={inView}
          />
          <BigStat
            icon={TrendingDown}
            label="Data Saved"
            value={stats.dataSavedPercent}
            format={(n) => `${n.toFixed(1)}%`}
            color="text-teal-400"
            inView={inView}
          />
        </div>

        {/* Comparison bars */}
        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          {/* Data comparison */}
          <div className="glass-strong p-6">
            <div className="flex items-center gap-2 mb-4">
              <HardDrive className="w-5 h-5 text-cyan-400" />
              <h3 className="font-display font-semibold text-white">Data Transmitted</h3>
            </div>
            <ComparisonBar
              label="Traditional (All Images)"
              value={stats.traditionalDataKB}
              max={stats.traditionalDataKB}
              color="bg-rose-500"
              format={formatBytes}
              inView={inView}
            />
            <ComparisonBar
              label="Neuromorphic (Filtered)"
              value={stats.neuromorphicDataKB}
              max={stats.traditionalDataKB}
              color="bg-green-500"
              format={formatBytes}
              inView={inView}
            />
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-400">Data Saved</span>
              <span className="font-mono font-semibold text-green-400">
                <Counter value={stats.dataSavedPercent} format={(n) => `${n.toFixed(1)}%`} />
                {' '}({formatBytes(stats.dataSavedKB)})
              </span>
            </div>
          </div>

          {/* Power comparison */}
          <div className="glass-strong p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="font-display font-semibold text-white">Energy Consumption</h3>
            </div>
            <ComparisonBar
              label="Traditional Processing"
              value={stats.traditionalPowerMw}
              max={stats.traditionalPowerMw}
              color="bg-rose-500"
              format={formatPower}
              inView={inView}
            />
            <ComparisonBar
              label="Neuromorphic Processing"
              value={stats.neuromorphicPowerMw}
              max={stats.traditionalPowerMw}
              color="bg-cyan-500"
              format={formatPower}
              inView={inView}
            />
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-400">Energy Saved</span>
              <span className="font-mono font-semibold text-cyan-400">
                <Counter value={stats.powerSavedPercent} format={(n) => `${n.toFixed(1)}%`} />
              </span>
            </div>
          </div>
        </div>

        {/* Bandwidth visualization */}
        <div className="glass-strong p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-5 h-5 text-teal-400" />
            <h3 className="font-display font-semibold text-white">Bandwidth Utilization</h3>
          </div>
          <div className="space-y-3">
            <BandwidthRow
              label="Traditional Downlink"
              percent={100}
              color="bg-rose-500/70"
              inView={inView}
            />
            <BandwidthRow
              label="Neuromorphic Downlink"
              percent={100 - stats.dataSavedPercent}
              color="bg-teal-500/70"
              inView={inView}
            />
          </div>
          <p className="text-[10px] text-slate-600 font-mono mt-4">
            * Values are simulated estimates based on configurable demo assumptions. Real
            results depend on cloud conditions, image resolution, and orbit parameters.
          </p>
        </div>
      </div>
    </section>
  );
}

function BigStat({
  icon: Icon,
  label,
  value,
  format,
  color,
  inView,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  format: (n: number) => string;
  color: string;
  inView: boolean;
}) {
  return (
    <div className="glass p-5">
      <Icon className={`w-5 h-5 ${color} mb-3`} />
      <div className="stat-label">{label}</div>
      <div className={`font-display font-bold text-2xl lg:text-3xl mt-1 ${color}`}>
        {inView ? <Counter value={value} format={format} /> : '0'}
      </div>
    </div>
  );
}

function ComparisonBar({
  label,
  value,
  max,
  color,
  format,
  inView,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  format: (n: number) => string;
  inView: boolean;
}) {
  const percent = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-sm font-mono text-white">
          {inView ? <Counter value={value} format={format} /> : '0'}
        </span>
      </div>
      <div className="h-3 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: inView ? `${percent}%` : '0%' }}
        />
      </div>
    </div>
  );
}

function BandwidthRow({
  label,
  percent,
  color,
  inView,
}: {
  label: string;
  percent: number;
  color: string;
  inView: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-sm font-mono text-white">
          {inView ? <Counter value={percent} format={(n) => `${n.toFixed(1)}%`} /> : '0%'}
        </span>
      </div>
      <div className="h-4 rounded-lg bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-lg ${color} transition-all duration-1000 ease-out`}
          style={{ width: inView ? `${percent}%` : '0%' }}
        />
      </div>
    </div>
  );
}

function ConfigField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full bg-ink-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-cyan-400/50 focus:outline-none"
      />
    </label>
  );
}
