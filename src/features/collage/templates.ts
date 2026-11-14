import { uid } from '../../lib/utils';
import { NO_FILTER } from './filters';
import { canvasSize, PANEL_W } from './formats';
import { measureTextHeight } from './render';
import raw from './templates.json';
import type { CollageProject, CollageStyle, FormatId, Layer, Matte, PhotoLayer, TextLayer, TextPreset, TextRole } from './types';

/**
 * Templates live in templates.json. Units:
 * - x and w are in panels (1 = one 1080 px panel), so carousel frames can
 *   cross panel borders (x: 0.6, w: 1 spans slides 1 and 2).
 * - y and h are fractions of the canvas height (0…1).
 * - Text `size` is in px.
 * See the README ("Collage Studio") for the full schema.
 */
export interface TemplateFrame {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
  inset?: boolean;
  matte?: Matte;
}

export interface TemplateText {
  preset: TextPreset;
  text?: string;
  x: number;
  y: number;
  w: number;
  size: number;
  align?: TextLayer['align'];
  pairId?: string;
  role?: TextRole;
  color?: string;
  shadow?: boolean;
  outline?: boolean;
  bg?: string | null;
}

export interface CollageTemplate {
  id: string;
  name: string;
  formats: FormatId[];
  /** Carousel templates: how many slides they're designed for. */
  panels?: number;
  premium?: boolean;
  style: Partial<CollageStyle>;
  frames: TemplateFrame[];
  texts?: TemplateText[];
}

export const TEMPLATES = raw as unknown as CollageTemplate[];

export const getTemplate = (id: string) => TEMPLATES.find((t) => t.id === id);
export const templatesFor = (format: FormatId) => TEMPLATES.filter((t) => t.formats.includes(format));

export const DEFAULT_STYLE: CollageStyle = {
  gap: 16,
  radius: 0,
  borderWidth: 0,
  borderColor: '#ffffff',
  background: { type: 'solid', color: '#ffffff' },
  decor: 'none',
};

export interface TemplateContext {
  destination?: string;
  date?: Date;
}

/** "11 14 '26", like an old film camera date stamp. */
export function dateStamp(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getMonth() + 1)} ${p(d.getDate())} '${String(d.getFullYear()).slice(2)}`;
}

/** Ready-made text styles. `textPreset` gives a complete text layer for each. */
export function textPreset(preset: TextPreset, ctx: TemplateContext = {}): Omit<TextLayer, 'id' | 'x' | 'y' | 'w' | 'h' | 'rotation'> {
  switch (preset) {
    case 'location':
      return {
        type: 'text',
        text: `📍 ${ctx.destination || 'Location'}`,
        pairId: 'modern',
        role: 'body',
        size: 40,
        color: '#111111',
        align: 'left',
        shadow: false,
        outline: false,
        bg: 'rgba(255,255,255,0.92)',
      };
    case 'date':
      return {
        type: 'text',
        text: dateStamp(ctx.date),
        pairId: 'typewriter',
        role: 'body',
        size: 54,
        color: '#ff8a2a',
        align: 'right',
        shadow: false,
        outline: false,
        bg: null,
        glow: true,
      };
    case 'title':
      return {
        type: 'text',
        text: ctx.destination || 'Title',
        pairId: 'modern',
        role: 'title',
        size: 110,
        color: '#ffffff',
        align: 'center',
        shadow: true,
        outline: false,
        bg: null,
      };
    case 'caption':
      return {
        type: 'text',
        text: 'Add a caption',
        pairId: 'modern',
        role: 'body',
        size: 44,
        color: '#ffffff',
        align: 'center',
        shadow: true,
        outline: false,
        bg: null,
      };
  }
}

export function makeTextLayer(preset: TextPreset, rect: { x: number; y: number; w: number }, ctx: TemplateContext, overrides: Partial<TextLayer> = {}): TextLayer {
  const layer: TextLayer = { id: uid(), x: rect.x, y: rect.y, w: rect.w, h: 0, rotation: 0, ...textPreset(preset, ctx), ...overrides };
  return { ...layer, h: measureTextHeight(layer) };
}

export function makePhotoLayer(rect: { x: number; y: number; w: number; h: number }, extra: Partial<PhotoLayer> = {}): PhotoLayer {
  return {
    id: uid(),
    type: 'photo',
    ...rect,
    rotation: 0,
    crop: { scale: 1, ox: 0, oy: 0 },
    filter: { ...NO_FILTER },
    inset: false,
    ...extra,
  };
}

/** Turns a template into layers for a canvas of the given size. */
export function buildTemplateLayers(t: CollageTemplate, height: number, ctx: TemplateContext): Layer[] {
  const photos: Layer[] = t.frames.map((f) =>
    makePhotoLayer(
      { x: f.x * PANEL_W, y: f.y * height, w: f.w * PANEL_W, h: f.h * height },
      { rotation: f.rotation ?? 0, inset: f.inset ?? true, matte: f.matte, fromTemplate: true },
    ),
  );
  const texts: Layer[] = (t.texts ?? []).map((tx) =>
    makeTextLayer(
      tx.preset,
      { x: tx.x * PANEL_W, y: tx.y * height, w: tx.w * PANEL_W },
      ctx,
      {
        size: tx.size,
        fromTemplate: true,
        ...(tx.text !== undefined && { text: tx.text }),
        ...(tx.align && { align: tx.align }),
        ...(tx.pairId && { pairId: tx.pairId }),
        ...(tx.role && { role: tx.role }),
        ...(tx.color && { color: tx.color }),
        ...(tx.shadow !== undefined && { shadow: tx.shadow }),
        ...(tx.outline !== undefined && { outline: tx.outline }),
        ...(tx.bg !== undefined && { bg: tx.bg }),
      },
    ),
  );
  return [...photos, ...texts];
}

export function createProject(format: FormatId, t: CollageTemplate, ctx: TemplateContext & { tripId?: string } = {}): CollageProject {
  const panels = format === 'carousel' ? Math.max(2, t.panels ?? 3) : 1;
  const { width, height } = canvasSize(format, panels);
  const now = Date.now();
  return {
    id: uid(),
    name: ctx.destination ? `${ctx.destination} collage` : 'Untitled collage',
    format,
    panels,
    width,
    height,
    templateId: t.id,
    style: { ...DEFAULT_STYLE, ...t.style },
    layers: buildTemplateLayers(t, height, ctx),
    tripId: ctx.tripId,
    destination: ctx.destination,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Switches an existing project to another template. Photos already placed
 * move into the new frames in order. Layers the user added stay as they are.
 */
export function applyTemplate(p: CollageProject, t: CollageTemplate): CollageProject {
  const panels = p.format === 'carousel' ? Math.max(p.panels, t.panels ?? p.panels) : 1;
  const { width, height } = canvasSize(p.format, panels);
  const assets = p.layers.filter((l): l is PhotoLayer => l.type === 'photo' && l.fromTemplate === true && !!l.assetId);
  const fresh = buildTemplateLayers(t, height, { destination: p.destination });
  let i = 0;
  const filled = fresh.map((l) => {
    if (l.type !== 'photo' || i >= assets.length) return l;
    const src = assets[i++];
    return { ...l, assetId: src.assetId, filter: src.filter };
  });
  const leftovers = assets.slice(i).map((a) => ({ ...a, fromTemplate: false }));
  const userLayers = p.layers.filter((l) => !l.fromTemplate);
  return {
    ...p,
    panels,
    width,
    height,
    templateId: t.id,
    style: { ...DEFAULT_STYLE, ...t.style },
    layers: [...filled, ...leftovers, ...userLayers],
  };
}
