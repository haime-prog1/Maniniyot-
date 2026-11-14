import { BottomSheet, SegmentedControl } from '../../components/ui';
import { cn } from '../../lib/utils';
import { SWATCHES } from './TextSheet';
import type { Background, CollageStyle } from './types';

const GRADIENTS: [string, string][] = [
  ['#fde2c8', '#f6b6c8'],
  ['#feda75', '#d62976'],
  ['#4f5bd5', '#962fbf'],
  ['#c8e6f6', '#f4efe8'],
  ['#111111', '#3a3a3c'],
];

interface Props {
  open: boolean;
  onClose: () => void;
  style: CollageStyle;
  onChange: (patch: Partial<CollageStyle>) => void;
}

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="text-2 flex justify-between text-[13px] font-medium">
        {label} <span>{Math.round(value)}</span>
      </span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-11 w-full accent-[#d62976]" />
    </label>
  );
}

/** Spacing, corners, borders and background. */
export function LookSheet({ open, onClose, style, onChange }: Props) {
  const bg = style.background;
  const setBg = (b: Background) => onChange({ background: b });
  return (
    <BottomSheet open={open} onClose={onClose} title="Layout & background">
      <div className="space-y-3 pt-1">
        <Slider label="Spacing" value={style.gap} min={0} max={80} onChange={(gap) => onChange({ gap })} />
        <Slider label="Corner radius" value={style.radius} min={0} max={80} onChange={(radius) => onChange({ radius })} />
        <Slider label="Border width" value={style.borderWidth} min={0} max={30} onChange={(borderWidth) => onChange({ borderWidth })} />
        {style.borderWidth > 0 && (
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Border color">
            {SWATCHES.map((c) => (
              <button
                key={c}
                role="radio"
                aria-checked={style.borderColor === c}
                aria-label={`Border ${c}`}
                onClick={() => onChange({ borderColor: c })}
                className={cn('h-11 w-11 rounded-full border border-black/15', style.borderColor === c && 'ring-2 ring-ig-pink ring-offset-2')}
                style={{ background: c }}
              />
            ))}
          </div>
        )}

        <p className="text-2 pt-2 text-[13px] font-medium">Background</p>
        <SegmentedControl
          label="Background type"
          value={bg.type}
          onChange={(t) =>
            setBg(
              t === 'solid'
                ? { type: 'solid', color: '#ffffff' }
                : t === 'gradient'
                  ? { type: 'gradient', from: GRADIENTS[0][0], to: GRADIENTS[0][1], angle: 135 }
                  : { type: 'blur', dim: 0.15 },
            )
          }
          options={[
            { value: 'solid', label: 'Solid' },
            { value: 'gradient', label: 'Gradient' },
            { value: 'blur', label: 'Blurred photo' },
          ]}
        />
        {bg.type === 'solid' && (
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Background color">
            {SWATCHES.map((c) => (
              <button
                key={c}
                role="radio"
                aria-checked={bg.color === c}
                aria-label={`Background ${c}`}
                onClick={() => setBg({ type: 'solid', color: c })}
                className={cn('h-11 w-11 rounded-full border border-black/15', bg.color === c && 'ring-2 ring-ig-pink ring-offset-2')}
                style={{ background: c }}
              />
            ))}
          </div>
        )}
        {bg.type === 'gradient' && (
          <>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Gradient">
              {GRADIENTS.map(([from, to]) => (
                <button
                  key={from + to}
                  role="radio"
                  aria-checked={bg.from === from && bg.to === to}
                  aria-label={`Gradient ${from} to ${to}`}
                  onClick={() => setBg({ ...bg, from, to })}
                  className={cn('h-11 w-11 rounded-full border border-black/15', bg.from === from && bg.to === to && 'ring-2 ring-ig-pink ring-offset-2')}
                  style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                />
              ))}
            </div>
            <Slider label="Angle" value={bg.angle} min={0} max={360} onChange={(angle) => setBg({ ...bg, angle })} />
          </>
        )}
        {bg.type === 'blur' && (
          <>
            <p className="text-2 text-[13px]">Uses your first photo, blurred.</p>
            <Slider label="Darken" value={Math.round(bg.dim * 100)} min={0} max={70} onChange={(v) => setBg({ ...bg, dim: v / 100 })} />
          </>
        )}
      </div>
    </BottomSheet>
  );
}
