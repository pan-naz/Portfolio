export interface HeroImageTransfer {
  image: HTMLImageElement;
  node: HTMLElement;
  placeholder: HTMLElement;
  alt: string;
}

const imageNode = (image: HTMLImageElement): HTMLElement => image.parentElement?.tagName === 'PICTURE' ? image.parentElement : image;

/** Keep the source's responsive layout while its actual image travels. */
export function reserveHeroImage(image: HTMLImageElement): HeroImageTransfer {
  const node = imageNode(image);
  const placeholder = node.cloneNode(true) as HTMLElement;
  placeholder.dataset.caseImageSlot = '';
  placeholder.setAttribute('aria-hidden', 'true');
  node.replaceWith(placeholder);
  return { image, node, placeholder, alt: image.alt };
}

export function restoreHeroImage(transfer: HeroImageTransfer) {
  transfer.image.alt = transfer.alt;
  transfer.placeholder.replaceWith(transfer.node);
}

/** Matching assets keep their live animation frame from card to case and back. */
export function borrowHeroImage(card: HTMLElement, hero: HTMLElement): HeroImageTransfer | undefined {
  if (card.querySelector('video') || hero.querySelector('video')) return;
  const cardImage = card.querySelector('img');
  const heroImage = hero.querySelector('img');
  if (!cardImage || !heroImage || (cardImage.currentSrc || cardImage.src) !== (heroImage.currentSrc || heroImage.src)) return;
  const transfer = reserveHeroImage(cardImage);
  imageNode(heroImage).replaceWith(transfer.node);
  transfer.image.alt = heroImage.alt;
  return transfer;
}
