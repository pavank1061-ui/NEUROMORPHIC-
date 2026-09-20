import { Satellite, Cpu, Radio, ArrowDown, Zap, Activity, Database } from 'lucide-react';
import { useInView } from './useInView';

export function Hero() {
  const { ref, inView } = useInView();

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-0 circuit-bg" />

      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl animate-float-delayed" />

      <div className="section-pad mx-auto max-w-[1600px] w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <div ref={ref} className="space-y-6">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-mono text-cyan-300 tracking-wider">
                TECHNOLOGY DEMONSTRATOR · SIMULATION
              </span>
            </div>

            <h1
              className={`font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-white ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: '0.1s' }}
            >
              NEUROMORPHIC
              <span className="block text-gradient-cyan">2.0</span>
            </h1>

            <p
              className={`text-lg sm:text-xl text-slate-400 max-w-lg leading-relaxed ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: '0.2s' }}
            >
              On-board AI. Brain-inspired. Ultra-low power.
              <span className="block mt-2 text-base text-slate-500">
                Edge-deployed neuromorphic processing for satellite and defence image
                filtering — reducing bandwidth, storage, and power by analyzing imagery
                before it ever reaches the ground.
              </span>
            </p>

            <div
              className={`flex flex-wrap gap-3 ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: '0.3s' }}
            >
              <a href="#simulator" className="btn-primary">
                Launch Simulator
              </a>
              <a href="#architecture" className="btn-ghost">
                How It Works
              </a>
            </div>

            {/* Quick stats */}
            <div
              className={`grid grid-cols-3 gap-4 pt-6 ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: '0.4s' }}
            >
              {[
                { icon: Zap, label: 'Target Power', value: '~20 mW', color: 'text-amber-400' },
                { icon: Activity, label: 'Onboard Decision', value: 'KEEP / REJECT', color: 'text-cyan-400' },
                { icon: Database, label: 'Data Reduction', value: 'Up to 80%', color: 'text-green-400' },
              ].map((stat) => (
                <div key={stat.label} className="glass p-4">
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                  <div className="stat-label">{stat.label}</div>
                  <div className="font-display font-semibold text-sm text-white mt-1">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: animated visualization */}
          <HeroVisualization />
        </div>
      </div>
    </section>
  );
}

function HeroVisualization() {
  return (
    <div className="relative aspect-square max-w-lg mx-auto w-full">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        {/* Outer orbit ring */}
        <circle
          cx="200" cy="200" r="180"
          fill="none" stroke="rgba(34,211,238,0.1)" strokeWidth="1"
          strokeDasharray="4 8"
          className="animate-spin-slow"
          style={{ transformOrigin: 'center' }}
        />
        <circle
          cx="200" cy="200" r="140"
          fill="none" stroke="rgba(45,212,191,0.08)" strokeWidth="1"
          strokeDasharray="2 6"
          className="animate-spin-reverse-slow"
          style={{ transformOrigin: 'center' }}
        />

        {/* Central chip core */}
        <g>
          <circle cx="200" cy="200" r="50" fill="rgba(8,145,178,0.08)" stroke="rgba(34,211,238,0.3)" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="35" fill="rgba(8,145,178,0.12)" stroke="rgba(34,211,238,0.2)" strokeWidth="1" />
          <circle cx="200" cy="200" r="20" fill="rgba(34,211,238,0.15)" className="animate-pulse-slow" />
          {/* Neural network nodes inside chip */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const x = 200 + Math.cos(angle) * 30;
            const y = 200 + Math.sin(angle) * 30;
            return (
              <circle key={i} cx={x} cy={y} r="2" fill="#22d3ee" className="animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
            );
          })}
          {/* Neural connections */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle1 = (i / 6) * Math.PI * 2;
            const angle2 = ((i + 2) / 6) * Math.PI * 2;
            const x1 = 200 + Math.cos(angle1) * 30;
            const y1 = 200 + Math.sin(angle1) * 30;
            const x2 = 200 + Math.cos(angle2) * 30;
            const y2 = 200 + Math.sin(angle2) * 30;
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(34,211,238,0.2)" strokeWidth="0.5" />
            );
          })}
        </g>

        {/* Satellite node (top) */}
        <g>
          <circle cx="200" cy="40" r="28" fill="rgba(13,148,136,0.08)" stroke="rgba(45,212,191,0.4)" strokeWidth="1.5" />
          <circle cx="200" cy="40" r="16" fill="rgba(13,148,136,0.15)" className="animate-pulse-slow" />
        </g>

        {/* Ground station node (bottom) */}
        <g>
          <circle cx="200" cy="360" r="28" fill="rgba(34,211,238,0.06)" stroke="rgba(34,211,238,0.3)" strokeWidth="1.5" />
          <circle cx="200" cy="360" r="16" fill="rgba(34,211,238,0.12)" className="animate-pulse-slow" />
        </g>

        {/* Data flow lines: satellite → chip */}
        <line
          x1="200" y1="68" x2="200" y2="150"
          stroke="rgba(34,211,238,0.4)" strokeWidth="2"
          strokeDasharray="6 4"
          className="animate-dash"
          markerEnd="url(#arrowDown)"
        />
        {/* Data flow lines: chip → ground */}
        <line
          x1="200" y1="250" x2="200" y2="332"
          stroke="rgba(45,212,191,0.4)" strokeWidth="2"
          strokeDasharray="6 4"
          className="animate-dash"
          markerEnd="url(#arrowDownTeal)"
        />

        {/* Side data flow (filtered data) */}
        <line
          x1="250" y1="200" x2="370" y2="200"
          stroke="rgba(251,113,133,0.2)" strokeWidth="1.5"
          strokeDasharray="4 4"
          className="animate-dash"
        />
        <line
          x1="30" y1="200" x2="150" y2="200"
          stroke="rgba(74,222,128,0.2)" strokeWidth="1.5"
          strokeDasharray="4 4"
          className="animate-dash"
        />

        {/* Arrow markers */}
        <defs>
          <marker id="arrowDown" markerWidth="6" markerHeight="6" refX="3" refY="5" orient="auto">
            <path d="M0,0 L6,0 L3,5 z" fill="rgba(34,211,238,0.6)" />
          </marker>
          <marker id="arrowDownTeal" markerWidth="6" markerHeight="6" refX="3" refY="5" orient="auto">
            <path d="M0,0 L6,0 L3,5 z" fill="rgba(45,212,191,0.6)" />
          </marker>
        </defs>
      </svg>

      {/* Floating labels */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-ink-800/80 border border-teal-400/20 text-xs font-mono text-teal-300">
          <Satellite className="w-3 h-3" />
          Satellite
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-1">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-ink-800/80 border border-cyan-400/30 text-xs font-mono text-cyan-300">
          <Cpu className="w-3 h-3" />
          Neuromorphic AI
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-ink-800/80 border border-cyan-400/20 text-xs font-mono text-cyan-300">
          <Radio className="w-3 h-3" />
          Ground Station
        </div>
      </div>

      {/* Side labels */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-2 hidden sm:block">
        <div className="flex items-center gap-1 px-2 py-1 rounded bg-ink-800/60 border border-rose-400/15 text-[10px] font-mono text-rose-300">
          <ArrowDown className="w-2.5 h-2.5" />
          Rejected
        </div>
      </div>
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-2 hidden sm:block">
        <div className="flex items-center gap-1 px-2 py-1 rounded bg-ink-800/60 border border-green-400/15 text-[10px] font-mono text-green-300">
          <ArrowDown className="w-2.5 h-2.5" />
          Kept
        </div>
      </div>
    </div>
  );
}
