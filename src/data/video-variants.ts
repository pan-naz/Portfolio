import records from './video-variants.json' with { type: 'json' };

type VideoVariant = (typeof records)[keyof typeof records];
/** Build-time metadata only: originals remain in the external media archive. */
export function getVideoVariant(src: string): VideoVariant | undefined {
  return records[src.split('?')[0] as keyof typeof records];
}
