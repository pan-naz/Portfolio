import type { WorkFilter } from './work-filter';
import type { initializeProjectCursor } from './project-cursor';
import { initializeSmoothScroll, pauseScroll, resumeScroll, repositionWork } from './motion';
import { refreshViewportPointer } from './viewport-pointer';
import { initializeCaseStudyVideos } from './case-study-videos';
import { initializeCaseStudyImages } from './case-study-images';
import { borrowHeroImage, reserveHeroImage, restoreHeroImage, type HeroImageTransfer } from './case-study-artwork';
import { readCaseStudyMotion } from './case-study-motion';
import { suspendCaseStudyScrollRestoration } from './case-study-navigation';
import { rescopeSvgAssets } from './svg-asset';
import { initializeControlMagnet } from './control-magnet';

type Cursor = NonNullable<ReturnType<typeof initializeProjectCursor>>;

export function initializeCaseStudies(cursor: Cursor | undefined, onChange: (open: boolean) => void, selectFilter?: (filter: WorkFilter) => void) {
  const dialog = document.querySelector<HTMLDialogElement>('[data-case-dialog]');
  const panel = dialog?.querySelector<HTMLElement>('[data-case-panel]');
  const scroll = dialog?.querySelector<HTMLElement>('[data-case-scroll]');
  if (!dialog || !panel || !scroll || !cursor) return;
  const motion = readCaseStudyMotion(getComputedStyle(document.documentElement));
  // A modal top layer keeps the page inert, including the floating site controls.
  document.body.append(dialog);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active: HTMLAnchorElement | null = null;
  let control: HTMLElement | null = null;
  let clone: HTMLElement | null = null;
  let artwork: HTMLElement | null = null;
  let borrowedVideo: { video: HTMLVideoElement; home: HTMLElement; hidden: string | null; label: string | null } | null = null;
  let borrowedImage: HeroImageTransfer | undefined;
  let travelingImage: HeroImageTransfer | undefined;
  let phase: 'closed' | 'opening' | 'open' | 'closing' = 'closed';
  let animations: Animation[] = [];
  let caseVideos: ReturnType<typeof initializeCaseStudyVideos> | undefined;
  let caseImages: ReturnType<typeof initializeCaseStudyImages> | undefined;
  let caseScroll: ReturnType<typeof initializeSmoothScroll> | undefined;
  let closeMagnet: ReturnType<typeof initializeControlMagnet> | undefined;
  let revision = 0;
  let closeRequested = false;
  let oldTitle = document.title;
  let origin = { x: 0, y: 0 };
  let returnUrl = `${location.pathname}${location.search}${location.hash}`;
  let originScrollTop = 0;
  let restoreHistoryScroll: (() => void) | undefined;
  const play = async (element: Element, frames: Keyframe[], options: KeyframeAnimationOptions = {}) => {
    const animation = element.animate(frames, { duration: motion.openDuration, easing: motion.travelEasing, fill: 'both', ...options, ...(reduced.matches ? { duration: 0, delay: 0 } : {}) });
    animations.push(animation);
    await animation.finished.catch(() => {});
  };
  const cancelAnimations = () => { animations.forEach(animation => animation.cancel()); animations = []; };
  const cardFrame = () => {
    const card = active!.closest<HTMLElement>('.project')!;
    const rect = card.getBoundingClientRect();
    return { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, borderRadius: getComputedStyle(card).borderRadius };
  };
  const fullFrame = () => ({ left: '0px', top: '0px', width: `${innerWidth}px`, height: `${innerHeight}px`, borderRadius: '0px' });
  const buttonAt = (x: number, y: number) => `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
  const topCenter = () => buttonAt(innerWidth / 2, motion.controlInset + motion.controlSize / 2);
  const lockScroll = (locked: boolean) => scroll.toggleAttribute('data-scroll-locked', locked);
  const viewportPosition = (frame: { left: string; top: string }) => ({
    left: `${-parseFloat(frame.left)}px`, top: `${-parseFloat(frame.top)}px`,
  });
  const contentOffset = () => reduced.matches ? 'none' : `translateY(${motion.copyDistance}px)`;
  // Both the panel and artwork animate with the same easing. Local coordinates
  // compose into a single viewport path from the actual source to destination.
  const artworkFrame = (element: HTMLElement, container: { left: number; top: number }) => {
    const bounds = element.getBoundingClientRect();
    return {
      left: `${bounds.left - container.left}px`, top: `${bounds.top - container.top}px`,
      width: `${bounds.width}px`, height: `${bounds.height}px`,
    };
  };
  const reserveVideoSpace = (video: HTMLVideoElement) => {
    const placeholder = document.createElement('div');
    placeholder.style.aspectRatio = `${video.width || video.videoWidth} / ${video.height || video.videoHeight}`;
    placeholder.setAttribute('aria-hidden', 'true');
    placeholder.dataset.caseVideoSlot = '';
    video.replaceWith(placeholder);
  };
  const videoSource = (video: HTMLVideoElement) => {
    const source = video.querySelector('source');
    return video.currentSrc || video.src || (source && new URL(source.dataset.src || source.src, document.baseURI).href);
  };
  const createArtwork = (source: HTMLElement) => {
    artwork = document.createElement('div');
    artwork.className = 'case-study-transition-artwork';
    artwork.style.background = source.style.background;
    artwork.setAttribute('aria-hidden', 'true');
    panel.append(artwork);
    const video = source.querySelector('video');
    if (video) {
      reserveVideoSpace(video);
      // Preserve the full hero composition around the live recording.
      source.childNodes.forEach(node => artwork!.append(node.cloneNode(true)));
      artwork.querySelector('[data-case-video-slot]')!.replaceWith(video);
      caseVideos?.refresh();
    } else {
      const image = source.querySelector('img');
      travelingImage = image ? reserveHeroImage(image) : undefined;
      source.childNodes.forEach(node => artwork!.append(node.cloneNode(true)));
      if (travelingImage) artwork.querySelector('[data-case-image-slot]')!.replaceWith(travelingImage.node);
      artwork.querySelectorAll('img').forEach(image => image.loading = 'eager');
    }
  };

  const open = async (link: HTMLAnchorElement, point?: { x: number; y: number }, push = true) => {
    if (phase !== 'closed') return;
    const id = link.dataset.caseLink;
    const template = document.querySelector<HTMLTemplateElement>(`template[data-case-template="${id}"]`);
    if (!template) return;
    phase = 'opening';
    lockScroll(true);
    closeRequested = false;
    if (link.closest('[hidden]')) {
      selectFilter?.(link.closest<HTMLElement>('.project')!.dataset.projectCategory as WorkFilter);
    }
    const ticket = ++revision;
    active = link;
    originScrollTop = window.scrollY;
    restoreHistoryScroll = suspendCaseStudyScrollRestoration();
    oldTitle = document.title;
    const rect = link.closest('.project')!.getBoundingClientRect();
    const media = link.querySelector<HTMLElement>('.project-media')!;
    const sourceArtwork = artworkFrame(media, rect);
    const halfControl = motion.controlSize / 2;
    origin = point ?? { x: Math.max(halfControl, Math.min(innerWidth - halfControl, rect.left + rect.width / 2)), y: Math.max(halfControl, Math.min(innerHeight - halfControl, rect.top + motion.controlSize + motion.controlInset / 2)) };
    if (push) {
      returnUrl = `${location.pathname}${location.search}${location.hash}`;
      history.pushState({
        ...history.state, caseStudy: id,
        portfolioCaseOrigin: { url: returnUrl, top: window.scrollY },
      }, '', link.href);
    }
    scroll.replaceChildren(template.content.cloneNode(true));
    const title = scroll.querySelector<HTMLElement>('[data-case-title]')!;
    if (!title.id) title.id = 'active-case-title';
    dialog.setAttribute('aria-labelledby', title.id);
    document.title = `${title.textContent} — naz.wtf`;
    clone = document.createElement('div');
    clone.className = 'case-study-origin project';
    clone.setAttribute('aria-hidden', 'true');
    clone.inert = true;
    clone.style.width = `${rect.width}px`;
    clone.append(link.querySelector('.project-caption')!.cloneNode(true));
    // The source caption becomes hidden during travel. Its masks, gradients and
    // clips cannot supply the copy's artwork; keep those definitions local.
    rescopeSvgAssets(clone);
    clone.querySelectorAll('[id]').forEach(element => {
      if (!element.closest('svg')) element.removeAttribute('id');
    });
    if (link.closest('.project--compact')) clone.classList.add('project--compact');
    panel.append(clone);
    control = cursor.claim();
    control.style.transform = buttonAt(origin.x, origin.y);
    dialog.append(control);
    const closeButton = control.querySelector<HTMLButtonElement>('button')!;
    closeButton.addEventListener('click', requestClose);
    closeButton.autofocus = true;
    onChange(true);
    pauseScroll();
    document.documentElement.classList.add('case-study-open');
    dialog.showModal();
    closeButton.autofocus = false;
    scroll.scrollTop = 0;
    // Measure the destination at its final layout, before applying travel frames.
    Object.assign(panel.style, fullFrame());
    const hero = scroll.querySelector<HTMLElement>('.case-study-artwork')!;
    const destinationArtwork = artworkFrame(hero, panel.getBoundingClientRect());
    const cardVideo = media.querySelector('video');
    const heroVideo = hero.querySelector('video');
    if (cardVideo && heroVideo && videoSource(cardVideo) === videoSource(heroVideo)) {
      borrowedVideo = { video: cardVideo, home: cardVideo.parentElement!, hidden: cardVideo.getAttribute('aria-hidden'), label: cardVideo.getAttribute('aria-label') };
      reserveVideoSpace(cardVideo);
      cardVideo.removeAttribute('aria-hidden');
      cardVideo.setAttribute('aria-label', heroVideo.getAttribute('aria-label') || '');
      heroVideo.replaceWith(cardVideo);
    }
    borrowedImage = borrowHeroImage(media, hero);
    createArtwork(hero);
    // Include the traveling video as well as the case's body videos. It keeps
    // the same owner when it moves into the hero after the flight.
    caseVideos = initializeCaseStudyVideos(panel);
    caseImages = initializeCaseStudyImages(panel);
    caseVideos.refresh();
    hero.style.visibility = 'hidden';
    active.closest<HTMLElement>('.project')!.style.visibility = 'hidden';
    const source = cardFrame();
    // Keep the card silhouette throughout the flight, then gently square the corners.
    const travel = play(panel, [source, { ...fullFrame(), borderRadius: source.borderRadius }]);
    const imageTravel = play(artwork!, [sourceArtwork, destinationArtwork]);
    // Counter the panel's movement so copy stays in viewport coordinates and
    // only its own vertical fade is visible, regardless of the card's column.
    play(scroll, [viewportPosition(source), { left: '0px', top: '0px' }]);
    play(clone, [{ left: '0px', top: '0px' }, { left: source.left, top: source.top }]);
    const corners = play(panel, [{ borderRadius: source.borderRadius }, { borderRadius: '0px' }], {
      delay: motion.openDuration, duration: motion.cornersDuration, easing: motion.cornersEasing,
    });
    play(clone, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: contentOffset() }], { duration: motion.captionExitDuration });
    const body = scroll.querySelector<HTMLElement>('.case-study-body')!;
    play(body, [{ opacity: 0, transform: contentOffset() }, { opacity: 1, transform: 'none' }], { delay: motion.bodyEnterDelay, duration: motion.bodyEnterDuration });
    play(control, [{ transform: buttonAt(origin.x, origin.y) }, { transform: topCenter() }]);
    play(control.querySelector('svg')!, [{ transform: 'rotate(0deg)' }, { transform: `rotate(${motion.controlRotation}deg)` }]);
    await Promise.all([travel, imageTravel]);
    if (ticket !== revision) return;
    phase = 'open';
    control.style.transform = topCenter();
    control.querySelector('svg')!.style.transform = `rotate(${motion.controlRotation}deg)`;
    clone.style.opacity = '0';
    const travelingVideo = artwork?.querySelector('video');
    if (travelingVideo) {
      hero.querySelector('[data-case-video-slot]')!.replaceWith(travelingVideo);
      caseVideos?.refresh();
    }
    if (travelingImage) {
      restoreHeroImage(travelingImage);
      travelingImage = undefined;
    }
    hero.style.removeProperty('visibility');
    artwork?.remove(); artwork = null;
    // Release the real hero at the shared travel endpoint, while the decorative
    // corner finish continues independently.
    lockScroll(false);
    caseScroll = initializeSmoothScroll(scroll, scroll.querySelector<HTMLElement>('[data-case-content]')!);
    await corners;
    if (ticket !== revision) return;
    panel.style.cssText = 'inset:0;width:100%;height:100%;border-radius:0';
    cancelAnimations();
    closeMagnet = initializeControlMagnet(control.querySelector<HTMLButtonElement>('button')!);
  };

  const close = async () => {
    if (phase === 'closed' || phase === 'closing' || !active || !control) return;
    phase = 'closing';
    closeMagnet?.destroy(); closeMagnet = undefined;
    // Freeze any remaining glide before measuring the return animation.
    caseScroll?.destroy();
    caseScroll = undefined;
    lockScroll(false);
    control.hidden = true;
    const ticket = ++revision;
    // Start from the current rendered frame, including an interrupted expansion.
    const panelStyle = getComputedStyle(panel);
    const start = { left: panelStyle.left, top: panelStyle.top, width: panelStyle.width, height: panelStyle.height, borderRadius: panelStyle.borderRadius };
    const hero = scroll.querySelector<HTMLElement>('.case-study-artwork')!;
    // During an interrupted opening, continue from the traveling image itself.
    const imageStart = artworkFrame(artwork ?? hero, panel.getBoundingClientRect());
    const restoreHero = !artwork && scroll.scrollTop > 0;
    if (restoreHero) imageStart.top = `${parseFloat(imageStart.top) + scroll.scrollTop}px`;
    if (!artwork) createArtwork(hero);
    hero.style.visibility = 'hidden';
    cancelAnimations();
    // Release the modal and its dimmed backdrop immediately. Keep only a
    // pointer-transparent visual layer while the artwork returns to the page.
    dialog.classList.add('is-closing');
    dialog.close();
    document.documentElement.classList.remove('case-study-open');
    resumeScroll();
    repositionWork(originScrollTop);
    const destination = cardFrame();
    const card = active.closest<HTMLElement>('.project')!;
    const cardMedia = active.querySelector<HTMLElement>('.project-media')!;
    const cardCaption = active.querySelector<HTMLElement>('.project-caption')!;
    const imageDestination = artworkFrame(cardMedia, card.getBoundingClientRect());
    // Restore the card surface while its traveling image and fading caption
    // stand in for the originals until the return finishes.
    cardMedia.style.visibility = 'hidden';
    cardCaption.style.visibility = 'hidden';
    card.style.removeProperty('visibility');
    // Counter the panel's travel so the caption fades in while rising gently
    // from 16px below, together with the surface and hero return.
    let captionFade: Promise<unknown> | undefined;
    if (clone) {
      clone.style.opacity = '1';
      clone.style.transform = 'none';
      void play(clone, [
        { left: `${parseFloat(destination.left) - parseFloat(start.left)}px`, top: `${parseFloat(destination.top) - parseFloat(start.top)}px` },
        { left: '0px', top: '0px' },
      ], { duration: motion.closeDuration });
      captionFade = play(clone, [
        { opacity: 0, transform: contentOffset() },
        { opacity: 1, transform: 'none' },
      ], { delay: motion.captionEnterDelay, duration: motion.captionEnterDuration });
    }
    const returnScrollY = window.scrollY;
    const followPageScroll = () => { panel.style.transform = `translateY(${returnScrollY - window.scrollY}px)`; };
    window.addEventListener('scroll', followPageScroll, { passive: true });
    const travel = play(panel, [{ ...start, borderRadius: destination.borderRadius }, destination], { duration: motion.closeDuration });
    const imageTravel = play(artwork!, [imageStart, imageDestination], { duration: motion.closeDuration });
    await Promise.all([travel, imageTravel, captionFade]);
    window.removeEventListener('scroll', followPageScroll);
    if (ticket !== revision) return;
    if (borrowedVideo) {
      const { video, home, hidden, label } = borrowedVideo;
      home.replaceChildren(video);
      for (const [name, value] of [['aria-hidden', hidden], ['aria-label', label]] as const) {
        if (value === null) video.removeAttribute(name);
        else video.setAttribute(name, value);
      }
      borrowedVideo = null;
    }
    if (borrowedImage) {
      restoreHeroImage(borrowedImage);
      borrowedImage = undefined;
    }
    travelingImage = undefined;
    caseVideos?.destroy();
    caseImages?.destroy();
    caseVideos = undefined;
    caseImages = undefined;
    cardMedia.style.removeProperty('visibility');
    cardCaption.style.removeProperty('visibility');
    control.hidden = true;
    control.querySelector('button')!.removeEventListener('click', requestClose);
    dialog.classList.remove('is-closing');
    panel.style.removeProperty('transform');
    cancelAnimations();
    artwork?.remove(); artwork = null;
    clone?.remove(); clone = null;
    scroll.replaceChildren();
    lockScroll(false);
    document.title = oldTitle;
    cursor.release();
    control = null;
    active.focus({ preventScroll: true });
    active = null;
    phase = 'closed';
    closeRequested = false;
    restoreHistoryScroll?.();
    restoreHistoryScroll = undefined;
    // Keep card tilt paused until the real card has replaced the return layer.
    // Releasing it here lets the spring ease from neutral toward a stationary
    // pointer instead of completing behind the closing panel and appearing to snap.
    onChange(false);
    refreshViewportPointer();
    // A Forward action can arrive while the reverse transition is still running.
    reconcileLocation();
  };
  function requestClose() {
    if (phase === 'closed' || phase === 'closing' || closeRequested) return;
    closeMagnet?.destroy(); closeMagnet = undefined;
    closeRequested = true;
    if (control) control.hidden = true;
    if (history.state?.caseStudy) history.back();
    else { history.replaceState(history.state, '', returnUrl); void close(); }
  }
  document.querySelector('#work')?.addEventListener('click', event => {
    if (!(event instanceof MouseEvent) || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('[data-case-link]') : null;
    if (!link || link.closest('[inert], [hidden]')) return;
    event.preventDefault();
    void open(link, event.detail ? { x: event.clientX, y: event.clientY } : undefined);
  });
  dialog.addEventListener('keydown', event => {
    if (scroll.hasAttribute('data-scroll-locked')) {
      if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Tab'].includes(event.key)) event.preventDefault();
      return;
    }
    if (event.key !== 'Tab') return;
    const targets = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')]
      .filter(target => target.getClientRects().length && !target.closest('[hidden], [inert]'));
    const first = targets[0], last = targets.at(-1);
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  });
  const preventLockedScroll = (event: Event) => { if (scroll.hasAttribute('data-scroll-locked')) event.preventDefault(); };
  dialog.addEventListener('wheel', preventLockedScroll, { passive: false });
  dialog.addEventListener('touchmove', preventLockedScroll, { passive: false });
  dialog.addEventListener('cancel', event => { event.preventDefault(); requestClose(); });
  function reconcileLocation() {
    const link = [...document.querySelectorAll<HTMLAnchorElement>('#work [data-case-link]')].find(link => link.pathname === location.pathname);
    if (link && phase === 'closed') void open(link, undefined, false);
    else if ((!link || link !== active) && phase !== 'closed') void close();
  }
  window.addEventListener('popstate', reconcileLocation);
  window.addEventListener('resize', () => {
    if (phase === 'open' && control) control.style.transform = topCenter();
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) animations.forEach(animation => animation.finish());
  });
}
