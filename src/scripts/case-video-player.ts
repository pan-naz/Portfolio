import { setCaseVideoPlaying, setCaseVideoMuted } from './case-study-videos';

const timestamp = (seconds: number) => {
  const time = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(time / 60)}:${String(time % 60).padStart(2, '0')}`;
};

class CaseVideoPlayer extends HTMLElement {
  private events?: AbortController;

  connectedCallback() {
    this.events?.abort();
    this.events = new AbortController();
    const { signal } = this.events;
    const video = this.querySelector('video')!;
    const controls = this.querySelector<HTMLElement>('[data-video-controls]')!;
    const toggle = this.querySelector<HTMLButtonElement>('[data-video-toggle]')!;
    const mute = this.querySelector<HTMLButtonElement>('[data-video-mute]');
    const seek = this.querySelector<HTMLInputElement>('[data-video-seek]')!;
    const time = this.querySelector<HTMLElement>('[data-video-time]');
    const durationTime = this.querySelector<HTMLElement>('[data-video-duration]');
    const preview = this.querySelector<HTMLElement>('[data-video-preview]');
    const sheet = this.dataset.preview ? JSON.parse(this.dataset.preview) as {
      src: string; columns: number; rows: number; count: number; interval: number;
    } : undefined;
    let dragging = false;
    let duration = 0;
    let previewProgress = 0;

    const update = () => {
      duration = Number.isFinite(video.duration) ? video.duration : 0;
      seek.disabled = duration <= 0;
      seek.max = String(duration || 100);
      if (!dragging) seek.value = String(video.currentTime);
      const value = Number(seek.value);
      seek.style.setProperty('--video-progress', `${duration ? value / duration * 100 : 0}%`);
      seek.setAttribute('aria-valuetext', `${timestamp(value)} of ${timestamp(duration)}`);
      if (time) time.textContent = timestamp(value);
      if (durationTime) durationTime.textContent = timestamp(duration);
      toggle.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
      this.querySelector('[data-play-icon]')!.toggleAttribute('hidden', !video.paused);
      this.querySelector('[data-pause-icon]')!.toggleAttribute('hidden', video.paused);
      if (mute) {
        mute.setAttribute('aria-label', video.muted ? 'Sound off. Turn sound on' : 'Sound on. Turn sound off');
        mute.setAttribute('aria-pressed', String(!video.muted));
        this.querySelector('[data-muted-icon]')!.toggleAttribute('hidden', !video.muted);
        this.querySelector('[data-sound-icon]')!.toggleAttribute('hidden', video.muted);
      }
    };
    const hidePreview = () => { if (preview) preview.hidden = true; };
    const showPreview = (fraction: number) => {
      if (!preview || !sheet || !duration) return;
      const progress = Math.max(0, Math.min(1, fraction));
      previewProgress = progress;
      const index = Math.min(sheet.count - 1, Math.floor(progress * duration / sheet.interval));
      const frame = preview.querySelector<HTMLElement>('.case-video-preview-frame')!;
      // This static sheet loads on first interaction; no second video decoder.
      frame.style.backgroundImage = `url("${sheet.src}")`;
      frame.style.backgroundSize = `${sheet.columns * 100}% ${sheet.rows * 100}%`;
      frame.style.backgroundPosition = `${index % sheet.columns / Math.max(1, sheet.columns - 1) * 100}% ${Math.floor(index / sheet.columns) / Math.max(1, sheet.rows - 1) * 100}%`;
      preview.querySelector('[data-preview-time]')!.textContent = timestamp(progress * duration);
      preview.hidden = false;
      // Follow the timeline point across the whole controller, including its
      // buttons and timer. Layout offsets stay correct during parent transforms.
      const center = seek.parentElement!.offsetLeft + seek.offsetLeft + progress * seek.clientWidth;
      const half = preview.offsetWidth / 2;
      preview.style.left = `${Math.max(half, Math.min(controls.clientWidth - half, center))}px`;
    };
    toggle.addEventListener('click', () => setCaseVideoPlaying(video, video.paused), { signal });
    mute?.addEventListener('click', () => {
      setCaseVideoMuted(video, !video.muted);
      if (!video.muted && video.paused) setCaseVideoPlaying(video, true);
    }, { signal });
    seek.addEventListener('pointerdown', () => { dragging = true; this.setAttribute('data-seeking', ''); }, { signal });
    const finishSeek = () => {
      if (!dragging) return;
      dragging = false;
      this.removeAttribute('data-seeking');
      hidePreview();
      update();
    };
    window.addEventListener('pointerup', finishSeek, { signal });
    window.addEventListener('pointercancel', finishSeek, { signal });
    seek.addEventListener('input', () => {
      if (!duration) return;
      video.currentTime = Number(seek.value);
      showPreview(Number(seek.value) / duration);
      update();
    }, { signal });
    seek.addEventListener('pointermove', event => {
      const rect = seek.getBoundingClientRect();
      showPreview(dragging ? Number(seek.value) / duration : (event.clientX - rect.left) / rect.width);
    }, { signal });
    seek.addEventListener('pointerleave', () => { if (!dragging && !seek.matches(':focus-visible')) hidePreview(); }, { signal });
    seek.addEventListener('focus', () => showPreview(Number(seek.value) / duration), { signal });
    seek.addEventListener('blur', hidePreview, { signal });
    window.addEventListener('resize', () => {
      if (preview && !preview.hidden) showPreview(previewProgress);
    }, { signal });
    for (const event of ['loadedmetadata', 'durationchange', 'timeupdate', 'play', 'pause', 'emptied', 'volumechange']) {
      video.addEventListener(event, update, { signal });
    }
    video.controls = false;
    controls.hidden = false;
    update();
  }

  disconnectedCallback() { this.events?.abort(); }
}

if (!customElements.get('case-video-player')) customElements.define('case-video-player', CaseVideoPlayer);
