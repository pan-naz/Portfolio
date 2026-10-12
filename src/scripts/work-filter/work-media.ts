import { preloadCaseVideo } from '../case-study/case-study-videos.ts';
import { loadVideoPoster } from '../case-study/video-posters.ts';
import { isDataSaving, mediaConnection } from '../case-study/video-policy.ts';

type BackgroundScheduler = { postTask(task: () => void, options: { priority: 'background'; signal: AbortSignal }): Promise<void> };

function scheduleBackground(task: () => void, signal: AbortSignal) {
  const scheduler = (window as Window & { scheduler?: BackgroundScheduler }).scheduler;
  if (scheduler) {
    void scheduler.postTask(task, { priority: 'background', signal }).catch(() => {});
  } else if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(() => { if (!signal.aborted) task(); }, { timeout: 1000 });
    signal.addEventListener('abort', () => window.cancelIdleCallback(handle), { once: true });
  } else {
    const handle = window.setTimeout(() => { if (!signal.aborted) task(); }, 0);
    signal.addEventListener('abort', () => window.clearTimeout(handle), { once: true });
  }
}

/** Intro effects start independently; background preparation never plays a video. */
export function initializeWorkMedia(started: Promise<void>) {
  const work = document.querySelector<HTMLElement>('#work');
  const list = work?.querySelector<HTMLElement>('[data-active-filter]');
  if (!work || !list) return;
  const collections = [...work.querySelectorAll<HTMLElement>('[data-project-collection]')];
  const lifecycle = new AbortController();
  let introStarted = false, destroyed = false, generation = 0;
  let queued: AbortController | undefined;
  const eligible = () => {
    return introStarted && !destroyed && !document.hidden && location.pathname === '/'
      && !isDataSaving();
  };
  const prepare = async (ticket: number) => {
    const filter = list.dataset.activeFilter;
    const collection = collections.find(item => item.dataset.projectCollection === filter);
    if (!collection) return;
    const valid = () => ticket === generation && eligible() && list.dataset.activeFilter === filter && !collection.hidden;
    const videos = [...collection.querySelectorAll<HTMLElement>('.project')].slice(0, 3)
      .map(card => card.querySelector<HTMLVideoElement>('[data-project-video]'));
    // Keep the requested order: three decoded posters, then video buffering.
    for (const video of videos) {
      if (!valid()) return;
      if (video) await loadVideoPoster(video, 'low');
    }
    for (const [index, video] of videos.entries()) {
      if (!valid()) return;
      if (video) preloadCaseVideo(video, index === 0 ? 'auto' : 'metadata');
    }
  };
  const queue = () => {
    queued?.abort();
    const ticket = ++generation;
    if (!eligible()) return;
    queued = new AbortController();
    scheduleBackground(() => { void prepare(ticket).catch(() => {}); }, queued.signal);
  };
  const destroy = () => { destroyed = true; generation++; queued?.abort(); lifecycle.abort(); };
  work.addEventListener('workfilterchange', queue, { signal: lifecycle.signal });
  document.addEventListener('visibilitychange', queue, { signal: lifecycle.signal });
  mediaConnection()?.addEventListener?.('change', queue, { signal: lifecycle.signal });
  window.addEventListener('pagehide', event => { if (!event.persisted) destroy(); }, { signal: lifecycle.signal });
  // Reduced-motion/readable fallbacks also keep the first-screen fonts first.
  void started.then(() => document.fonts.ready).then(() => { introStarted = true; queue(); }).catch(() => {});
  return { destroy };
}
