import { waterfallIconSize } from './waterfall-icons';

// A bounded atlas avoids re-stroking hundreds of changing vector paths every
// frame. Opaque palette colors preserve the existing appearance at overlaps.
export class WaterfallSprites {
  private atlas = document.createElement('canvas');
  private context = this.atlas.getContext('2d')!;
  private entries = new Map<string, number>();
  private keys: string[] = [];
  private next = 0;
  private ratio = 0;
  private tile = 0;
  private readonly columns = 64;
  private readonly capacity = 4096;
  private readonly padding = 2;

  constructor(private icons: Path2D[]) {}

  resize(ratio: number) {
    if (ratio === this.ratio) return;
    this.ratio = ratio;
    this.tile = Math.ceil((waterfallIconSize + this.padding * 2) * ratio);
    this.atlas.width = this.columns * this.tile;
    this.atlas.height = Math.ceil(this.capacity / this.columns) * this.tile;
    this.entries.clear();
    this.keys = [];
    this.next = 0;
  }

  draw(target: CanvasRenderingContext2D, icon: number, color: string, x: number, y: number) {
    const key = `${icon}:${color}`;
    let slot = this.entries.get(key);
    if (slot === undefined) {
      slot = this.next;
      this.next = (this.next + 1) % this.capacity;
      if (this.keys[slot] !== undefined) this.entries.delete(this.keys[slot]);
      this.keys[slot] = key;
      this.entries.set(key, slot);
      const sx = (slot % this.columns) * this.tile;
      const sy = Math.floor(slot / this.columns) * this.tile;
      const ctx = this.context;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(sx, sy, this.tile, this.tile);
      ctx.setTransform(this.ratio, 0, 0, this.ratio,
        sx + this.padding * this.ratio, sy + this.padding * this.ratio);
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;
      ctx.stroke(this.icons[icon]);
    }
    target.drawImage(this.atlas, (slot % this.columns) * this.tile,
      Math.floor(slot / this.columns) * this.tile, this.tile, this.tile,
      x - this.padding, y - this.padding, this.tile / this.ratio, this.tile / this.ratio);
  }

  destroy() {
    this.entries.clear();
    this.keys = [];
    this.atlas.width = this.atlas.height = 0;
  }
}
