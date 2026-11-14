import type { FormatId } from './types';

/** Width of one panel (and of every single-image format), in px. */
export const PANEL_W = 1080;
export const MIN_PANELS = 2;
export const MAX_PANELS = 10;

export interface FormatPreset {
  id: FormatId;
  label: string;
  hint: string;
  /** Height in px; width is PANEL_W per panel. */
  height: number;
}

export const FORMATS: Record<FormatId, FormatPreset> = {
  story: { id: 'story', label: 'IG Story', hint: '9:16 · 1080×1920', height: 1920 },
  post: { id: 'post', label: 'Post 4:5', hint: 'IG & FB · 1080×1350', height: 1350 },
  square: { id: 'square', label: 'Square', hint: '1:1 · 1080×1080', height: 1080 },
  carousel: { id: 'carousel', label: 'Seamless carousel', hint: '2–10 slides · 1080×1350 each', height: 1350 },
};

export const FORMAT_ORDER: FormatId[] = ['story', 'post', 'square', 'carousel'];

export const canvasSize = (format: FormatId, panels: number) => ({
  width: PANEL_W * (format === 'carousel' ? panels : 1),
  height: FORMATS[format].height,
});

export const panelCount = (format: FormatId, panels: number) => (format === 'carousel' ? panels : 1);
