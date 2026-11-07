export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const formatRange = ([a, b]: [number, number]) => (a === b ? `${a}s` : `${a}–${b}s`);

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB'];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`;
}

export const spring = { type: 'spring' as const, stiffness: 300, damping: 30 };
