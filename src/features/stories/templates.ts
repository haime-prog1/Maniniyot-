/** Canvas renderers for 9:16 Story templates (1080×1920). Everything renders on-device. */

export const W = 1080;
export const H = 1920;

export interface Frame {
  src: CanvasImageSource;
  w: number;
  h: number;
}

export interface StoryData {
  title: string;
  subtitle: string;
  destination: string;
  dateLabel: string;
  gradient: string[];
  frames: Frame[];
  shots: { title: string; captured: boolean }[];
  captured: number;
  total: number;
  countdownDays: number | null;
  goldenLabel?: string;
}

export type TemplateId = 'myday' | 'checklist' | 'dump' | 'film' | 'countdown' | 'golden';

export const TEMPLATES: { id: TemplateId; label: string; emoji: string }[] = [
  { id: 'myday', label: 'My Day', emoji: '☀️' },
  { id: 'dump', label: 'Photo Dump', emoji: '📸' },
  { id: 'film', label: 'Film Strip', emoji: '🎞️' },
  { id: 'checklist', label: 'Shot Checklist', emoji: '✅' },
  { id: 'countdown', label: 'Countdown', emoji: '✈️' },
  { id: 'golden', label: 'Golden Hour', emoji: '🌅' },
];

const IG = ['#feda75', '#fa7e1e', '#d62976', '#962fbf', '#4f5bd5'];
const FONT = '-apple-system, "SF Pro Display", Inter, system-ui, sans-serif';

