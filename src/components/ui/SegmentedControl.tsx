import { motion } from 'framer-motion';
import { useId } from 'react';
import { spring } from '../../lib/utils';

interface Props<T extends string | number> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  columns?: number;
}

export function SegmentedControl<T extends string | number>({ options, value, onChange, label, columns }: Props<T>) {
  const id = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="glass grid gap-1 rounded-[18px] p-1"
      style={{ gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className="relative h-9 rounded-[14px] text-[13px] font-semibold"
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={spring}
                className="absolute inset-0 rounded-[14px] bg-white shadow-sm dark:bg-white/20"
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
