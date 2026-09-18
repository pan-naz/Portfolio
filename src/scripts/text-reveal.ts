/** Keep the browser's original kerning; animate glyphs at measured native positions. */
export function splitLetters(element: HTMLElement, text: string) {
  element.replaceChildren();
  text.split(' ').forEach((word, wordIndex) => {
    if (wordIndex) element.append(' ');
    const wrapper = document.createElement('span');
    wrapper.className = 'reveal-word';
    const natural = document.createElement('span');
    natural.className = 'reveal-word-text';
    natural.textContent = word;
    wrapper.append(natural);
    element.append(wrapper);
    // The invisible native text supplies exact width, baseline and responsive flow.
    // Each visible glyph is drawn once; there is no mask, gradient or duplicate ink.
    const origin = wrapper.getBoundingClientRect().left;
    const fontSize = parseFloat(getComputedStyle(wrapper).fontSize);
    const range = document.createRange();
    const positions = Array.from(word, (_, letterIndex) => {
      range.setStart(natural.firstChild!, letterIndex);
      range.setEnd(natural.firstChild!, letterIndex + 1);
      return (range.getBoundingClientRect().left - origin) / fontSize;
    });
    for (const [letterIndex, letter] of Array.from(word).entries()) {
      const span = document.createElement('span');
      span.className = 'reveal-letter';
      span.style.setProperty('--glyph-x', `${positions[letterIndex]}em`);
      span.textContent = letter;
      wrapper.append(span);
    }
  });
  return [...element.querySelectorAll<HTMLElement>('.reveal-letter')];
}

/** Measure actual rendered lines, retaining inline emphasis and natural word breaks. */
export function splitLines(paragraph: HTMLElement) {
  const original = paragraph.innerHTML;
  const readable = document.createElement('span');
  readable.className = 'sr-only';
  readable.textContent = paragraph.textContent;
  const visual = document.createElement('span');
  visual.setAttribute('aria-hidden', 'true');
  const words: HTMLElement[] = [];
  for (const node of [...paragraph.childNodes]) {
    if (node.nodeType === Node.TEXT_NODE) {
      for (const token of (node.textContent ?? '').split(/(\s+)/)) {
        if (!token) continue;
        if (/^\s+$/.test(token)) { visual.append(token); continue; }
        const word = document.createElement('span');
        word.textContent = token;
        visual.append(word);
        words.push(word);
      }
    } else if (node instanceof HTMLElement) {
      const word = node.cloneNode(true) as HTMLElement;
      visual.append(word);
      words.push(word);
    }
  }
  paragraph.replaceChildren(readable, visual);
  // All geometry reads precede writes. There is no per-frame measurement.
  const tops = words.map(word => word.getBoundingClientRect().top);
  const lines: HTMLElement[] = [];
  let previousTop = -Infinity;
  words.forEach((word, index) => {
    if (Math.abs(tops[index] - previousTop) > 2) {
      const line = document.createElement('span');
      line.className = 'reveal-line';
      lines.push(line);
      previousTop = tops[index];
    }
    const line = lines[lines.length - 1];
    if (line.childNodes.length && word.previousSibling?.nodeType === Node.TEXT_NODE) line.append(' ');
    line.append(word.cloneNode(true));
  });
  visual.replaceChildren(...lines);
  return { lines, restore: () => { paragraph.innerHTML = original; } };
}
