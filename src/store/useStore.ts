import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { PHASE_ORDER } from '../data/options';
import { uid } from '../lib/utils';
import type { CameraPref, ListShot, Phase, ShotList, ThemePref } from '../types';

interface State {
  lists: ShotList[];
  activeListId?: string;
  theme: ThemePref;
  camera: CameraPref;
  setCamera: (c: CameraPref) => void;
  addList: (list: ShotList) => void;
  deleteList: (id: string) => void;
  duplicateList: (id: string) => string | undefined;
  setActive: (id: string) => void;
  toggleCaptured: (listId: string, shotId: string, value?: boolean) => void;
  setNotes: (listId: string, shotId: string, notes: string) => void;
  setSkipped: (listId: string, shotId: string, skipped: boolean) => void;
  reorderPhase: (listId: string, phase: Phase, orderedIds: string[]) => void;
  addCustomShot: (listId: string, shot: Omit<ListShot, 'id' | 'order' | 'captured' | 'custom'>) => void;
  setHasMedia: (listId: string, shotId: string, has: boolean) => void;
  setTripInfo: (listId: string, info: Partial<Pick<ShotList, 'tripDate' | 'coords'>>) => void;
  clearAllMediaFlags: () => void;
  setTheme: (t: ThemePref) => void;
  resetAll: () => void;
}

const sortShots = (shots: ListShot[]) =>
  [...shots]
    .sort((a, b) => PHASE_ORDER.indexOf(a.phase) - PHASE_ORDER.indexOf(b.phase) || a.order - b.order)
    .map((s, i) => ({ ...s, order: i }));

export const useStore = create<State>()(
  persist(
    (set, get) => {
      const updateList = (listId: string, fn: (l: ShotList) => ShotList) =>
        set((s) => ({ lists: s.lists.map((l) => (l.id === listId ? fn(l) : l)) }));
      const updateShot = (listId: string, shotId: string, fn: (s: ListShot) => ListShot) =>
        updateList(listId, (l) => ({ ...l, shots: l.shots.map((s) => (s.id === shotId ? fn(s) : s)) }));

      return {
        lists: [],
        activeListId: undefined,
        theme: 'system',
        camera: 'phone',
        setCamera: (camera) => set({ camera }),
        addList: (list) => set((s) => ({ lists: [list, ...s.lists], activeListId: list.id })),
        deleteList: (id) =>
          set((s) => ({
            lists: s.lists.filter((l) => l.id !== id),
            activeListId: s.activeListId === id ? s.lists.find((l) => l.id !== id)?.id : s.activeListId,
          })),
        duplicateList: (id) => {
          const src = get().lists.find((l) => l.id === id);
          if (!src) return;
          const copy: ShotList = {
            ...src,
            id: uid(),
            createdAt: Date.now(),
            destinationName: `${src.destinationName} (copy)`,
            // Media lives with the original list. The copy starts fresh.
            shots: src.shots.map((s) => ({ ...s, captured: false, hasMedia: false, mediaRev: 0 })),
          };
          set((s) => ({ lists: [copy, ...s.lists] }));
          return copy.id;
        },
        setActive: (id) => set({ activeListId: id }),
        toggleCaptured: (listId, shotId, value) =>
          updateShot(listId, shotId, (s) => ({ ...s, captured: value ?? !s.captured })),
        setNotes: (listId, shotId, notes) => updateShot(listId, shotId, (s) => ({ ...s, notes })),
        setSkipped: (listId, shotId, skipped) => updateShot(listId, shotId, (s) => ({ ...s, skipped })),
        reorderPhase: (listId, phase, orderedIds) =>
          updateList(listId, (l) => {
            const rank = new Map(orderedIds.map((id, i) => [id, i]));
            const phaseShots = l.shots.filter((s) => s.phase === phase && rank.has(s.id));
            const baseOrders = phaseShots.map((s) => s.order).sort((a, b) => a - b);
            const reordered = new Map(
              [...phaseShots].sort((a, b) => rank.get(a.id)! - rank.get(b.id)!).map((s, i) => [s.id, baseOrders[i]]),
            );
            return { ...l, shots: sortShots(l.shots.map((s) => (reordered.has(s.id) ? { ...s, order: reordered.get(s.id)! } : s))) };
          }),
        addCustomShot: (listId, shot) =>
          updateList(listId, (l) => ({
            ...l,
            shots: sortShots([...l.shots, { ...shot, id: `c-${uid()}`, order: Number.MAX_SAFE_INTEGER, captured: false, custom: true }]),
          })),
        setHasMedia: (listId, shotId, has) =>
          updateShot(listId, shotId, (s) => ({
            ...s,
            hasMedia: has,
            captured: has ? true : s.captured,
            mediaRev: (s.mediaRev ?? 0) + 1,
          })),
        setTripInfo: (listId, info) => updateList(listId, (l) => ({ ...l, ...info })),
        clearAllMediaFlags: () =>
          set((s) => ({ lists: s.lists.map((l) => ({ ...l, shots: l.shots.map((x) => ({ ...x, hasMedia: false })) })) })),
        setTheme: (theme) => set({ theme }),
        resetAll: () => set({ lists: [], activeListId: undefined, theme: 'system', camera: 'phone' }),
      };
    },
    { name: 'shotlist-store', version: 1, storage: createJSONStorage(() => localStorage) },
  ),
);

export const useActiveList = () =>
  useStore((s) => s.lists.find((l) => l.id === s.activeListId) ?? s.lists[0]);
