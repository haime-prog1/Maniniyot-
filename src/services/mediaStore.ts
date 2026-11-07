/**
 * On-device media storage.
 *
 * Captured clips and photos are stored ONLY in this browser's IndexedDB.
 * Nothing here talks to the network. Media is never uploaded or sent to analytics
 * or any third party.
 */
import { clear, createStore, del, entries, get, keys, set } from 'idb-keyval';

const store = createStore('shotlist-media', 'media');

export interface MediaRecord {
  blob: Blob;
  type: string;
  name?: string;
  size: number;
  createdAt: number;
}

const key = (listId: string, shotId: string) => `${listId}::${shotId}`;

export async function saveMedia(listId: string, shotId: string, blob: Blob, name?: string) {
  const rec: MediaRecord = {
    blob,
    type: blob.type || 'application/octet-stream',
    name,
    size: blob.size,
    createdAt: Date.now(),
  };
  await set(key(listId, shotId), rec, store);
}

export const getMedia = (listId: string, shotId: string) =>
  get<MediaRecord>(key(listId, shotId), store);

export const deleteMedia = (listId: string, shotId: string) => del(key(listId, shotId), store);

export async function deleteListMedia(listId: string) {
  const all = (await keys(store)) as string[];
  await Promise.all(all.filter((k) => k.startsWith(`${listId}::`)).map((k) => del(k, store)));
}

export const deleteAllMedia = () => clear(store);

export async function mediaUsage(): Promise<{ count: number; bytes: number }> {
  const all = await entries<string, MediaRecord>(store);
  return { count: all.length, bytes: all.reduce((n, [, r]) => n + (r?.size ?? 0), 0) };
}

/** Ask the browser not to evict our data under storage pressure (helps on iOS). */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

export function extensionFor(type: string) {
  if (type.includes('quicktime')) return 'mov';
  if (type.includes('mp4')) return 'mp4';
  if (type.includes('webm')) return 'webm';
  if (type.includes('png')) return 'png';
  if (type.includes('heic')) return 'heic';
  return type.startsWith('video') ? 'mp4' : 'jpg';
}

/** Share a clip via the iOS share sheet (Save Video, CapCut, AirDrop…). Downloads it if sharing isn't supported. */
export async function shareMedia(rec: MediaRecord, baseName: string) {
  const name = `${baseName.replace(/[^\w-]+/g, '-').toLowerCase()}.${extensionFor(rec.type)}`;
  const file = new File([rec.blob], name, { type: rec.type });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: baseName });
    } catch (e) {
      if ((e as DOMException).name !== 'AbortError') throw e;
    }
    return;
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function cameraPermissionState(): Promise<'granted' | 'denied' | 'prompt'> {
  try {
    const r = await navigator.permissions?.query({ name: 'camera' as PermissionName });
    return (r?.state as 'granted' | 'denied' | 'prompt') ?? 'prompt';
  } catch {
    return 'prompt';
  }
}
