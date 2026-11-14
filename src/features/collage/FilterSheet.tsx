import { useEffect, useRef, useState } from 'react';
import { BottomSheet, GlassButton, LockBadge } from '../../components/ui';
import { cn } from '../../lib/utils';
import { isLocked, requirePremium, usePremium } from '../../services/entitlements';
import { getPreview, loadPreview } from './assets';
import { cssFilter, FILTERS, filterOps, NO_FILTER } from './filters';
import type { FilterSettings } from './types';

function Swatch({ assetId, css }: { assetId?: string; css: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!assetId) return;
    loadPreview(assetId).then(() => setReady(true));
  }, [assetId]);
  useEffect(() => {
    const c = ref.current;
    const f = assetId ? getPreview(assetId) : undefined;
    if (!c || !f) return;
    const s = 128;
    c.width = c.height = s;
    const k = Math.max(s / f.w, s / f.h);
    c.getContext('2d')!.drawImage(f.src, (s - f.w * k) / 2, (s - f.h * k) / 2, f.w * k, f.h * k);
  }, [assetId, ready]);
  return assetId ? (
    <canvas ref={ref} className="h-16 w-16 rounded-xl" style={{ filter: css }} aria-hidden />
  ) : (
    <span className="block h-16 w-16 rounded-xl bg-ig" style={{ filter: css }} aria-hidden />
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** The photo whose filter is edited (and shown in the swatches). */
  assetId?: string;
  value: FilterSettings;
  onChange: (f: FilterSettings) => void;
  onApplyAll: (f: FilterSettings) => void;
  /** Editing every photo at once (nothing selected). */
  allMode: boolean;
}

export function FilterSheet({ open, onClose, assetId, value, onChange, onApplyAll, allMode }: Props) {
  const premium = usePremium();
  const set = (patch: Partial<FilterSettings>) => onChange({ ...value, ...patch });
  const sliders: [keyof FilterSettings, string][] = [
    ['brightness', 'Brightness'],
    ['contrast', 'Contrast'],
    ['saturation', 'Saturation'],
  ];
  return (
    <BottomSheet open={open} onClose={onClose} title={allMode ? 'Filter · all photos' : 'Filter'}>
      <div className="space-y-4 pt-1">
        <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1" role="radiogroup" aria-label="Filter">
          {FILTERS.map((f) => {
            const locked = isLocked(f, premium);
            return (
              <button
                key={f.id}
                role="radio"
                aria-checked={value.preset === f.id}
                aria-label={`${f.name}${locked ? ' (Premium)' : ''}`}
                onClick={() => requirePremium(f, `The ${f.name} filter is a Premium filter.`) && set({ preset: f.id })}
                className={cn('relative flex shrink-0 flex-col items-center gap-1 rounded-2xl p-1.5', value.preset === f.id && 'bg-ig-pink/15 ring-2 ring-ig-pink')}
              >
                <Swatch assetId={assetId} css={cssFilter(f.ops)} />
                <span className="text-[12px] font-medium">{f.name}</span>
                {locked && <LockBadge className="absolute right-1 top-1" />}
              </button>
            );
          })}
        </div>

        {sliders.map(([k, label]) => (
          <label key={k} className="block">
            <span className="text-2 flex justify-between text-[13px] font-medium">
              {label} <span>{Math.round(((value[k] as number) - 1) * 100)}</span>
            </span>
            <input
              type="range"
              min={50}
              max={150}
              value={Math.round((value[k] as number) * 100)}
              onChange={(e) => set({ [k]: Number(e.target.value) / 100 })}
              className="h-11 w-full accent-[#d62976]"
            />
          </label>
        ))}

        <div className="grid grid-cols-2 gap-2">
          <GlassButton size="md" onClick={() => onChange({ ...NO_FILTER })}>
            Reset
          </GlassButton>
          {!allMode && (
            <GlassButton size="md" onClick={() => onApplyAll(value)}>
              Apply to all
            </GlassButton>
          )}
        </div>
        <span className="sr-only">{cssFilter(filterOps(value))}</span>
      </div>
    </BottomSheet>
  );
}
