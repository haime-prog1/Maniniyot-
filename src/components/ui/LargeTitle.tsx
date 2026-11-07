import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { spring } from '../../lib/utils';

interface Props {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onBack?: () => void;
}

/** iOS-style large title that collapses into a compact glass nav bar on scroll. */
export function LargeTitle({ title, subtitle, right, onBack }: Props) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.header
        aria-hidden={!compact}
        className="glass-strong fixed inset-x-0 top-0 z-30 mx-auto max-w-[430px] !rounded-none !border-x-0 !border-t-0 pt-[env(safe-area-inset-top)]"
        initial={false}
        animate={{ opacity: compact ? 1 : 0, y: compact ? 0 : -10 }}
        style={{ pointerEvents: compact ? 'auto' : 'none' }}
        transition={spring}
      >
        <div className="relative flex h-12 items-center justify-center px-4">
          {onBack && (
            <button aria-label="Back" tabIndex={compact ? 0 : -1} onClick={onBack} className="absolute left-2 p-1 text-ig-pink">
              <ChevronLeft />
            </button>
          )}
          <span className="max-w-[60%] truncate text-[17px] font-semibold">{title}</span>
          {right && <div className="absolute right-3">{right}</div>}
        </div>
      </motion.header>

      <div className="px-5 pt-[calc(env(safe-area-inset-top)+8px)]">
        <div className="flex h-11 items-center justify-between">
          {onBack ? (
            <button onClick={onBack} className="-ml-2 flex items-center font-medium text-ig-pink">
              <ChevronLeft /> Back
            </button>
          ) : (
            <span />
          )}
          {right}
        </div>
        <motion.h1
          className="origin-left text-[34px] font-bold leading-tight tracking-tight"
          animate={{ opacity: compact ? 0 : 1, scale: compact ? 0.94 : 1 }}
          transition={spring}
        >
          {title}
        </motion.h1>
        {subtitle && <p className="text-2 mt-0.5 text-[15px]">{subtitle}</p>}
      </div>
    </>
  );
}
