/** Pure edits on a collage project. Each returns a new project. */
import { uid } from '../../lib/utils';
import { canvasSize, MAX_PANELS, MIN_PANELS, PANEL_W } from './formats';
import { measureTextHeight } from './render';
import { makePhotoLayer, makeTextLayer, type TemplateContext } from './templates';
import type { CollageProject, FilterSettings, Layer, TextLayer, TextPreset } from './types';

export const patchLayer = (p: CollageProject, id: string, patch: Partial<Layer>): CollageProject => ({
  ...p,
  layers: p.layers.map((l) => {
    if (l.id !== id) return l;
    const next = { ...l, ...patch } as Layer;
    return next.type === 'text' ? { ...next, h: measureTextHeight(next) } : next;
  }),
});

export const removeLayer = (p: CollageProject, id: string): CollageProject => ({ ...p, layers: p.layers.filter((l) => l.id !== id) });

export function moveLayer(p: CollageProject, id: string, dir: 1 | -1): CollageProject {
  const i = p.layers.findIndex((l) => l.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= p.layers.length) return p;
  const layers = [...p.layers];
  [layers[i], layers[j]] = [layers[j], layers[i]];
  return { ...p, layers };
}

export function duplicateLayer(p: CollageProject, id: string): { project: CollageProject; id?: string } {
  const l = p.layers.find((x) => x.id === id);
  if (!l) return { project: p };
  const copy = { ...l, id: uid(), x: l.x + 40, y: l.y + 40, fromTemplate: false } as Layer;
  return { project: { ...p, layers: [...p.layers, copy] }, id: copy.id };
}

/** Center of a panel, for placing new layers where the user is looking. */
const panelCenter = (p: CollageProject, panel: number) => ({
  x: Math.min(panel, Math.max(0, p.width / PANEL_W - 1)) * PANEL_W + PANEL_W / 2,
  y: p.height / 2,
});

export function addText(p: CollageProject, preset: TextPreset, panel: number, ctx: TemplateContext): { project: CollageProject; id: string } {
  const c = panelCenter(p, panel);
  const w = PANEL_W * 0.8;
  const layer: TextLayer = makeTextLayer(preset, { x: c.x - w / 2, y: c.y, w }, ctx);
  const placed = { ...layer, y: c.y - layer.h / 2 };
  return { project: { ...p, layers: [...p.layers, placed] }, id: placed.id };
}

/** Adds a free photo (not part of the grid), sized to the image's aspect ratio. */
export function addPhoto(p: CollageProject, assetId: string, panel: number, aspect: number, offset = 0): { project: CollageProject; id: string } {
  const c = panelCenter(p, panel);
  const w = PANEL_W * 0.6;
  const h = Math.min(p.height * 0.6, w / Math.max(0.2, aspect));
  const layer = makePhotoLayer(
    { x: c.x - w / 2 + offset, y: c.y - h / 2 + offset, w, h },
    { assetId, matte: { color: '#ffffff', pad: 22, bottom: 80 } },
  );
  return { project: { ...p, layers: [...p.layers, layer] }, id: layer.id };
}

/** Fills empty frames in order. Returns the asset ids that didn't fit. */
export function fillEmptyFrames(p: CollageProject, assetIds: string[]): { project: CollageProject; rest: string[] } {
  const queue = [...assetIds];
  const layers = p.layers.map((l) => (l.type === 'photo' && !l.assetId && queue.length ? { ...l, assetId: queue.shift() } : l));
  return { project: { ...p, layers }, rest: queue };
}

export function setFilterAll(p: CollageProject, filter: FilterSettings): CollageProject {
  return { ...p, layers: p.layers.map((l) => (l.type === 'photo' ? { ...l, filter: { ...filter } } : l)) };
}

export function setPanels(p: CollageProject, panels: number): CollageProject {
  const n = Math.max(MIN_PANELS, Math.min(MAX_PANELS, panels));
  const { width, height } = canvasSize(p.format, n);
  return { ...p, panels: n, width, height };
}
