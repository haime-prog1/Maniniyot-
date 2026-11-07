import { useState } from 'react';
import { BottomSheet, GlassButton } from '../../components/ui';
import { PHASES, STYLES, TRIP_TYPES } from '../../data/options';
import { useStore } from '../../store/useStore';
import type { Angle, Movement, Phase } from '../../types';

const ANGLES: Angle[] = ['POV', 'Low angle', 'Wide', 'Medium', 'Close-up', 'Overhead'];
const MOVEMENTS: Movement[] = ['Static', 'Pan', 'Tilt', 'Walk-forward', 'Orbit', 'Slow-mo', 'Hyperlapse'];

interface Props {
  listId: string;
  open: boolean;
  onClose: () => void;
}

export function AddShotSheet({ listId, open, onClose }: Props) {
  const add = useStore((s) => s.addCustomShot);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [phase, setPhase] = useState<Phase>('activities');
  const [angle, setAngle] = useState<Angle>('Medium');
  const [movement, setMovement] = useState<Movement>('Static');
  const [min, setMin] = useState(2);
  const [max, setMax] = useState(3);
  const [tip, setTip] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    add(listId, {
      title: title.trim(),
      description: description.trim() || 'Your own shot idea.',
      phase,
      angle,
      movement,
      durationSec: [Math.max(1, Math.min(min, max)), Math.max(min, max, 1)],
      tip: tip.trim() || 'Keep it steady and hold the shot for an extra second.',
      styles: STYLES.map((s) => s.value),
      tripTypes: TRIP_TYPES.map((t) => t.value),
    });
    setTitle('');
    setDescription('');
    setTip('');
    onClose();
  };

  const select = 'field appearance-none';

  return (
    <BottomSheet open={open} onClose={onClose} title="Add custom shot">
      <form onSubmit={submit} className="space-y-3 pt-1">
        <input className="field" placeholder="Shot title" aria-label="Shot title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea
          className="field resize-none"
          rows={2}
          placeholder="What to film"
          aria-label="What to film"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select className={select} aria-label="Trip phase" value={phase} onChange={(e) => setPhase(e.target.value as Phase)}>
          {PHASES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <select className={select} aria-label="Camera angle" value={angle} onChange={(e) => setAngle(e.target.value as Angle)}>
            {ANGLES.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
          <select className={select} aria-label="Camera movement" value={movement} onChange={(e) => setMovement(e.target.value as Movement)}>
            {MOVEMENTS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-2 text-[13px]">
            Min seconds
            <input className="field mt-1" type="number" min={1} max={30} value={min} onChange={(e) => setMin(Number(e.target.value))} />
          </label>
          <label className="text-2 text-[13px]">
            Max seconds
            <input className="field mt-1" type="number" min={1} max={30} value={max} onChange={(e) => setMax(Number(e.target.value))} />
          </label>
        </div>
        <input className="field" placeholder="Pro tip (optional)" aria-label="Pro tip" value={tip} onChange={(e) => setTip(e.target.value)} />
        <GlassButton type="submit" variant="primary" size="lg" full disabled={!title.trim()}>
          Add shot
        </GlassButton>
      </form>
    </BottomSheet>
  );
}
