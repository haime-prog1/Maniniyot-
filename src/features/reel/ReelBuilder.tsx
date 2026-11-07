import { Check, Film, Music } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassButton, GlassCard, LargeTitle } from '../../components/ui';
import { cn } from '../../lib/utils';
import { useActiveList, useStore } from '../../store/useStore';
import type { ListShot } from '../../types';
import { MediaThumb } from '../capture/MediaThumb';
import { useShotMedia } from '../capture/useShotMedia';

const EDIT_TIPS = [
  'Import the clips into CapCut or VN in this order',
  'Add your song first, then tap "Beats" or "Auto beat" to mark the beats',
  'Trim each clip so its cut lands on a beat marker',
  'Use speed ramps (Curve → Montage) on the slow-mo clips',
  'Add the suggested transitions between shots',
  'Colour: lower highlights, add warmth and a little contrast',
  'Add text for the location in the first 2 seconds',
  'Export at 1080×1920, 30 fps, at the highest bitrate',
];

const BEAT = 0.5; // 120 BPM, a common tempo for travel songs

function allocate(shots: ListShot[], target: number) {
  const sumMin = shots.reduce((n, s) => n + s.durationSec[0], 0);
  const sumMax = shots.reduce((n, s) => n + s.durationSec[1], 0);
  let durs: number[];
  if (target <= sumMin) durs = shots.map((s) => (s.durationSec[0] * target) / Math.max(sumMin, 1));
  else if (target >= sumMax) durs = shots.map((s) => s.durationSec[1]);
  else {
    const t = (target - sumMin) / (sumMax - sumMin);
    durs = shots.map((s) => s.durationSec[0] + t * (s.durationSec[1] - s.durationSec[0]));
  }
  // Snap each clip to the beat grid.
  durs = durs.map((d) => Math.max(BEAT, Math.round(d / BEAT) * BEAT));
  return { durs, total: durs.reduce((a, b) => a + b, 0), sumMax };
}

function Clip({ listId, shot, index, start, dur, drop }: { listId: string; shot: ListShot; index: number; start: number; dur: number; drop: boolean }) {
  const { url, record } = useShotMedia(listId, shot.id, shot.hasMedia, shot.mediaRev);
  return (
    <li className="flex gap-3">
      {url && record ? (
        <MediaThumb url={url} type={record.type} playable label={shot.title} className="aspect-[9/16] w-20 shrink-0 rounded-2xl" />
      ) : (
        <div className="glass flex aspect-[9/16] w-20 shrink-0 items-center justify-center rounded-2xl" aria-label="No media attached">
          <Check className="text-green-500" />
        </div>
      )}
      <div className="min-w-0 flex-1 py-1">
        <p className="text-2 text-[12px] font-medium">
          {index + 1} · {start.toFixed(1)}s → {(start + dur).toFixed(1)}s
        </p>
        <p className="text-[15px] font-semibold leading-snug">{shot.title}</p>
        <p className="text-2 mt-0.5 text-[13px]">
          Use {dur.toFixed(1)}s{shot.transition ? ` · ${shot.transition} out` : ''}
        </p>
        <p className={cn('mt-1 text-[12px] font-semibold', drop ? 'text-ig-purple' : 'text-ig-pink')}>
          {drop ? '♫ Beat drop: put your most dynamic shot here' : '♪ Cut on the beat'}
        </p>
      </div>
    </li>
  );
}

