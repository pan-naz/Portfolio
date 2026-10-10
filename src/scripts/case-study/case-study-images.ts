interface ImageController { refresh(): void; destroy(): void; }
const controllers = new WeakMap<ParentNode, ImageController>();

/** Original play-once image recordings restart on entry; stills remain visible until then. */
export function initializeCaseStudyImages(root: ParentNode = document): ImageController {
  const existing = controllers.get(root);
  if (existing) return existing;
  const images = [...root.querySelectorAll<HTMLImageElement>('[data-case-animated-image]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const visible = new Set<HTMLImageElement>();
  const states = new Map(images.map(image => [image, { still: image.getAttribute('src')!, url: '', playing: false, revision: 0, bytes: undefined as Promise<Blob | undefined> | undefined }]));
  const abort = new AbortController();
  let destroyed = false;

  const syncImage = async (image: HTMLImageElement) => {
    const state = states.get(image)!;
    const play = !destroyed && !reduced.matches && !document.hidden && visible.has(image);
    if (state.playing === play) return;
    state.playing = play;
    const revision = ++state.revision;
    if (state.url) URL.revokeObjectURL(state.url);
    state.url = '';
    image.src = state.still;
    if (!play) return;
    state.bytes ??= fetch(image.dataset.caseAnimatedImage!, { signal: abort.signal }).then(response => response.ok ? response.blob() : undefined).catch(() => undefined);
    const bytes = await state.bytes;
    if (!bytes || destroyed || revision !== state.revision) return;
    state.url = URL.createObjectURL(bytes);
    image.src = state.url;
  };
  const refresh = () => images.forEach(image => { void syncImage(image); });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const image = entry.target as HTMLImageElement;
      if (entry.isIntersecting && entry.intersectionRatio >= .5) visible.add(image);
      else if (!entry.isIntersecting) visible.delete(image);
      void syncImage(image);
    });
  }, { threshold: [0, .5] });
  images.forEach(image => observer.observe(image));
  reduced.addEventListener('change', refresh);
  document.addEventListener('visibilitychange', refresh);
  const controller: ImageController = {
    refresh,
    destroy() {
      destroyed = true;
      abort.abort();
      observer.disconnect();
      reduced.removeEventListener('change', refresh);
      document.removeEventListener('visibilitychange', refresh);
      refresh();
      controllers.delete(root);
    },
  };
  controllers.set(root, controller);
  return controller;
}
