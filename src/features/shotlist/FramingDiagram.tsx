import type { Angle, Movement } from '../../types';
import { cn } from '../../lib/utils';

interface Props {
  angle: Angle;
  movement: Movement;
  /** Ghost mode: subtle white strokes, no frame, used over the live camera. */
  ghost?: boolean;
  className?: string;
}

/** A 9:16 framing guide: rule-of-thirds grid, subject placement and a movement arrow. */
export function FramingDiagram({ angle, movement, ghost, className }: Props) {
  const W = 90;
  const H = 160;
  const stroke = ghost ? 'white' : 'currentColor';
  const subject = 'rgba(255,138,61,0.85)';

  const figure = (() => {
    switch (angle) {
      case 'POV':
        return (
          <g fill={ghost ? 'none' : subject} stroke={ghost ? stroke : 'none'} strokeWidth={1.5}>
            <ellipse cx={30} cy={150} rx={12} ry={18} />
            <ellipse cx={60} cy={150} rx={12} ry={18} />
          </g>
        );
      case 'Low angle':
        return (
          <g fill={ghost ? 'none' : subject} stroke={ghost ? stroke : 'none'} strokeWidth={1.5}>
            <circle cx={60} cy={50} r={8} />
            <path d="M48 62 h24 l8 98 h-40 z" />
          </g>
        );
      case 'Wide':
        return (
          <g fill={ghost ? 'none' : subject} stroke={ghost ? stroke : 'none'} strokeWidth={1.5}>
            <circle cx={60} cy={96} r={3.5} />
            <rect x={56} y={100} width={8} height={14} rx={2} />
          </g>
        );
      case 'Close-up':
        return <circle cx={45} cy={70} r={26} fill={ghost ? 'none' : subject} stroke={ghost ? stroke : 'none'} strokeWidth={1.5} />;
      case 'Overhead':
        return (
          <g fill="none" stroke={ghost ? stroke : subject} strokeWidth={2}>
            <rect x={14} y={42} width={62} height={76} rx={8} />
            <circle cx={32} cy={64} r={8} />
            <circle cx={58} cy={70} r={10} />
            <circle cx={40} cy={98} r={9} />
          </g>
        );
      default:
        return (
          <g fill={ghost ? 'none' : subject} stroke={ghost ? stroke : 'none'} strokeWidth={1.5}>
            <circle cx={30} cy={58} r={11} />
            <path d="M14 76 h32 l6 84 h-44 z" />
          </g>
        );
    }
  })();

  const arrow = (() => {
    const a = { stroke, strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, opacity: 0.9 };
    switch (movement) {
      case 'Pan':
        return <path d="M20 30 H70 M62 24 L70 30 L62 36" {...a} />;
      case 'Tilt':
        return <path d="M80 120 V40 M74 48 L80 40 L86 48" {...a} />;
      case 'Walk-forward':
        return <path d="M35 34 L45 24 L55 34 M35 44 L45 34 L55 44" {...a} />;
      case 'Orbit':
        return <path d="M18 30 A27 9 0 1 0 72 30 M66 23 L72 30 L64 34" {...a} />;
      case 'Hyperlapse':
        return <path d="M18 30 H70 M62 24 L70 30 L62 36" {...a} strokeDasharray="4 4" />;
      case 'Slow-mo':
        return (
          <text x={45} y={32} textAnchor="middle" fontSize={10} fontWeight={700} fill={stroke}>
            SLO-MO
          </text>
        );
      default:
        return null;
    }
  })();

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cn(className)}
      role="img"
      aria-label={`Framing guide: ${angle}, ${movement}. Place the subject on the rule-of-thirds lines.`}
    >
      {!ghost && <rect x={0.5} y={0.5} width={W - 1} height={H - 1} rx={10} fill="currentColor" fillOpacity={0.06} stroke="currentColor" strokeOpacity={0.25} />}
      <g stroke={stroke} strokeOpacity={ghost ? 0.5 : 0.3} strokeWidth={0.8}>
        <line x1={W / 3} y1={0} x2={W / 3} y2={H} />
        <line x1={(2 * W) / 3} y1={0} x2={(2 * W) / 3} y2={H} />
        <line x1={0} y1={H / 3} x2={W} y2={H / 3} />
        <line x1={0} y1={(2 * H) / 3} x2={W} y2={(2 * H) / 3} />
      </g>
      {angle === 'Wide' && <line x1={0} y1={(2 * H) / 3} x2={W} y2={(2 * H) / 3} stroke={stroke} strokeWidth={1.4} strokeOpacity={0.7} />}
      <g opacity={ghost ? 0.7 : 1}>{figure}</g>
      {arrow}
    </svg>
  );
}
