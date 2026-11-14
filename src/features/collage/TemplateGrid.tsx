import { useEffect, useRef } from 'react';
import { LockBadge } from '../../components/ui';
import { cn } from '../../lib/utils';
import { isLocked, usePremium } from '../../services/entitlements';
import { emptyProvider, renderCollage } from './render';
import { createProject, templatesFor, type CollageTemplate } from './templates';
import type { FormatId } from './types';

function TemplateThumb({ format, t, height }: { format: FormatId; t: CollageTemplate; height: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const p = createProject(format, t, { destination: 'Boracay' });
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const k = (height * dpr) / p.height;
    c.width = Math.round(p.width * k);
    c.height = Math.round(p.height * k);
    const ctx = c.getContext('2d')!;
    ctx.scale(k, k);
    renderCollage(ctx, p, emptyProvider, { thumbnail: true });
  }, [format, t, height]);
  return <canvas ref={ref} className="block rounded-lg shadow-sm" style={{ height }} aria-hidden />;
}

interface Props {
  format: FormatId;
  selectedId?: string;
  onPick: (t: CollageTemplate) => void;
}

/** Template choices for a format, drawn with the real renderer. */
export function TemplateGrid({ format, selectedId, onPick }: Props) {
  const premium = usePremium();
  const list = templatesFor(format);
  const h = format === 'carousel' ? 92 : 132;
  return (
    <div className={cn('grid gap-3', format === 'carousel' ? 'grid-cols-1' : 'grid-cols-3')}>
      {list.map((t) => {
        const locked = isLocked(t, premium);
        return (
          <button
            key={t.id}
            onClick={() => onPick(t)}
            aria-pressed={selectedId === t.id}
            aria-label={`${t.name}${locked ? ' (Premium)' : ''}`}
            className={cn(
              'relative flex min-h-[44px] flex-col items-center gap-1.5 rounded-2xl p-2 text-[12px] font-medium',
              selectedId === t.id ? 'bg-ig-pink/15 ring-2 ring-ig-pink' : 'bg-black/[0.04] dark:bg-white/[0.06]',
            )}
          >
            <div className="no-scrollbar max-w-full overflow-x-auto">
              <TemplateThumb format={format} t={t} height={h} />
            </div>
            <span className="text-center leading-tight">{t.name}</span>
            {locked && <LockBadge className="absolute right-2 top-2" />}
          </button>
        );
      })}
    </div>
  );
}