const font = (ctx: CanvasRenderingContext2D, size: number, weight = 700, italic = false) =>
  (ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${FONT}`);

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function linear(ctx: CanvasRenderingContext2D, colors: string[], x0 = 0, y0 = 0, x1 = W, y1 = H) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  colors.forEach((c, i) => g.addColorStop(colors.length === 1 ? 0 : i / (colors.length - 1), c));
  return g;
}

/** Draw a frame with object-fit: cover into a (rounded) box. Falls back to a gradient. */
function cover(ctx: CanvasRenderingContext2D, f: Frame | undefined, x: number, y: number, w: number, h: number, r: number, fallback: string[]) {
  ctx.save();
  rr(ctx, x, y, w, h, r);
  ctx.clip();
  if (f) {
    const s = Math.max(w / f.w, h / f.h);
    const dw = f.w * s;
    const dh = f.h * s;
    ctx.drawImage(f.src, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = linear(ctx, fallback, x, y, x + w, y + h);
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(x + w * 0.72, y + h * 0.3, Math.min(w, h) * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number, maxLines = 3) {
  const words = text.split(/\s+/);
  let line = '';
  let lines = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width > maxW && line) {
      if (lines === maxLines - 1) {
        ctx.fillText(`${line}…`, x, y + lines * lh);
        return lines + 1;
      }
      ctx.fillText(line, x, y + lines * lh);
      line = words[i];
      lines++;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, y + lines * lh);
  return lines + 1;
}

/** Truncate with an ellipsis so text never gets squashed. */
function fit(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}

function pill(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, bg: string | CanvasGradient, color: string, align: 'left' | 'center' = 'left') {
  font(ctx, size, 700);
  const w = ctx.measureText(text).width + size * 1.4;
  const h = size * 1.9;
  const left = align === 'center' ? x - w / 2 : x;
  ctx.fillStyle = bg;
  rr(ctx, left, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, left + size * 0.7, y + h / 2 + 1);
  ctx.textBaseline = 'alphabetic';
  return w;
}

function watermark(ctx: CanvasRenderingContext2D, color = 'rgba(255,255,255,0.75)') {
  font(ctx, 30, 600);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText('made with ShotList', W / 2, H - 70);
  ctx.textAlign = 'left';
}

function shadowText(ctx: CanvasRenderingContext2D, on: boolean) {
  ctx.shadowColor = on ? 'rgba(0,0,0,0.45)' : 'transparent';
  ctx.shadowBlur = on ? 24 : 0;
  ctx.shadowOffsetY = on ? 4 : 0;
}

const renderers: Record<TemplateId, (ctx: CanvasRenderingContext2D, d: StoryData) => void> = {
  myday(ctx, d) {
    cover(ctx, d.frames[0], 0, 0, W, H, 0, d.gradient);
    const top = ctx.createLinearGradient(0, 0, 0, 520);
    top.addColorStop(0, 'rgba(0,0,0,0.45)');
    top.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, W, 520);
    const bottom = ctx.createLinearGradient(0, H - 900, 0, H);
    bottom.addColorStop(0, 'rgba(0,0,0,0)');
    bottom.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = bottom;
    ctx.fillRect(0, H - 900, W, 900);

    pill(ctx, 'MY DAY', 80, 170, 40, linear(ctx, IG, 80, 0, 380, 0), '#fff');
    font(ctx, 38, 600);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillText(d.dateLabel, 80, 300);

    shadowText(ctx, true);
    ctx.fillStyle = '#fff';
    font(ctx, 112, 800);
    const lines = wrap(ctx, d.title, 80, H - 680, W - 160, 120, 2);
    font(ctx, 46, 500);
    wrap(ctx, d.subtitle, 80, H - 680 + lines * 120 + 10, W - 160, 58, 2);
    shadowText(ctx, false);
    pill(ctx, `📍 ${d.destination}`, 80, H - 260, 40, 'rgba(255,255,255,0.92)', '#111');
    watermark(ctx);
  },

  dump(ctx, d) {
    ctx.fillStyle = '#f7f3ee';
    ctx.fillRect(0, 0, W, H);
    font(ctx, 96, 800, true);
    ctx.fillStyle = '#111';
    ctx.fillText(d.title, 80, 240, W - 160);
    font(ctx, 40, 500);
    ctx.fillStyle = '#555';
    ctx.fillText(`${d.destination} · ${d.dateLabel}`, 84, 310, W - 160);

    const slots = [
      { x: 90, y: 400, r: -3 },
      { x: 560, y: 450, r: 4 },
      { x: 110, y: 1010, r: 3 },
      { x: 570, y: 1050, r: -4 },
    ];
    slots.forEach((s, i) => {
      ctx.save();
      ctx.translate(s.x + 215, s.y + 270);
      ctx.rotate((s.r * Math.PI) / 180);
      ctx.shadowColor = 'rgba(0,0,0,0.18)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = '#fff';
      ctx.fillRect(-215, -270, 430, 560);
      ctx.shadowColor = 'transparent';
      cover(ctx, d.frames[i], -190, -245, 380, 450, 4, i % 2 ? [IG[2], IG[3]] : d.gradient);
      ctx.restore();
    });
    font(ctx, 44, 600, true);
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText(d.subtitle, W / 2, H - 210, W - 160);
    ctx.textAlign = 'left';
    watermark(ctx, 'rgba(0,0,0,0.4)');
  },

  film(ctx, d) {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, W, H);
    const stripX = 150;
    const stripW = W - 300;
    ctx.fillStyle = '#1d1a17';
    ctx.fillRect(stripX, 0, stripW, H);
    ctx.fillStyle = '#111';
    for (let y = 20; y < H; y += 70) {
      rr(ctx, stripX + 22, y, 34, 44, 6);
      ctx.fill();
      rr(ctx, stripX + stripW - 56, y, 34, 44, 6);
      ctx.fill();
    }
    const fx = stripX + 90;
    const fw = stripW - 180;
    const fh = 470;
    [0, 1, 2].forEach((i) => cover(ctx, d.frames[i], fx, 120 + i * (fh + 50), fw, fh, 6, i === 1 ? [IG[1], IG[2]] : d.gradient));
    font(ctx, 44, 700);
    ctx.fillStyle = '#ffb347';
    ctx.textAlign = 'right';
    ctx.fillText(d.dateLabel.toUpperCase(), fx + fw - 20, 120 + fh - 30);
    ctx.textAlign = 'center';
    font(ctx, 84, 800);
    ctx.fillStyle = '#fff';
    ctx.fillText(d.title, W / 2, H - 170, W - 120);
    font(ctx, 38, 500);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText(d.subtitle, W / 2, H - 110, W - 120);
    ctx.textAlign = 'left';
  },

  checklist(ctx, d) {
    ctx.fillStyle = linear(ctx, IG);
    ctx.fillRect(0, 0, W, H);
    const cx = 80;
    const cw = W - 160;
    ctx.fillStyle = 'rgba(255,255,255,0.94)';
    rr(ctx, cx, 260, cw, 1400, 56);
    ctx.fill();
    font(ctx, 72, 800);
    ctx.fillStyle = '#111';
    ctx.fillText(fit(ctx, d.title, cw - 140), cx + 70, 400);
    font(ctx, 40, 500);
    ctx.fillStyle = '#666';
    ctx.fillText(fit(ctx, `${d.destination} · ${d.captured}/${d.total} shots captured`, cw - 140), cx + 70, 470);
    // progress bar
    ctx.fillStyle = '#eee';
    rr(ctx, cx + 70, 510, cw - 140, 22, 11);
    ctx.fill();
    ctx.fillStyle = linear(ctx, IG, cx + 70, 0, cx + cw - 70, 0);
    rr(ctx, cx + 70, 510, Math.max(22, (cw - 140) * (d.total ? d.captured / d.total : 0)), 22, 11);
    ctx.fill();

    d.shots.slice(0, 11).forEach((s, i) => {
      const y = 620 + i * 92;
      ctx.beginPath();
      ctx.arc(cx + 100, y - 14, 26, 0, Math.PI * 2);
      if (s.captured) {
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx + 88, y - 14);
        ctx.lineTo(cx + 97, y - 4);
        ctx.lineTo(cx + 114, y - 25);
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 5;
        ctx.stroke();
      }
      font(ctx, 40, s.captured ? 500 : 600);
      ctx.fillStyle = s.captured ? '#999' : '#111';
      ctx.fillText(fit(ctx, s.title, cw - 220), cx + 150, y);
    });
    font(ctx, 40, 600);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(d.subtitle, W / 2, 1760, W - 160);
    ctx.textAlign = 'left';
    watermark(ctx);
  },

  countdown(ctx, d) {
    cover(ctx, d.frames[0], 0, 0, W, H, 0, d.gradient);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.arc(W / 2, 820, 330, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = linear(ctx, IG, W / 2 - 330, 0, W / 2 + 330, 0);
    ctx.lineWidth = 18;
    ctx.stroke();
    shadowText(ctx, true);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    const days = d.countdownDays;
    font(ctx, days !== null && days >= 100 ? 220 : 300, 800);
    ctx.fillText(days === null ? '✈️' : days <= 0 ? '🎉' : String(days), W / 2, 920);
    font(ctx, 64, 700);
    ctx.fillText(
      days === null ? `Next stop: ${d.destination}` : days <= 0 ? `It's ${d.destination} day!` : `${days === 1 ? 'day' : 'days'} to ${d.destination}`,
      W / 2,
      1270,
      W - 160,
    );
    font(ctx, 46, 500);
    ctx.fillText(d.title, W / 2, 1360, W - 160);
    font(ctx, 38, 500);
    ctx.fillText(d.subtitle, W / 2, 1430, W - 160);
    shadowText(ctx, false);
    ctx.textAlign = 'left';
    watermark(ctx);
  },

  golden(ctx, d) {
    ctx.fillStyle = linear(ctx, ['#2b1055', '#d62976', '#fa7e1e', '#feda75'], 0, 0, 0, H);
    ctx.fillRect(0, 0, W, H);
    const sun = ctx.createRadialGradient(W / 2, 1150, 40, W / 2, 1150, 360);
    sun.addColorStop(0, 'rgba(255,245,200,1)');
    sun.addColorStop(0.5, 'rgba(255,200,120,0.7)');
    sun.addColorStop(1, 'rgba(255,170,90,0)');
    ctx.fillStyle = sun;
    ctx.beginPath();
    ctx.arc(W / 2, 1150, 360, 0, Math.PI * 2);
    ctx.fill();
    // water
    ctx.fillStyle = 'rgba(40,10,70,0.55)';
    ctx.fillRect(0, 1250, W, H - 1250);
    ctx.fillStyle = 'rgba(255,220,150,0.5)';
    for (let i = 0; i < 9; i++) {
      const w = 260 - i * 22;
      rr(ctx, W / 2 - w / 2, 1290 + i * 48, w, 10, 5);
      ctx.fill();
    }
    // a small photo, if there is one
    if (d.frames[0]) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 40;
      ctx.fillStyle = '#fff';
      rr(ctx, W - 430, 160, 340, 440, 24);
      ctx.fill();
      ctx.restore();
      cover(ctx, d.frames[0], W - 412, 178, 304, 404, 14, d.gradient);
    }
    ctx.fillStyle = '#fff';
    shadowText(ctx, true);
    font(ctx, 40, 700);
    ctx.fillText('GOLDEN HOUR', 80, 240);
    font(ctx, 110, 800);
    wrap(ctx, d.title, 80, 380, d.frames[0] ? 560 : W - 160, 118, 3);
    font(ctx, 52, 600);
    if (d.goldenLabel) ctx.fillText(d.goldenLabel, 80, 760);
    font(ctx, 40, 500);
    ctx.fillText(`📍 ${d.destination} · ${d.dateLabel}`, 80, 830, W - 160);
    font(ctx, 44, 500, true);
    ctx.textAlign = 'center';
    ctx.fillText(d.subtitle, W / 2, H - 200, W - 160);
    ctx.textAlign = 'left';
    shadowText(ctx, false);
    watermark(ctx);
  },
};

export function renderStory(canvas: HTMLCanvasElement, id: TemplateId, data: StoryData) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, W, H);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  renderers[id](ctx, data);
}
