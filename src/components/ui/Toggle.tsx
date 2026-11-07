import { motion } from 'framer-motion';
import { cn, spring } from '../../lib/utils';

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative flex h-[31px] w-[51px] shrink-0 items-center rounded-full p-[2px] transition-colors',
        checked ? 'justify-end bg-green-500' : 'justify-start bg-black/15 dark:bg-white/20',
      )}
    >
      <motion.span layout transition={spring} className="h-[27px] w-[27px] rounded-full bg-white shadow" />
    </button>
  );
}
