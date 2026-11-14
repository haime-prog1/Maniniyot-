import { makeZip } from '../../lib/zip';
import { fullResProvider } from './assets';
import { panelCount } from './formats';
import { renderCollage } from './render';
import type { CollageProject } from './types';

export type ExportType = 'jpg' | 'png';

export interface ExportOptions {
  type: ExportType;
  watermark: boolean;
}

/**
 * Renders the collage at full resolution, entirely on the device. Carousels
 * become one image per slide (slide-01.jpg, slide-02.jpg…). Each slide is drawn
 * from the same continuous canvas, so photos crossing a border line up exactly.
 */
export async function exportCollage(p: CollageProject, opts: ExportOptions, onProgress?: (msg: string) => void): Promise<File[]> {
  onProgress?.('Preparing full-size photos…');
  const sources = await fullResProvider(p, (done, total) => onProgress?.(`Preparing photos ${done} of ${total}…`));
  const n = panelCount(p.format, p.panels);
  const pw = p.width / n;
  const mime = opts.type === 'png' ? 'image/png' : 'image/jpeg';
  const files: File[] = [];
  for (let i = 0; i < n; i++) {
    onProgress?.(n > 1 ? `Rendering slide ${i + 1} of ${n}…` : 'Rendering…');
    const c = document.createElement('canvas');
    c.width = pw;
    c.height = p.height;
    const ctx = c.getContext('2d')!;
    ctx.translate(-i * pw, 0);
    renderCollage(ctx, p, sources, { watermark: opts.watermark });
    const blob = await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('Export failed'))), mime, 0.92));
    const name = n > 1 ? `slide-${String(i + 1).padStart(2, '0')}.${opts.type}` : `collage.${opts.type}`;
    files.push(new File([blob], name, { type: mime }));
    c.width = c.height = 0;
  }
  return files;
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export type DeliveryResult = 'shared' | 'downloaded' | 'cancelled';

/**
 * Phones: the share sheet (Save Images, Instagram, Facebook…).
 * Desktop: one file downloads directly, several download as a ZIP.
 */
export async function deliverFiles(files: File[], zipName = 'collage-slides.zip'): Promise<DeliveryResult> {
  const touch = window.matchMedia('(pointer: coarse)').matches;
  if (touch && navigator.canShare?.({ files })) {
    try {
      await navigator.share({ files });
      return 'shared';
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return 'cancelled';
    }
  }
  if (files.length === 1) download(files[0], files[0].name);
  else download(await makeZip(files.map((f) => ({ name: f.name, blob: f }))), zipName);
  return 'downloaded';
}
