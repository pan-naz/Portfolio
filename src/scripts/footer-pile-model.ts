import Matter from 'matter-js';
import { waterfallIconSize } from './waterfall-icons';
import { footerInterfaceIcons } from './footer-interface-icons';

const { Engine, Bodies, Body, Composite, Sleeping } = Matter;
export const pileRadius = waterfallIconSize * .72;
export const pilePitch = pileRadius * 2;
export const pileCursorRadius = 50; // 100px diameter, independent of the hero rain.
export const pilePreviewWidth = 1200;
export const pilePreviewHeight = 120;
export const pileBleed = pileCursorRadius + waterfallIconSize * 2;
export const pileAbove = pilePreviewHeight + pileCursorRadius;
export const pileStep = 1 / 120;
export const pilePreviewSeed = 1827;

export interface PileIcon {
  id: number; icon: number; x: number; y: number; angle: number;
  vx: number; vy: number; spin: number; fallen: boolean; removed: boolean;
}
export interface PilePointer { x: number; y: number; active: boolean; }

function randomFromSeed(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = Math.imul(state ^ state >>> 15, state | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

/** Random deposition makes uneven shoulders, little gaps and a different skyline. */
export function createPile(width: number, iconCount: number, seed = pilePreviewSeed): PileIcon[] {
  const random = randomFromSeed(seed);
  const order = footerInterfaceIcons.filter(index => index < iconCount);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (!order.length) return [];
  const span = Math.min(720, width * .72);
  const height = Math.min(100, width * .16);
  const count = Math.min(order.length, Math.floor(span / pilePitch * height / pilePitch * .68));
  const direction = random() < .5 ? -1 : 1;
  const peak = direction * span * (.05 + random() * .10);
  const shoulder = -direction * span * (.25 + random() * .08);
  const icons: PileIcon[] = [];
  for (let attempt = 0; icons.length < count && attempt < count * 40; attempt++) {
    const group = random();
    const center = group < .72 ? peak : shoulder;
    const spread = group < .72 ? span * .26 : span * .13;
    const offset = group > .94 ? (random() - .5) * span
      : center + (random() + random() + random() - 1.5) * spread;
    if (Math.abs(offset) > span / 2 - pileRadius) continue;
    const x = width / 2 + offset;
    let y = -pileRadius;
    for (const other of icons) {
      const dx = x - other.x;
      if (Math.abs(dx) < pilePitch) y = Math.min(y, other.y - Math.sqrt(pilePitch ** 2 - dx ** 2));
    }
    const skyline = Math.min(1, .22
      + .78 * Math.exp(-(((offset - peak) / (span * .26)) ** 2))
      + .4 * Math.exp(-(((offset - shoulder) / (span * .13)) ** 2)));
    if (y < -height * skyline) continue;
    const id = icons.length;
    icons.push({ id, icon: order[id], x, y, angle: (random() - .5) * Math.PI * 2,
      vx: 0, vy: 0, spin: 0, fallen: false, removed: false });
  }
  return icons;
}

/** A real circular collider sweeps bodies; no long-range force or random impulse. */
export class FooterPile {
  icons: PileIcon[];
  disturbed = false;
  sleeping = true;
  private accumulator = 0;
  private engine = Engine.create({ enableSleeping: true, positionIterations: 10, velocityIterations: 8,
    gravity: { x: 0, y: 1, scale: .001 } });
  private bodies: Matter.Body[];
  private shelf: Matter.Body;
  private brush?: Matter.Body;
  private brushRadius = 1;
  private brushMoving = false;

  /** A distant pointer cannot wake a settled pile until its collider reaches an icon. */
  needsPointerStep(x: number, y: number) {
    if (!this.sleeping || this.brush) return true;
    const reach = pileCursorRadius + pileRadius + 2;
    const reachSquared = reach * reach;
    return this.icons.some(icon => !icon.removed && !icon.fallen
      && (icon.x - x) ** 2 + (icon.y - y) ** 2 < reachSquared);
  }

  constructor(public width: number, iconCount: number, public readonly seed = pilePreviewSeed,
    public viewLeft = pileBleed, public viewRight = pileBleed) {
    this.icons = createPile(width, iconCount, seed);
    this.shelf = this.createShelf(width);
    this.bodies = this.icons.map(icon => Bodies.circle(icon.x, icon.y, pileRadius, {
      friction: .32, frictionStatic: .5, frictionAir: .025, restitution: .03,
      slop: .015, sleepThreshold: 45, angle: icon.angle,
      collisionFilter: { category: 1, mask: 7 },
    }, 32));
    Composite.add(this.engine.world, [this.shelf, ...this.bodies]);
    // Settle the random drop before the first paint; there is no load-time rainfall.
    for (let step = 0; step < 360; step++) {
      Engine.update(this.engine, pileStep * 1000);
      if (this.bodies.every(body => body.isSleeping)) break;
    }
    this.bodies.forEach(body => Sleeping.set(body, true));
    this.syncIcons();
  }

  private createShelf(width: number) {
    return Bodies.rectangle(width / 2, 100, width, 200, { isStatic: true, friction: .4,
      frictionStatic: .6, restitution: 0, collisionFilter: { category: 2, mask: 1 } });
  }

  releasePointer() {
    if (!this.brush) return;
    const { x, y } = this.brush.position;
    this.bodies.forEach((body, i) => {
      if (!this.icons[i].removed && Math.abs(body.position.x - x) < this.brushRadius + pilePitch
        && body.position.y < y + this.brushRadius + pilePitch) Sleeping.set(body, false);
    });
    Composite.remove(this.engine.world, this.brush);
    this.brush = undefined;
    this.sleeping = this.bodies.every((body, i) => this.icons[i].removed || body.isSleeping);
  }

  resize(width: number, viewLeft = this.viewLeft, viewRight = this.viewRight) {
    this.releasePointer();
    if (width !== this.width) {
      const shift = (width - this.width) / 2;
      this.icons.forEach((icon, i) => {
        if (icon.removed) return;
        icon.x += shift;
        Body.setPosition(this.bodies[i], { x: icon.x, y: icon.y });
        if (icon.x < 0 || icon.x > width) Sleeping.set(this.bodies[i], false);
      });
      Composite.remove(this.engine.world, this.shelf);
      this.shelf = this.createShelf(width);
      Composite.add(this.engine.world, this.shelf);
    }
    this.width = width;
    this.viewLeft = viewLeft;
    this.viewRight = viewRight;
    this.sleeping = this.bodies.every((body, i) => this.icons[i].removed || body.isSleeping);
  }

  advance(delta: number, pointer: PilePointer) {
    if (!pointer.active) this.releasePointer();
    const tracking = pointer.active && (!this.brush || this.brushRadius < pileCursorRadius
      || Math.hypot(pointer.x - this.brush.position.x, pointer.y - this.brush.position.y) > .01);
    if (this.sleeping && !tracking) { this.accumulator = 0; return false; }
    this.accumulator += Math.min(Math.max(0, delta), .05);
    while (this.accumulator + 1e-9 >= pileStep) {
      this.step(pointer);
      this.accumulator -= pileStep;
    }
    const caughtUp = !this.brush || (this.brushRadius === pileCursorRadius
      && Math.hypot(pointer.x - this.brush.position.x, pointer.y - this.brush.position.y) < .01);
    this.sleeping = caughtUp && this.bodies.every((body, i) => this.icons[i].removed || body.isSleeping);
    return true;
  }

  private step(pointer: PilePointer) {
    if (pointer.active) {
      if (!this.brush) {
        this.brushRadius = 1;
        this.brush = Bodies.circle(pointer.x, pointer.y, pileCursorRadius, { isStatic: true,
          friction: 0, restitution: 0, collisionFilter: { category: 4, mask: 1 } }, 64);
        Body.scale(this.brush, 1 / pileCursorRadius, 1 / pileCursorRadius);
        Composite.add(this.engine.world, this.brush);
      }
      const radius = Math.min(pileCursorRadius, this.brushRadius + pileStep * 400);
      const dx = pointer.x - this.brush.position.x, dy = pointer.y - this.brush.position.y;
      const distance = Math.hypot(dx, dy);
      const travel = Math.min(1, 900 * pileStep / (distance || 1));
      const moving = distance > .01 || radius !== this.brushRadius;
      this.brushMoving = moving;
      // Substeps keep fast strokes continuous; expanding on entry avoids deep teleportation.
      Body.scale(this.brush, radius / this.brushRadius, radius / this.brushRadius);
      this.brushRadius = radius;
      Body.setPosition(this.brush, { x: this.brush.position.x + dx * travel,
        y: this.brush.position.y + dy * travel });
      Body.setVelocity(this.brush, { x: dx * travel, y: dy * travel });
      this.bodies.forEach((body, i) => {
        if (this.icons[i].removed || this.icons[i].fallen) return;
        const separation = Math.hypot(body.position.x - this.brush!.position.x,
          body.position.y - this.brush!.position.y);
        if (moving && separation < radius + pileRadius + 2) {
          this.disturbed = true;
          Sleeping.set(body, false);
        }
      });
    }
    Engine.update(this.engine, pileStep * 1000);
    this.syncIcons();
  }

  private syncIcons() {
    for (let i = 0; i < this.icons.length; i++) {
      const icon = this.icons[i], body = this.bodies[i];
      if (icon.removed) continue;
      // Keep a fast hand sweep energetic sideways without catapulting light icons upward.
      const speed = Body.getVelocity(body);
      if (!icon.fallen && (Math.abs(speed.x) > 12 || speed.y < -4)) {
        Body.setVelocity(body, { x: Math.max(-12, Math.min(12, speed.x)), y: Math.max(-4, speed.y) });
      }
      // A mouse can cross the shelf; physical icons cannot. Resolve trapped contacts
      // along the shelf instead of allowing two static colliders to squeeze them through it.
      if (!icon.fallen && body.position.x >= 0 && body.position.x <= this.width
        && body.position.y > -pileRadius - .1) {
        Body.setPosition(body, { x: body.position.x, y: -pileRadius });
        const velocity = Body.getVelocity(body);
        if (this.brush && Math.hypot(body.position.x - this.brush.position.x,
          body.position.y - this.brush.position.y) < this.brushRadius + (this.brushMoving ? pileRadius - .5 : .5)) {
          Sleeping.set(body, false);
          const direction = Math.sign(body.position.x - this.brush.position.x)
            || Math.sign(this.brush.velocity.x) || 1;
          const horizontalContact = Math.sqrt(Math.max(0, (this.brushRadius + pileRadius) ** 2
            - (body.position.y - this.brush.position.y) ** 2));
          const overlap = horizontalContact - Math.abs(body.position.x - this.brush.position.x);
          Body.translate(body, { x: direction * Math.min(2, Math.max(0, overlap)), y: 0 });
          velocity.x = direction * Math.max(Math.abs(velocity.x), 3);
        }
        Body.setVelocity(body, { x: velocity.x, y: Math.min(0, velocity.y) });
      }
      icon.x = body.position.x; icon.y = body.position.y; icon.angle = body.angle;
      icon.vx = body.velocity.x * 60; icon.vy = body.velocity.y * 60;
      icon.spin = body.angularVelocity * 60;
      if (!icon.fallen && (icon.x < 0 || icon.x > this.width)) {
        icon.fallen = true;
        body.collisionFilter.mask = 1;
        Sleeping.set(body, false);
      }
      if (icon.y > 180 || icon.x < -this.viewLeft - pileRadius
        || icon.x > this.width + this.viewRight + pileRadius) {
        icon.removed = true;
        Composite.remove(this.engine.world, body);
      }
    }
  }

  destroy() { Composite.clear(this.engine.world, false); Engine.clear(this.engine); }
}
