import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
interface Candidate { src: string; width: number; height: number; bytes: number; }
export interface ResponsiveImage { width: number; height: number; originalBytes: number; policy: string; webp: Candidate[]; avif: Candidate[]; }
let images: Record<string, ResponsiveImage> = {};
try { images = JSON.parse(readFileSync(resolve('public/generated/images/manifest.json'), 'utf8')); } catch { /* Dev and an absent generated manifest retain originals. */ }
export function responsiveImage(src: string): ResponsiveImage | undefined {
  const image = images[src.split('?')[0]];
  if (!image) return;
  // Lossless reconstruction of an already compressed screenshot can be larger.
  // Keep the original fallback unless every candidate in a format saves bytes.
  const webp = image.webp.every(candidate => candidate.bytes <= image.originalBytes) ? image.webp : [];
  const avif = image.avif.every(candidate => candidate.bytes <= image.originalBytes) ? image.avif : [];
  return webp.length || avif.length ? { ...image, webp, avif } : undefined;
}
