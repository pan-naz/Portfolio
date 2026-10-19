import { layoutMasonry } from '../masonry';
/** ResizeObserver runs before paint, including after a popup clone becomes measurable. */
class CaseStudyMasonry extends HTMLElement {
  private frame = 0;
  private readonly resize = new ResizeObserver(() => {
    if (!this.frame) this.frame = requestAnimationFrame(() => { this.frame = 0; this.layout(); });
  });
  private layout = () => {
    if (!this.clientWidth) return;
    const cards = [...this.children] as HTMLElement[];
    if (getComputedStyle(this).gridTemplateColumns.split(' ').length > 1) {
      layoutMasonry(this, cards, 2, 'alternate', card => card.getBoundingClientRect().height);
    } else {
      delete this.dataset.masonryReady;
      this.style.removeProperty('height');
      cards.forEach(card => ['width', 'left', 'top'].forEach(name => card.style.removeProperty(name)));
    }
  };
  connectedCallback() {
    this.layout();
    window.addEventListener('resize', this.layout);
    this.resize.observe(this);
    [...this.children].forEach(card => this.resize.observe(card));
    void document.fonts.ready.then(() => { if (this.isConnected) this.layout(); });
  }
  disconnectedCallback() {
    this.resize.disconnect();
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    window.removeEventListener('resize', this.layout);
  }
}
if (!customElements.get('case-study-masonry')) customElements.define('case-study-masonry', CaseStudyMasonry);
