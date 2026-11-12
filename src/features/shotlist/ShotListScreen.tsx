import { Reorder } from 'framer-motion';
import { Eye, Film, Mic, Plus, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GlassButton, GlassCard, LargeTitle, ProgressRing } from '../../components/ui';
import { getDestination, gradientCss } from '../../data/destinations';
import { PHASES, styleLabel, tripLabel } from '../../data/options';
import { useStore } from '../../store/useStore';
import { CaptureSheet } from '../capture/CaptureSheet';
import { LightPlanCard } from '../light/LightPlanCard';
import { AddShotSheet } from './AddShotSheet';
import { ShotCard } from './ShotCard';
import { ShotDetailSheet } from './ShotDetailSheet';

export function ShotListScreen() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const list = useStore((s) => s.lists.find((l) => l.id === id));
  const setActive = useStore((s) => s.setActive);
  const reorder = useStore((s) => s.reorderPhase);
  const unskip = useStore((s) => s.setSkipped);
  const [detailId, setDetailId] = useState<string>();
  const [captureId, setCaptureId] = useState<string>();
  const [addOpen, setAddOpen] = useState(false);
  const [showSkipped, setShowSkipped] = useState(false);

  useEffect(() => {
    if (list) setActive(list.id);
  }, [list, setActive]);

  const visible = useMemo(() => (list ? list.shots.filter((s) => !s.skipped).sort((a, b) => a.order - b.order) : []), [list]);
  const skipped = list?.shots.filter((s) => s.skipped) ?? [];

  if (!list) {
    return (
      <div className="px-5 pt-[calc(env(safe-area-inset-top)+60px)] text-center">
        <h1 className="text-[28px] font-bold">Trip not found</h1>
        <p className="text-2 mt-2">This shot list may have been deleted.</p>
        <GlassButton variant="primary" className="mt-6" onClick={() => navigate('/')}>
          Back to Discover
        </GlassButton>
      </div>
    );
  }

  const captured = visible.filter((s) => s.captured).length;
  const numberOf = (shotId: string) => visible.findIndex((s) => s.id === shotId) + 1;

  return (
    <div>
      <LargeTitle
        title={list.destinationName}
        subtitle={`${styleLabel(list.style)} · ${tripLabel(list.tripType)} · ${list.targetLength}s reel`}
        onBack={() => navigate(-1)}
        right={
          <button onClick={() => setAddOpen(true)} aria-label="Add custom shot" className="p-1 text-ig-pink">
            <Plus />
          </button>
        }
      />

      {/* Profile-style header: a progress ring around the destination "avatar", then stats. */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-5">
          <ProgressRing value={captured} total={visible.length} size={88} stroke={4} label="Shots captured">
            <span
              className="block h-[72px] w-[72px] rounded-full"
              style={{ background: gradientCss(getDestination(list.destinationId)?.gradient ?? ['#fa7e1e', '#d62976', '#962fbf']) }}
            />
          </ProgressRing>
          <dl className="grid flex-1 grid-cols-3 text-center">
            {[
              [visible.length, 'shots'],
              [captured, 'captured'],
              [`${list.targetLength}s`, 'reel'],
            ].map(([v, l]) => (
              <div key={l}>
                <dd className="text-[19px] font-bold leading-tight">{v}</dd>
                <dt className="text-[13px]">{l}</dt>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-3 text-[14px] font-semibold">
          {captured} / {visible.length} shots captured
        </p>
        <p className="text-2 text-[13px]">Swipe left to skip · Drag ⋮⋮ to reorder</p>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/15" aria-hidden>
          <div className="h-full rounded-full bg-ig transition-all" style={{ width: `${visible.length ? (captured / visible.length) * 100 : 0}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <GlassButton size="sm" className="!px-2" icon={<Mic size={15} />} onClick={() => navigate(`/script/${list.id}`)}>
            Script
          </GlassButton>
          <GlassButton size="sm" className="!px-2" icon={<Sparkles size={15} />} onClick={() => navigate(`/stories/${list.id}`)}>
            Story
          </GlassButton>
          <GlassButton size="sm" className="!px-2" icon={<Film size={15} />} onClick={() => navigate('/reel')}>
            Reel
          </GlassButton>
        </div>
      </div>

      <LightPlanCard list={list} onOpenShot={setDetailId} />

      {PHASES.map((p) => {
        const shots = visible.filter((s) => s.phase === p.id);
        if (!shots.length) return null;
        return (
          <section key={p.id} aria-labelledby={`phase-${p.id}`} className="mt-5">
            <h2
              id={`phase-${p.id}`}
              className="sticky top-[calc(env(safe-area-inset-top)+52px)] z-20 mx-4 mb-2 inline-block rounded-full border bg-[var(--bg)] px-4 py-1.5 shadow-sm hairline text-[13px] font-semibold uppercase tracking-wide"
            >
              {p.label} <span className="text-2">· {shots.filter((s) => s.captured).length}/{shots.length}</span>
            </h2>
            <Reorder.Group
              axis="y"
              values={shots.map((s) => s.id)}
              onReorder={(ids) => reorder(list.id, p.id, ids as string[])}
              className="space-y-3 px-4"
            >
              {shots.map((s) => (
                <ShotCard
                  key={s.id}
                  listId={list.id}
                  shot={s}
                  number={numberOf(s.id)}
                  onOpen={() => setDetailId(s.id)}
                  onCapture={() => setCaptureId(s.id)}
                />
              ))}
            </Reorder.Group>
          </section>
        );
      })}

      <div className="mt-6 space-y-3 px-4">
        <GlassButton size="lg" full icon={<Plus size={20} />} onClick={() => setAddOpen(true)}>
          Add custom shot
        </GlassButton>
        {skipped.length > 0 && (
          <GlassCard className="p-4">
            <button className="flex w-full items-center justify-between text-[15px] font-semibold" onClick={() => setShowSkipped((v) => !v)} aria-expanded={showSkipped}>
              Skipped shots ({skipped.length}) <Eye size={18} className="text-2" />
            </button>
            {showSkipped && (
              <ul className="mt-3 space-y-2">
                {skipped.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 text-[14px]">
                    <span className="truncate">{s.title}</span>
                    <GlassButton size="sm" onClick={() => unskip(list.id, s.id, false)}>
                      Restore
                    </GlassButton>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        )}
        <GlassButton variant="primary" size="lg" full onClick={() => navigate('/reel')}>
          Open Reel Builder
        </GlassButton>
      </div>

      <ShotDetailSheet listId={list.id} shot={list.shots.find((s) => s.id === detailId)} onClose={() => setDetailId(undefined)} />
      <CaptureSheet listId={list.id} shot={list.shots.find((s) => s.id === captureId)} onClose={() => setCaptureId(undefined)} />
      <AddShotSheet listId={list.id} open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
