import { useEffect, useRef, useState } from 'react';
import { BottomSheet } from '../../components/ui';
import { cn } from '../../lib/utils';
import { loadPreview, previewProvider, projectAssetIds } from './assets';
import { panelCount } from './formats';
import { renderCollage } from './render';
import type { CollageProject } from './types';

function Slide({ p, index, width, watermark }: { p: CollageProject; index: number; width: number; watermark: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const n = panelCount(p.format, p.panels);
    const pw = p.width / n;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const k = (width * dpr) / pw;
    c.width = Math.round(pw * k);
    c.height = Math.round(p.height * k);
    const ctx = c.getContext('2d')!;
    ctx.scale(k, k);
    ctx.translate(-index * pw, 0);
    renderCollage(ctx, p, previewProvider, { watermark });
  }, [p, index, width, watermark]);
  return <canvas ref={ref} className="block rounded-xl" style={{ width, aspectRatio: `${p.width / panelCount(p.format, p.panels)} / ${p.height}` }} />;
}

/** Swipe through the slides the way followers will see them. */
export function OverviewSheet({ open, onClose, project, watermark }: { open: boolean; onClose: () => void; project: CollageProject; watermark: boolean }) {
  const n = panelCount(project.format, project.panels);
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState(0);
  const width = Math.min(320, (typeof window !== 'undefined' ? window.innerWidth : 390) - 72);

  useEffect(() => {
    if (!open) return;
    setReady(false);
    setPage(0);
    Promise.all(projectAssetIds(project).map(loadPreview)).then(() => setReady(true));
  }, [open, project]);

  return (
    <BottomSheet open={open} onClose={onClose} title="Swipe preview">
      <div className="pt-1">
        <div
          className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5"
          onScroll={(e) => setPage(Math.round(e.currentTarget.scrollLeft / (width + 12)))}
          aria-label={`${n} slides`}
        >
          {ready &&
            Array.from({ length: n }, (_, i) => (
              <div key={i} className="shrink-0 snap-center" aria-label={`Slide ${i + 1} of ${n}`}>
                <Slide p={project} index={i} width={width} watermark={watermark} />
              </div>
            ))}
        </div>
        <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
          {Array.from({ length: n }, (_, i) => (
            <span key={i} className={cn('h-1.5 w-1.5 rounded-full', i === page ? 'bg-ig-pink' : 'bg-black/20 dark:bg-white/25')} />
          ))}
        </div>
        <p className="text-2 mt-2 text-center text-[13px]">
          Slide {Math.min(page + 1, n)} of {n} · Panel lines are hidden in the export.
        </p>
      </div>
    </BottomSheet>
  );
}
