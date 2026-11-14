import type { TextRole } from './types';

export interface FontFace {
  family: string;
  weight: number;
  italic?: boolean;
  uppercase?: boolean;
  /** Extra space between letters, as a fraction of the font size. */
  tracking?: number;
}

export interface FontPair {
  id: string;
  name: string;
  premium?: boolean;
  title: FontFace;
  body: FontFace;
}

const SYSTEM = '-apple-system, "SF Pro Display", Inter, system-ui, "Segoe UI", Roboto, sans-serif';

/**
 * Curated font pairs. They use fonts built into iPhones (with fallbacks), so
 * nothing is downloaded and everything works offline.
 */
export const FONT_PAIRS: FontPair[] = [
  { id: 'modern', name: 'Modern', title: { family: SYSTEM, weight: 800 }, body: { family: SYSTEM, weight: 500 } },
  {
    id: 'editorial',
    name: 'Editorial',
    title: { family: 'Georgia, "Times New Roman", serif', weight: 700, italic: true },
    body: { family: SYSTEM, weight: 500 },
  },
  {
    id: 'typewriter',
    name: 'Typewriter',
    title: { family: '"American Typewriter", "Courier New", Courier, monospace', weight: 700 },
    body: { family: '"Courier New", Courier, monospace', weight: 600, tracking: 0.04 },
  },
  {
    id: 'magazine',
    name: 'Magazine',
    premium: true,
    title: { family: 'Didot, "Bodoni 72", "Bodoni MT", Georgia, serif', weight: 700, uppercase: true, tracking: 0.06 },
    body: { family: '"Avenir Next", Avenir, ' + SYSTEM, weight: 500, uppercase: true, tracking: 0.12 },
  },
  {
    id: 'handwritten',
    name: 'Handwritten',
    premium: true,
    title: { family: '"Snell Roundhand", "Brush Script MT", "Segoe Script", cursive', weight: 700 },
    body: { family: 'Noteworthy, "Marker Felt", "Comic Sans MS", cursive', weight: 400 },
  },
  {
    id: 'poster',
    name: 'Poster',
    premium: true,
    title: { family: 'Futura, "Avenir Next Condensed", "Arial Narrow", Impact, sans-serif', weight: 800, uppercase: true, tracking: 0.02 },
    body: { family: 'Futura, "Avenir Next", ' + SYSTEM, weight: 500 },
  },
];

export const getPair = (id: string) => FONT_PAIRS.find((p) => p.id === id) ?? FONT_PAIRS[0];
export const getFace = (pairId: string, role: TextRole) => getPair(pairId)[role];

export function cssFont(face: FontFace, size: number) {
  return `${face.italic ? 'italic ' : ''}${face.weight} ${Math.round(size)}px ${face.family}`;
}
