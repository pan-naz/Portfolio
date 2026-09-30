interface VideoController {
  setPaused(value: boolean): void;
  refresh(): void;
  destroy(): void;
}

const controllers = new WeakMap<ParentNode, VideoController>();
type VideoOwner = { active: boolean; visible: Set<HTMLVideoElement> };
const owners = new WeakMap<HTMLVideoElement, VideoOwner>();

/** Posters render immediately; video bytes are requested only while in view. */
export function initializeCaseStudyVideos(root: ParentNode = document): VideoController {
  const existing = controllers.get(root);
  if (existing) return existing;
  const videos = [...root.querySelectorAll<HTMLVideoElement>('[data-case-video], [data-project-video]')];
  // A case can borrow the card's live video. Only its current controller may
  // pause it or release its source; the homepage keeps its observer for return.
  const previousOwners = new Map(videos.map(video => [video, owners.get(video)]));
  const visible = new Set(videos.filter(video => previousOwners.get(video)?.visible.has(video)));
  const owner: VideoOwner = { active: true, visible };
  videos.forEach(video => owners.set(video, owner));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  let destroyed = false;
  const syncVideo = (video: HTMLVideoElement) => {
    if (destroyed || owners.get(video) !== owner) return;
    if (paused || reduced.matches || document.hidden || !visible.has(video)) {
      video.pause();
      if (reduced.matches && video.readyState > 0) video.currentTime = 0;
      return;
    }
    let loaded = false;
    video.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach(source => {
      if (source.hasAttribute('src')) return;
      source.src = source.dataset.src!;
      loaded = true;
    });
    // Explicit muted playback also works on mobile browsers that block sound.
    video.muted = true;
    if (loaded) video.load();
    void video.play().catch(() => {});
  };
  const sync = () => videos.forEach(syncVideo);
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const video = entry.target as HTMLVideoElement;
      if (entry.isIntersecting && entry.intersectionRatio > 0) visible.add(video);
      else visible.delete(video);
      syncVideo(video);
    }
  }, { threshold: 0 });
  videos.forEach(video => observer.observe(video));
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  const controller: VideoController = {
    setPaused(value) { paused = value; sync(); },
    refresh: sync,
    destroy() {
      destroyed = true;
      owner.active = false;
      observer.disconnect();
      reduced.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      videos.forEach(video => {
        if (owners.get(video) !== owner) return;
        const previous = previousOwners.get(video);
        if (previous?.active) {
          owners.set(video, previous);
          return; // Preserve playback position and buffered frames for the card.
        }
        owners.delete(video);
        video.pause();
        const sources = [...video.querySelectorAll('source[src]')];
        sources.forEach(source => source.removeAttribute('src'));
        if (sources.length) video.load(); // Cancel in-flight transfers when a case closes.
      });
      controllers.delete(root);
    },
  };
  controllers.set(root, controller);
  return controller;
}
