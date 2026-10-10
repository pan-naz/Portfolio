/** WCAG contrast, compositing alpha foreground tokens over an opaque surface. */
export function contrastRatio(foreground: string, background: string): number {
  const parse = (color: string): number[] => {
    const value = color.trim();
    if (/^#[\da-f]{6}$/i.test(value)) return [...value.slice(1).match(/../g)!.map(c => parseInt(c, 16)), 1];
    const rgb = value.match(/^rgb\(\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)(?:\s*\/\s*(\d*\.?\d+))?\s*\)$/i);
    if (rgb) {
      const channels = rgb.slice(1, 4).map(Number), alpha = rgb[4] === undefined ? 1 : Number(rgb[4]);
      if (channels.every(c => c >= 0 && c <= 255) && alpha >= 0 && alpha <= 1) return [...channels, alpha];
    }
    throw new Error(`Unsupported sRGB color: ${color}`);
  };
  const fg = parse(foreground), bg = parse(background);
  if (bg[3] !== 1) throw new Error('Contrast requires an opaque background');
  const luminance = (channels: number[]) => {
    const [r, g, b] = channels.slice(0, 3).map(channel => {
      const value = channel / 255;
      return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
    });
    return .2126 * r + .7152 * g + .0722 * b;
  };
  const a = luminance(fg.slice(0, 3).map((c, i) => c * fg[3] + bg[i] * (1 - fg[3])));
  const b = luminance(bg);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}

export const passesNormalTextAA = (ratio: number) => ratio >= 4.5;