export function ReelBuilder() {
  const navigate = useNavigate();
  const lists = useStore((s) => s.lists);
  const active = useActiveList();
  const [listId, setListId] = useState<string | undefined>(active?.id);
  const [checks, setChecks] = useState<boolean[]>(() => EDIT_TIPS.map(() => false));
  const list = lists.find((l) => l.id === listId) ?? active;

  if (!list) {
    return (
      <div>
        <LargeTitle title="Reel Builder" />
        <div className="px-4 pt-6">
          <GlassCard className="p-5 text-center">
            <Film className="mx-auto text-ig-pink" />
            <p className="mt-2 text-[17px] font-semibold">No trips yet</p>
            <p className="text-2 mt-1 text-[14px]">Create a shot guide and capture some shots to build your reel timeline.</p>
            <GlassButton variant="primary" className="mt-4" onClick={() => navigate('/')}>
              Go to Discover
            </GlassButton>
          </GlassCard>
        </div>
      </div>
    );
  }

  const captured = list.shots.filter((s) => s.captured && !s.skipped).sort((a, b) => a.order - b.order);
  const { durs, total, sumMax } = allocate(captured, list.targetLength);
  const starts = durs.map((_, i) => durs.slice(0, i).reduce((a, b) => a + b, 0));
  const dropTime = list.targetLength / 3;
  const dropIndex = starts.length ? starts.reduce((best, s, i) => (Math.abs(s - dropTime) < Math.abs(starts[best] - dropTime) ? i : best), 0) : -1;
  const scale = Math.max(total, list.targetLength);

  return (
    <div>
      <LargeTitle title="Reel Builder" subtitle={`${list.destinationName} · ${list.targetLength}s target`} />
      <div className="space-y-5 px-4 pt-4">
        {lists.length > 1 && (
          <select className="field appearance-none" aria-label="Choose trip" value={list.id} onChange={(e) => setListId(e.target.value)}>
            {lists.map((l) => (
              <option key={l.id} value={l.id}>
                {l.destinationName}
              </option>
            ))}
          </select>
        )}

        <GlassCard className="p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-[17px] font-semibold">Timeline</p>
            <p className={cn('text-[14px] font-semibold', Math.abs(total - list.targetLength) <= 1 ? 'text-green-500' : 'text-ig-pink')}>
              {total.toFixed(1)}s / {list.targetLength}s
            </p>
          </div>
          <div className="relative mt-3 h-10 overflow-hidden rounded-xl bg-black/5 dark:bg-white/10" role="img" aria-label={`Timeline with ${captured.length} clips totalling ${total.toFixed(1)} seconds`}>
            {captured.map((s, i) => (
              <div
                key={s.id}
                className={cn('absolute inset-y-0 border-r-2 border-white/80 dark:border-black/50', i % 2 ? 'bg-ig-orange/80' : 'bg-ig-purple/75')}
                style={{ left: `${(starts[i] / scale) * 100}%`, width: `${(durs[i] / scale) * 100}%` }}
              />
            ))}
            <div className="absolute inset-y-0 w-0.5 bg-black/60 dark:bg-white" style={{ left: `${(list.targetLength / scale) * 100}%` }} />
            {dropIndex >= 0 && (
              <Music size={14} className="absolute top-1 -translate-x-1/2 text-white drop-shadow" style={{ left: `${(starts[dropIndex] / scale) * 100}%` }} />
            )}
          </div>
          <p className="text-2 mt-2 text-[13px]">
            {captured.length === 0
              ? 'Capture shots on your list and they appear here, in order.'
              : sumMax < list.targetLength
                ? `You need about ${(list.targetLength - sumMax).toFixed(0)}s more footage. Capture a few more shots.`
                : total > list.targetLength + 1
                  ? 'Trim the clips slightly to hit your target length.'
                  : 'Cuts are snapped to a 120 BPM beat grid (every 0.5s).'}
          </p>
        </GlassCard>

        {captured.length > 0 && (
          <ol className="space-y-3" aria-label="Clips in timeline order">
            {captured.map((s, i) => (
              <Clip key={s.id} listId={list.id} shot={s} index={i} start={starts[i]} dur={durs[i]} drop={i === dropIndex} />
            ))}
          </ol>
        )}

        <GlassCard className="p-4">
          <p className="mb-2 text-[17px] font-semibold">Editing checklist (CapCut / VN)</p>
          <ul className="space-y-1">
            {EDIT_TIPS.map((t, i) => (
              <li key={t}>
                <button
                  role="checkbox"
                  aria-checked={checks[i]}
                  onClick={() => setChecks((c) => c.map((v, j) => (j === i ? !v : v)))}
                  className="flex w-full items-start gap-3 py-1.5 text-left text-[14px]"
                >
                  <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2', checks[i] ? 'border-green-500 bg-green-500 text-white' : 'border-black/25 dark:border-white/35')}>
                    {checks[i] && <Check size={13} strokeWidth={3} />}
                  </span>
                  <span className={cn(checks[i] && 'text-2 line-through')}>{t}</span>
                </button>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
