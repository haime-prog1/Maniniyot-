/**
 * Collage photos, stored only on this device (IndexedDB). Nothing is uploaded.
 *
 * - The original file is kept, and export renders from it.
 * - The editor uses a downscaled preview (≤ 1600 px) so it stays smooth with big photos.
 * - Images are decoded through <img>, which applies EXIF orientation, so
 *   sideways phone photos come out upright in both preview and export.
 */
import { createStore, del, get, keys, set } from 'idb-keyval';
import { uid } from '../../lib/utils';
import { getMedia } from '../../services/mediaStore';
import { videoFrame } from '../stories/loadFrames';
import { filterKey, renderFiltered } from './filters';
import { coverGeometry, frameRect, photoArea, type SourceProvider } from './render';
import type { CollageProject, FilterSettings, Frame } from './types';

const store = createStore('shotlist-collage-assets', 'assets');

export interface AssetRecord {
  blob: Blob;
  w: number;
  h: number;
  createdAt: number;
}

const PREVIEW_MAX = 1600;
const EXPORT_MAX = 4096;

/** Decodes a blob with EXIF orientation applied. */
export function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('This image format is not supported.'));
    };
    img.src = url;
  });
}

const toBlob = (c: HTMLCanvasElement, type = 'image/jpeg', q = 0.95) =>
  new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), type, q));

/** Saves a photo (or a still from a video) and returns its asset id. */
export async function addAsset(blob: Blob): Promise<string> {
  let image = blob;
  if (blob.type.startsWith('video')) {
    const f = await videoFrame(blob);
    if (!f) throw new Error('Could not read this video.');
    image = await toBlob(f.src as HTMLCanvasElement);
  }
  const img = await loadImage(image);
  const id = uid();
  await set(id, { blob: image, w: img.naturalWidth, h: img.naturalHeight, createdAt: Date.now() } satisfies AssetRecord, store);
  return id;
}

/** Copies a captured shot (photo or video still) into the collage library. */
export async function addAssetFromShot(listId: string, shotId: string): Promise<string | null> {
  const rec = await getMedia(listId, shotId);
  return rec ? addAsset(rec.blob) : null;
}

export const getAsset = (id: string) => get<AssetRecord>(id, store);
export const allAssetIds = async () => (await keys(store)) as string[];
export async function deleteAssets(ids: string[]) {
  await Promise.all(ids.map((id) => del(id, store)));
  ids.forEach((id) => {
    previews.delete(id);
    ready.delete(id);
    blurred.delete(id);
  });
}

// ---------- Previews (in memory) ----------

const previews = new Map<string, Promise<Frame | null>>();
const ready = new Map<string, Frame>();
const filtered = new Map<string, Frame>();
const blurred = new Map<string, Frame>();

function downscale(src: CanvasImageSource, w: number, h: number, max: number): Frame {
  const k = Math.min(1, max / Math.max(w, h));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w * k));
  c.height = Math.max(1, Math.round(h * k));
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, 0, 0, c.width, c.height);
  return { src: c, w: c.width, h: c.height };
}

/** Loads (once) the editor preview of an asset. */
export function loadPreview(id: string): Promise<Frame | null> {
  let p = previews.get(id);
  if (!p) {
    p = (async () => {
      const rec = await getAsset(id);
      if (!rec) return null;
      const img = await loadImage(rec.blob);
      const f = downscale(img, img.naturalWidth, img.naturalHeight, PREVIEW_MAX);
      ready.set(id, f);
      return f;
    })().catch(() => null);
    previews.set(id, p);
  }
  return p;
}

export const getPreview = (id: string) => ready.get(id);

/** Shrinks to ~24 px, then smoothly scales back up: a cheap blur that looks the same everywhere. */
function blurOf(f: Frame): Frame {
  const tiny = downscale(f.src, f.w, f.h, 24);
  const c = document.createElement('canvas');
  const k = 160 / Math.max(tiny.w, tiny.h);
  c.width = Math.round(tiny.w * k);
  c.height = Math.round(tiny.h * k);
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(tiny.src, 0, 0, c.width, c.height);
  return { src: c, w: c.width, h: c.height };
}

/** Image sources for the editor and thumbnails (previews, filtered and cached). */
export const previewProvider: SourceProvider = {
  photo(assetId, filter) {
    const base = ready.get(assetId);
    if (!base) return undefined;
    const key = `${assetId}|${filterKey(filter)}`;
    let f = filtered.get(key);
    if (!f) {
      f = filterKey(filter) === 'none' ? base : renderFiltered(base.src, base.w, base.h, filter);
      filtered.set(key, f);
    }
    return f;
  },
  blur(assetId) {
    const base = ready.get(assetId);
    if (!base) return undefined;
    let f = blurred.get(assetId);
    if (!f) {
      f = blurOf(base);
      blurred.set(assetId, f);
    }
    return f;
  },
};

/** Every asset a project uses. */
export function projectAssetIds(p: CollageProject): string[] {
  const ids = new Set<string>();
  p.layers.forEach((l) => l.type === 'photo' && l.assetId && ids.add(l.assetId));
  if (p.style.background.type === 'blur' && p.style.background.assetId) ids.add(p.style.background.assetId);
  return [...ids];
}

// ---------- Full resolution (export) ----------

/**
 * Prepares full-resolution sources for export. Each photo is decoded from the
 * original, scaled only as far down as its frame needs (never below the size
 * it is shown at), then filtered. Originals are decoded one at a time to keep
 * memory low on phones.
 */
export async function fullResProvider(p: CollageProject, onProgress?: (done: number, total: number) => void): Promise<SourceProvider> {
  const needs = new Map<string, { assetId: string; filter: FilterSettings; scale: number }>();
  for (const l of p.layers) {
    if (l.type !== 'photo' || !l.assetId) continue;
    const rec = await getAsset(l.assetId);
    if (!rec) continue;
    const a = photoArea(l, frameRect(l, p));
    const { s } = coverGeometry(a.w, a.h, rec.w, rec.h, l.crop);
    const key = `${l.assetId}|${filterKey(l.filter)}`;
    const prev = needs.get(key);
    needs.set(key, { assetId: l.assetId, filter: l.filter, scale: Math.max(prev?.scale ?? 0, s) });
  }

  const out = new Map<string, Frame>();
  let done = 0;
  for (const [key, n] of needs) {
    const rec = await getAsset(n.assetId);
    if (rec) {
      const img = await loadImage(rec.blob);
      const k = Math.min(1, n.scale * 1.15, EXPORT_MAX / Math.max(img.naturalWidth, img.naturalHeight));
      out.set(key, renderFiltered(img, img.naturalWidth * k, img.naturalHeight * k, n.filter));
      img.src = '';
    }
    onProgress?.(++done, needs.size);
  }

  await Promise.all(projectAssetIds(p).map(loadPreview));
  return {
    photo: (assetId, filter) => out.get(`${assetId}|${filterKey(filter)}`),
    blur: (assetId) => previewProvider.blur(assetId),
  };
}
