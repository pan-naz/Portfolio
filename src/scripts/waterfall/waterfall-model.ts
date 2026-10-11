// Stable per-column variation keeps resizing from reshuffling the whole field.
export const variation = (index: number, salt: number) => {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
};

export type Drop = { cycle: number; start: number; end: number; speed: number; tail: number };
const schedules = new Map<number, { time: number; height: number; nextStart: number; cycle: number; drops: Drop[] }>();

/** Reuse the bounded per-column schedule in the live draw loop. */
export function streamDrops(column: number, time: number, height: number): readonly Drop[] {
  let schedule = schedules.get(column);
  if (!schedule || time < schedule.time || height !== schedule.height) {
    schedule = { time, height, nextStart: .1 + variation(column, 1) * 2.4, cycle: 0, drops: [] };
    schedules.set(column, schedule);
  }
  schedule.time = time;
  while (schedule.nextStart <= time) {
    const cycle = schedule.cycle++;
    const seed = column * 100003 + cycle * 997;
    const previous = schedule.drops[schedule.drops.length - 1];
    let speed = 145 + variation(seed, 21) * 90;
    // Avoid near-identical consecutive speeds without alternating fixed presets.
    if (previous && Math.abs(speed - previous.speed) < 18) speed = 145 + (speed - 145 + 45) % 90;
    const tail = 126 + variation(column, 3) * 90;
    const gap = 240 + variation(seed, 22) * 100;
    const start = schedule.nextStart;
    if (schedule.drops.length === 3) schedule.drops.shift();
    schedule.drops.push({ cycle, start, speed, tail, end: start + .45 + (height + tail + 35) / speed });
    schedule.nextStart = start + (tail + gap) / speed;
    // Keep three reusable drop slots; never evict a slower visible tail.
    if (schedule.drops.length === 3) schedule.nextStart = Math.max(schedule.nextStart, schedule.drops[0].end);
  }
  return schedule.drops;
}

export function streamStates(column: number, time: number, height: number) {
  return streamDrops(column, time, height).filter(drop => time <= drop.end).map(drop => ({
    cycle: drop.cycle, tail: drop.tail, speed: drop.speed,
    elapsed: time - drop.start, head: (time - drop.start) * drop.speed - 20,
  }));
}

export function stretchedIconY(elapsed: number, row: number, speed: number, pitch: number) {
  const delay = row * .09;
  const localTime = elapsed - delay;
  if (localTime < 0) return null;
  // Analytic damped response: stagger, stretch, catch up, settle. No spring solver
  // or per-particle velocity state; position remains identical at any refresh rate.
  const settle = .45;
  const decay = Math.exp(-localTime / settle);
  const easedTravel = localTime - settle * (1 - decay);
  const catchUp = delay * (1 - (1 + localTime / settle) * decay);
  return -20 - row * pitch + speed * (easedTravel + catchUp);
}

export const repulsionRadius = 220;

// Each icon owns its elapsed fall time. Integrating speed avoids position jumps
// as it enters/leaves the cursor's repulsion area.
export function advanceLocalFallClock(rate: number, delta: number, affected: boolean) {
  if (!affected && rate === 1) return { rate: 1, elapsed: delta };
  const target = affected ? .4 : 1;
  const decay = Math.exp(-delta * 5);
  return {
    rate: target + (rate - target) * decay,
    elapsed: target * delta + (rate - target) * (1 - decay) / 5,
  };
}

// Critically damped recovery of lost fall time. The moving reference keeps falling
// normally: briefly accelerate, then settle at its position/speed without overshoot.
export function catchUpFallClock(rate: number, delta: number, lag: number, response = 3) {
  if (delta === 0) return { rate, elapsed: 0 };
  if (lag <= 0 && rate >= 1) return { rate: 1, elapsed: delta };
  const velocity = 1 - rate;
  const coefficient = velocity + response * lag;
  const decay = Math.exp(-response * delta);
  const remaining = Math.max(0, (lag + coefficient * delta) * decay);
  return {
    rate: 1 - (velocity - response * coefficient * delta) * decay,
    elapsed: Math.max(0, delta + lag - remaining),
  };
}

export function trailOpacity(distance: number, tail: number) {
  if (distance < 0 || distance >= tail) return 0;
  const fade = 1 - distance / tail;
  return .3 * fade * fade + .02 * Math.max(0, 1 - distance / 18);
}

export function pointerRepulsion(x: number, y: number, pointerX: number, pointerY: number, id: number) {
  const dx = x - pointerX;
  const dy = y - pointerY;
  if (dx * dx + dy * dy >= repulsionRadius * repulsionRadius) return { x: 0, y: 0 };
  const distance = Math.hypot(dx, dy);
  const influence = Math.max(0, 1 - distance / repulsionRadius);
  const angle = distance > .01 ? Math.atan2(dy, dx) : variation(id, 9) * Math.PI * 2;
  // Vary displacement per icon so the cursor breaks columns, not just bends them.
  const push = Math.pow(influence, 1.35) * (85 + variation(id, 10) * 45);
  return { x: Math.cos(angle) * push, y: Math.sin(angle) * push };
}
