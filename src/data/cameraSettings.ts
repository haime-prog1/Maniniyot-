import type { Shot } from '../types';

/** Camera settings recommendations derived from the shot's movement and angle. */
export function cameraSettingsFor(shot: Pick<Shot, 'movement' | 'angle'>): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  switch (shot.movement) {
    case 'Slow-mo':
      rows.push({ label: 'Mode', value: 'Slo-mo 1080p at 120/240 fps, or 4K 60 fps' });
      break;
    case 'Hyperlapse':
      rows.push({ label: 'Mode', value: 'Time-lapse, with the phone on a mount or tripod' });
      break;
    case 'Walk-forward':
    case 'Orbit':
      rows.push({ label: 'Mode', value: '4K 60 fps with Action Mode or stabilisation on' });
      break;
    default:
      rows.push({ label: 'Mode', value: '4K 30 fps (60 fps if you may slow it down)' });
  }
  rows.push({ label: 'Lens', value: shot.angle === 'Wide' ? '0.5x ultra-wide or 1x' : shot.angle === 'Close-up' ? '2x or 1x up close' : '1x main' });
  rows.push({ label: 'Exposure', value: 'Tap and hold to lock AE/AF, then drag the sun icon down slightly' });
  rows.push({ label: 'Orientation', value: 'Vertical 9:16 for Reels and TikTok' });
  return rows;
}
