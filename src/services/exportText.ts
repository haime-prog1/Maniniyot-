import { PHASES, styleLabel, tripLabel } from '../data/options';
import { formatRange } from '../lib/utils';
import type { ShotList } from '../types';

export function shotListToText(list: ShotList): string {
  const shots = list.shots.filter((s) => !s.skipped).sort((a, b) => a.order - b.order);
  const lines = [
    `ShotList: ${list.destinationName}`,
    `${styleLabel(list.style)} · ${tripLabel(list.tripType)} · ${list.targetLength}s reel`,
    `${shots.filter((s) => s.captured).length}/${shots.length} captured`,
    '',
  ];
  let n = 0;
  for (const p of PHASES) {
    const inPhase = shots.filter((s) => s.phase === p.id);
    if (!inPhase.length) continue;
    lines.push(`— ${p.label.toUpperCase()} —`);
    for (const s of inPhase) {
      n++;
      lines.push(`${s.captured ? '☑' : '☐'} ${n}. ${s.title} (${formatRange(s.durationSec)} · ${s.angle} · ${s.movement})`);
      lines.push(`   ${s.description}`);
      lines.push(`   Tip: ${s.tip}`);
      if (s.transition) lines.push(`   Transition: ${s.transition}`);
      if (s.notes) lines.push(`   Notes: ${s.notes}`);
    }
    lines.push('');
  }
  return lines.join('\n').trim();
}
