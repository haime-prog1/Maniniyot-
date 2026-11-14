import { BottomSheet, GlassButton } from '../../components/ui';
import type { Layer } from './types';

interface Props {
  layer?: Layer;
  onClose: () => void;
  onChange: (patch: Partial<Layer>) => void;
}

/** Slider alternatives to the pinch, drag and rotate gestures. */
export function AdjustSheet({ layer, onClose, onChange }: Props) {
  return (
    <BottomSheet open={!!layer} onClose={onClose} title="Adjust">
      {layer && (
        <div className="space-y-3 pt-1">
          {layer.type === 'photo' && (
            <>
              <label className="block">
                <span className="text-2 flex justify-between text-[13px] font-medium">
                  Zoom <span>{layer.crop.scale.toFixed(1)}×</span>
                </span>
                <input
                  type="range"
                  min={100}
                  max={500}
                  value={Math.round(layer.crop.scale * 100)}
                  onChange={(e) => onChange({ crop: { ...layer.crop, scale: Number(e.target.value) / 100 } })}
                  className="h-11 w-full accent-[#d62976]"
                />
              </label>
              {(['ox', 'oy'] as const).map((k) => (
                <label key={k} className="block">
                  <span className="text-2 text-[13px] font-medium">{k === 'ox' ? 'Move photo left / right' : 'Move photo up / down'}</span>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    value={Math.round(layer.crop[k] * 100)}
                    onChange={(e) => onChange({ crop: { ...layer.crop, [k]: Number(e.target.value) / 100 } })}
                    className="h-11 w-full accent-[#d62976]"
                  />
                </label>
              ))}
            </>
          )}
          <label className="block">
            <span className="text-2 flex justify-between text-[13px] font-medium">
              Rotation <span>{Math.round(layer.rotation)}°</span>
            </span>
            <input
              type="range"
              min={-180}
              max={180}
              value={Math.round(layer.rotation)}
              onChange={(e) => onChange({ rotation: Number(e.target.value) })}
              className="h-11 w-full accent-[#d62976]"
            />
          </label>
          <GlassButton
            size="md"
            full
            onClick={() => onChange(layer.type === 'photo' ? { rotation: 0, crop: { scale: 1, ox: 0, oy: 0 } } : { rotation: 0 })}
          >
            Reset
          </GlassButton>
          <p className="text-2 text-center text-[12px]">
            {layer.type === 'photo' ? 'Tip: drag inside the frame to pan and pinch to zoom.' : 'Tip: drag to move and pinch to resize and rotate.'}
          </p>
        </div>
      )}
    </BottomSheet>
  );
}
