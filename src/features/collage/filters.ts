import type { FilterId, FilterSettings, Frame } from './types';

type Op = [fn: 'brightness' | 'contrast' | 'saturate' | 'grayscale' | 'sepia', value: number];

export interface FilterPreset {
  id: FilterId;
  name: string;
  premium?: boolean;
  ops: Op[];
}

export const FILTERS: FilterPreset[] = [
  { id: 'none', name: 'Original', ops: [] },
  { id: 'warm', name: 'Warm', ops: [['sepia', 0.22], ['saturate', 1.25], ['brightness', 1.03]] },
  { id: 'vivid', name: 'Vivid', ops: [['saturate', 1.45], ['contrast', 1.08]] },
  { id: 'bw', name: 'B&W', ops: [['grayscale', 1], ['contrast', 1.12]] },
  { id: 'film', name: 'Film', premium: true, ops: [['sepia', 0.18], ['contrast', 1.12], ['saturate', 0.85], ['brightness', 1.02]] },
  { id: 'faded', name: 'Faded', premium: true, ops: [['contrast', 0.82], ['brightness', 1.08], ['saturate', 0.78], ['sepia', 0.08]] },
];

export const NO_FILTER: FilterSettings = { preset: 'none', brightness: 1, contrast: 1, saturation: 1 };

export const getFilter = (id: FilterId) => FILTERS.find((f) => f.id === id) ?? FILTERS[0];

export function filterOps(f: FilterSettings): Op[] {
  const ops = [...getFilter(f.preset).ops];
  if (f.brightness !== 1) ops.push(['brightness', f.brightness]);
  if (f.contrast !== 1) ops.push(['contrast', f.contrast]);
  if (f.saturation !== 1) ops.push(['saturate', f.saturation]);
  return ops;
}

/** CSS filter string (also used for canvas `ctx.filter`). */
export const cssFilter = (ops: Op[]) => (ops.length ? ops.map(([fn, v]) => `${fn}(${v})`).join(' ') : 'none');

export const filterKey = (f: FilterSettings) => cssFilter(filterOps(f));

let ctxFilterSupport: boolean | undefined;
/** Older iOS Safari ignores `ctx.filter`, so test it once. */
function supportsCtxFilter() {
  if (ctxFilterSupport !== undefined) return ctxFilterSupport;
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx || !('filter' in ctx)) return (ctxFilterSupport = false);
    ctx.fillStyle = '#ff0000';
    ctx.filter = 'grayscale(1)';
    ctx.fillRect(0, 0, 1, 1);
    const [r, g] = ctx.getImageData(0, 0, 1, 1).data;
    ctxFilterSupport = Math.abs(r - g) < 10;
  } catch {
    ctxFilterSupport = false;
  }
  return ctxFilterSupport;
}

type M = number[]; // 3×3 color matrix, row-major

const saturateM = (s: number): M => [
  0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s,
  0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s,
  0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s,
];

const sepiaM = (a: number): M => {
  const k = 1 - a;
  return [
    0.393 + 0.607 * k, 0.769 - 0.769 * k, 0.189 - 0.189 * k,
    0.349 - 0.349 * k, 0.686 + 0.314 * k, 0.168 - 0.168 * k,
    0.272 - 0.272 * k, 0.534 - 0.534 * k, 0.131 + 0.869 * k,
  ];
};

/** The same math as CSS filter functions, done per pixel (fallback for old Safari). */
function applyOpsToPixels(data: Uint8ClampedArray, ops: Op[]) {
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    for (const [fn, v] of ops) {
      if (fn === 'brightness') {
        r *= v;
        g *= v;
        b *= v;
      } else if (fn === 'contrast') {
        r = (r - 127.5) * v + 127.5;
        g = (g - 127.5) * v + 127.5;
        b = (b - 127.5) * v + 127.5;
      } else {
        const m = fn === 'sepia' ? sepiaM(v) : saturateM(fn === 'grayscale' ? 1 - v : v);
        const nr = m[0] * r + m[1] * g + m[2] * b;
        const ng = m[3] * r + m[4] * g + m[5] * b;
        const nb = m[6] * r + m[7] * g + m[8] * b;
        r = nr;
        g = ng;
        b = nb;
      }
    }
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
}

/** Draws `source` at w×h into a new canvas with the filter applied. */
export function renderFiltered(source: CanvasImageSource, w: number, h: number, f: FilterSettings): Frame {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  const ops = filterOps(f);
  const ctx = canvas.getContext('2d', { willReadFrequently: ops.length > 0 && !supportsCtxFilter() })!;
  ctx.imageSmoothingQuality = 'high';
  if (ops.length && supportsCtxFilter()) ctx.filter = cssFilter(ops);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  if (ops.length && !supportsCtxFilter()) {
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyOpsToPixels(img.data, ops);
    ctx.putImageData(img, 0, 0);
  }
  return { src: canvas, w: canvas.width, h: canvas.height };
}
