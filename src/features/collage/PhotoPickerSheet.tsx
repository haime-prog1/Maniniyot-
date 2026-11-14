import { Check, ImagePlus, Lock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BottomSheet, GlassButton, SegmentedControl, buttonClass } from '../../components/ui';
import { cn } from '../../lib/utils';
import { listMediaKeys } from '../../services/mediaStore';
import { useStore } from '../../store/useStore';
import { MediaThumb } from '../capture/MediaThumb';
import { useShotMedia } from '../capture/useShotMedia';
import { addAsset, addAssetFromShot } from './assets';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Pick one photo (replace) or several (fill frames). */
  multiple: boolean;
  /** Trip to show first. */
  tripId?: string;
  onPicked: (assetIds: string[]) => void;
}

function ShotTile({ listId, shotId, title, selected, onToggle }: { listId: string; shotId: string; title: string; selected: boolean; onToggle: () => void }) {
  const { url, record } = useShotMedia(listId, shotId, true, 0);
  return (
    <button
      onClick={onToggle}
      aria-pressed={selected}
      aria-label={`${title}${selected ? ', selected' : ''}`}
      className={cn('relative aspect-square overflow-hidden rounded-xl bg-black/10 dark:bg-white/10', selected && 'ring-[3px] ring-ig-pink')}
    >
      {url && record && <MediaThumb url={url} type={record.type} label={title} className="h-full w-full" />}
      {selected && (
        <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ig-pink text-white">
          <Check size={14} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

/** Choose photos from captured trip shots, or upload from the Photo Library. */
export function PhotoPickerSheet({ open, onClose, multiple, tripId, onPicked }: Props) {
  const lists = useStore((s) => s.lists);
  const [tab, setTab] = useState<'trips' | 'upload'>('trips');
  const [keys, setKeys] = useState<{ listId: string; shotId: string }[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelected([]);
    setError(null);
    listMediaKeys().then((k) => {
      setKeys(k);
      if (!k.length) setTab('upload');
    });
  }, [open]);

  const groups = useMemo(() => {
    const byList = lists
      .map((l) => ({
        list: l,
        shots: keys.filter((k) => k.listId === l.id).map((k) => ({ ...k, title: l.shots.find((s) => s.id === k.shotId)?.title ?? 'Shot' })),
      }))
      .filter((g) => g.shots.length);
    return byList.sort((a, b) => Number(b.list.id === tripId) - Number(a.list.id === tripId));
  }, [lists, keys, tripId]);

  const toggle = (k: string) =>
    setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : multiple ? [...s, k] : [k]));

  const finish = async (work: () => Promise<string[]>) => {
    setBusy(true);
    setError(null);
    try {
      const ids = await work();
      if (ids.length) {
        onPicked(ids);
        onClose();
      }
    } catch (e) {
      setError((e as Error).message || 'Could not add that photo.');
    } finally {
      setBusy(false);
    }
  };

  const addSelected = () =>
    finish(async () => {
      const ids: string[] = [];
      for (const k of selected) {
        const [listId, shotId] = k.split('::');
        const id = await addAssetFromShot(listId, shotId);
        if (id) ids.push(id);
      }
      return ids;
    });

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length) finish(async () => Promise.all(files.map((f) => addAsset(f))));
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={multiple ? 'Add photos' : 'Choose a photo'}
      footer={
        tab === 'trips' && groups.length > 0 ? (
          <GlassButton variant="primary" size="lg" full disabled={!selected.length || busy} onClick={addSelected}>
            {busy ? 'Adding…' : selected.length ? `Add ${selected.length} photo${selected.length > 1 ? 's' : ''}` : 'Select photos'}
          </GlassButton>
        ) : undefined
      }
    >
      <div className="space-y-4 pt-1">
        <SegmentedControl
          label="Photo source"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'trips', label: 'From my trips' },
            { value: 'upload', label: 'Photo Library' },
          ]}
        />

        {tab === 'trips' ? (
          groups.length ? (
            groups.map((g) => (
              <section key={g.list.id}>
                <h3 className="text-2 mb-2 text-[13px] font-semibold uppercase tracking-wide">{g.list.destinationName}</h3>
                <div className="grid grid-cols-3 gap-1.5">
                  {g.shots.map((s) => {
                    const k = `${s.listId}::${s.shotId}`;
                    return <ShotTile key={k} listId={s.listId} shotId={s.shotId} title={s.title} selected={selected.includes(k)} onToggle={() => toggle(k)} />;
                  })}
                </div>
              </section>
            ))
          ) : (
            <p className="text-2 py-6 text-center text-[14px]">No captured shots yet. Capture shots on a trip, or pick from your Photo Library.</p>
          )
        ) : (
          <div className="space-y-3 py-2">
            <label className={cn(buttonClass('primary', 'lg', true), 'cursor-pointer', busy && 'pointer-events-none opacity-50')}>
              <ImagePlus size={20} /> {busy ? 'Adding…' : multiple ? 'Choose photos' : 'Choose a photo'}
              <input type="file" accept="image/*" multiple={multiple} className="sr-only" onChange={onFiles} />
            </label>
            <p className="text-2 flex items-center justify-center gap-1.5 text-center text-[12px]">
              <Lock size={12} /> Photos stay on this device. Nothing is uploaded.
            </p>
          </div>
        )}

        {error && (
          <p role="alert" className="text-center text-[13px] text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </BottomSheet>
  );
}
