import { Move, MoveDiagonal2, RotateCw } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { cn } from '../../lib/utils';
import { getPreview, loadPreview, previewProvider, projectAssetIds } from './assets';
import { PANEL_W, panelCount } from './formats';
import { patchLayer } from './ops';
import { coverGeometry, frameRect, hitLayer, measureTextHeight, photoArea, renderCollage } from './render';
import type { CollageProject, Layer, PhotoLayer, TextLayer } from './types';

interface Props {
  project: CollageProject;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (fn: (p: CollageProject) => CollageProject, key?: string) => void;
  /** Tap on an empty frame, or on the selected text. */
  onTapLayer: (layer: Layer) => void;
  showDividers: boolean;
  watermark: boolean;
  onPanelChange?: (panel: number) => void;
}

type Mode = 'body' | 'move' | 'resize' | 'rotate' | 'pinch';

interface Gesture {
  mode: Mode;
  key: string;
  pointers: Map<number, { x: number; y: number }>;
  start: Layer;
  startPointer: { x: number; y: number };
  startTime: number;
  moved: boolean;
  center: { x: number; y: number };
  startAngle: number;
  startDist: number;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const deg = (r: number) => (r * 180) / Math.PI;

/** Rotates a screen delta into the layer's own (unrotated) axes. */
function toLocal(dx: number, dy: number, rotation: number) {
  const a = (-rotation * Math.PI) / 180;
  return { x: Math.cos(a) * dx - Math.sin(a) * dy, y: Math.sin(a) * dx + Math.cos(a) * dy };
}

export function EditorCanvas({ project, selectedId, onSelect, onUpdate, onTapLayer, showDividers, watermark, onPanelChange }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef(project);
  projectRef.current = project;
  const gesture = useRef<Gesture | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [tick, setTick] = useState(0);
  const [guides, setGuides] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });

  const carousel = project.format === 'carousel';
  const panels = panelCount(project.format, project.panels);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = useMemo(() => {
    if (!size.w || !size.h) return 0;
    const availH = size.h - 16;
    if (carousel) return Math.min(size.w * 0.84, (availH * PANEL_W) / project.height) / PANEL_W;
    return Math.min((size.w - 24) / project.width, availH / project.height);
  }, [size, carousel, project.width, project.height]);

  const dispW = project.width * scale;
  const dispH = project.height * scale;

  // Load previews for every photo, then redraw.
  const assetKey = projectAssetIds(project).join(',');
  useEffect(() => {
    if (!assetKey) return;
    let alive = true;
    Promise.all(assetKey.split(',').map(loadPreview)).then(() => alive && setTick((t) => t + 1));
    return () => {
      alive = false;
    };
  }, [assetKey]);

  // Draw.
  useEffect(() => {
    const c = canvasRef.current;
    if (!c || !scale) return;
    const id = requestAnimationFrame(() => {
      let dpr = Math.min(2, window.devicePixelRatio || 1);
      if (dispW * dpr > 8000) dpr = 8000 / dispW;
      const w = Math.round(dispW * dpr);
      const h = Math.round(dispH * dpr);
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      const ctx = c.getContext('2d')!;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
      renderCollage(ctx, project, previewProvider, { editor: true, watermark });
    });
    return () => cancelAnimationFrame(id);
  }, [project, scale, dispW, dispH, tick, watermark]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el || !carousel || !scale) return;
    onPanelChange?.(clamp(Math.round(el.scrollLeft / (PANEL_W * scale)), 0, panels - 1));
  };

  // ---------- Snapping ----------
  const snapMove = useCallback(
    (x: number, y: number, w: number, h: number) => {
      const p = projectRef.current;
      const t = 10 / (scale || 1);
      const xs = [0, p.width];
      for (let i = 0; i < panelCount(p.format, p.panels); i++) xs.push(i * PANEL_W, i * PANEL_W + PANEL_W / 2);
      const ys = [0, p.height / 2, p.height];
      let bx = { d: t, v: x, g: NaN };
      for (const off of [0, w / 2, w]) for (const c of xs) if (Math.abs(x + off - c) < bx.d) bx = { d: Math.abs(x + off - c), v: c - off, g: c };
      let by = { d: t, v: y, g: NaN };
      for (const off of [0, h / 2, h]) for (const c of ys) if (Math.abs(y + off - c) < by.d) by = { d: Math.abs(y + off - c), v: c - off, g: c };
      setGuides({ x: isNaN(bx.g) ? [] : [bx.g], y: isNaN(by.g) ? [] : [by.g] });
      return { x: bx.v, y: by.v };
    },
    [scale],
  );

  // ---------- Gestures on the selected layer ----------
  const selected = project.layers.find((l) => l.id === selectedId) ?? null;

  const begin = (e: RPointerEvent, mode: Mode) => {
    e.stopPropagation();
    const layer = projectRef.current.layers.find((l) => l.id === selectedId);
    if (!layer) return;
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {
      /* not capturable (e.g. synthetic) */
    }
    const g = gesture.current;
    if (!g) {
      const box = boxRef.current?.getBoundingClientRect();
      const center = box ? { x: box.left + box.width / 2, y: box.top + box.height / 2 } : { x: e.clientX, y: e.clientY };
      gesture.current = {
        mode,
        key: `g${Date.now()}`,
        pointers: new Map([[e.pointerId, { x: e.clientX, y: e.clientY }]]),
        start: layer,
        startPointer: { x: e.clientX, y: e.clientY },
        startTime: Date.now(),
        moved: false,
        center,
        startAngle: deg(Math.atan2(e.clientY - center.y, e.clientX - center.x)),
        startDist: 0,
      };
      return;
    }
    g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (g.pointers.size === 2) {
      const [a, b] = [...g.pointers.values()];
      g.mode = 'pinch';
      g.moved = true;
      g.start = layer;
      g.startDist = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      g.startAngle = deg(Math.atan2(b.y - a.y, b.x - a.x));
    }
  };

  const move = (e: RPointerEvent) => {
    const g = gesture.current;
    if (!g || !g.pointers.has(e.pointerId)) return;
    g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const s = g.start;
    const dxs = e.clientX - g.startPointer.x;
    const dys = e.clientY - g.startPointer.y;
    if (!g.moved && Math.hypot(dxs, dys) < 6) return;
    g.moved = true;
    const dx = dxs / scale;
    const dy = dys / scale;
    const p = projectRef.current;
    let patch: Partial<Layer> | null = null;

    if (g.mode === 'pinch') {
      const [a, b] = [...g.pointers.values()];
      const ratio = (Math.hypot(b.x - a.x, b.y - a.y) || 1) / g.startDist;
      if (s.type === 'photo') patch = { crop: { ...s.crop, scale: clamp(s.crop.scale * ratio, 1, 5) } };
      else {
        const t = s as TextLayer;
        const w = clamp(t.w * ratio, 80, p.width);
        const size = clamp(t.size * ratio, 12, 600);
        const rotation = t.rotation + deg(Math.atan2(b.y - a.y, b.x - a.x)) - g.startAngle;
        const h = measureTextHeight({ ...t, w, size });
        patch = { w, size, rotation, x: t.x + t.w / 2 - w / 2, y: t.y + t.h / 2 - h / 2 };
      }
    } else if (g.mode === 'body' && s.type === 'photo') {
      const img = s.assetId ? getPreview(s.assetId) : undefined;
      if (!img) return;
      const a = photoArea(s, frameRect(s, p));
      const geo = coverGeometry(a.w, a.h, img.w, img.h, s.crop);
      const l = toLocal(dx, dy, s.rotation);
      patch = {
        crop: {
          ...s.crop,
          ox: geo.maxX > 0 ? clamp(s.crop.ox + l.x / geo.maxX, -1, 1) : s.crop.ox,
          oy: geo.maxY > 0 ? clamp(s.crop.oy + l.y / geo.maxY, -1, 1) : s.crop.oy,
        },
      };
    } else if (g.mode === 'move' || g.mode === 'body') {
      patch = snapMove(s.x + dx, s.y + dy, s.w, s.h);
    } else if (g.mode === 'resize') {
      const l = toLocal(dx, dy, s.rotation);
      if (s.type === 'photo') {
        const w = Math.max(80, s.w + 2 * l.x);
        const h = Math.max(80, s.h + 2 * l.y);
        patch = { w, h, x: s.x + s.w / 2 - w / 2, y: s.y + s.h / 2 - h / 2 };
      } else {
        const f = Math.max(0.2, (s.w + 2 * l.x) / s.w);
        const w = clamp(s.w * f, 80, p.width);
        const size = clamp(s.size * f, 12, 600);
        const h = measureTextHeight({ ...s, w, size });
        patch = { w, size, x: s.x + s.w / 2 - w / 2, y: s.y + s.h / 2 - h / 2 };
      }
    } else if (g.mode === 'rotate') {
      let r = s.rotation + deg(Math.atan2(e.clientY - g.center.y, e.clientX - g.center.x)) - g.startAngle;
      r = ((((r + 180) % 360) + 360) % 360) - 180;
      for (const snap of [-180, -90, 0, 90, 180]) if (Math.abs(r - snap) < 4) r = snap;
      patch = { rotation: r };
    }
    if (patch) {
      const id = s.id;
      const pt = patch;
      onUpdate((proj) => patchLayer(proj, id, pt), g.key);
    }
  };

  const end = (e: RPointerEvent) => {
    const g = gesture.current;
    if (!g || !g.pointers.has(e.pointerId)) return;
    g.pointers.delete(e.pointerId);
    if (g.mode === 'pinch' || g.pointers.size === 0) {
      if (!g.moved && e.type === 'pointerup' && Date.now() - g.startTime < 500 && g.mode === 'body') onTapLayer(g.start);
      gesture.current = null;
      setGuides({ x: [], y: [] });
    }
  };

  // ---------- Taps on the canvas ----------
  const onTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const hit = hitLayer(projectRef.current, (e.clientX - rect.left) / scale, (e.clientY - rect.top) / scale);
    if (!hit) return onSelect(null);
    onSelect(hit.id);
    if (hit.type === 'photo' && !hit.assetId) onTapLayer(hit);
  };

  const sel = selected;
  const selRect = sel ? (sel.type === 'photo' ? frameRect(sel as PhotoLayer, project) : sel) : null;
  // Keep the rotate handle on screen: flip it below frames that touch the top.
  const rotateBelow = !!selRect && selRect.y * scale < 52 && Math.abs(sel?.rotation ?? 0) < 90;
  const handle = 'absolute flex h-11 w-11 items-center justify-center';
  const knob = 'flex h-7 w-7 items-center justify-center rounded-full bg-white text-black shadow-md ring-1 ring-black/10';
  const pointerProps = { onPointerMove: move, onPointerUp: end, onPointerCancel: end };

  return (
    <div ref={rootRef} className="relative h-full w-full">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className={cn('no-scrollbar flex h-full items-center', carousel ? 'overflow-x-auto overscroll-x-contain px-[8%]' : 'justify-center')}
      >
        {scale > 0 && (
          <div className="relative shrink-0 shadow-xl" style={{ width: dispW, height: dispH }}>
            <canvas
              ref={canvasRef}
              className="absolute inset-0 block"
              style={{ width: dispW, height: dispH }}
              role="img"
              aria-label={`Collage canvas, ${panels > 1 ? `${panels} slides` : project.format}`}
            />

            {carousel && showDividers && (
              <div aria-hidden className="pointer-events-none absolute inset-0">
                {Array.from({ length: panels }, (_, i) => (
                  <div key={i} className="absolute top-0 h-full" style={{ left: i * PANEL_W * scale, width: PANEL_W * scale }}>
                    {i > 0 && <div className="absolute inset-y-0 left-0 border-l-2 border-dashed border-white/90 mix-blend-difference" />}
                    <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white">
                      {i + 1}/{panels}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div aria-hidden className="pointer-events-none absolute inset-0">
              {guides.x.map((x) => (
                <div key={`x${x}`} className="absolute inset-y-0 w-px bg-ig-pink" style={{ left: x * scale }} />
              ))}
              {guides.y.map((y) => (
                <div key={`y${y}`} className="absolute inset-x-0 h-px bg-ig-pink" style={{ top: y * scale }} />
              ))}
            </div>

            <div className="absolute inset-0" style={{ touchAction: carousel ? 'pan-x' : 'none' }} onClick={onTap} />

            {sel && selRect && (
              <div
                ref={boxRef}
                role="group"
                aria-label={sel.type === 'photo' ? 'Selected photo. Drag to pan, pinch to zoom.' : 'Selected text. Drag to move, pinch to resize.'}
                className="absolute"
                style={{
                  left: (selRect.x + selRect.w / 2) * scale,
                  top: (selRect.y + selRect.h / 2) * scale,
                  width: selRect.w * scale,
                  height: selRect.h * scale,
                  transform: `translate(-50%, -50%) rotate(${sel.rotation}deg)`,
                  touchAction: 'none',
                }}
                onPointerDown={(e) => begin(e, 'body')}
                {...pointerProps}
              >
                <div className="pointer-events-none absolute inset-0 border-2 border-white shadow-[0_0_0_1.5px_rgba(214,41,118,0.9)]" />
                <div
                  className={cn(handle, 'left-1/2 -translate-x-1/2', rotateBelow ? '-bottom-12' : '-top-12')}
                  style={{ touchAction: 'none' }}
                  onPointerDown={(e) => begin(e, 'rotate')}
                  {...pointerProps}
                  role="button"
                  aria-label="Rotate"
                >
                  <span className={knob}>
                    <RotateCw size={15} />
                  </span>
                </div>
                <div
                  className={cn(handle, '-bottom-6 -right-6')}
                  style={{ touchAction: 'none' }}
                  onPointerDown={(e) => begin(e, 'resize')}
                  {...pointerProps}
                  role="button"
                  aria-label="Resize"
                >
                  <span className={knob}>
                    <MoveDiagonal2 size={15} />
                  </span>
                </div>
                {sel.type === 'photo' && (
                  <div
                    className={cn(handle, '-left-6 -top-6')}
                    style={{ touchAction: 'none' }}
                    onPointerDown={(e) => begin(e, 'move')}
                    {...pointerProps}
                    role="button"
                    aria-label="Move frame"
                  >
                    <span className={knob}>
                      <Move size={15} />
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Screen-reader access to every layer. */}
      <div className="sr-only">
        {project.layers.map((l, i) => (
          <button key={l.id} onClick={() => onSelect(l.id)}>
            {l.type === 'photo' ? `Photo ${i + 1}${l.assetId ? '' : ' (empty)'}` : `Text: ${l.text}`}
          </button>
        ))}
      </div>
    </div>
  );
}
