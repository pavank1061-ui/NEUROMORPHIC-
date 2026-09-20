import { Brain, Menu, X } from 'lucide-react';
import { useState } from 'react';

const LINKS = [
  { label: 'Simulator', href: '#simulator' },
  { label: 'Data Savings', href: '#data-savings' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'One Chip', href: '#one-chip' },
  { label: 'Impact', href: '#impact' },
  { label: 'Roadmap', href: '#roadmap' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <div className="section-pad mx-auto max-w-[1600px] h-16 flex items-center justify-between">
        <a href="#hero" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400/20 to-teal-500/20 border border-cyan-400/30 flex items-center justify-center group-hover:border-cyan-400/60 transition-colors">
            <Brain className="w-5 h-5 text-cyan-400" />
            <div className="absolute inset-0 rounded-lg animate-glow opacity-50" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-bold text-sm tracking-wider text-white">
              NEUROMORPHIC
            </span>
            <span className="font-mono text-[10px] text-cyan-400 tracking-widest">2.0</span>
          </div>
        </a>

        <div className="hidden lg:flex items-center gap-1">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:block">
          <a href="#simulator" className="btn-primary text-sm py-2 px-4">
            Launch Simulator
          </a>
        </div>

        <button
          className="lg:hidden p-2 text-slate-300 hover:text-cyan-400 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/5 bg-ink-900/95 backdrop-blur-xl">
          <div className="section-pad py-4 flex flex-col gap-1">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors rounded-lg hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#simulator"
              onClick={() => setOpen(false)}
              className="btn-primary text-sm mt-2"
            >
              Launch Simulator
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
