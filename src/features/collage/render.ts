/**
 * The one collage renderer. The editor preview, thumbnails and the full-size
 * export all draw through `renderCollage`, so what you see is what you export.
 */
import { cssFont, getFace } from './fonts';
import { PANEL_W, panelCount } from './formats';
import type { CollageProject, FilterSettings, Frame, Layer, PhotoLayer, Rect, TextLayer } from './types';

export interface SourceProvider {
  /** The (already filtered) image for a photo, or undefined while it loads. */
  photo(assetId: string, filter: FilterSettings): Frame | undefined;
  /** A tiny, pre-blurred version of the photo, for blurred backgrounds. */
  blur(assetId: string): Frame | undefined;
}

export interface RenderOptions {
  /** Editor mode: draws "+" placeholders in empty frames. */
  editor?: boolean;
  /** Draws the free-plan watermark on each slide. */
  watermark?: boolean;
  /** Thumbnail mode: tints empty frames so templates are easy to tell apart. */
  thumbnail?: boolean;
}

const THUMB_TINTS = ['#f6b6c8', '#fde2c8', '#c8e6f6', '#d8f0d0', '#e6d8f6', '#f6eec8'];

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** The frame rect after spacing (gap) is applied. Edges on the canvas border get a full gap. */
export function frameRect(l: PhotoLayer, p: CollageProject): Rect {
  if (!l.inset || p.style.gap <= 0) return { x: l.x, y: l.y, w: l.w, h: l.h };
  const g = p.style.gap / 2;
  const e = 0.5;
  const left = g + (l.x <= e ? g : 0);
  const top = g + (l.y <= e ? g : 0);
  const right = g + (l.x + l.w >= p.width - e ? g : 0);
  const bottom = g + (l.y + l.h >= p.height - e ? g : 0);
  return { x: l.x + left, y: l.y + top, w: Math.max(1, l.w - left - right), h: Math.max(1, l.h - top - bottom) };
}

/** The area the photo itself fills (inside a polaroid matte, if any), relative to the frame's top-left. */
export function photoArea(l: PhotoLayer, r: Rect): Rect {
  if (!l.matte) return { x: 0, y: 0, w: r.w, h: r.h };
  const { pad, bottom } = l.matte;
  return { x: pad, y: pad, w: Math.max(1, r.w - 2 * pad), h: Math.max(1, r.h - pad - bottom) };
}

/** Where a photo of iw×ih is drawn inside an area of aw×ah for a crop. */
export function coverGeometry(aw: number, ah: number, iw: number, ih: number, crop: PhotoLayer['crop']) {
  const s = Math.max(aw / iw, ah / ih) * crop.scale;
  const dw = iw * s;
  const dh = ih * s;
  const maxX = Math.max(0, (dw - aw) / 2);
  const maxY = Math.max(0, (dh - ah) / 2);
  return { s, dw, dh, maxX, maxY, dx: (aw - dw) / 2 + crop.ox * maxX, dy: (ah - dh) / 2 + crop.oy * maxY };
}

function drawBackground(ctx: CanvasRenderingContext2D, p: CollageProject, sources: SourceProvider) {
  const bg = p.style.background;
  const { width: w, height: h } = p;
  if (bg.type === 'solid') {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, w, h);
  } else if (bg.type === 'gradient') {
    const a = (bg.angle * Math.PI) / 180;
    const len = Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a));
    const cx = w / 2;
    const cy = h / 2;
    const dx = (Math.sin(a) * len) / 2;
    const dy = (-Math.cos(a) * len) / 2;
    const g = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
    g.addColorStop(0, bg.from);
    g.addColorStop(1, bg.to);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.fillStyle = '#1c1c1e';
    ctx.fillRect(0, 0, w, h);
    const firstPhoto = p.layers.find((l): l is PhotoLayer => l.type === 'photo' && !!l.assetId);
    const id = bg.assetId ?? firstPhoto?.assetId;
    const f = id ? sources.blur(id) : undefined;
    if (f) {
      const s = Math.max(w / f.w, h / f.h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(f.src, (w - f.w * s) / 2, (h - f.h * s) / 2, f.w * s, f.h * s);
    }
    ctx.fillStyle = `rgba(0,0,0,${bg.dim})`;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawSprockets(ctx: CanvasRenderingContext2D, p: CollageProject) {
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < panelCount(p.format, p.panels); i++) {
    const x0 = i * PANEL_W;
    for (let y = 24; y < p.height - 40; y += 74) {
      roundRect(ctx, x0 + 34, y, 46, 38, 8);
      ctx.fill();
      roundRect(ctx, x0 + PANEL_W - 80, y, 46, 38, 8);
      ctx.fill();
    }
  }
}

