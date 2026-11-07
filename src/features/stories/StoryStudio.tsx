import { motion } from 'framer-motion';
import { ImagePlus, Lock, Share } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GlassButton, LargeTitle } from '../../components/ui';
import { getDestination } from '../../data/destinations';
import { cn, spring } from '../../lib/utils';
import { formatRange, sunTimes, todayISO } from '../../services/sun';
import { useStore } from '../../store/useStore';
import { blobToFrame, loadTripFrames } from './loadFrames';
import { renderStory, TEMPLATES, type Frame, type TemplateId } from './templates';

const DAY = 86400000;

/** Make Instagram / Facebook Story images from a trip, entirely on-device. */
export function StoryStudio() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const list = useStore((s) => s.lists.find((l) => l.id === id));
  const setTripInfo = useStore((s) => s.setTripInfo);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [template, setTemplate] = useState<TemplateId>('myday');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('Plan the shots, live the moment ✨');
  const [tripFrames, setTripFrames] = useState<Frame[]>([]);
  const [extraFrames, setExtraFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const dest = list ? getDestination(list.destinationId) : undefined;

  useEffect(() => {
    if (list && !title) setTitle(`Day 1 in ${list.destinationName}`);
  }, [list, title]);

  useEffect(() => {
    if (!list) return;
    let cancelled = false;
    setLoading(true);
    loadTripFrames(list).then((f) => {
      if (!cancelled) {
        setTripFrames(f);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // Reload only when media for this trip changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list?.id, list?.shots.map((s) => `${s.id}:${s.mediaRev ?? 0}`).join()]);

  const data = useMemo(() => {
    if (!list) return null;
    const tz = list.coords ? undefined : dest?.timeZone;
    const date = list.tripDate ?? todayISO(tz);
    const [y, m, d] = date.split('-').map(Number);
    const dateLabel = new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const today = todayISO();
    const countdownDays = list.tripDate ? Math.round((Date.parse(list.tripDate) - Date.parse(today)) / DAY) : null;
    const coords = list.coords ?? (dest?.lat !== undefined && dest.lng !== undefined ? { lat: dest.lat, lng: dest.lng } : undefined);
    const t = coords ? sunTimes(date, coords.lat, coords.lng) : undefined;
    const shots = list.shots.filter((s) => !s.skipped).sort((a, b) => a.order - b.order);
    return {
      title,
      subtitle,
      destination: list.destinationName,
      dateLabel,
      gradient: dest?.gradient ?? ['#fa7e1e', '#d62976', '#962fbf'],
      frames: [...extraFrames, ...tripFrames],
      shots: shots.map((s) => ({ title: s.title, captured: s.captured })),
      captured: shots.filter((s) => s.captured).length,
      total: shots.length,
      countdownDays,
      goldenLabel: t ? formatRange(t.eveningGoldenStart, t.eveningBlueStart, tz) : undefined,
    };
  }, [list, dest, title, subtitle, extraFrames, tripFrames]);

  useEffect(() => {
    if (canvasRef.current && data) renderStory(canvasRef.current, template, data);
  }, [template, data]);

  if (!list || !data) {
    return (
      <div className="px-5 pt-[calc(env(safe-area-inset-top)+60px)] text-center">
        <h1 className="text-[24px] font-bold">Trip not found</h1>
        <GlassButton variant="primary" className="mt-6" onClick={() => navigate('/trips')}>
          Go to My Trips
        </GlassButton>
      </div>
    );
  }

  const addPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    const frames = (await Promise.all(files.map(blobToFrame))).filter((f): f is Frame => !!f);
    setExtraFrames((prev) => [...frames, ...prev].slice(0, 6));
  };

  const share = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setStatus(null);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
    if (!blob) return;
    const file = new File([blob], `shotlist-${template}-story.png`, { type: 'image/png' });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: title });
        return;
      }
    } catch (err) {
      if ((err as DOMException).name === 'AbortError') return;
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus('Saved as an image. Post it from your Photos to your Story.');
  };

  const photoCount = extraFrames.length + tripFrames.length;

  return (
    <div>
      <LargeTitle title="Story Studio" subtitle={`${list.destinationName} · My Day & Story templates`} onBack={() => navigate(-1)} />

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-4" role="radiogroup" aria-label="Story template">
        {TEMPLATES.map((t) => {
          const on = t.id === template;
          return (
            <motion.button
              key={t.id}
              role="radio"
              aria-checked={on}
              whileTap={{ scale: 0.95 }}
              transition={spring}
              onClick={() => setTemplate(t.id)}
              className={cn('shrink-0 rounded-full p-[2px]', on ? 'bg-ig' : 'bg-black/10 dark:bg-white/15')}
            >
              <span className="block rounded-full bg-[var(--bg)] px-4 py-2 text-[14px] font-semibold">
                {t.emoji} {t.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="px-4 pt-4">
        <canvas
          ref={canvasRef}
          className="mx-auto block aspect-[9/16] w-full max-w-[300px] rounded-[22px] shadow-xl"
          role="img"
          aria-label={`Story preview: ${TEMPLATES.find((t) => t.id === template)?.label}`}
        />
        <p className="text-2 mt-2 text-center text-[12px]">
          {loading ? 'Loading your trip photos…' : photoCount ? `Using ${photoCount} photo${photoCount > 1 ? 's' : ''} from this trip` : 'No photos yet, so a gradient is used. Capture shots or add photos.'}
        </p>
      </div>

      <div className="space-y-3 px-4 pt-4">
        <label className="block">
          <span className="text-2 px-1 text-[13px] font-medium">Title</span>
          <input className="field mt-1" value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-2 px-1 text-[13px] font-medium">Caption</span>
          <input className="field mt-1" value={subtitle} maxLength={80} onChange={(e) => setSubtitle(e.target.value)} />
        </label>
        {template === 'countdown' && (
          <label className="block">
            <span className="text-2 px-1 text-[13px] font-medium">Trip date</span>
            <input
              type="date"
              className="field mt-1"
              value={list.tripDate ?? ''}
              onChange={(e) => setTripInfo(list.id, { tripDate: e.target.value || undefined })}
            />
          </label>
        )}

        <label className={cn('glass flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full text-[15px] font-semibold')}>
          <ImagePlus size={18} /> Add photos from your Camera Roll
          <input type="file" accept="image/*" multiple className="sr-only" onChange={addPhotos} />
        </label>
        <GlassButton variant="primary" size="lg" full icon={<Share size={20} />} onClick={share}>
          Save / Share Story
        </GlassButton>
        <p className="text-2 text-center text-[12px]">
          Tap <b>Save Image</b>, then open Instagram or Facebook → <b>Your Story</b> → pick it from your photos.
        </p>
        {status && (
          <p role="status" className="text-center text-[13px] font-medium">
            {status}
          </p>
        )}
        <p className="text-2 flex items-center justify-center gap-1.5 pb-2 text-[12px]">
          <Lock size={12} /> Stories are made on this device. Nothing is uploaded.
        </p>
      </div>
    </div>
  );
}
