/** Slowly drifting gradient blobs give the glass something to refract. */
export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="blob -left-[20vmax] -top-[18vmax] h-[60vmax] w-[60vmax] bg-orange-400" />
      <div className="blob -right-[22vmax] top-[25vh] h-[55vmax] w-[55vmax] bg-teal-400" />
      <div className="blob -bottom-[25vmax] left-[5vw] h-[60vmax] w-[60vmax] bg-blue-700" />
      <div className="absolute inset-0 bg-[var(--bg)] opacity-45 dark:opacity-55" />
    </div>
  );
}
