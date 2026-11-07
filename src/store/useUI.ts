import { create } from 'zustand';

interface UIState {
  createOpen: boolean;
  presetDestinationId?: string;
  openCreate: (destinationId?: string) => void;
  closeCreate: () => void;
}

export const useUI = create<UIState>()((set) => ({
  createOpen: false,
  openCreate: (presetDestinationId) => set({ createOpen: true, presetDestinationId }),
  closeCreate: () => set({ createOpen: false }),
}));
