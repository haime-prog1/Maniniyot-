import { motion } from 'framer-motion';
import { Bookmark, ChevronRight, Heart, MapPin, Plus, Search, Send, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassButton, ProgressRing } from '../../components/ui';
import { DESTINATIONS, gradientCss } from '../../data/destinations';
import { DESTINATION_SHOTS } from '../../data/shots';
import { styleLabel } from '../../data/options';
import { cn, spring } from '../../lib/utils';
import { useActiveList, useStore } from '../../store/useStore';
import { useUI } from '../../store/useUI';
import type { Destination } from '../../types';

const handle = (d: Destination) => d.name.toLowerCase().replace(/\s*\(.*\)/, '').replace(/[^a-z0-9]+/g, '');
const tag = (s: string) => `#${s.replace(/^the /i, '').replace(/[^a-z0-9]+/gi, '')}`;

function Avatar({ d, size = 64, ring = true }: { d: Destination; size?: number; ring?: boolean }) {
  return (
    <span className={cn('block', ring ? 'ig-ring' : '')}>
      <span className={cn('block', ring && 'ig-ring-inner')}>
        <span className="block rounded-full" style={{ width: size, height: size, background: gradientCss(d.gradient) }} />
      </span>
    </span>
  );
}

/** Instagram-story-style circles for destinations. */
function Stories({ onPick }: { onPick: (id?: string) => void }) {
  return (
    <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 py-2" role="list" aria-label="Destinations">
      <button role="listitem" onClick={() => onPick()} className="flex w-[72px] shrink-0 flex-col items-center gap-1" aria-label="Create a new guide">
        <span className="relative">
          <span className="block h-[74px] w-[74px] rounded-full border border-dashed border-current opacity-30" />
          <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--bg)] bg-ig text-white">
            <Plus size={14} strokeWidth={3} />
          </span>
        </span>
        <span className="text-[12px]">New guide</span>
      </button>
      {DESTINATIONS.map((d) => (
        <motion.button
          role="listitem"
          key={d.id}
          whileTap={{ scale: 0.94 }}
          transition={spring}
          onClick={() => onPick(d.id)}
          className="flex w-[72px] shrink-0 flex-col items-center gap-1"
          aria-label={`Create a guide for ${d.name}`}
        >
          <Avatar d={d} size={64} />
          <span className="w-full truncate text-center text-[12px]">{handle(d)}</span>
        </motion.button>
      ))}
    </div>
  );
}

/** A feed post for one destination. */
function DestinationPost({ d, onPick }: { d: Destination; onPick: () => void }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const highlights = DESTINATION_SHOTS.filter((s) => s.destinationSpecific === d.id).length;

  return (
    <article className="border-b pb-4 hairline" aria-label={d.name}>
      <header className="flex items-center gap-3 px-4 py-2.5">
        <Avatar d={d} size={32} />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[14px] font-semibold">{handle(d)}</p>
          <p className="text-2 flex items-center gap-1 text-[12px]">
            <MapPin size={11} /> {d.country}
          </p>
        </div>
        <button onClick={onPick} className="text-[14px] font-semibold text-ig-blue dark:text-[#6b8bff]">
          Plan
        </button>
      </header>

      <motion.button
        onDoubleClick={() => setLiked(true)}
        onClick={onPick}
        whileTap={{ scale: 0.99 }}
        className="relative block aspect-[4/5] w-full overflow-hidden text-left text-white"
        style={{ background: gradientCss(d.gradient) }}
        aria-label={`Create a guide for ${d.name}`}
      >
        <svg aria-hidden viewBox="0 0 100 125" className="absolute inset-0 h-full w-full opacity-30" preserveAspectRatio="xMidYMid slice">
          <circle cx="74" cy="30" r="14" fill="white" />
          <path d="M0 92 Q25 78 50 90 T100 84 V125 H0 Z" fill="white" opacity="0.55" />
          <path d="M0 104 Q30 94 60 104 T100 100 V125 H0 Z" fill="white" opacity="0.8" />
        </svg>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-4 pt-16">
          <p className="text-[28px] font-extrabold leading-none tracking-tight drop-shadow">{d.name}</p>
          <p className="mt-1 text-[14px] font-medium opacity-95 drop-shadow">{d.tagline}</p>
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-black/35 px-2.5 py-1 text-[12px] font-semibold backdrop-blur">
          {highlights ? `${highlights} signature shots` : 'Shot guide'}
        </span>
      </motion.button>

      <div className="flex items-center gap-4 px-4 pt-3">
        <motion.button whileTap={{ scale: 0.8 }} onClick={() => setLiked((v) => !v)} aria-pressed={liked} aria-label="Like">
          <Heart size={25} className={liked ? 'fill-[#ff3040] text-[#ff3040]' : ''} />
        </motion.button>
        <button onClick={onPick} aria-label={`Plan a trip to ${d.name}`}>
          <Send size={24} />
        </button>
        <motion.button whileTap={{ scale: 0.8 }} onClick={() => setSaved((v) => !v)} aria-pressed={saved} aria-label="Save" className="ml-auto">
          <Bookmark size={25} className={saved ? 'fill-current' : ''} />
        </motion.button>
      </div>
      <p className="px-4 pt-2 text-[14px] leading-snug">
        <span className="font-semibold">{handle(d)}</span> {d.tagline}.{' '}
        <span className="text-ig-blue dark:text-[#6b8bff]">{d.landmarks.slice(0, 3).map(tag).join(' ')}</span>
      </p>
    </article>
  );
}

