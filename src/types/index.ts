export type Style = 'cinematic' | 'vlog' | 'aesthetic' | 'funny' | 'couple' | 'barkada';
export type TripType = 'flight' | 'roadtrip' | 'ferry' | 'staycation';
export type TargetLength = 15 | 30 | 60 | 90;

export type Phase =
  | 'departure'
  | 'transit'
  | 'arrival'
  | 'accommodation'
  | 'activities'
  | 'food'
  | 'golden'
  | 'night'
  | 'home';

export type Angle = 'POV' | 'Low angle' | 'Wide' | 'Medium' | 'Close-up' | 'Overhead';
export type Movement = 'Static' | 'Pan' | 'Tilt' | 'Walk-forward' | 'Orbit' | 'Slow-mo' | 'Hyperlapse';

export interface Destination {
  id: string;
  name: string;
  country: string;
  airportName?: string;
  portName?: string;
  landmarks: string[];
  lat?: number;
  lng?: number;
  /** IANA time zone, used to show sun times in local time. */
  timeZone?: string;
  /** Two to three hex colours used for the card art. */
  gradient: string[];
  tagline?: string;
}

export interface Shot {
  id: string;
  title: string;
  description: string;
  phase: Phase;
  /** [min, max] clip length in seconds. */
  durationSec: [number, number];
  angle: Angle;
  movement: Movement;
  tip: string;
  transition?: string;
  styles: Style[];
  tripTypes: TripType[];
  /** Set when the shot needs an action camera (waterproof, wide, mountable). */
  gear?: 'action';
  /** Destination id when the shot only applies to one place. */
  destinationSpecific?: string;
}

export interface ListShot extends Shot {
  captured: boolean;
  notes?: string;
  order: number;
  skipped?: boolean;
  custom?: boolean;
  /** True when a clip or photo is stored on-device in IndexedDB. */
  hasMedia?: boolean;
  /** Bumped each time the media is replaced, so thumbnails refresh. */
  mediaRev?: number;
}

export interface ShotList {
  id: string;
  destinationId: string;
  destinationName: string;
  style: Style;
  tripType: TripType;
  targetLength: TargetLength;
  shots: ListShot[];
  createdAt: number;
  /** Trip date (YYYY-MM-DD), used by the Light Planner and countdown stories. */
  tripDate?: string;
  /** Coordinates for custom destinations, from "Use my location". */
  coords?: { lat: number; lng: number };
}

export type ThemePref = 'system' | 'light' | 'dark';

/** The camera the user films with. It changes settings advice, import options and bonus shots. */
export type CameraPref = 'phone' | 'acepro2';
