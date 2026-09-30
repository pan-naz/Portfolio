import { WaterfallGPU } from './waterfall-gpu';
import { WaterfallSprites } from './waterfall-sprites';

class Waterfall2D {
  private context: CanvasRenderingContext2D;
  private sprites: WaterfallSprites;
  private palette: string[] = [];
  private width = 0;
  private height = 0;
  private ratio = 1;
  constructor(private canvas: HTMLCanvasElement, icons: Path2D[]) {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Rain canvas unavailable');
    this.context = context;
    this.sprites = new WaterfallSprites(icons);
  }
  resize(width: number, height: number, ratio: number, palette: string[]) {
    this.width = width; this.height = height; this.ratio = ratio; this.palette = palette;
    const w = Math.round(width * ratio), h = Math.round(height * ratio);
    if (this.canvas.width !== w) this.canvas.width = w;
    if (this.canvas.height !== h) this.canvas.height = h;
    this.sprites.resize(ratio);
  }
  begin() {
    this.context.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.globalAlpha = 1;
  }
  draw(icon: number, color: number, x: number, y: number) {
    this.sprites.draw(this.context, icon, this.palette[color], x, y);
  }
  end() {}
  destroy() { this.sprites.destroy(); }
}

// Only the drawing backend changes. Simulation, leases, clocks and interaction
// remain owned by waterfall.ts. Context loss switches to the existing 2D path
// without reinitializing the animation or leaving a blank canvas.
export function createWaterfallRenderer(initialCanvas: HTMLCanvasElement, icons: Path2D[]) {
  let canvas = initialCanvas;
  let engine: WaterfallGPU | Waterfall2D;
  let size: [number, number, number, string[]] | undefined;
  const freshCanvas = () => {
    const replacement = canvas.cloneNode(false) as HTMLCanvasElement;
    canvas.replaceWith(replacement);
    canvas = replacement;
  };
  let gl: WebGL2RenderingContext | null = null;
  try {
    gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
  } catch { /* A blocked GPU context may still allow a 2D canvas. */ }
  try {
    if (gl) {
      try { engine = new WaterfallGPU(canvas, gl, icons); }
      catch { freshCanvas(); engine = new Waterfall2D(canvas, icons); }
    } else engine = new Waterfall2D(canvas, icons);
  } catch { return undefined; }
  const fallback = () => {
    canvas.removeEventListener('webglcontextlost', lost);
    engine.destroy();
    freshCanvas();
    engine = new Waterfall2D(canvas, icons);
    canvas.dataset.renderer = '2d';
    if (size) engine.resize(...size);
  };
  const lost = (event: Event) => { event.preventDefault(); fallback(); };
  canvas.dataset.renderer = engine instanceof WaterfallGPU ? 'webgl2' : '2d';
  canvas.addEventListener('webglcontextlost', lost);
  return {
    resize(width: number, height: number, ratio: number, palette: string[]) {
      size = [width, height, ratio, palette];
      try { engine.resize(...size); }
      catch (error) {
        if (engine instanceof WaterfallGPU) fallback();
        else throw error;
      }
    },
    begin: () => engine.begin(),
    draw: (icon: number, color: number, x: number, y: number) => engine.draw(icon, color, x, y),
    end: () => engine.end(),
    destroy() { canvas.removeEventListener('webglcontextlost', lost); engine.destroy(); },
  };
}
