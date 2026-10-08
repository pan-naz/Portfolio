interface MediaCanvas {
  width: number;
  height: number;
  canvasColor?: string;
  canvasInset?: number;
  canvasFade?: boolean;
  canvasSourceRatio?: number;
}

/** Crop source pixels without changing original media bytes or its playback. */
export function mediaCrop({ width, height, cropPixels = 0 }: { width: number; height: number; cropPixels?: number }) {
  const frameWidth = width - cropPixels * 2;
  const frameHeight = height - cropPixels * 2;
  if (cropPixels < 0 || frameWidth <= 0 || frameHeight <= 0) throw new Error('Invalid source-media crop');
  return {
    width: frameWidth,
    height: frameHeight,
    style: cropPixels ? `--media-source-ratio:${width} / ${height};--media-crop-width:${width / frameWidth * 100}%;--media-crop-offset:${-cropPixels / frameWidth * 100}%` : undefined,
  };
}

export function mediaCanvasStyle({ width, height, canvasColor, canvasInset = 0, canvasFade, canvasSourceRatio = width / height }: MediaCanvas) {
  const canvasRatio = width / height;
  const contentSize = 100 - canvasInset * 2;
  // object-fit: contain may add empty space inside the padding. Fade the
  // painted recording's rectangle, rather than the surrounding canvas.
  const fadeWidth = contentSize * Math.min(1, canvasSourceRatio / canvasRatio);
  const fadeHeight = contentSize * Math.min(1, canvasRatio / canvasSourceRatio);
  return [
    canvasColor ? `background:${canvasColor}` : '',
    canvasInset ? `padding:${canvasInset * height / width}% ${canvasInset}%` : '',
    canvasFade ? `--media-fade-size:${fadeWidth}% ${fadeHeight}%` : '',
  ].filter(Boolean).join(';') || undefined;
}