function drawPhoto(ctx: CanvasRenderingContext2D, l: PhotoLayer, p: CollageProject, sources: SourceProvider, opts: RenderOptions, index: number) {
  const r = frameRect(l, p);
  ctx.save();
  ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
  ctx.rotate((l.rotation * Math.PI) / 180);
  ctx.translate(-r.w / 2, -r.h / 2);

  if (l.matte) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = l.matte.color;
    roundRect(ctx, 0, 0, r.w, r.h, 6);
    ctx.fill();
    ctx.restore();
  }

  const a = photoArea(l, r);
  const radius = l.matte ? 2 : p.style.radius;
  ctx.save();
  roundRect(ctx, a.x, a.y, a.w, a.h, radius);
  ctx.clip();
  const src = l.assetId ? sources.photo(l.assetId, l.filter) : undefined;
  if (src) {
    const g = coverGeometry(a.w, a.h, src.w, src.h, l.crop);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(src.src, a.x + g.dx, a.y + g.dy, g.dw, g.dh);
  } else if (opts.thumbnail) {
    ctx.fillStyle = THUMB_TINTS[index % THUMB_TINTS.length];
    ctx.fillRect(a.x, a.y, a.w, a.h);
  } else {
    ctx.fillStyle = opts.editor ? '#d6d6dc' : '#cfcfd4';
    ctx.fillRect(a.x, a.y, a.w, a.h);
    if (opts.editor && !l.assetId) {
      const cx = a.x + a.w / 2;
      const cy = a.y + a.h / 2;
      const rad = Math.min(56, a.w / 4, a.h / 4);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8e8e93';
      ctx.lineWidth = Math.max(4, rad / 7);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - rad / 2.2, cy);
      ctx.lineTo(cx + rad / 2.2, cy);
      ctx.moveTo(cx, cy - rad / 2.2);
      ctx.lineTo(cx, cy + rad / 2.2);
      ctx.stroke();
    }
  }
  ctx.restore();

  if (!l.matte && p.style.borderWidth > 0) {
    const bw = p.style.borderWidth;
    ctx.strokeStyle = p.style.borderColor;
    ctx.lineWidth = bw;
    roundRect(ctx, a.x + bw / 2, a.y + bw / 2, a.w - bw, a.h - bw, Math.max(0, radius - bw / 2));
    ctx.stroke();
  }
  ctx.restore();
}

let measureCtx: CanvasRenderingContext2D | null = null;
function getMeasureCtx() {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  return measureCtx!;
}

function applyFont(ctx: CanvasRenderingContext2D, l: TextLayer) {
  const face = getFace(l.pairId, l.role);
  ctx.font = cssFont(face, l.size);
  const c = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if ('letterSpacing' in c) c.letterSpacing = `${(face.tracking ?? 0) * l.size}px`;
  return face;
}

/** Splits text into lines that fit the layer width. */
export function layoutText(ctx: CanvasRenderingContext2D, l: TextLayer) {
  const face = applyFont(ctx, l);
  const pad = l.bg ? l.size * 0.38 : 0;
  const maxW = Math.max(10, l.w - pad * 2);
  const raw = face.uppercase || l.uppercase ? l.text.toUpperCase() : l.text;
  const lines: string[] = [];
  for (const para of raw.split('\n')) {
    const words = para.split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push('');
      continue;
    }
    let line = words[0];
    for (let i = 1; i < words.length; i++) {
      const test = `${line} ${words[i]}`;
      if (ctx.measureText(test).width > maxW) {
        lines.push(line);
        line = words[i];
      } else line = test;
    }
    lines.push(line);
  }
  const lineH = l.size * 1.18;
  return { lines, lineH, pad, height: lines.length * lineH + pad * 2 };
}

