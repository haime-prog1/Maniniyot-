import { Check, Crown } from 'lucide-react';
import { useState } from 'react';
import { BottomSheet, GlassButton } from '../../components/ui';
import { purchasePremium, usePremium, useUpgradePrompt } from '../../services/entitlements';

const PERKS = [
  'All collage templates, including film strip, magazine and big carousels',
  'Every font pair: Magazine, Handwritten and Poster',
  'Film and Faded filters',
  'Exports without the ShotList watermark',
];

/** Global upgrade sheet, opened by `requirePremium()` or `useUpgradePrompt().show()`. */
export function UpgradeSheet() {
  const { open, reason, hide } = useUpgradePrompt();
  const premium = usePremium();
  const [busy, setBusy] = useState(false);

  const unlock = async () => {
    setBusy(true);
    await purchasePremium();
    setBusy(false);
    hide();
  };

  return (
    <BottomSheet open={open} onClose={hide} title="ShotList Premium">
      <div className="space-y-4 pt-1">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ig text-white">
          <Crown />
        </div>
        {reason && <p className="text-[15px] font-semibold">{reason}</p>}
        <ul className="space-y-2">
          {PERKS.map((p) => (
            <li key={p} className="flex gap-2 text-[15px]">
              <Check size={18} className="mt-0.5 shrink-0 text-green-500" aria-hidden />
              {p}
            </li>
          ))}
        </ul>
        {premium ? (
          <p className="rounded-2xl bg-green-500/10 p-3 text-center text-[15px] font-semibold text-green-600 dark:text-green-400">
            Premium is active on this device.
          </p>
        ) : (
          <>
            <GlassButton variant="primary" size="lg" full disabled={busy} onClick={unlock}>
              {busy ? 'Unlocking…' : 'Unlock Premium'}
            </GlassButton>
            <p className="text-2 text-center text-[12px]">
              Payments aren't set up yet. This unlocks Premium on this device for testing.
            </p>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
