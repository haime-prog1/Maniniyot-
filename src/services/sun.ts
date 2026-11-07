/**
 * Offline sun-position maths (the standard NOAA / astronomical-almanac approach).
 * No network: everything is computed on the device from latitude, longitude and date.
 */
const rad = Math.PI / 180;
const dayMs = 86400000;
const J1970 = 2440588;
const J2000 = 2451545;
const obliquity = rad * 23.4397;
const J0 = 0.0009;

const toJulian = (d: Date) => d.valueOf() / dayMs - 0.5 + J1970;
const fromJulian = (j: number) => new Date((j + 0.5 - J1970) * dayMs);
const toDays = (d: Date) => toJulian(d) - J2000;
const declination = (l: number) => Math.asin(Math.sin(obliquity) * Math.sin(l));
const meanAnomaly = (d: number) => rad * (357.5291 + 0.98560028 * d);
const eclipticLongitude = (M: number) => {
  const C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  return M + C + rad * 102.9372 + Math.PI;
};
const julianCycle = (d: number, lw: number) => Math.round(d - J0 - lw / (2 * Math.PI));
const approxTransit = (ht: number, lw: number, n: number) => J0 + (ht + lw) / (2 * Math.PI) + n;
const solarTransitJ = (ds: number, M: number, L: number) => J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
const hourAngle = (h: number, phi: number, dec: number) =>
  Math.acos((Math.sin(h) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec)));

export interface SunTimes {
  dawn: Date; // sun at -6° (blue hour starts)
  morningBlueEnd: Date; // -4°: morning golden hour starts
  sunrise: Date;
  morningGoldenEnd: Date; // +6°
  noon: Date;
  eveningGoldenStart: Date; // +6°
  sunset: Date;
  eveningBlueStart: Date; // -4°: golden hour ends, blue hour begins
  dusk: Date; // -6°
}

/** Sun times for the local calendar day `dateISO` (YYYY-MM-DD) at a location. */
export function sunTimes(dateISO: string, lat: number, lng: number): SunTimes {
  const [y, m, d] = dateISO.split('-').map(Number);
  // Local solar noon of that calendar day, so the Julian cycle lands on the right day.
  const date = new Date(Date.UTC(y, m - 1, d, 12) - (lng / 15) * 3600000);
  const lw = rad * -lng;
  const phi = rad * lat;
  const n = julianCycle(toDays(date), lw);
  const ds = approxTransit(0, lw, n);
  const M = meanAnomaly(ds);
  const L = eclipticLongitude(M);
  const dec = declination(L);
  const Jnoon = solarTransitJ(ds, M, L);

  const at = (angle: number) => {
    const Jset = solarTransitJ(approxTransit(hourAngle(angle * rad, phi, dec), lw, n), M, L);
    return { rise: fromJulian(Jnoon - (Jset - Jnoon)), set: fromJulian(Jset) };
  };
  const sun = at(-0.833);
  const golden = at(6);
  const blue = at(-4);
  const civil = at(-6);
  return {
    dawn: civil.rise,
    morningBlueEnd: blue.rise,
    sunrise: sun.rise,
    morningGoldenEnd: golden.rise,
    noon: fromJulian(Jnoon),
    eveningGoldenStart: golden.set,
    sunset: sun.set,
    eveningBlueStart: blue.set,
    dusk: civil.set,
  };
}

export const formatTime = (d: Date, timeZone?: string) =>
  new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone }).format(d);

export const formatRange = (a: Date, b: Date, timeZone?: string) => `${formatTime(a, timeZone)}–${formatTime(b, timeZone)}`;

/** Today's date (YYYY-MM-DD) in a given time zone. */
export function todayISO(timeZone?: string) {
  const parts = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone }).format(new Date());
  return parts; // en-CA formats as YYYY-MM-DD
}

export function countdownLabel(ms: number) {
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  return `${h}h ${mins % 60}m`;
}
