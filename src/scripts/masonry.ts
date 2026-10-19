import { arrangeProjectCards } from './work-filter/work-filter-model.ts';
/** Shared placement used by Work collections and the ordered Blaustrom steps. */
export function layoutMasonry(collection: HTMLElement, cards: HTMLElement[], columns: number, order: 'shortest' | 'alternate' = 'shortest', measure: (card: HTMLElement) => number = card => card.offsetHeight) {
  const gap = parseFloat(getComputedStyle(collection).gap);
  const cardWidth = (collection.clientWidth - gap * (columns - 1)) / columns;
  cards.forEach(card => { card.style.width = `${cardWidth}px`; });
  const arranged = arrangeProjectCards(cards.map(measure), columns, gap, order);
  collection.dataset.masonryReady = 'true';
  cards.forEach((card, index) => {
    const position = arranged.positions[index];
    card.style.left = `${position.column * (cardWidth + gap)}px`;
    card.style.top = `${position.top}px`;
  });
  collection.style.height = `${arranged.height}px`;
}
