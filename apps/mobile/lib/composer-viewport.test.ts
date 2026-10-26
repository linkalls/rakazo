import { describe, expect, it } from "vitest";
import { composerViewport } from "./composer-viewport";

describe("responsive chat editor", () => {
  it.each([320, 360, 600, 820, 1200])("bounds suggestions on a %d pt screen", (height) => {
    const viewport = composerViewport(height, 1);
    expect(viewport.suggestionHeight).toBeGreaterThanOrEqual(72);
    expect(viewport.suggestionHeight).toBeLessThanOrEqual(224);
    expect(viewport.compactInputHeight).toBeLessThanOrEqual(height * 0.21);
    expect(viewport.expandedInputHeight).toBeGreaterThanOrEqual(viewport.compactInputHeight);
    expect(viewport.expandedInputHeight).toBeLessThanOrEqual(height * 0.42);
  });
  it("respects enlarged accessible type without making the input smaller than a line", () => {
    const viewport = composerViewport(340, 3.2);
    expect(viewport.compactInputHeight).toBeGreaterThanOrEqual(22 * 3.2);
    expect(viewport.expandedInputHeight).toBeGreaterThanOrEqual(viewport.compactInputHeight);
  });
  it("handles temporarily invalid window dimensions during rotation", () => {
    expect(composerViewport(0, 1)).toEqual(composerViewport(640, 1));
  });
});
