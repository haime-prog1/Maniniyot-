import { AnimatePresence, PresenceContext, motion, useDragControls } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { spring } from '../../lib/utils';

let openCount = 0;

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function BottomSheet({ open, onClose, title, children, footer }: Props) {
  const controls = useDragControls();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    openCount++;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      openCount--;
      if (openCount <= 0) document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="glass-strong relative flex max-h-[92dvh] w-full max-w-[430px] flex-col rounded-t-[28px] pb-[env(safe-area-inset-bottom)]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={spring}
            drag="y"
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
          >
            <div className="cursor-grab touch-none px-5 pb-2 pt-2" onPointerDown={(e) => controls.start(e)}>
              <div className="mx-auto h-1.5 w-10 rounded-full bg-current opacity-25" />
              {title && (
                <div className="mt-3 flex items-center justify-between">
                  <h2 className="text-[20px] font-bold tracking-tight">{title}</h2>
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
            {/* Isolate the content from the sheet's exit animation. Otherwise an animated
                element inside (like a segmented control's sliding highlight) can block
                the sheet from being removed, leaving an invisible layer that eats taps. */}
            <PresenceContext.Provider value={null}>
              <div className="overflow-y-auto overscroll-contain px-5 pb-5">{children}</div>
              {footer && <div className="px-5 pb-4 pt-2">{footer}</div>}
            </PresenceContext.Provider>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
