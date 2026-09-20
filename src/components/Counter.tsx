import { useEffect, useRef, useState } from 'react';

interface CounterProps {
  value: number;
  duration?: number;
  className?: string;
  format?: (n: number) => string;
}

export function Counter({ value, duration = 800, className = '', format }: CounterProps) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);
  const startRef = useRef<number | undefined>(undefined);
  const fromRef = useRef(0);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = undefined;

    const animate = (now: number) => {
      if (startRef.current === undefined) startRef.current = now;
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = fromRef.current + (value - fromRef.current) * eased;
      setDisplay(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  const formatted = format ? format(display) : Math.round(display).toLocaleString();
  return <span className={className}>{formatted}</span>;
}
