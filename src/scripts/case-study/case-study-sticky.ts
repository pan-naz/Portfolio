/** Native sticky positioning works in standalone pages and cloned case dialogs. */
class CaseStudySticky extends HTMLElement {
  private readonly resize = new ResizeObserver(([entry]) => {
    const height = entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height;
    this.style.setProperty('--case-sticky-height', `${height}px`);
  });

  connectedCallback() {
    this.resize.observe(this);
  }

  disconnectedCallback() {
    this.resize.disconnect();
  }
}

if (!customElements.get('case-study-sticky')) {
  customElements.define('case-study-sticky', CaseStudySticky);
}
