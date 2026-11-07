import { DESTINATION_SHOTS, GENERIC_SHOTS } from '../data/shots';
import { PHASE_ORDER } from '../data/options';
import type { Destination, ListShot, Phase, Shot, Style, TargetLength, TripType } from '../types';

export interface GenerateInput {
  destination: Destination;
  style: Style;
  tripType: TripType;
  targetLength: TargetLength;
}

/** Approximate number of shots that fit each reel length. */
const BUDGET: Record<TargetLength, number> = { 15: 10, 30: 16, 60: 24, 90: 32 };

/** The backbone of every travel reel: always included when they match the trip type. */
const KEY_SHOTS = ['g-board', 'g-takeoff', 'g-airport', 'g-trunk', 'g-road', 'g-port', 'g-wake', 'g-checkin', 'g-silhouette', 'g-ending'];

/**
 * Entry point for shot-list generation.
 *
 * To plug in an AI provider later, call your API here (for example, a serverless
 * function that returns `Shot[]` as JSON), validate the response, and pass it through
 * `finalizeShots()`. Fall back to `buildLocalShotList()` if the call fails or there is
 * no network.
 */
export async function generateShotList(input: GenerateInput): Promise<ListShot[]> {
  return buildLocalShotList(input);
}

export function buildLocalShotList({ destination, style, tripType, targetLength }: GenerateInput): ListShot[] {
  const generic = GENERIC_SHOTS.filter((s) => s.styles.includes(style) && s.tripTypes.includes(tripType));
  const specific = DESTINATION_SHOTS.filter(
    (s) => s.destinationSpecific === destination.id && s.tripTypes.includes(tripType),
  );
  const budget = BUDGET[targetLength];
  const chosen = new Set<string>();
  const pool0 = [...generic, ...specific];
  const inPhase = (arr: Shot[], p: Phase) => arr.filter((s) => s.phase === p);

  // 1. Key shots (boarding, airport sign, sunset, ending…).
  for (const id of KEY_SHOTS) if (generic.some((s) => s.id === id)) chosen.add(id);
  // 2. Cover every phase once. Prefer destination shots, and use the closing shot for "home".
  for (const p of PHASE_ORDER) {
    const d = inPhase(specific, p);
    const g = inPhase(generic, p);
    const pick = d[0] ?? (p === 'home' ? g[g.length - 1] : g[0]);
    if (pick && !inPhase(pool0, p).some((s) => chosen.has(s.id))) chosen.add(pick.id);
  }
  // 3. Then add the rest of the destination highlights.
  // Signature spots are the point of a destination guide, so they get a little extra room.
  for (const s of specific) if (chosen.size < budget + 4) chosen.add(s.id);
  // 4. Fill the remaining slots round-robin across phases for balance.
  const queues = PHASE_ORDER.map((p) => inPhase(generic, p).filter((s) => !chosen.has(s.id)));
  while (chosen.size < budget && queues.some((q) => q.length)) {
    for (const q of queues) {
      if (chosen.size >= budget) break;
      const s = q.shift();
      if (s) chosen.add(s.id);
    }
  }

  const pool = [...generic, ...specific];
  const picked = pool
    .filter((s) => chosen.has(s.id))
    .sort(
      (a, b) =>
        PHASE_ORDER.indexOf(a.phase) - PHASE_ORDER.indexOf(b.phase) ||
        Number(!!a.destinationSpecific) - Number(!!b.destinationSpecific) ||
        pool.indexOf(a) - pool.indexOf(b),
    );
  // Keep the "Goodbye" ending last within Going Home.
  const endIdx = picked.findIndex((s) => s.id === 'g-ending');
  if (endIdx >= 0) picked.push(picked.splice(endIdx, 1)[0]);

  return finalizeShots(picked, destination);
}

/** Replace template tokens with destination data, and add list-only fields. */
export function finalizeShots(shots: Shot[], destination: Destination): ListShot[] {
  const landmarks = destination.landmarks.length ? destination.landmarks : [destination.name];
  let li = 0;
  return shots.map((s, i) => {
    const usesLandmark = /\{landmark\}/.test(s.title + s.description);
    const landmark = landmarks[li % landmarks.length];
    if (usesLandmark) li++;
    const fill = (t: string) =>
      t
        .replace(/\{airportName\}/g, destination.airportName ?? `${destination.name} airport`)
        .replace(/\{portName\}/g, destination.portName ?? 'the port')
        .replace(/\{destination\}/g, destination.name)
        .replace(/\{landmark\}/g, landmark);
    return {
      ...s,
      title: fill(s.title),
      description: fill(s.description),
      tip: fill(s.tip),
      captured: false,
      order: i,
    };
  });
}
