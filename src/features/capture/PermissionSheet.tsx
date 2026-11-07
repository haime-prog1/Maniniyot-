import { Camera, ShieldCheck, Settings } from 'lucide-react';
import { BottomSheet, GlassButton } from '../../components/ui';

interface Props {
  mode: 'explain' | 'denied' | null;
  onClose: () => void;
  onContinue: () => void;
}

/** A friendly explainer shown before the browser's camera prompt, and after a denial. */
export function PermissionSheet({ mode, onClose, onContinue }: Props) {
  return (
    <BottomSheet open={mode !== null} onClose={onClose} title={mode === 'denied' ? 'Camera is turned off' : 'Use your camera?'}>
      {mode === 'denied' ? (
        <div className="space-y-4 pt-1">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-500">
            <Settings />
          </div>
          <p className="text-[15px]">ShotList can't open the camera because access was denied. To turn it back on:</p>
          <ol className="glass list-decimal space-y-1.5 rounded-2xl py-3 pl-9 pr-4 text-[15px]">
            <li>Open the iPhone <b>Settings</b> app.</li>
            <li>
              Go to <b>Safari → Camera</b>.
            </li>
            <li>
              Choose <b>Ask</b> or <b>Allow</b>.
            </li>
            <li>Come back to ShotList and tap Quick Capture again.</li>
          </ol>
          <p className="text-2 text-[13px]">
            You can also tap <b>aA → Website Settings → Camera</b> in Safari's address bar. Or use <b>Use iPhone Camera</b>, which doesn't need this permission.
          </p>
          <GlassButton variant="primary" size="lg" full onClick={onClose}>
            Got it
          </GlassButton>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-500">
            <Camera />
          </div>
          <p className="text-[15px]">
            Quick Capture films right inside ShotList, with a framing guide and a timer for this shot. Your browser will ask for camera access next.
          </p>
          <div className="glass flex gap-3 rounded-2xl p-3 text-[14px]">
            <ShieldCheck className="shrink-0 text-green-500" size={20} />
            <span>The camera is only on while the capture screen is open. Your clips are saved on this device and are never uploaded.</span>
          </div>
          <div className="flex gap-2">
            <GlassButton size="lg" className="flex-1" onClick={onClose}>
              Not now
            </GlassButton>
            <GlassButton variant="primary" size="lg" className="flex-1" onClick={onContinue}>
              Continue
            </GlassButton>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
