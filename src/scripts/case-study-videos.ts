interface VideoController {
  setPaused(value: boolean): void;
  destroy(): void;
}

const controllers = new WeakMap<ParentNode, VideoController>();

/** Posters render immediately; video bytes are requested only while in view. */
export function initializeCaseStudyVideos(root: ParentNode = document): VideoController {
  const existing = controllers.get(root);
  if (existing) return existing;
  const videos = [...root.querySelectorAll<HTMLVideoElement>('[data-case-video], [data-project-video]')];
  const visible = new Set<HTMLVideoElement>();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  let destroyed = false;
  const syncVideo = (video: HTMLVideoElement) => {
    if (destroyed || paused || reduced.matches || document.hidden || !visible.has(video)) {
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
    destroy() {
      destroyed = true;
      observer.disconnect();
      reduced.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      videos.forEach(video => {
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
