import { motion } from 'framer-motion';
import { ChevronRight, MapPin, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassButton, GlassCard, LargeTitle, ProgressRing } from '../../components/ui';
import { DESTINATIONS, gradientCss } from '../../data/destinations';
import { styleLabel } from '../../data/options';
import { spring } from '../../lib/utils';
import { useActiveList } from '../../store/useStore';
import { useUI } from '../../store/useUI';
import type { Destination } from '../../types';

function DestinationCard({ d, onPick, wide }: { d: Destination; onPick: () => void; wide?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={spring}
      onClick={onPick}
      aria-label={`Create a guide for ${d.name}`}
      className={`relative shrink-0 snap-start overflow-hidden rounded-[26px] text-left text-white shadow-lg ${wide ? 'h-32 w-full' : 'h-52 w-40'}`}
      style={{ background: gradientCss(d.gradient) }}
    >
      <svg aria-hidden viewBox="0 0 160 208" className="absolute inset-0 h-full w-full opacity-35" preserveAspectRatio="xMidYMid slice">
        <circle cx="120" cy="50" r="26" fill="white" />
        <path d="M0 150 Q40 120 80 145 T160 135 V208 H0 Z" fill="white" opacity="0.5" />
        <path d="M0 170 Q50 150 100 168 T160 160 V208 H0 Z" fill="white" opacity="0.7" />
      </svg>
      <div className="glass absolute inset-x-2 bottom-2 rounded-[18px] !border-white/30 !bg-black/20 p-2.5">
        <p className="text-[16px] font-bold leading-tight">{d.name}</p>
        <p className="line-clamp-1 text-[11px] opacity-90">{d.tagline ?? d.country}</p>
      </div>
    </motion.button>
  );
}

export function HomeScreen() {
  const navigate = useNavigate();
  const openCreate = useUI((s) => s.openCreate);
  const active = useActiveList();
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return DESTINATIONS.filter((d) => [d.name, d.country, ...d.landmarks].some((x) => x.toLowerCase().includes(t)));
  }, [q]);

  const visibleShots = active?.shots.filter((s) => !s.skipped) ?? [];
  const captured = visibleShots.filter((s) => s.captured).length;

  return (
    <div>
      <LargeTitle title="ShotList" subtitle="Plan the shots. Capture the trip." />

      <div className="px-4 pt-4">
        <label className="glass flex items-center gap-2 rounded-2xl px-4">
          <Search size={18} className="text-2" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search destinations or landmarks"
            aria-label="Search destinations"
            className="h-12 flex-1 bg-transparent text-[16px] outline-none placeholder:opacity-60"
          />
        </label>
      </div>

      {q.trim() ? (
        <section className="space-y-3 px-4 pt-4" aria-label="Search results">
          {results.map((d) => (
            <DestinationCard key={d.id} d={d} wide onPick={() => openCreate(d.id)} />
          ))}
          <GlassCard interactive className="flex items-center gap-3 p-4" onClick={() => openCreate(`custom:${q.trim()}`)}>
            <MapPin className="text-orange-500" />
            <span className="flex-1 text-[15px]">
              Create a guide for "<b>{q.trim()}</b>"
            </span>
            <ChevronRight size={18} className="text-2" />
          </GlassCard>
        </section>
      ) : (
        <>
          <section className="pt-6" aria-labelledby="featured">
            <h2 id="featured" className="px-5 pb-3 text-[22px] font-bold">
              Featured destinations
            </h2>
            <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scroll-pl-4">
              {DESTINATIONS.map((d) => (
                <DestinationCard key={d.id} d={d} onPick={() => openCreate(d.id)} />
              ))}
            </div>
          </section>

          <section className="px-4 pt-6" aria-labelledby="continue">
            <h2 id="continue" className="px-1 pb-3 text-[22px] font-bold">
              {active ? 'Continue your trip' : 'Start your first trip'}
            </h2>
            {active ? (
              <GlassCard interactive className="flex items-center gap-4 p-4" onClick={() => navigate(`/list/${active.id}`)}>
                <ProgressRing value={captured} total={visibleShots.length} size={64} label="Shots captured">
                  <span className="text-[13px] font-bold">
                    {captured}/{visibleShots.length}
                  </span>
                </ProgressRing>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[18px] font-semibold">{active.destinationName}</p>
                  <p className="text-2 text-[14px]">
                    {styleLabel(active.style)} · {active.targetLength}s reel
                  </p>
                </div>
                <ChevronRight className="text-2" />
              </GlassCard>
            ) : (
              <GlassCard className="p-5">
                <Sparkles className="text-orange-500" />
                <p className="mt-2 text-[17px] font-semibold">Your cinematic reel starts with a plan</p>
                <p className="text-2 mt-1 text-[14px]">
                  Pick a destination and a style, and ShotList gives you every shot to film, from boarding the plane to the last sunset.
                </p>
                <GlassButton variant="primary" size="lg" full className="mt-4" onClick={() => openCreate()}>
                  Create a guide
                </GlassButton>
              </GlassCard>
            )}
          </section>
        </>
      )}
    </div>
  );
}
