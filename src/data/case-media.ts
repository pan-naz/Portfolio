/** Media paths and repeated frame defaults; original filenames remain untouched. */
export function createCaseMedia(basePath: string, { imageExtension = '', posterExtension = '.jpg' }: { imageExtension?: string; posterExtension?: string } = {}) {
  const asset = (name: string) => basePath + name;
  const image = (name: string, width: number, height: number, alt: string) => ({
    src: asset(name + imageExtension), width, height, alt,
    kind: 'image' as const, presentation: 'floating' as const, radius: 'medium' as const,
  });
  const video = (name: string, width: number, height: number, alt: string) => ({
    src: asset(name + '.mp4'), poster: asset(name + posterExtension), width, height, alt,
    presentation: 'floating' as const, radius: 'medium' as const,
  });
  return { asset, image, video };
}
