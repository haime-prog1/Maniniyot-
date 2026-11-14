/**
 * Premium entitlements: the one place that decides what a user may use.
 *
 * Everything gated in the app goes through `isPremium()` / `usePremium()` /
 * `requirePremium()`. Gated data items (templates, fonts, filters) carry a
 * `premium: true` flag and are checked with `isLocked()`.
 *
 * Payments are not wired up yet. `purchasePremium()` is a placeholder that grants
 * premium on this device. To add real payments, replace its body with your
 * provider's checkout (e.g. Stripe, RevenueCat or the App Store) and call
 * `grant('purchase')` once the purchase is verified. Keep `restorePurchases()` in
 * sync with the same provider. Nothing else in the app needs to change.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Tier = 'free' | 'premium';
export type UnlockSource = 'placeholder' | 'purchase' | 'restore';

interface EntitlementState {
  tier: Tier;
  source?: UnlockSource;
  unlockedAt?: number;
  grant: (source: UnlockSource) => void;
  revoke: () => void;
}

export const useEntitlements = create<EntitlementState>()(
  persist(
    (set) => ({
      tier: 'free',
      grant: (source) => set({ tier: 'premium', source, unlockedAt: Date.now() }),
      revoke: () => set({ tier: 'free', source: undefined, unlockedAt: undefined }),
    }),
    { name: 'shotlist-entitlements', version: 1, storage: createJSONStorage(() => localStorage) },
  ),
);

export const isPremium = () => useEntitlements.getState().tier === 'premium';
export const usePremium = () => useEntitlements((s) => s.tier === 'premium');

/** Anything that can be marked premium in its config. */
export interface Gated {
  premium?: boolean;
}

/** True when the item is premium and the user is not. */
export const isLocked = (item: Gated, premium: boolean = isPremium()) => !!item.premium && !premium;

/** Placeholder purchase. Replace with a real checkout later (see the note at the top). */
export async function purchasePremium(): Promise<boolean> {
  useEntitlements.getState().grant('placeholder');
  return true;
}

/** Placeholder restore. With real payments, ask the provider for active purchases. */
export async function restorePurchases(): Promise<boolean> {
  return isPremium();
}

interface UpgradePromptState {
  open: boolean;
  reason?: string;
  show: (reason?: string) => void;
  hide: () => void;
}

/** Controls the global upgrade sheet. */
export const useUpgradePrompt = create<UpgradePromptState>()((set) => ({
  open: false,
  show: (reason) => set({ open: true, reason }),
  hide: () => set({ open: false }),
}));

/** Returns true when the item can be used. Otherwise it opens the upgrade sheet and returns false. */
export function requirePremium(item: Gated, reason?: string): boolean {
  if (!isLocked(item)) return true;
  useUpgradePrompt.getState().show(reason);
  return false;
}
