import { useState } from 'react';
import {
  Camera,
  SlidersHorizontal,
  Brain,
  GitBranch,
  Database,
  Radio,
  ArrowRight,
  Zap,
  Layers,
  Cpu,
} from 'lucide-react';
import { useInView } from './useInView';

const STAGES = [
  {
    id: 0,
    icon: Camera,
    label: 'Sensor / Image',
    title: 'Image Capture',
    description:
      'The satellite sensor captures raw earth-observation imagery. In a traditional system, every frame is stored and transmitted — even cloud-covered or useless images.',
    detail: 'At ~8 MB per image and 120 images per orbit, raw data accumulates fast.',
    color: 'text-sky-400',
    borderColor: 'border-sky-400/30',
    bgColor: 'bg-sky-400/5',
  },
  {
    id: 1,
    icon: SlidersHorizontal,
    label: 'Preprocessing',
    title: 'On-Board Preprocessing',
    description:
      'The image is downscaled, normalized, and converted to a format the neuromorphic processor can handle. This step minimizes data movement — a major source of power consumption.',
    detail: 'Resampling to 200x200 pixels for the AI inference path reduces data 100x.',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-400/30',
    bgColor: 'bg-cyan-400/5',
  },
  {
    id: 2,
    icon: Brain,
    label: 'Neuromorphic AI',
    title: 'Spiking Neural Network Inference',
    description:
      'A brain-inspired spiking neural network processes the image using event-driven computation. Only "interesting" pixels trigger spikes — idle neurons consume near-zero power.',
    detail: 'Target: ~20 mW per image. Traditional GPU inference: ~350 mW+.',
    color: 'text-teal-400',
    borderColor: 'border-teal-400/30',
    bgColor: 'bg-teal-400/5',
  },
  {
    id: 3,
    icon: GitBranch,
    label: 'Decision',
    title: 'KEEP / REJECT Decision',
    description:
      'The AI outputs a cloud-coverage score and usability estimate. If cloud cover exceeds the mission threshold, the image is discarded on-board — never transmitted.',
    detail: 'Configurable threshold per mission mode (25%–50% cloud cover).',
    color: 'text-amber-400',
    borderColor: 'border-amber-400/30',
    bgColor: 'bg-amber-400/5',
  },
  {
    id: 4,
    icon: Database,
    label: 'Local Storage',
    title: 'On-Board Storage',
    description:
      'Kept images are stored in local solid-state memory for later downlink. Rejected images free storage for future captures — extending mission lifetime.',
    detail: 'Local buffer enables intelligent prioritization of downlink queue.',
    color: 'text-green-400',
    borderColor: 'border-green-400/30',
    bgColor: 'bg-green-400/5',
  },
  {
    id: 5,
    icon: Radio,
    label: 'Transmission',
    title: 'Downlink to Ground Station',
    description:
      'Only useful, cloud-filtered images are transmitted to the ground station. This reduces bandwidth, energy, and ground processing load by up to 80%.',
    detail: 'Fewer downlink passes needed — critical for defence/rural edge scenarios.',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-400/30',
    bgColor: 'bg-cyan-400/5',
  },
];

export function Architecture() {
  const { ref, inView } = useInView();
  const [activeStage, setActiveStage] = useState(0);

  return (
    <section id="architecture" className="relative py-20 lg:py-28">
      <div className="section-pad mx-auto max-w-[1600px]" ref={ref}>
        <div className="max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">
            03 · Neuromorphic Architecture
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
            How On-Board AI Filtering Works
          </h2>
          <p className="text-base text-slate-400 mt-3 leading-relaxed">
            Follow the data flow from sensor capture to ground-station downlink. Click
            each stage to learn how neuromorphic processing reduces power and data movement.
          </p>
        </div>

        {/* Flow diagram */}
        <div className="mt-12">
          {/* Desktop: horizontal flow */}
          <div className="hidden lg:flex items-center justify-between gap-2">
            {STAGES.map((stage, i) => (
              <div key={stage.id} className="flex items-center flex-1">
                <button
                  onClick={() => setActiveStage(stage.id)}
                  className={`group relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 flex-1 ${
                    activeStage === stage.id
                      ? `${stage.borderColor} ${stage.bgColor} scale-105`
                      : 'border-white/5 bg-ink-850/40 hover:border-white/10'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
                      activeStage === stage.id
                        ? `${stage.borderColor} ${stage.bgColor}`
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <stage.icon className={`w-6 h-6 ${activeStage === stage.id ? stage.color : 'text-slate-500'}`} />
                  </div>
                  <span
                    className={`text-xs font-mono font-medium ${
                      activeStage === stage.id ? stage.color : 'text-slate-500'
                    }`}
                  >
                    {stage.label}
                  </span>
                </button>
                {i < STAGES.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-slate-600 mx-1 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Mobile: vertical flow */}
          <div className="lg:hidden space-y-2">
            {STAGES.map((stage, i) => (
              <div key={stage.id}>
                <button
                  onClick={() => setActiveStage(stage.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    activeStage === stage.id
                      ? `${stage.borderColor} ${stage.bgColor}`
                      : 'border-white/5 bg-ink-850/40'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${stage.borderColor} ${stage.bgColor}`}>
                    <stage.icon className={`w-5 h-5 ${stage.color}`} />
                  </div>
                  <span className={`text-sm font-mono ${activeStage === stage.id ? stage.color : 'text-slate-400'}`}>
                    {stage.label}
                  </span>
                </button>
                {i < STAGES.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowRight className="w-4 h-4 text-slate-600 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Active stage detail */}
        <div className="glass-strong p-6 lg:p-8 mt-8 animate-fade-in-up" key={activeStage}>
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center border flex-shrink-0 ${STAGES[activeStage].borderColor} ${STAGES[activeStage].bgColor}`}>
              {(() => {
                const Icon = STAGES[activeStage].icon;
                return <Icon className={`w-7 h-7 ${STAGES[activeStage].color}`} />;
              })()}
            </div>
            <div className="flex-1">
              <div className="text-xs font-mono text-slate-500 mb-1">
                Stage {activeStage + 1} / {STAGES.length}
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-2">
                {STAGES[activeStage].title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {STAGES[activeStage].description}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-mono text-slate-300">
                  {STAGES[activeStage].detail}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key principles */}
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          {[
            {
              icon: Zap,
              title: 'Low-Power Processing',
              text: 'Spiking neurons fire only when needed — idle circuits draw near-zero power, unlike always-on GPU inference.',
            },
            {
              icon: Layers,
              title: 'Reduced Data Movement',
              text: 'Processing happens where data is captured. No round-trip to ground stations for every image.',
            },
            {
              icon: Cpu,
              title: 'Edge Intelligence',
              text: 'Decisions are made locally. The satellite decides what is worth sending — no ground-in-the-loop delay.',
            },
          ].map((item) => (
            <div key={item.title} className="glass p-5">
              <item.icon className="w-5 h-5 text-cyan-400 mb-3" />
              <h4 className="font-display font-semibold text-white text-sm mb-1">
                {item.title}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
