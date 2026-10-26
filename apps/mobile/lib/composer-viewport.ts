/** Keep message input, completion choices and send action usable on short screens. */
export function composerViewport(windowHeight: number, fontScale: number) {
  const height = Number.isFinite(windowHeight) && windowHeight > 0 ? windowHeight : 640;
  const scaledLine = 22 * fontScale;
  const compact = Math.max(scaledLine, Math.min(110 * fontScale, height * 0.21));
  return {
    compactInputHeight: compact,
    expandedInputHeight: Math.max(compact, Math.min(340 * fontScale, height * 0.42)),
    suggestionHeight: Math.max(72, Math.min(224, height * 0.26)),
  };
}
