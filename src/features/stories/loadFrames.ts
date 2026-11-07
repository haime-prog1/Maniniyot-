import { getMedia } from '../../services/mediaStore';
import type { ShotList } from '../../types';
import type { Frame } from './templates';

/** Grab a still from a video blob, on-device. */
async function videoFrame(blob: Blob): Promise<Frame | null> {
  const url = URL.createObjectURL(blob);
  try {
    const v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.src = url;
    await new Promise<void>((res, rej) => {
      v.onloadeddata = () => res();
      v.onerror = () => rej(new Error('video'));
      setTimeout(() => rej(new Error('timeout')), 6000);
    });
    v.currentTime = Math.min(0.6, (v.duration || 1) / 2);
    await new Promise<void>((res) => {
      v.onseeked = () => res();
      setTimeout(res, 1500);
    });
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d')?.drawImage(v, 0, 0);
    return c.width ? { src: c, w: c.width, h: c.height } : null;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function blobToFrame(blob: Blob): Promise<Frame | null> {
  if (blob.type.startsWith('video')) return videoFrame(blob);
  try {
    const bmp = await createImageBitmap(blob);
    return { src: bmp, w: bmp.width, h: bmp.height };
  } catch {
    return null;
  }
}

/** Load stills for the trip's captured shots, in shot order. */
export async function loadTripFrames(list: ShotList, max = 6): Promise<Frame[]> {
  const shots = list.shots.filter((s) => s.hasMedia && !s.skipped).sort((a, b) => a.order - b.order);
  const frames: Frame[] = [];
  for (const s of shots) {
    if (frames.length >= max) break;
    const rec = await getMedia(list.id, s.id);
    if (!rec) continue;
    const f = await blobToFrame(rec.blob);
    if (f) frames.push(f);
  }
  return frames;
}
