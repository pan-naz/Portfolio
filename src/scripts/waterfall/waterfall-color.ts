// One shared entrance clock colors the whole cursor region, not each symbol.
export const accentDurationSeconds = 2;
export const accentBlendSteps = 128;
export const trailShadeSteps = 64;
// Preserve the accepted light leader/tail appearance using opaque RGB shades.
export const maximumTrailStrength = .32;
export const trailShadeIndex = (strength: number) => Math.round(Math.min(1, Math.max(0, strength / maximumTrailStrength)) * trailShadeSteps);
export function accentProgress(elapsed: number) {
  const progress = Math.min(1, Math.max(0, elapsed / accentDurationSeconds));
  return progress * progress * (3 - 2 * progress);
}
export interface AccentState { accent: number; accentExitFrom: number; accentExitElapsed: number; }
export function updateParticleAccent(state: AccentState, inside: boolean, groupAccent: number, delta: number) {
  if (inside) {
    state.accent = groupAccent;
    state.accentExitFrom = groupAccent;
    state.accentExitElapsed = 0;
  } else {
    state.accentExitElapsed = Math.min(accentDurationSeconds, state.accentExitElapsed + Math.max(0, delta));
    state.accent = state.accentExitFrom * (1 - accentProgress(state.accentExitElapsed));
  }
}

export function createAccentPalette(ink: string, activeInk: string, background: string) {
  const channels = (value: string, fallback: string) => {
    const hex = /^#[0-9a-f]{6}$/i.test(value) ? value.slice(1) : fallback;
    return [0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
  };
  const from = channels(ink, '111111');
  const to = channels(activeInk, '171716');
  const canvas = channels(background, 'faf8f7');
  // Precompose quiet gray and active primary-ink tails into the theme background.
  // The hot loop only selects a cached solid color; no per-icon alpha or RGB work.
  return Array.from({ length: (trailShadeSteps + 1) * (accentBlendSteps + 1) }, (_, index) => {
    const blend = (index % (accentBlendSteps + 1)) / accentBlendSteps;
    const trail = Math.floor(index / (accentBlendSteps + 1)) / trailShadeSteps;
    return `rgb(${from.map((channel, i) => {
      const quiet = (channel - canvas[i]) * maximumTrailStrength;
      const active = to[i] - canvas[i];
      return Math.round(canvas[i] + (quiet + (active - quiet) * blend) * trail);
    }).join(',')})`;
  });
}
