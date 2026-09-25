export interface MotionEffect {
  element: HTMLElement;
  keyframes: Keyframe[];
  duration: number;
  delay?: number;
  easing: string;
}

export interface RevealOptions {
  duration: number;
  delay?: number;
  stagger?: number;
  distance: number;
  easing: string;
}

/** CSS builds may shorten 900ms to .9s; the animation APIs always need milliseconds.
 * Unitless motion ratios/distances and the legacy unitless timings keep their values.
 */
export function readMotionToken(tokens: Pick<CSSStyleDeclaration, 'getPropertyValue'>, name: string): number {
  const value = tokens.getPropertyValue(name).trim();
  return parseFloat(value) * (value.endsWith('s') && !value.endsWith('ms') ? 1000 : 1);
}

/** Shared opacity-and-rise recipe for letters, lines, labels and controls. */
export function revealEffects(elements: HTMLElement[], options: RevealOptions): MotionEffect[] {
  return elements.map((element, index) => ({
    element,
    keyframes: [
      { opacity: 0, transform: `translateY(${options.distance}px)` },
      { opacity: 1, transform: 'translateY(0px)' },
    ],
    duration: options.duration,
    delay: (options.delay ?? 0) + index * (options.stagger ?? 0),
    easing: options.easing,
  }));
}

/** One browser clock and lifecycle. JavaScript writes styles only at endpoints. */
export function createNativeMotion(effects: MotionEffect[], options: { paused?: boolean; onComplete?: () => void } = {}) {
  let ended = false;
  let paused = options.paused ?? false;
  const animations = effects.map(({ element, keyframes, ...timing }) => {
    const animation = element.animate(keyframes, { ...timing, fill: 'both' });
    animation.pause();
    animation.currentTime = 0;
    return animation;
  });
  const leadIndex = effects.reduce((longest, effect, index) =>
    effect.duration + (effect.delay ?? 0) > effects[longest].duration + (effects[longest].delay ?? 0) ? index : longest, 0);
  const lead = animations[leadIndex];
  const cancel = () => {
    ended = true;
    for (const animation of animations) {
      animation.onfinish = null;
      animation.cancel();
    }
  };
  const finish = () => {
    if (ended) return;
    for (const { element, keyframes } of effects) {
      const last = keyframes[keyframes.length - 1];
      if (last.opacity !== undefined) element.style.opacity = String(last.opacity);
      if (last.transform !== undefined) element.style.transform = String(last.transform);
      if (last.borderRadius !== undefined) element.style.borderRadius = String(last.borderRadius);
    }
    // Commit endpoints before releasing effects; never flash back to initial styles.
    cancel();
    options.onComplete?.();
  };
  const play = () => {
    const now = effects[0]?.element.ownerDocument.timeline.currentTime;
    const elapsed = lead?.currentTime ?? 0;
    for (const animation of animations) {
      if (typeof now === 'number' && typeof elapsed === 'number') animation.startTime = now - elapsed;
      else animation.play();
    }
  };
  if (lead) {
    lead.onfinish = finish;
    if (!paused) play();
  }
  return {
    finish,
    cancel,
    setPaused(value: boolean) {
      if (ended || paused === value) return;
      paused = value;
      if (paused) animations.forEach(animation => animation.pause());
      else play();
    },
  };
}
