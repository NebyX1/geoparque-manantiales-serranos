/** Keep every window, including its close button, reachable after moving or resizing. */
export function clampPanel(
  x: number,
  y: number,
  width: number,
  height: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  return {
    x: Math.max(8, Math.min(Number.isFinite(x) ? x : 8, viewportWidth - width - 8)),
    y: Math.max(8, Math.min(Number.isFinite(y) ? y : 8, viewportHeight - height - 8)),
  };
}
