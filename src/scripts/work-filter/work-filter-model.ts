/** Stable, row-wise reading order: each next card occupies the shorter column. */
export function arrangeProjectCards(heights: number[], columns: number, gap: number, order: 'shortest' | 'alternate' = 'shortest') {
  const bottoms = Array.from({ length: Math.max(1, columns) }, () => 0);
  const positions = heights.map((height, index) => {
    const column = order === 'alternate' ? index % bottoms.length : bottoms.indexOf(Math.min(...bottoms));
    const top = bottoms[column];
    bottoms[column] = top + height + gap;
    return { column, top };
  });
  return { positions, height: Math.max(0, ...bottoms) - (heights.length ? gap : 0) };
}
