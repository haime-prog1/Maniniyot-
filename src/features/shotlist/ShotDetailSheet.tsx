import { ArrowRightLeft, Lightbulb } from 'lucide-react';
import { BottomSheet, ListGroup, ListRow, Toggle } from '../../components/ui';
import { cameraSettingsFor } from '../../data/cameraSettings';
import { phaseLabel } from '../../data/options';
import { formatRange } from '../../lib/utils';
import { useStore } from '../../store/useStore';
import type { ListShot } from '../../types';
import { CapturePanel } from '../capture/CapturePanel';
import { FramingDiagram } from './FramingDiagram';

interface Props {
  listId: string;
  shot?: ListShot;
  onClose: () => void;
}

export function ShotDetailSheet({ listId, shot, onClose }: Props) {
  const setNotes = useStore((s) => s.setNotes);
  const toggle = useStore((s) => s.toggleCaptured);

  return (
    <BottomSheet open={!!shot} onClose={onClose} title={shot?.title}>
      {shot && (
        <div className="space-y-5 pt-1">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-ig-pink">{phaseLabel(shot.phase)}</p>
          <p className="-mt-3 text-[16px] leading-relaxed">{shot.description}</p>

          <div className="flex gap-4">
            <FramingDiagram angle={shot.angle} movement={shot.movement} className="w-28 shrink-0" />
            <dl className="grid flex-1 content-start gap-2 text-[14px]">
              <div>
                <dt className="text-2 text-[12px]">Duration</dt>
                <dd className="font-semibold">{formatRange(shot.durationSec)}</dd>
              </div>
              <div>
                <dt className="text-2 text-[12px]">Angle</dt>
                <dd className="font-semibold">{shot.angle}</dd>
              </div>
              <div>
                <dt className="text-2 text-[12px]">Movement</dt>
                <dd className="font-semibold">{shot.movement}</dd>
              </div>
              <p className="text-2 text-[12px] leading-snug">Place the subject where the pink shape sits, on the thirds lines.</p>
            </dl>
          </div>

          <div className="glass space-y-2 rounded-2xl p-4 text-[14px]">
            <p className="flex gap-2">
              <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber-500" /> {shot.tip}
            </p>
            {shot.transition && (
              <p className="text-2 flex gap-2">
                <ArrowRightLeft size={16} className="mt-0.5 shrink-0" /> Transition into the next shot: {shot.transition}
              </p>
            )}
          </div>

          <ListGroup title="Recommended camera settings">
            {cameraSettingsFor(shot).map((r) => (
              <ListRow key={r.label} label={<span className="text-[14px]">{r.label}</span>} detail={<span className="text-[13px]">{r.value}</span>} />
            ))}
            <ListRow label="Captured" right={<Toggle checked={shot.captured} onChange={(v) => toggle(listId, shot.id, v)} label="Captured" />} />
          </ListGroup>

          <section>
            <label htmlFor="shot-notes" className="text-2 px-1 text-[13px] font-medium uppercase tracking-wide">
              Notes
            </label>
            <textarea
              id="shot-notes"
              rows={3}
              value={shot.notes ?? ''}
              onChange={(e) => setNotes(listId, shot.id, e.target.value)}
              placeholder="Outfit, time of day, who's filming…"
              className="field mt-1.5 resize-none"
            />
          </section>

          <section>
            <h3 className="text-2 mb-2 px-1 text-[13px] font-medium uppercase tracking-wide">Capture</h3>
            <CapturePanel listId={listId} shot={shot} />
          </section>
        </div>
      )}
    </BottomSheet>
  );
}
