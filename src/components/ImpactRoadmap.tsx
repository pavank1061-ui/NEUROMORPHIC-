import {
  Radio,
  HardDrive,
  Zap,
  Zap as ZapIcon,
  Wifi,
  WifiOff,
  Gauge,
  ArrowRight,
} from 'lucide-react';
import { useInView } from './useInView';

const IMPACT_ITEMS = [
  {
    icon: Radio,
    title: 'Lower Bandwidth',
    text: 'Only useful images are downlinked — reducing bandwidth demand by up to 80%.',
    metric: '~80%',
    metricLabel: 'less bandwidth',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-400/20',
    bgColor: 'bg-cyan-400/5',
  },
  {
    icon: HardDrive,
    title: 'Lower Storage',
    text: 'Cloud-covered images are discarded on-board, freeing storage for valuable captures.',
    metric: '~55%',
    metricLabel: 'less storage',
    color: 'text-teal-400',
    borderColor: 'border-teal-400/20',
    bgColor: 'bg-teal-400/5',
  },
  {
    icon: ZapIcon,
    title: 'Lower Energy',
    text: 'Spiking neural networks draw ~20 mW/image versus ~350 mW for traditional processing.',
    metric: '~94%',
    metricLabel: 'less energy',
    color: 'text-amber-400',
    borderColor: 'border-amber-400/20',
    bgColor: 'bg-amber-400/5',
  },
  {
    icon: Gauge,
    title: 'Faster Intelligence',
    text: 'On-board decisions eliminate ground-in-the-loop latency — actionable in milliseconds.',
    metric: '<50ms',
    metricLabel: 'per image',
    color: 'text-green-400',
    borderColor: 'border-green-400/20',
    bgColor: 'bg-green-400/5',
  },
  {
    icon: WifiOff,
    title: 'Offline Capability',
    text: 'Edge AI works without continuous connectivity — critical for defence and rural use.',
    metric: 'Zero',
    metricLabel: 'ground dependency',
    color: 'text-sky-400',
    borderColor: 'border-sky-400/20',
    bgColor: 'bg-sky-400/5',
  },
  {
    icon: Wifi,
    title: 'Low-Connectivity Ready',
    text: 'Store-and-forward: process now, downlink when ground station is available.',
    metric: 'Store',
    metricLabel: '& forward',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-400/20',
    bgColor: 'bg-cyan-400/5',
  },
];

