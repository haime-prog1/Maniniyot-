import { Reorder } from 'framer-motion';
import { Eye, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GlassButton, GlassCard, LargeTitle, ProgressRing } from '../../components/ui';
import { PHASES, styleLabel, tripLabel } from '../../data/options';
import { useStore } from '../../store/useStore';
import { CaptureSheet } from '../capture/CaptureSheet';
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
          <button onClick={() => setAddOpen(true)} aria-label="Add custom shot" className="p-1 text-orange-500">
            <Plus />
          </button>
        }
      />

      <div className="px-4 pt-4">
        <GlassCard className="flex items-center gap-4 p-4">
          <ProgressRing value={captured} total={visible.length} size={72} label="Shots captured">
            <span className="text-[15px] font-bold">{visible.length ? Math.round((captured / visible.length) * 100) : 0}%</span>
          </ProgressRing>
          <div className="flex-1">
            <p className="text-[20px] font-bold">
              {captured} / {visible.length} shots captured
            </p>
            <p className="text-2 text-[13px]">Swipe left to skip · Drag ⋮⋮ to reorder</p>
          </div>
        </GlassCard>
      </div>

      {PHASES.map((p) => {
        const shots = visible.filter((s) => s.phase === p.id);
        if (!shots.length) return null;
        return (
          <section key={p.id} aria-labelledby={`phase-${p.id}`} className="mt-5">
            <h2
              id={`phase-${p.id}`}
              className="glass-strong sticky top-[calc(env(safe-area-inset-top)+48px)] z-20 mx-4 mb-2 inline-block rounded-full px-4 py-1.5 text-[13px] font-semibold uppercase tracking-wide"
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
