import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomSheet, GlassButton } from '../../components/ui';
import { cn } from '../../lib/utils';
import { requirePremium } from '../../services/entitlements';
import { useStore } from '../../store/useStore';
import { FORMAT_ORDER, FORMATS } from './formats';
import { saveProject } from './projects';
import { TemplateGrid } from './TemplateGrid';
import { createProject, type CollageTemplate } from './templates';
import type { FormatId } from './types';

const RATIO: Record<FormatId, string> = { story: 'aspect-[9/16] w-7', post: 'aspect-[4/5] w-9', square: 'aspect-square w-10', carousel: 'aspect-[12/5] w-16' };

interface Props {
  open: boolean;
  onClose: () => void;
  tripId?: string;
}

/** Two steps: pick a format, then a template. Creates the project and opens the editor. */
export function NewCollageSheet({ open, onClose, tripId }: Props) {
  const navigate = useNavigate();
  const trip = useStore((s) => s.lists.find((l) => l.id === tripId));
  const [format, setFormat] = useState<FormatId | null>(null);

  useEffect(() => {
    if (open) setFormat(null);
  }, [open]);

  const create = async (t: CollageTemplate) => {
    if (!format || !requirePremium(t, `"${t.name}" is a Premium template.`)) return;
    const p = createProject(format, t, { destination: trip?.destinationName.replace(/\s*\(copy\)$/, ''), tripId });
    await saveProject(p);
    onClose();
    navigate(`/collage/${p.id}`);
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={format ? 'Pick a layout' : 'New collage'}
      footer={
        format ? (
          <GlassButton size="lg" full onClick={() => setFormat(null)}>
            Back to formats
          </GlassButton>
        ) : undefined
      }
    >
      {!format ? (
        <div className="grid grid-cols-2 gap-3 pt-1">
          {FORMAT_ORDER.map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={cn('glass flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl p-3 text-center', f === 'carousel' && 'col-span-2')}
            >
              <span className={cn('block rounded-md bg-ig', RATIO[f])} aria-hidden />
              <span className="text-[15px] font-semibold">{FORMATS[f].label}</span>
              <span className="text-2 text-[12px]">{FORMATS[f].hint}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="pt-1">
          <TemplateGrid format={format} onPick={create} />
        </div>
      )}
    </BottomSheet>
  );
}
