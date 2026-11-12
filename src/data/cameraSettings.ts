import type { CameraPref, Shot } from '../types';

type Row = { label: string; value: string };
type ShotLike = Pick<Shot, 'movement' | 'angle' | 'phase'>;

export const CAMERAS: { value: CameraPref; label: string }[] = [
  { value: 'phone', label: 'iPhone' },
  { value: 'acepro2', label: 'Ace Pro 2' },
];

export const cameraLabel = (c: CameraPref) => (c === 'acepro2' ? 'Insta360 Ace Pro 2' : 'iPhone');

/** Camera settings recommendations for a shot, for the user's camera. */
export function cameraSettingsFor(shot: ShotLike, camera: CameraPref = 'phone'): Row[] {
  return camera === 'acepro2' ? acePro2Settings(shot) : phoneSettings(shot);
}

function phoneSettings(shot: ShotLike): Row[] {
  const rows: Row[] = [];
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

/**
 * Insta360 Ace Pro 2. Mode names follow the camera's menus (Video, Slow Motion,
 * PureVideo, FreeFrame, TimeShift, Timelapse); exact options can vary by firmware.
 */
function acePro2Settings(shot: ShotLike): Row[] {
  const lowLight = shot.phase === 'night';
  const rows: Row[] = [];

  if (shot.movement === 'Slow-mo') {
    rows.push({ label: 'Mode', value: 'Slow Motion at 4K 120 fps (1080p 240 fps for extra slow)' });
  } else if (shot.movement === 'Hyperlapse') {
    rows.push({
      label: 'Mode',
      value: shot.angle === 'Wide' && shot.phase === 'golden' ? 'Timelapse on a tripod or clamp' : 'TimeShift if you are moving, Timelapse if the camera stays still',
    });
  } else if (lowLight) {
    rows.push({ label: 'Mode', value: 'PureVideo at 4K 30 fps, made for low light' });
  } else if (shot.movement === 'Static' && shot.angle === 'Wide') {
    rows.push({ label: 'Mode', value: 'Video at 4K 30 fps with Active HDR (8K 30 fps if you want to crop later)' });
  } else {
    rows.push({ label: 'Mode', value: 'Video at 4K 60 fps with Active HDR' });
  }

  rows.push({
    label: 'Stabilisation',
    value:
      shot.movement === 'Static' || shot.movement === 'Hyperlapse'
        ? 'FlowState on Standard. Use a mount or tripod if you can'
        : shot.movement === 'Orbit' || shot.movement === 'Walk-forward'
          ? 'FlowState on High, with Horizon Lock on'
          : 'FlowState on Standard',
  });

  rows.push({
    label: 'Field of view',
    value:
      shot.angle === 'POV'
        ? 'ActionView or UltraWide for an immersive POV'
        : shot.angle === 'Wide'
          ? 'UltraWide. Switch to Dewarp if the horizon looks bent'
          : shot.angle === 'Close-up'
            ? 'Linear, or 2x Clarity Zoom. Do not get too close: the focus is fixed'
            : 'Dewarp or Linear so people look natural',
  });

  rows.push({
    label: 'Mounting',
    value:
      shot.angle === 'POV'
        ? 'Chest or bite mount, or hold it at chest height'
        : shot.angle === 'Overhead'
          ? 'Selfie stick held straight up, lens pointing down'
          : shot.angle === 'Low angle'
            ? 'Set it on the ground, or flip the selfie stick upside down'
            : shot.movement === 'Static' || shot.movement === 'Hyperlapse'
              ? 'Mini tripod or magnetic mount'
              : 'Selfie stick. Flip the screen up to frame yourself',
  });

  rows.push({
    label: 'Orientation',
    value: 'Turn the camera vertical for 9:16, or shoot FreeFrame and pick the ratio in the Insta360 app',
  });
  if (lowLight) rows.push({ label: 'Tip', value: 'Keep movements slow at night to avoid motion blur' });
  return rows;
}
