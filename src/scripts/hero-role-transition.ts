import { createNativeMotion, revealEffects, type MotionEffect } from './native-motion.ts';

interface RoleLayer {
  phrase: HTMLElement;
  letters: HTMLElement[];
}

interface RoleMotionOptions {
  hold: number;
  exit: number;
  enter: number;
  stagger: number;
  distance: number;
  ease: string;
}

/** Use the same per-letter fade-and-rise recipe as every other title. */
export function roleRevealEffects(role: RoleLayer, options: RoleMotionOptions, delay = 0): MotionEffect[] {
  return [{
    element: role.phrase,
    // Expose the incoming phrase without moving its wrapper. Each glyph owns
    // its rise, including on later cycles after the phrase has faded out.
    keyframes: [
      { opacity: 1, transform: 'none' },
      { opacity: 1, transform: 'none' },
    ],
    duration: options.enter + Math.max(0, role.letters.length - 1) * options.stagger,
    delay, easing: options.ease,
  }, ...revealEffects(role.letters, {
    duration: options.enter, delay, stagger: options.stagger,
    distance: options.distance, easing: options.ease,
  })];
}

/** The initial reveal belongs to the intro; this controller only advances settled roles. */
export function createRoleAnimator(roles: RoleLayer[], options: RoleMotionOptions) {
  let motion: ReturnType<typeof createNativeMotion> | undefined;
  let index = 0;
  let paused = false;
  let disposed = false;
  let started = false;
  roles.forEach(({ phrase, letters }) => {
    phrase.style.opacity = '0';
    phrase.style.transform = 'translate3d(0px, 0px, 0px)';
    letters.forEach(letter => { letter.style.opacity = '0'; });
  });
  const fadeAfterHold = () => {
    if (disposed) return;
    motion = createNativeMotion([{
      element: roles[index].phrase,
      keyframes: [{ opacity: 1 }, { opacity: 0 }],
      delay: options.hold, duration: options.exit, easing: 'cubic-bezier(.37, 0, .63, 1)',
    }], { paused, onComplete: () => {
      if (disposed) return;
      index = (index + 1) % roles.length;
      motion = createNativeMotion(roleRevealEffects(roles[index], options), {
        paused, onComplete: fadeAfterHold,
      });
    } });
  };
  return {
    startCycling() {
      if (disposed || started || typeof roles[0].phrase.animate !== 'function') return;
      started = true;
      fadeAfterHold();
    },
    setPaused(value: boolean) { paused = value; motion?.setPaused(value); },
    destroy() { disposed = true; motion?.cancel(); },
  };
}
