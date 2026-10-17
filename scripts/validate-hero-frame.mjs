import fs from 'node:fs';
import path from 'node:path';

/** Hero borders share their underlying surface; travel adds colour to the existing flight. */
export function validateHeroFrame(root = process.cwd()) {
  const read = file => fs.readFileSync(path.join(root, file), 'utf8');
  const tokens = read('src/styles/tokens.css'), css = read('src/styles/global.css');
  const controller = read('src/scripts/case-study/case-studies.ts'), errors = [];
  if (!tokens.includes('--color-media-frame: var(--color-bg-canvas);')) errors.push('Hero frame role must default to local Canvas.');
  const frame = css.match(/:is\(\.project-media, \.case-study-transition-artwork, \.case-study-artwork\)\s*\{([^}]+)\}/)?.[1] || '';
  if (!frame.includes('border: 4px solid var(--color-media-frame);')) errors.push('Every hero frame must use the shared frame role without geometry changes.');
  if (!css.includes('.project-surface { --color-media-frame: var(--color-bg-canvas);') || !css.includes(".project-surface:not([data-theme='light'] .project-surface, [data-color-zone='light'] .project-surface) { --color-media-frame: var(--color-bg-surface); }")) errors.push('Card frames must follow the existing Light, Dark and fixed-Light surfaces.');
  for (const rule of css.matchAll(/[^{}]*\.project-surface[^{}]*\{([^}]+)\}/g)) {
    if (/background\s*:/.test(rule[1]) && !rule[1].includes('background: var(--color-media-frame);')) errors.push('The project surface and its frame must share one colour role.');
  }
  for (const fragment of ["getPropertyValue('--color-media-frame')", 'borderColor: frameColor(media)', 'borderColor: frameColor(hero)', 'borderColor: getComputedStyle(artwork ?? hero).borderTopColor', 'borderColor: frameColor(cardMedia)']) if (!controller.includes(fragment)) errors.push('Missing continuous source/destination hero frame colour: ' + fragment);
  return errors;
}
