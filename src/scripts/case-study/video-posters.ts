const pending = new WeakMap<HTMLVideoElement, { image: HTMLImageElement; promise: Promise<void> }>();
const ready = new WeakSet<HTMLVideoElement>();
const images = new WeakMap<HTMLImageElement, Promise<void>>();

/** Restore the existing responsive selection before requesting its original fallback. */
export function loadDeferredImage(image: HTMLImageElement, priority: 'auto' | 'low' = 'auto'): Promise<void> {
  const existing = images.get(image);
  if (existing) return existing;
  image.fetchPriority = priority;
  image.closest('picture')?.querySelectorAll<HTMLSourceElement>('source[data-srcset]').forEach(source => {
    source.srcset = source.dataset.srcset!;
  });
  if (image.dataset.srcset) image.srcset = image.dataset.srcset;
  if (image.dataset.src) image.src = image.dataset.src;
  image.loading = 'eager';
  const promise = image.decode().catch(() => {});
  images.set(image, promise);
  return promise;
}

export function hasVideoPoster(video: HTMLVideoElement): boolean {
  return !video.dataset?.poster || ready.has(video) || Boolean(video.poster);
}

/** Decode the unchanged poster before exposing it to the native video renderer. */
export function loadVideoPoster(video: HTMLVideoElement, priority: 'auto' | 'low' = 'auto'): Promise<void> {
  if (hasVideoPoster(video)) return Promise.resolve();
  const existing = pending.get(video);
  if (existing) return existing.promise;
  const image = new Image();
  image.fetchPriority = priority;
  image.decoding = 'async';
  image.src = video.dataset.poster!;
  const promise = Promise.all([
    image.decode().catch(() => {}),
    ...[...video.closest('.hooko-hero')?.querySelectorAll<HTMLImageElement>('img[data-deferred-image]') ?? []].map(image => loadDeferredImage(image, priority)),
  ]).then(() => {
    if (pending.get(video)?.image !== image) return;
    video.poster = video.dataset.poster!;
    video.querySelectorAll<HTMLImageElement>('img[data-src]').forEach(fallback => { fallback.src = fallback.dataset.src!; });
    ready.add(video);
    pending.delete(video);
  });
  pending.set(video, { image, promise });
  return promise;
}

export function cancelVideoPoster(video: HTMLVideoElement) {
  const loading = pending.get(video);
  pending.delete(video);
  if (loading) loading.image.src = '';
}
