import { BottomSheet, LockBadge, SegmentedControl, Toggle } from '../../components/ui';
import { cn } from '../../lib/utils';
import { isLocked, requirePremium, usePremium } from '../../services/entitlements';
import { cssFont, FONT_PAIRS } from './fonts';
import { textPreset, type TemplateContext } from './templates';
import type { TextLayer, TextPreset } from './types';

export const SWATCHES = ['#ffffff', '#111111', '#ff8a2a', '#d62976', '#962fbf', '#4f5bd5', '#22c55e', '#facc15', '#5b4636', '#efe6d8'];

interface Props {
  layer?: TextLayer;
  onClose: () => void;
  onChange: (patch: Partial<TextLayer>) => void;
  ctx: TemplateContext;
}

const PRESETS: { id: TextPreset; label: string }[] = [
  { id: 'location', label: '📍 Location' },
  { id: 'date', label: '📅 Date stamp' },
  { id: 'title', label: 'Title' },
  { id: 'caption', label: 'Caption' },
];

export function TextSheet({ layer, onClose, onChange, ctx }: Props) {
  const premium = usePremium();
  return (
    <BottomSheet open={!!layer} onClose={onClose} title="Text">
      {layer && (
        <div className="space-y-4 pt-1">
          <textarea
            value={layer.text}
            onChange={(e) => onChange({ text: e.target.value })}
            rows={2}
            aria-label="Text"
            className="field resize-none text-[17px]"
          />

          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1" role="group" aria-label="Text presets">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  const preset: Partial<TextLayer> = { ...textPreset(p.id, ctx) };
                  delete preset.type;
                  onChange(preset);
                }}
                className="glass h-11 shrink-0 rounded-full px-4 text-[14px] font-semibold"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div>
            <p className="text-2 mb-2 text-[13px] font-medium">Font</p>
            <div className="grid grid-cols-3 gap-2">
              {FONT_PAIRS.map((f) => {
                const locked = isLocked(f, premium);
                return (
                  <button
                    key={f.id}
                    onClick={() => requirePremium(f, `The ${f.name} font is a Premium font.`) && onChange({ pairId: f.id })}
                    aria-pressed={layer.pairId === f.id}
                    aria-label={`${f.name}${locked ? ' (Premium)' : ''}`}
                    className={cn(
                      'relative flex min-h-[56px] flex-col items-center justify-center rounded-2xl px-1 py-2',
                      layer.pairId === f.id ? 'bg-ig-pink/15 ring-2 ring-ig-pink' : 'bg-black/[0.04] dark:bg-white/[0.06]',
                    )}
                  >
                    <span className="text-[20px] leading-none" style={{ font: cssFont(f.title, 20) }}>
                      Aa
                    </span>
                    <span className="mt-1 text-[11px] font-medium">{f.name}</span>
                    {locked && <LockBadge className="absolute right-1 top-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <SegmentedControl
              label="Text role"
              value={layer.role}
              onChange={(role) => onChange({ role })}
              options={[
                { value: 'title', label: 'Title' },
                { value: 'body', label: 'Caption' },
              ]}
            />
            <SegmentedControl
              label="Alignment"
              value={layer.align}
              onChange={(align) => onChange({ align })}
              options={[
                { value: 'left', label: 'Left' },
                { value: 'center', label: 'Center' },
                { value: 'right', label: 'Right' },
              ]}
            />
          </div>

          <label className="block">
            <span className="text-2 text-[13px] font-medium">Size</span>
            <input
              type="range"
              min={16}
              max={320}
              value={Math.round(layer.size)}
              onChange={(e) => onChange({ size: Number(e.target.value) })}
              className="mt-1 h-11 w-full accent-[#d62976]"
            />
          </label>

          <div>
            <p className="text-2 mb-2 text-[13px] font-medium">Color</p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Text color">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  role="radio"
                  aria-checked={layer.color === c}
                  aria-label={c}
                  onClick={() => onChange({ color: c })}
                  className={cn('h-11 w-11 rounded-full border border-black/15', layer.color === c && 'ring-2 ring-ig-pink ring-offset-2 ring-offset-[var(--sheet-bg)]')}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div className="glass divide-y rounded-2xl [&>*]:hairline">
            {(
              [
                ['shadow', 'Shadow'],
                ['outline', 'Outline'],
              ] as const
            ).map(([k, label]) => (
              <div key={k} className="flex min-h-[52px] items-center justify-between px-4">
                <span className="text-[15px]">{label}</span>
                <Toggle checked={!!layer[k]} onChange={(v) => onChange({ [k]: v })} label={label} />
              </div>
            ))}
            <div className="flex min-h-[52px] items-center justify-between px-4">
              <span className="text-[15px]">Label background</span>
              <Toggle checked={!!layer.bg} onChange={(v) => onChange({ bg: v ? 'rgba(255,255,255,0.92)' : null })} label="Label background" />
            </div>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