export function HomeScreen() {
  const navigate = useNavigate();
  const openCreate = useUI((s) => s.openCreate);
  const active = useActiveList();
  const hasLists = useStore((s) => s.lists.length > 0);
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return DESTINATIONS;
    return DESTINATIONS.filter((d) => [d.name, d.country, ...d.landmarks].some((x) => x.toLowerCase().includes(t)));
  }, [q]);

  const visibleShots = active?.shots.filter((s) => !s.skipped) ?? [];
  const captured = visibleShots.filter((s) => s.captured).length;

  return (
    <div>
      <header className="glass-strong sticky top-0 z-30 !rounded-none !border-x-0 !border-t-0 !shadow-none pt-[env(safe-area-inset-top)]">
        <div className="flex h-12 items-center justify-between px-4">
          <h1 className="text-ig text-[26px] font-extrabold tracking-tight">ShotList</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/trips')} aria-label="My trips">
              <Heart size={25} />
            </button>
            <button onClick={() => openCreate()} aria-label="Create a new guide">
              <Sparkles size={24} />
            </button>
          </div>
        </div>
      </header>

      <Stories onPick={openCreate} />

      <div className="px-4 pb-2 pt-1">
        <label className="flex items-center gap-2 rounded-xl bg-black/[0.06] px-3 dark:bg-white/[0.12]">
          <Search size={17} className="text-2" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search destinations or landmarks"
            aria-label="Search destinations"
            className="h-10 flex-1 bg-transparent text-[15px] outline-none placeholder:opacity-60"
          />
        </label>
      </div>

      {active && !q.trim() && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          transition={spring}
          onClick={() => navigate(`/list/${active.id}`)}
          className="mx-4 mb-3 flex w-[calc(100%-2rem)] items-center gap-3 rounded-2xl border p-3 text-left hairline"
          aria-label={`Continue your trip to ${active.destinationName}`}
        >
          <ProgressRing value={captured} total={visibleShots.length} size={54} stroke={5} label="Shots captured">
            <span className="text-[12px] font-bold">
              {captured}/{visibleShots.length}
            </span>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <p className="text-2 text-[12px] font-medium">Continue your trip</p>
            <p className="truncate text-[16px] font-semibold">{active.destinationName}</p>
            <p className="text-2 text-[13px]">
              {styleLabel(active.style)} · {active.targetLength}s reel
            </p>
          </div>
          <ChevronRight className="text-2" />
        </motion.button>
      )}

      {!hasLists && !q.trim() && (
        <div className="mx-4 mb-3 rounded-2xl bg-ig p-[1.5px]">
          <div className="rounded-[15px] bg-[var(--bg)] p-4">
            <p className="text-[16px] font-semibold">Plan the shots. Capture the trip. ✨</p>
            <p className="text-2 mt-1 text-[14px]">Tap a destination to get every shot for a cinematic Reel, from boarding the plane to the last sunset.</p>
            <GlassButton variant="primary" size="md" full className="mt-3" onClick={() => openCreate()}>
              Create a guide
            </GlassButton>
          </div>
        </div>
      )}

      <section aria-label={q.trim() ? 'Search results' : 'Destination feed'}>
        {results.map((d) => (
          <DestinationPost key={d.id} d={d} onPick={() => openCreate(d.id)} />
        ))}
        {q.trim() && (
          <button onClick={() => openCreate(`custom:${q.trim()}`)} className="flex w-full items-center gap-3 px-4 py-4 text-left">
            <span className="ig-ring">
              <span className="ig-ring-inner flex">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10">
                  <MapPin size={18} />
                </span>
              </span>
            </span>
            <span className="flex-1 text-[15px]">
              Create a guide for "<b>{q.trim()}</b>"
            </span>
            <ChevronRight size={18} className="text-2" />
          </button>
        )}
      </section>
    </div>
  );
}
