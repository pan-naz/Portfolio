export interface HeroImageTransfer {
  image: HTMLImageElement;
  node: HTMLElement;
  placeholder: HTMLElement;
  alt: string;
  release?: () => void;
}

const imageNode = (image: HTMLImageElement): HTMLElement => image.parentElement?.tagName === 'PICTURE' ? image.parentElement : image;

/** Keep the source's responsive layout while its actual image travels. */
export function reserveHeroImage(image: HTMLImageElement): HeroImageTransfer {
  const node = imageNode(image);
  // Import into an inert template document before stripping source attributes.
  const reservation = document.createElement('template');
  const placeholder = reservation.content.ownerDocument.importNode(node, true) as HTMLElement;
  // A reservation keeps geometry, never a second loading/decoding copy.
  for (const item of [placeholder, ...placeholder.querySelectorAll('img, source')]) {
    for (const name of ['src', 'srcset', 'data-src', 'data-srcset', 'data-case-animated-image']) item.removeAttribute(name);
  }
  placeholder.dataset.caseImageSlot = '';
  placeholder.setAttribute('aria-hidden', 'true');
  node.replaceWith(placeholder);
  return { image, node, placeholder, alt: image.alt };
}

export function restoreHeroImage(transfer: HeroImageTransfer) {
  transfer.image.alt = transfer.alt;
  transfer.placeholder.replaceWith(transfer.node);
  transfer.release?.();
}

const originalImage = (image: HTMLImageElement) => image.getAttribute('src') || image.src;

const prepared = new WeakMap<HTMLTemplateElement, Map<string, HTMLImageElement>>();

// Chrome may prefer a cached hero candidate after reparenting a responsive card.
// Keep that card's decoded selection until a real viewport change requires resizing.
const pinned = new Map<HTMLImageElement, { card: HTMLElement; width: number; attributes: { element: HTMLImageElement | HTMLSourceElement; srcset: string | null }[] }>();
const releaseResizedCards = () => {
  for (const [image, pin] of pinned) {
    if (pin.width === innerWidth || !pin.card.contains(image)) continue;
    for (const { element, srcset } of pin.attributes) {
      if (srcset === null) element.removeAttribute('srcset'); else element.setAttribute('srcset', srcset);
    }
    pinned.delete(image);
  }
};
if (typeof window !== 'undefined') window.addEventListener('resize', releaseResizedCards, { passive: true });


/** One decoded destination candidate; neither the hidden hero nor its slot loads a copy. */
export function prepareHeroImage(template: HTMLTemplateElement, card: HTMLElement): HTMLImageElement | undefined {
  if (card.querySelector('video')) return;
  const original = template.content.querySelector<HTMLImageElement>('.case-study-artwork img');
  const shown = card.querySelector<HTMLImageElement>('img');
  if (!original || !shown || originalImage(original) !== originalImage(shown)) return;
  if (!shown.currentSrc) return;
  const picture = original.parentElement;
  const extension = (shown.currentSrc || shown.src).split('?')[0].split('.').at(-1);
  const source = picture?.tagName === 'PICTURE' ? [...picture.querySelectorAll('source')].find(source => source.type === `image/${extension}`) : undefined;
  const candidates = (source?.srcset || original.srcset).split(',').map(value => {
    const [src, width] = value.trim().split(/\s+/);
    return { src, width: parseFloat(width) };
  }).filter(item => item.src && Number.isFinite(item.width));
  if (!candidates.length) return;
  const required = innerWidth * devicePixelRatio;
  const url = candidates.find(item => item.width >= required)?.src || candidates.at(-1)?.src || original.src;
  const cache = prepared.get(template) || new Map<string, HTMLImageElement>();
  prepared.set(template, cache);
  if (cache.has(url)) return cache.get(url);
  const image = new Image();
  for (const attribute of original.attributes) if (!['src', 'srcset', 'sizes', 'loading', 'fetchpriority'].includes(attribute.name)) image.setAttribute(attribute.name, attribute.value);
  image.loading = 'eager';
  image.fetchPriority = 'high';
  image.src = url;
  cache.set(url, image);
  return image;
}

/** Responsive versions of one original keep the card's decoded pixels during travel. */
export function borrowHeroImage(card: HTMLElement, hero: HTMLElement): HeroImageTransfer | undefined {
  if (card.querySelector('video') || hero.querySelector('video')) return;
  const cardImage = card.querySelector('img');
  const heroImage = hero.querySelector('img');
  if (!cardImage || !heroImage || originalImage(cardImage) !== originalImage(heroImage)) return;
  const selected = cardImage.currentSrc;
  if (selected && selected !== cardImage.src && !pinned.has(cardImage)) {
    const elements = [cardImage, ...imageNode(cardImage).querySelectorAll<HTMLSourceElement>('source[srcset]')];
    pinned.set(cardImage, { card, width: innerWidth, attributes: elements.map(element => ({ element, srcset: element.getAttribute('srcset') })) });
    const candidate = elements.flatMap(element => (element.getAttribute('srcset') || '').split(',').map(value => value.trim().split(/\s+/))).find(([url]) => url && (url === selected || new URL(url, document.baseURI).href === selected));
    const selection = candidate?.[1] ? `${selected} ${candidate[1]}` : selected;
    for (const element of elements) element.setAttribute('srcset', selection);
  }
  const transfer = reserveHeroImage(cardImage);
  transfer.release = releaseResizedCards;
  imageNode(heroImage).replaceWith(transfer.node);
  transfer.image.alt = heroImage.alt;
  return transfer;
}