export function Impact() {
  const { ref, inView } = useInView();

  return (
    <section id="impact" className="relative py-20 lg:py-28">
      <div className="section-pad mx-auto max-w-[1600px]" ref={ref}>
        <div className="max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">
            05 · Impact
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
            Why On-Board Neuromorphic AI Matters
          </h2>
          <p className="text-base text-slate-400 mt-3 leading-relaxed">
            The impact goes beyond filtering — it transforms how satellites and edge
            systems handle data, power, and decision-making.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {IMPACT_ITEMS.map((item, i) => (
            <div
              key={item.title}
              className={`glass p-6 border ${item.borderColor} ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${item.bgColor} ${item.borderColor} border flex items-center justify-center`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div className="text-right">
                  <div className={`font-display font-bold text-2xl ${item.color}`}>
                    {item.metric}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    {item.metricLabel}
                  </div>
                </div>
              </div>
              <h3 className="font-display font-semibold text-white text-base mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-slate-600 font-mono mt-6">
          * Metrics are target/simulated values for this technology demonstrator. Actual
          results depend on deployment conditions, image resolution, and hardware.
        </p>
      </div>
    </section>
  );
}

const ROADMAP = [
  {
    year: 'Year 1',
    title: 'AI + Low-Power Prototype',
    status: 'current',
    items: [
      'Develop spiking neural network model for cloud detection',
      'Software prototype on edge hardware (FPGA/embedded GPU)',
      'Validate against real satellite imagery datasets',
      'Benchmark power consumption vs. traditional inference',
    ],
    color: 'cyan',
  },
  {
    year: 'Year 2',
    title: 'UAV / Edge Prototype',
    status: 'planned',
    items: [
      'Deploy on UAV platform for aerial image filtering',
      'Integrate with rural/farm and disaster-response workflows',
      'Optimize for size, weight, and power (SWaP) constraints',
      'Field trials in low-connectivity environments',
    ],
    color: 'teal',
  },
  {
    year: 'Year 3',
    title: 'Neuromorphic Chip + Pilot',
    status: 'future',
    items: [
      'Custom neuromorphic ASIC design and fabrication',
      'On-orbit pilot deployment on satellite platform',
      'Integration with ground-station downlink protocols',
      'Performance validation in operational conditions',
    ],
    color: 'amber',
  },
];

export function Roadmap() {
  const { ref, inView } = useInView();

  return (
    <section id="roadmap" className="relative py-20 lg:py-28">
      <div className="section-pad mx-auto max-w-[1600px]" ref={ref}>
        <div className="max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">
            06 · Roadmap
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
            Development Path
          </h2>
          <p className="text-base text-slate-400 mt-3 leading-relaxed">
            A phased approach from software prototype to custom neuromorphic silicon.
            This is a forward-looking roadmap — not a claim of existing hardware.
          </p>
        </div>

        {/* Timeline */}
        <div className="mt-12 grid lg:grid-cols-3 gap-6">
          {ROADMAP.map((phase, i) => (
            <div
              key={phase.year}
              className={`relative glass-strong p-6 ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {/* Status badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-slate-500">{phase.year}</span>
                <span
                  className={`chip text-[10px] ${
                    phase.status === 'current'
                      ? 'border-cyan-400/30 text-cyan-400 bg-cyan-400/5'
                      : phase.status === 'planned'
                      ? 'border-teal-400/30 text-teal-400 bg-teal-400/5'
                      : 'border-amber-400/30 text-amber-400 bg-amber-400/5'
                  }`}
                >
                  {phase.status === 'current' ? 'Current Phase' : phase.status === 'planned' ? 'Planned' : 'Future'}
                </span>
              </div>

              <h3 className="font-display font-bold text-lg text-white mb-4">
                {phase.title}
              </h3>

              <ul className="space-y-2.5">
                {phase.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-slate-400">
                    <ArrowRight className="w-3.5 h-3.5 mt-1 text-slate-600 flex-shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              {/* Connector line */}
              {i < ROADMAP.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-white/20 to-transparent" />
              )}
            </div>
          ))}
        </div>

        <div className="glass p-5 mt-6 border-amber-400/10">
          <p className="text-xs text-slate-500 leading-relaxed">
            <span className="font-semibold text-amber-400">Important:</span> NEUROMORPHIC 2.0
            is a technology demonstrator and simulation. No physical neuromorphic chip,
            satellite deployment, or defence partnership currently exists. This roadmap
            represents target milestones for future development.
          </p>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-12">
      <div className="section-pad mx-auto max-w-[1600px]">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400/20 to-teal-500/20 border border-cyan-400/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="font-display font-bold text-sm text-white tracking-wider">
                NEUROMORPHIC 2.0
              </div>
              <div className="font-mono text-[10px] text-slate-500">
                Technology Demonstrator · Simulation
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <a href="#simulator" className="hover:text-cyan-400 transition-colors">Simulator</a>
            <a href="#data-savings" className="hover:text-cyan-400 transition-colors">Data Savings</a>
            <a href="#architecture" className="hover:text-cyan-400 transition-colors">Architecture</a>
            <a href="#one-chip" className="hover:text-cyan-400 transition-colors">One Chip</a>
            <a href="#roadmap" className="hover:text-cyan-400 transition-colors">Roadmap</a>
          </div>

          <div className="text-[10px] font-mono text-slate-600 text-center lg:text-right">
            Brain-inspired edge AI for satellite imagery filtering.
            <br />
            Prototype / simulation — not a deployed system.
          </div>
        </div>
      </div>
    </footer>
  );
}
