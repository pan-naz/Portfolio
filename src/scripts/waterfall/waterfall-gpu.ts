import { waterfallIconSize } from './waterfall-constants';

// Rasterize each original path once. Positions and opaque palette colors are
// instance data, never new textures. No canvas-to-canvas copies in the hot loop.
export class WaterfallGPU {
  private program: WebGLProgram;
  private buffer: WebGLBuffer;
  private texture: WebGLTexture;
  private vao: WebGLVertexArrayObject;
  private data: Float32Array;
  private colors = new Float32Array();
  private count = 0;
  private ratio = 0;
  private readonly columns = 64;
  private readonly padding = 2;

  constructor(private canvas: HTMLCanvasElement, private gl: WebGL2RenderingContext, private icons: Path2D[]) {
    const vertex = this.shader(gl.VERTEX_SHADER, `#version 300 es
      precision highp float;
      layout(location=0) in vec4 placement;
      layout(location=1) in vec3 color;
      uniform vec2 viewportSize;
      uniform vec2 atlasGrid;
      uniform float tileSize;
      out vec2 uv;
      out vec3 ink;
      const vec2 corners[6] = vec2[6](vec2(0,0),vec2(1,0),vec2(0,1),vec2(0,1),vec2(1,0),vec2(1,1));
      void main() {
        vec2 corner = corners[gl_VertexID];
        vec2 position = placement.xy + corner * tileSize;
        gl_Position = vec4(position / viewportSize * vec2(2,-2) + vec2(-1,1), 0, 1);
        uv = (placement.zw + corner) / atlasGrid;
        ink = color;
      }`);
    let fragment: WebGLShader | undefined;
    const program = gl.createProgram();
    if (!program) { gl.deleteShader(vertex); throw new Error('Rain program unavailable'); }
    try {
      fragment = this.shader(gl.FRAGMENT_SHADER, `#version 300 es
        precision highp float;
        uniform sampler2D glyphs;
        in vec2 uv;
        in vec3 ink;
        out vec4 pixel;
        void main() {
          float coverage = texture(glyphs, uv).a;
          pixel = vec4(ink * coverage, coverage);
        }`);
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Rain program could not link');
    } catch (error) {
      gl.deleteProgram(program);
      throw error;
    } finally {
      gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
    }
    this.program = program;
    const buffer = gl.createBuffer(), texture = gl.createTexture(), vao = gl.createVertexArray();
    if (!buffer || !texture || !vao) {
      gl.deleteBuffer(buffer); gl.deleteTexture(texture); gl.deleteVertexArray(vao); gl.deleteProgram(program);
      throw new Error('Rain GPU resources unavailable');
    }
    this.buffer = buffer; this.texture = texture; this.vao = vao;
    // Symbol leases guarantee at most icons.length simultaneous instances.
    this.data = new Float32Array(icons.length * 7);
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.data.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 28, 0);
    gl.vertexAttribDivisor(0, 1);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 28, 16);
    gl.vertexAttribDivisor(1, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(gl.getUniformLocation(program, 'glyphs'), 0);
    gl.enable(gl.BLEND);
    // Premultiplied source-over preserves draw order and opaque-ink overlaps.
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
  }

  private shader(type: number, source: string) {
    const gl = this.gl, shader = gl.createShader(type);
    if (!shader) throw new Error('Rain shader unavailable');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      throw new Error('Rain shader could not compile');
    }
    return shader;
  }

  resize(width: number, height: number, ratio: number, palette: string[]) {
    const gl = this.gl;
    const w = Math.round(width * ratio), h = Math.round(height * ratio);
    if (this.canvas.width !== w) this.canvas.width = w;
    if (this.canvas.height !== h) this.canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(gl.getUniformLocation(this.program, 'viewportSize'), width, height);
    this.colors = new Float32Array(palette.length * 3);
    for (let i = 0; i < palette.length; i++) {
      const channels = palette[i].match(/\d+/g)!;
      for (let c = 0; c < 3; c++) this.colors[i * 3 + c] = Number(channels[c]) / 255;
    }
    if (this.ratio === ratio) return;
    this.ratio = ratio;
    const tile = Math.ceil((waterfallIconSize + this.padding * 2) * ratio);
    const rows = Math.ceil(this.icons.length / this.columns);
    const atlas = document.createElement('canvas');
    atlas.width = this.columns * tile; atlas.height = rows * tile;
    const ctx = atlas.getContext('2d')!;
    ctx.lineWidth = 1; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#ffffff';
    for (let icon = 0; icon < this.icons.length; icon++) {
      ctx.setTransform(ratio, 0, 0, ratio,
        (icon % this.columns) * tile + this.padding * ratio,
        Math.floor(icon / this.columns) * tile + this.padding * ratio);
      ctx.stroke(this.icons[icon]);
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
    gl.uniform2f(gl.getUniformLocation(this.program, 'atlasGrid'), this.columns, rows);
    gl.uniform1f(gl.getUniformLocation(this.program, 'tileSize'), tile / ratio);
    atlas.width = atlas.height = 0;
  }

  begin() { this.count = 0; }

  draw(icon: number, color: number, x: number, y: number) {
    const at = this.count++ * 7;
    this.data[at] = x - this.padding;
    this.data[at + 1] = y - this.padding;
    this.data[at + 2] = icon % this.columns;
    this.data[at + 3] = Math.floor(icon / this.columns);
    this.data[at + 4] = this.colors[color * 3];
    this.data[at + 5] = this.colors[color * 3 + 1];
    this.data[at + 6] = this.colors[color * 3 + 2];
  }

  end() {
    const gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!this.count) return;
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.data, 0, this.count * 7);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, this.count);
  }

  destroy() {
    const gl = this.gl;
    gl.deleteBuffer(this.buffer); gl.deleteTexture(this.texture);
    gl.deleteVertexArray(this.vao); gl.deleteProgram(this.program);
  }
}
