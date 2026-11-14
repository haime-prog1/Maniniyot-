import { Lock } from 'lucide-react';
import { cn } from '../../lib/utils';

/** Small "PRO" badge for premium items the user hasn't unlocked. */
export function LockBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'pointer-events-none inline-flex h-5 items-center gap-0.5 rounded-full bg-black/70 px-1.5 text-[10px] font-bold tracking-wide text-white',
        className,
      )}
    >
      <Lock size={10} aria-hidden />
      PRO
      <span className="sr-only">(Premium)</span>
    </span>
  );
}
