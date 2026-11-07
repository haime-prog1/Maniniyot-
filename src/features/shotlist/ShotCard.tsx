import { motion, Reorder, useDragControls, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRightLeft, Camera, Clock, EyeOff, GripVertical, Lightbulb, Move, ScanEye } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { cn, formatRange, spring } from '../../lib/utils';
import { useStore } from '../../store/useStore';
import type { ListShot } from '../../types';
import { MediaThumb } from '../capture/MediaThumb';
import { useShotMedia } from '../capture/useShotMedia';

interface Props {
  listId: string;
  shot: ListShot;
  number: number;
  onOpen: () => void;
  onCapture: () => void;
}

export function CheckButton({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <motion.button
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      whileTap={{ scale: 0.85 }}
      transition={spring}
      onClick={onToggle}
      className={cn(
        'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
        checked ? 'border-green-500 bg-green-500' : 'border-black/25 dark:border-white/35',
      )}
    >
      {checked && (
        <motion.span
          className="absolute inset-0 rounded-full bg-green-500"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          fill="none"
          stroke="white"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </svg>
    </motion.button>
  );
}

export function ShotCard({ listId, shot, number, onOpen, onCapture }: Props) {
  const controls = useDragControls();
  const toggle = useStore((s) => s.toggleCaptured);
  const skip = useStore((s) => s.setSkipped);
  const x = useMotionValue(0);
  const skipOpacity = useTransform(x, [-130, -20], [1, 0]);
  const gripRef = useRef<HTMLButtonElement>(null);
  const { url, record } = useShotMedia(listId, shot.id, shot.hasMedia, shot.mediaRev);

  // A native listener so the reorder drag starts without also triggering the swipe drag.
  useEffect(() => {
    const el = gripRef.current;
    if (!el) return;
    const down = (e: PointerEvent) => {
      e.stopPropagation();
      controls.start(e);
    };
    el.addEventListener('pointerdown', down);
    return () => el.removeEventListener('pointerdown', down);
  }, [controls]);

  return (
    <Reorder.Item value={shot.id} dragListener={false} dragControls={controls} className="relative list-none" transition={spring}>
      <motion.div
        aria-hidden
        style={{ opacity: skipOpacity }}
        className="absolute inset-0 flex items-center justify-end gap-2 rounded-[24px] bg-red-500/85 pr-6 font-semibold text-white"
      >
        <EyeOff size={18} /> Skip
      </motion.div>
      <motion.article
        style={{ x }}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.6, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -110) skip(listId, shot.id, true);
        }}
        className={cn('glass relative rounded-[24px] p-4', shot.captured && 'ring-1 ring-green-500/40')}
        aria-label={`Shot ${number}: ${shot.title}`}
      >
        <div className="flex items-start gap-3">
          <CheckButton checked={shot.captured} onToggle={() => toggle(listId, shot.id)} label={`Mark "${shot.title}" as captured`} />
          <button onClick={onOpen} className="min-w-0 flex-1 text-left">
            <h3 className={cn('text-[16px] font-semibold leading-snug', shot.captured && 'text-2 line-through')}>
              <span className="text-ig-pink">{number}.</span> {shot.title}
            </h3>
            <p className="text-2 mt-1 line-clamp-2 text-[14px] leading-snug">{shot.description}</p>
          </button>
          {url && record && (
            <button onClick={onCapture} aria-label="View captured media" className="shrink-0">
              <MediaThumb url={url} type={record.type} label={shot.title} className="h-14 w-10 rounded-lg" />
            </button>
          )}
          <button ref={gripRef} aria-label="Drag to reorder" className="text-2 -mr-1 shrink-0 cursor-grab touch-none p-1">
            <GripVertical size={18} />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="chip">
            <Clock size={12} /> {formatRange(shot.durationSec)}
          </span>
          <span className="chip">
            <ScanEye size={12} /> {shot.angle}
          </span>
          <span className="chip">
            <Move size={12} /> {shot.movement}
          </span>
          {shot.custom && <span className="chip">Custom</span>}
        </div>

        <p className="mt-3 flex gap-2 text-[13px] leading-snug">
          <Lightbulb size={15} className="mt-px shrink-0 text-amber-500" aria-hidden />
          <span>{shot.tip}</span>
        </p>
        {shot.transition && (
          <p className="text-2 mt-1.5 flex gap-2 text-[13px]">
            <ArrowRightLeft size={15} className="mt-px shrink-0" aria-hidden />
            <span>Transition into next: {shot.transition}</span>
          </p>
        )}

        <div className="mt-3 flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={spring}
            onClick={onCapture}
            className="glass flex h-9 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold"
          >
            <Camera size={16} /> {shot.hasMedia ? 'Captured' : 'Capture'}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={spring}
            onClick={onOpen}
            className="text-2 flex h-9 items-center rounded-full px-3 text-[14px] font-medium"
          >
            Details
          </motion.button>
        </div>
      </motion.article>
    </Reorder.Item>
  );
}