export function measureTextHeight(l: TextLayer) {
  const ctx = getMeasureCtx();
  ctx.save();
  const h = layoutText(ctx, l).height;
  ctx.restore();
  return Math.max(l.size, h);
}

function drawText(ctx: CanvasRenderingContext2D, l: TextLayer) {
  ctx.save();
  ctx.translate(l.x + l.w / 2, l.y + l.h / 2);
  ctx.rotate((l.rotation * Math.PI) / 180);
  ctx.translate(-l.w / 2, -l.h / 2);
  const { lines, lineH, pad } = layoutText(ctx, l);
  ctx.textBaseline = 'middle';
  ctx.textAlign = l.align;
  const tx = l.align === 'left' ? pad : l.align === 'right' ? l.w - pad : l.w / 2;

  if (l.bg) {
    const widest = Math.min(l.w, Math.max(...lines.map((s) => ctx.measureText(s).width)) + pad * 2);
    const bx = l.align === 'left' ? 0 : l.align === 'right' ? l.w - widest : (l.w - widest) / 2;
    ctx.fillStyle = l.bg;
    roundRect(ctx, bx, 0, widest, lines.length * lineH + pad * 2, lineH / 2 + pad);
    ctx.fill();
  }

  lines.forEach((line, i) => {
    const y = pad + lineH * i + lineH / 2;
    if (l.outline) {
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(2, l.size * 0.1);
      ctx.strokeStyle = l.color.toLowerCase() === '#111111' || l.color.toLowerCase() === '#000000' ? '#ffffff' : '#111111';
      ctx.strokeText(line, tx, y);
    }
    ctx.save();
    if (l.glow) {
      ctx.shadowColor = l.color;
      ctx.shadowBlur = l.size * 0.35;
    } else if (l.shadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = l.size * 0.25;
      ctx.shadowOffsetY = l.size * 0.05;
    }
    ctx.fillStyle = l.color;
    ctx.fillText(line, tx, y);
    ctx.restore();
  });
  ctx.restore();
}

function drawWatermark(ctx: CanvasRenderingContext2D, p: CollageProject) {
  const n = panelCount(p.format, p.panels);
  const pw = p.width / n;
  ctx.save();
  ctx.font = `700 26px -apple-system, "SF Pro Display", Inter, system-ui, sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < n; i++) {
    const text = 'made with ShotList';
    const w = ctx.measureText(text).width + 32;
    const x = i * pw + pw - 28 - w;
    const y = p.height - 28 - 44;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    roundRect(ctx, x, y, w, 44, 22);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillText(text, x + w - 16, y + 23);
  }
  ctx.restore();
}

/** Draws the whole collage in canvas pixel coordinates (callers set the transform). */
export function renderCollage(ctx: CanvasRenderingContext2D, p: CollageProject, sources: SourceProvider, opts: RenderOptions = {}) {
  ctx.save();
  drawBackground(ctx, p, sources);
  if (p.style.decor === 'sprockets') drawSprockets(ctx, p);
  let photoIndex = 0;
  p.layers.forEach((l: Layer) => {
    if (l.type === 'photo') drawPhoto(ctx, l, p, sources, opts, photoIndex++);
    else drawText(ctx, l);
  });
  if (opts.watermark) drawWatermark(ctx, p);
  ctx.restore();
}

/** Point-in-layer test in canvas coordinates (handles rotation). */
export function hitLayer(p: CollageProject, x: number, y: number): Layer | undefined {
  for (let i = p.layers.length - 1; i >= 0; i--) {
    const l = p.layers[i];
    const r = l.type === 'photo' ? frameRect(l, p) : l;
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const a = (-l.rotation * Math.PI) / 180;
    const lx = Math.cos(a) * (x - cx) - Math.sin(a) * (y - cy);
    const ly = Math.sin(a) * (x - cx) + Math.cos(a) * (y - cy);
    if (Math.abs(lx) <= r.w / 2 && Math.abs(ly) <= r.h / 2) return l;
  }
  return undefined;
}

/** A provider with no images (template thumbnails). */
export const emptyProvider: SourceProvider = { photo: () => undefined, blur: () => undefined };
