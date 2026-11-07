/** A soft Instagram-gradient glow behind the UI. It's GPU-composited, so it won't flicker on iOS. */
export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="bg-glow" />
    </div>
  );
}
