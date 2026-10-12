import records from './video-variants.json' with { type: 'json' };

type VideoOutput = (typeof records)[keyof typeof records]['desktop'];
type VideoVariant = Omit<(typeof records)[keyof typeof records], 'mobile'> & { mobile?: VideoOutput };
/** Build-time metadata only: originals remain in the external media archive. */
export function getVideoVariant(src: string): VideoVariant | undefined {
  return records[src.split('?')[0] as keyof typeof records];
}
