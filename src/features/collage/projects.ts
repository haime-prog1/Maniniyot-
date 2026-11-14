/** Saved collage projects, stored on this device (IndexedDB). */
import { createStore, del, get, set, values } from 'idb-keyval';
import { uid } from '../../lib/utils';
import { allAssetIds, deleteAssets, previewProvider, projectAssetIds, loadPreview } from './assets';
import { renderCollage } from './render';
import type { CollageProject } from './types';

const store = createStore('shotlist-collage-projects', 'projects');

export async function listProjects(): Promise<CollageProject[]> {
  const all = await values<CollageProject>(store);
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export const getProject = (id: string) => get<CollageProject>(id, store);
export const saveProject = (p: CollageProject) => set(p.id, p, store);

/** Deletes assets no saved project uses any more. */
async function cleanupAssets() {
  const used = new Set((await listProjects()).flatMap(projectAssetIds));
  const orphans = (await allAssetIds()).filter((id) => !used.has(id));
  if (orphans.length) await deleteAssets(orphans);
}

export async function deleteProject(id: string) {
  await del(id, store);
  await cleanupAssets();
}

export async function duplicateProject(id: string) {
  const p = await getProject(id);
  if (!p) return;
  const now = Date.now();
  const copy: CollageProject = { ...p, id: uid(), name: `${p.name} (copy)`, createdAt: now, updatedAt: now };
  await saveProject(copy);
  return copy;
}

/** Small JPEG preview for the My Collages list. */
export async function makeThumbnail(p: CollageProject, width = 360): Promise<string> {
  await Promise.all(projectAssetIds(p).map(loadPreview));
  const k = width / p.width;
  const c = document.createElement('canvas');
  c.width = Math.round(p.width * k);
  c.height = Math.round(p.height * k);
  const ctx = c.getContext('2d')!;
  ctx.scale(k, k);
  renderCollage(ctx, p, previewProvider);
  return c.toDataURL('image/jpeg', 0.72);
}
