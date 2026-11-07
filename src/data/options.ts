import type { Phase, Style, TargetLength, TripType } from '../types';

export const PHASES: { id: Phase; label: string }[] = [
  { id: 'departure', label: 'Departure' },
  { id: 'transit', label: 'In Transit' },
  { id: 'arrival', label: 'Arrival' },
  { id: 'accommodation', label: 'Accommodation' },
  { id: 'activities', label: 'Activities' },
  { id: 'food', label: 'Food' },
  { id: 'golden', label: 'Golden Hour / Sunset' },
  { id: 'night', label: 'Night' },
  { id: 'home', label: 'Going Home' },
];

export const PHASE_ORDER: Phase[] = PHASES.map((p) => p.id);
export const phaseLabel = (p: Phase) => PHASES.find((x) => x.id === p)?.label ?? p;

export const STYLES: { value: Style; label: string }[] = [
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'vlog', label: 'Vlog' },
  { value: 'aesthetic', label: 'Aesthetic' },
  { value: 'funny', label: 'Funny' },
  { value: 'couple', label: 'Couple' },
  { value: 'barkada', label: 'Barkada' },
];

export const TRIP_TYPES: { value: TripType; label: string; hint: string }[] = [
  { value: 'flight', label: 'Flight', hint: 'Airport, plane, arrival sign' },
  { value: 'roadtrip', label: 'Road trip', hint: 'Car, highway, pit stops' },
  { value: 'ferry', label: 'Ferry', hint: 'Port, boat, sea spray' },
  { value: 'staycation', label: 'Staycation', hint: 'Hotel or local getaway' },
];

export const TARGET_LENGTHS: TargetLength[] = [15, 30, 60, 90];

export const styleLabel = (s: Style) => STYLES.find((x) => x.value === s)?.label ?? s;
export const tripLabel = (t: TripType) => TRIP_TYPES.find((x) => x.value === t)?.label ?? t;
