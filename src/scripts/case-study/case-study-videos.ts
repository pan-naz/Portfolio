import { cancelVideoPoster, hasVideoPoster, loadVideoPoster } from './video-posters.ts';

interface VideoController {
  setPaused(value: boolean): void;
  refresh(): void;
  destroy(): void;
}

const controllers = new WeakMap<ParentNode, VideoController>();
type VideoOwner = { active: boolean; visible: Set<HTMLVideoElement>; sync(video: HTMLVideoElement): void };
const owners = new WeakMap<HTMLVideoElement, VideoOwner>();
const playbackIntent = new WeakMap<HTMLVideoElement, boolean>();
const soundEnabled = new WeakSet<HTMLVideoElement>();

function attachVideoSources(video: HTMLVideoElement): boolean {
  let loaded = false;
  video.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach(source => {
    if (source.hasAttribute('src')) return;
    source.src = source.dataset.src!;
    loaded = true;
  });
  return loaded;
}

/** Warm an existing source without replaying, seeking or changing sound/intent. */
export function preloadCaseVideo(video: HTMLVideoElement, preload: 'auto' | 'metadata') {
  if (video.preload === 'auto' && preload === 'metadata') return;
  video.preload = preload;
  if (attachVideoSources(video)) video.load();
}

/** Sound is enabled only by an explicit player action, and survives reentry. */
export function setCaseVideoMuted(video: HTMLVideoElement, muted: boolean) {
  if (muted) soundEnabled.delete(video);
  else soundEnabled.add(video);
  video.muted = muted;
}

/** Explicit controls take precedence over autoplay, but never play offscreen. */
export function setCaseVideoPlaying(video: HTMLVideoElement, playing: boolean) {
  playbackIntent.set(video, playing);
  owners.get(video)?.sync(video);
}

/** Decode nearby active posters; normal autoplay starts only while in view. */
export function initializeCaseStudyVideos(root: ParentNode = document): VideoController {
  const existing = controllers.get(root);
  if (existing) return existing;
  const videos = [...root.querySelectorAll<HTMLVideoElement>('[data-case-video], [data-project-video]')];
  // A case can borrow the card's live video. Only its current controller may
  // pause it or release its source; the homepage keeps its observer for return.
  const previousOwners = new Map(videos.map(video => [video, owners.get(video)]));
  const visible = new Set(videos.filter(video => previousOwners.get(video)?.visible.has(video)));
  const owner: VideoOwner = { active: true, visible, sync: video => syncVideo(video) };
  videos.forEach(video => owners.set(video, owner));
  // Even-sized web encodes can round their native ratio by a fraction of a
  // pixel. Keep the original recording's layout once metadata is available;
  // poster-only geometry and the existing canvas/crop ratios remain unchanged.
  const preserveSourceRatio = (event: Event) => {
    const video = event.currentTarget as HTMLVideoElement;
    if (video.dataset.sourceRatio) {
      video.style.setProperty('--video-source-ratio', video.dataset.sourceRatio);
      video.dataset.sourceRatioReady = '';
    }
  };
  videos.forEach(video => video.addEventListener('loadedmetadata', preserveSourceRatio));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  let destroyed = false;
  const lazyVideos = videos.filter(video => Boolean(video.dataset?.poster));
  const nearby = new Set<HTMLVideoElement>();
  const homeAtRest = () => typeof location !== 'undefined' && location.pathname === '/' && window.scrollY === 0;
  const loadNearby = () => {
    if (destroyed || paused || document.hidden || homeAtRest()) return;
    nearby.forEach(video => {
      if (owners.get(video) === owner && !video.closest('[hidden]')) void loadVideoPoster(video);
    });
  };
  let posterObserver: IntersectionObserver | undefined;
  const observePosters = () => {
    if (!lazyVideos.length) return;
    posterObserver?.disconnect();
    const scrollRoot = typeof HTMLElement !== 'undefined' && root instanceof HTMLElement ? root.closest<HTMLElement>('[data-case-scroll]') : null;
    posterObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) nearby.add(video); else nearby.delete(video);
      }
      loadNearby();
    }, { root: scrollRoot, rootMargin: `${window.innerHeight}px 0px`, threshold: 0 });
    lazyVideos.forEach(video => posterObserver!.observe(video));
  };
  const syncVideo = (video: HTMLVideoElement) => {
    if (destroyed || owners.get(video) !== owner) return;
    const intent = playbackIntent.get(video);
    if (paused || intent === false || (reduced.matches && intent !== true) || document.hidden || !visible.has(video)) {
      video.pause();
      if (reduced.matches && intent === undefined && video.readyState > 0) video.currentTime = 0;
      return;
    }
    if (!hasVideoPoster(video)) {
      void loadVideoPoster(video).then(() => syncVideo(video));
      return;
    }
    const loaded = attachVideoSources(video);
    // All autoplay begins muted; only an explicit sound choice enables audio.
    video.muted = !soundEnabled.has(video);
    if (loaded) video.load();
    void video.play().catch(() => {});
  };
  const sync = () => { videos.forEach(syncVideo); loadNearby(); };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const video = entry.target as HTMLVideoElement;
      if (entry.isIntersecting && entry.intersectionRatio > 0) visible.add(video);
      else visible.delete(video);
      syncVideo(video);
    }
  }, { threshold: 0 });
  videos.forEach(video => observer.observe(video));
  observePosters();
  if (lazyVideos.length) {
    window.addEventListener('scroll', loadNearby, { passive: true });
    window.addEventListener('resize', observePosters, { passive: true });
  }
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  const controller: VideoController = {
    setPaused(value) { paused = value; sync(); },
    refresh: sync,
    destroy() {
      destroyed = true;
      owner.active = false;
      observer.disconnect();
      posterObserver?.disconnect();
      if (lazyVideos.length) {
        window.removeEventListener('scroll', loadNearby);
        window.removeEventListener('resize', observePosters);
      }
      reduced.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      videos.forEach(video => {
        video.removeEventListener('loadedmetadata', preserveSourceRatio);
        if (owners.get(video) !== owner) return;
        const previous = previousOwners.get(video);
        if (previous?.active) {
          owners.set(video, previous);
          return; // Preserve playback position and buffered frames for the card.
        }
        owners.delete(video);
        cancelVideoPoster(video);
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
