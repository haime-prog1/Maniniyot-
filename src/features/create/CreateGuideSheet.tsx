import { AnimatePresence, motion } from 'framer-motion';
import { Car, Check, Hotel, Plane, Ship } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomSheet, GlassButton, SegmentedControl } from '../../components/ui';
import { DESTINATIONS, customDestination, getDestination, gradientCss } from '../../data/destinations';
import { STYLES, TARGET_LENGTHS, TRIP_TYPES, styleLabel, tripLabel } from '../../data/options';
import { cn, spring, uid } from '../../lib/utils';
import { generateShotList } from '../../services/generateShotList';
import { useStore } from '../../store/useStore';
import { useUI } from '../../store/useUI';
import type { Style, TargetLength, TripType } from '../../types';

const tripIcons = { flight: Plane, roadtrip: Car, ferry: Ship, staycation: Hotel };
const STEPS = ['Destination', 'Trip type', 'Reel style', 'Reel length'];

export function CreateGuideSheet() {
  const { createOpen, presetDestinationId, closeCreate } = useUI();
  const addList = useStore((s) => s.addList);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [destId, setDestId] = useState<string>('boracay');
  const [custom, setCustom] = useState('');
  const [trip, setTrip] = useState<TripType>('flight');
  const [style, setStyle] = useState<Style>('cinematic');
  const [length, setLength] = useState<TargetLength>(30);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!createOpen) return;
    if (presetDestinationId?.startsWith('custom:')) {
      setDestId('custom');
      setCustom(presetDestinationId.slice(7));
      setStep(1);
    } else if (presetDestinationId) {
      setDestId(presetDestinationId);
      setCustom('');
      setStep(1);
    } else {
      setStep(0);
    }
  }, [createOpen, presetDestinationId]);

  const destination = destId === 'custom' ? (custom.trim() ? customDestination(custom) : undefined) : getDestination(destId);
  const canNext = step !== 0 || !!destination;

  const generate = async () => {
    if (!destination) return;
    setBusy(true);
    const shots = await generateShotList({ destination, style, tripType: trip, targetLength: length });
    const id = uid();
    addList({
      id,
      destinationId: destination.id,
      destinationName: destination.name,
      style,
      tripType: trip,
      targetLength: length,
      shots,
      createdAt: Date.now(),
    });
    setBusy(false);
    closeCreate();
    navigate(`/list/${id}`);
  };

  return (
    <BottomSheet
      open={createOpen}
      onClose={closeCreate}
      title="New shot guide"
      footer={
        <div className="flex gap-2">
          {step > 0 && (
            <GlassButton size="lg" className="flex-1" onClick={() => setStep((s) => s - 1)}>
              Back
            </GlassButton>
          )}
          {step < 3 ? (
            <GlassButton variant="primary" size="lg" className="flex-1" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              Next
            </GlassButton>
          ) : (
            <GlassButton variant="primary" size="lg" className="flex-1" disabled={busy || !destination} onClick={generate}>
              {busy ? 'Generating…' : 'Generate shot list'}
            </GlassButton>
          )}
        </div>
      }
    >
      <div className="mb-4 flex gap-1.5" aria-label={`Step ${step + 1} of 4: ${STEPS[step]}`}>
        {STEPS.map((s, i) => (
          <div key={s} className={cn('h-1 flex-1 rounded-full transition-colors', i <= step ? 'bg-orange-500' : 'bg-black/10 dark:bg-white/15')} />
        ))}
      </div>
      <p className="text-2 text-[13px] font-medium uppercase tracking-wide">
        Step {step + 1} · {STEPS[step]}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={spring}
          className="pt-3"
        >
          {step === 0 && (
            <div className="space-y-3">
              <h3 className="text-[22px] font-bold">Where are you going?</h3>
              <div className="grid grid-cols-2 gap-2">
                {DESTINATIONS.map((d) => (
                  <motion.button
                    key={d.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDestId(d.id)}
                    aria-pressed={destId === d.id}
                    className={cn('relative h-16 overflow-hidden rounded-2xl px-3 text-left text-white', destId === d.id && 'ring-2 ring-orange-500 ring-offset-2 ring-offset-transparent')}
                    style={{ background: gradientCss(d.gradient) }}
                  >
                    <span className="text-[15px] font-bold drop-shadow">{d.name}</span>
                    {destId === d.id && <Check size={16} className="absolute right-2 top-2" />}
                  </motion.button>
                ))}
              </div>
              <input
                className="field"
                placeholder="Or type any destination…"
                aria-label="Custom destination"
                value={custom}
                onFocus={() => setDestId('custom')}
                onChange={(e) => {
                  setCustom(e.target.value);
                  setDestId('custom');
                }}
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <h3 className="text-[22px] font-bold">How are you getting there?</h3>
              <div className="grid grid-cols-2 gap-2">
                {TRIP_TYPES.map((t) => {
                  const Icon = tripIcons[t.value];
                  const on = trip === t.value;
                  return (
                    <motion.button
                      key={t.value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setTrip(t.value)}
                      aria-pressed={on}
                      className={cn('glass rounded-2xl p-4 text-left', on && 'ring-2 ring-orange-500')}
                    >
                      <Icon className={on ? 'text-orange-500' : ''} />
                      <p className="mt-2 text-[16px] font-semibold">{t.label}</p>
                      <p className="text-2 text-[12px]">{t.hint}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h3 className="text-[22px] font-bold">Pick your reel style</h3>
              <SegmentedControl label="Reel style" options={STYLES} value={style} onChange={setStyle} columns={3} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-[22px] font-bold">How long is the reel?</h3>
              <SegmentedControl
                label="Target reel length"
                options={TARGET_LENGTHS.map((l) => ({ value: l, label: `${l}s` }))}
                value={length}
                onChange={setLength}
              />
              <div className="glass rounded-2xl p-4 text-[15px]">
                <p className="font-semibold">{destination?.name ?? 'Your destination'}</p>
                <p className="text-2 text-[14px]">
                  {tripLabel(trip)} · {styleLabel(style)} · {length}s reel
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </BottomSheet>
  );
}
