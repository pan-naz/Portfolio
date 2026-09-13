// Exclusive symbol leases across the entire canvas, including overscan.
// Taking/releasing an unused symbol is O(1); no per-frame shuffles or searches.
export class WaterfallSymbols {
  private free: number[];
  private leases = new Map<number, { icon: number; cycle: number; next: number; frame: number }>();
  private frame = 0;
  private random: () => number;

  constructor(count: number, random: () => number = Math.random) {
    this.random = random;
    this.free = Array.from({ length: count }, (_, i) => i);
  }

  beginFrame() { this.frame++; }

  private take() {
    if (!this.free.length) return undefined;
    const index = Math.floor(this.random() * this.free.length);
    const icon = this.free[index];
    this.free[index] = this.free[this.free.length - 1];
    this.free.pop();
    return icon;
  }

  iconFor(id: number, cycle: number, time: number) {
    let lease = this.leases.get(id);
    if (!lease || lease.cycle !== cycle || time >= lease.next) {
      // Reserve the replacement before releasing the old icon: no immediate repeat.
      const icon = this.take();
      if (icon !== undefined) {
        if (lease) this.free.push(lease.icon);
        lease = { icon, cycle, next: time + .12 + this.random() * .12, frame: this.frame };
        this.leases.set(id, lease);
      }
    }
    if (!lease) return undefined; // Never duplicate if the pool is exhausted.
    lease.frame = this.frame;
    return lease.icon;
  }

  endFrame() {
    for (const [id, lease] of this.leases) {
      if (lease.frame !== this.frame) {
        this.free.push(lease.icon);
        this.leases.delete(id);
      }
    }
  }
}
