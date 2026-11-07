import { Moon, Sun, Sunrise, Sunset, Waves, LocateFixed } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { GlassButton } from '../../components/ui';
import { getDestination } from '../../data/destinations';
import { countdownLabel, formatRange, formatTime, sunTimes, todayISO } from '../../services/sun';
import { useStore } from '../../store/useStore';
import type { ListShot, ShotList } from '../../types';

interface Slot {
  key: string;
  label: string;
  range: string;
  icon: typeof Sun;
  tone: string;
  shots: ListShot[];
  why: string;
}

/**
 * Light Planner: works out golden hour, blue hour and harsh midday light for the
 * trip date and location, offline, and schedules each shot into the best window.
 */
export function LightPlanCard({ list, onOpenShot }: { list: ShotList; onOpenShot: (id: string) => void }) {
  const setTripInfo = useStore((s) => s.setTripInfo);
  const dest = getDestination(list.destinationId);
  const coords = list.coords ?? (dest?.lat !== undefined && dest.lng !== undefined ? { lat: dest.lat, lng: dest.lng } : undefined);
  const tz = list.coords ? undefined : dest?.timeZone;
  const date = list.tripDate ?? todayISO(tz);
  const [now, setNow] = useState(Date.now());
  const [locError, setLocError] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const times = useMemo(() => (coords ? sunTimes(date, coords.lat, coords.lng) : undefined), [coords, date]);

  const slots: Slot[] = useMemo(() => {
    if (!times) return [];
    const shots = list.shots.filter((s) => !s.skipped && !s.captured);
    const text = (s: ListShot) => `${s.title} ${s.description} ${s.tip}`;
    const used = new Set<string>();
    const take = (pred: (s: ListShot) => boolean) =>
      shots.filter((s) => !used.has(s.id) && pred(s)).map((s) => (used.add(s.id), s));
    return [
      {
        key: 'am',
        label: 'Morning golden hour',
        range: formatRange(times.morningBlueEnd, times.morningGoldenEnd, tz),
        icon: Sunrise,
        tone: 'from-ig-yellow to-ig-orange',
        why: 'Soft light and empty spots',
        shots: take((s) => /\b(morning|early|sunrise|dewy)\b|no crowds/i.test(text(s))),
      },
      {
        key: 'mid',
        label: 'Bright midday',
        range: formatRange(new Date(times.noon.getTime() - 2 * 3600000), new Date(times.noon.getTime() + 2 * 3600000), tz),
        icon: Waves,
        tone: 'from-sky-400 to-ig-blue',
        why: 'The sun is high, so water looks clearest',
        shots: take((s) => s.phase === 'activities' && /water|snorkel|lagoon|island hopping|kayak|underwater|swim/i.test(text(s))),
      },
      {
        key: 'pm',
        label: 'Evening golden hour',
        range: formatRange(times.eveningGoldenStart, times.eveningBlueStart, tz),
        icon: Sunset,
        tone: 'from-ig-orange to-ig-pink',
        why: 'Warm glow, silhouettes and flares',
        shots: take((s) => s.phase === 'golden'),
      },
      {
        key: 'blue',
        label: 'Blue hour',
        range: formatRange(times.eveningBlueStart, times.dusk, tz),
        icon: Moon,
        tone: 'from-ig-purple to-ig-blue',
        why: 'Deep blue sky and lights just switching on',
        shots: take((s) => s.phase === 'night').slice(0, 3),
      },
    ];
  }, [times, list.shots, tz]);

  // "Next good light" countdown, shown only when the trip date is today.
  const next = useMemo(() => {
    if (!times || date !== todayISO(tz)) return null;
    const windows: [string, Date, Date][] = [
      ['Morning golden hour', times.morningBlueEnd, times.morningGoldenEnd],
      ['Evening golden hour', times.eveningGoldenStart, times.eveningBlueStart],
      ['Blue hour', times.eveningBlueStart, times.dusk],
    ];
    for (const [label, a, b] of windows) {
      if (now >= a.getTime() && now < b.getTime()) return `${label} is happening now. Go shoot! ✨`;
      if (now < a.getTime()) return `${label} starts in ${countdownLabel(a.getTime() - now)}`;
    }
    return null;
  }, [times, date, now, tz]);

  const useMyLocation = () => {
    setLocError(null);
    if (!navigator.geolocation) {
      setLocError('Location is not available on this device.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setTripInfo(list.id, { coords: { lat: p.coords.latitude, lng: p.coords.longitude } }),
      () => setLocError('Location access was denied. Turn it on in Settings → Safari → Location.'),
      { maximumAge: 600000, timeout: 15000 },
    );
  };

  return (
    <section aria-labelledby="light-plan" className="mx-4 mt-4 overflow-hidden rounded-[22px] border hairline">
      <div className="bg-gradient-to-br from-ig-yellow via-ig-orange to-ig-pink px-4 pb-3 pt-3.5 text-white">
        <div className="flex items-center justify-between gap-2">
          <h2 id="light-plan" className="flex items-center gap-1.5 text-[16px] font-bold">
            <Sun size={18} /> Light Planner
          </h2>
          <label className="text-[13px] font-medium">
            <span className="sr-only">Trip date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => e.target.value && setTripInfo(list.id, { tripDate: e.target.value })}
              className="rounded-full bg-white/25 px-2.5 py-1 text-[13px] font-semibold text-white outline-none [color-scheme:dark]"
            />
          </label>
        </div>
        {times && (
          <p className="mt-1 text-[13px] opacity-95">
            Sunrise {formatTime(times.sunrise, tz)} · Sunset {formatTime(times.sunset, tz)}
            {tz ? ` · ${list.destinationName} time` : ''}
          </p>
        )}
        {next && <p className="mt-2 rounded-full bg-black/20 px-3 py-1 text-[13px] font-semibold">{next}</p>}
      </div>

      {!coords ? (
        <div className="space-y-2 p-4 text-[14px]">
          <p>Light Planner needs a location to work out golden hour for "{list.destinationName}".</p>
          <GlassButton size="sm" icon={<LocateFixed size={15} />} onClick={useMyLocation}>
            Use my current location
          </GlassButton>
          {locError && <p className="text-[13px] text-red-600 dark:text-red-400">{locError}</p>}
        </div>
      ) : (
        <ul className="divide-y hairline">
          {slots.map((s) => (
            <li key={s.key} className="flex gap-3 px-4 py-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${s.tone} text-white`}>
                <s.icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-baseline justify-between gap-x-2 text-[14px] font-semibold">
                  {s.label} <span className="text-2 text-[13px] font-medium">{s.range}</span>
                </p>
                <p className="text-2 text-[12px]">{s.why}</p>
                {s.shots.length > 0 ? (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {s.shots.map((shot) => (
                      <button key={shot.id} onClick={() => onOpenShot(shot.id)} className="chip text-left">
                        {shot.title}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-2 mt-1 text-[12px] italic">No shots left for this window 🎉</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
