import { AnimatePresence } from 'framer-motion';
import { Camera, Lock, RefreshCcw, Share, Trash2, Video } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { GlassButton, buttonClass } from '../../components/ui';
import { cn } from '../../lib/utils';
import {
  cameraPermissionState,
  deleteMedia,
  requestPersistentStorage,
  saveMedia,
  shareMedia,
} from '../../services/mediaStore';
import { useStore } from '../../store/useStore';
import type { ListShot } from '../../types';
import { CameraView } from './CameraView';
import { MediaThumb } from './MediaThumb';
import { PermissionSheet } from './PermissionSheet';
import { useShotMedia } from './useShotMedia';

interface Props {
  listId: string;
  shot: ListShot;
  onSaved?: () => void;
}

/** Capture options plus a preview, share, replace and delete for one shot. */
export function CapturePanel({ listId, shot, onSaved }: Props) {
  const setHasMedia = useStore((s) => s.setHasMedia);
  const { url, record } = useShotMedia(listId, shot.id, shot.hasMedia, shot.mediaRev);
  const fileRef = useRef<HTMLInputElement>(null);
  const [camera, setCamera] = useState(false);
  const [perm, setPerm] = useState<'explain' | 'denied' | null>(null);
  const [replacing, setReplacing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (blob: Blob, name?: string) => {
    setBusy(true);
    setError(null);
    try {
      await saveMedia(listId, shot.id, blob, name);
      await requestPersistentStorage();
      setHasMedia(listId, shot.id, true);
      setReplacing(false);
      onSaved?.();
    } catch {
      setError('Could not save on this device. Storage may be full.');
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (f) await save(f, f.name);
  };

  const startQuick = async () => {
    const state = await cameraPermissionState();
    if (state === 'granted') setCamera(true);
    else if (state === 'denied') setPerm('denied');
    else setPerm('explain');
  };

  const onDenied = useCallback(() => {
    setCamera(false);
    setPerm('denied');
  }, []);

  const remove = async () => {
    await deleteMedia(listId, shot.id);
    setHasMedia(listId, shot.id, false);
  };

  const share = async () => {
    if (!record) return;
    try {
      await shareMedia(record, shot.title);
    } catch {
      setError('Sharing failed. Try again.');
    }
  };

  const options = (
    <div className="grid grid-cols-1 gap-2">
      <label className={cn(buttonClass('primary', 'lg', true), 'cursor-pointer', busy && 'pointer-events-none opacity-50')}>
        <Camera size={20} /> Use iPhone Camera
        <input ref={fileRef} type="file" accept="video/*,image/*" capture="environment" className="sr-only" onChange={onFile} />
      </label>
      <p className="text-2 -mt-1 text-center text-[12px]">Recommended: full 4K, stabilisation and slo-mo</p>
      <GlassButton size="lg" full icon={<Video size={20} />} onClick={startQuick} disabled={busy}>
        Quick Capture (in-app)
      </GlassButton>
    </div>
  );

  return (
    <div className="space-y-3">
      {url && record && !replacing ? (
        <div className="space-y-3">
          <MediaThumb url={url} type={record.type} playable label={shot.title} className="mx-auto aspect-[9/16] w-44 rounded-[20px]" />
          <div className="grid grid-cols-3 gap-2">
            <GlassButton size="md" icon={<Share size={16} />} onClick={share} aria-label="Save to Photos or share">
              Share
            </GlassButton>
            <GlassButton size="md" icon={<RefreshCcw size={16} />} onClick={() => setReplacing(true)}>
              Replace
            </GlassButton>
            <GlassButton size="md" variant="danger" icon={<Trash2 size={16} />} onClick={remove}>
              Delete
            </GlassButton>
          </div>
          <p className="text-2 text-center text-[12px]">Share → "Save Video" to back it up to Photos, or send it to CapCut.</p>
        </div>
      ) : (
        <>
          {options}
          {replacing && (
            <GlassButton size="sm" full onClick={() => setReplacing(false)}>
              Keep current clip
            </GlassButton>
          )}
        </>
      )}

      {error && (
        <p role="alert" className="text-center text-[13px] text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <p className="text-2 flex items-center justify-center gap-1.5 text-[12px]">
        <Lock size={12} /> Saved only on this device. Never uploaded.
      </p>

      <AnimatePresence>
        {camera && (
          <CameraView
            shot={shot}
            onClose={() => setCamera(false)}
            onDenied={onDenied}
            onCaptured={async (blob) => {
              setCamera(false);
              await save(blob);
            }}
          />
        )}
      </AnimatePresence>
      <PermissionSheet
        mode={perm}
        onClose={() => setPerm(null)}
        onContinue={() => {
          setPerm(null);
          setCamera(true);
        }}
      />
    </div>
  );
}
