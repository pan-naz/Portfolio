import {existsSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';

/** Headings outside fenced examples define sections; prose is free to evolve. */
export function documentationSections(text) {
  const lines = text.split('\n'), sections = [];
  let fence, stack = [];
  for (let index = 0; index < lines.length; index++) {
    const marker = lines[index].match(/^\s*(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1][0];
      else if (marker[1][0] === fence) fence = undefined;
      continue;
    }
    if (fence) continue;
    const heading = lines[index].match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!heading) continue;
    const level = heading[1].length, title = heading[2];
    while (stack.length && stack.at(-1).level >= level) stack.pop();
    const parents = stack.filter(section => section.level > 1).map(section => section.title);
    const section = {title, level, line: index, path: [...parents, title].join(' / ')};
    sections.push(section);
    stack.push(section);
  }
  return sections.map((section, index) => {
    const end = sections.slice(index + 1).find(next => next.level <= section.level)?.line ?? lines.length;
    return {...section, body: lines.slice(section.line + 1, end).join('\n').trim()};
  });
}

const components = ['Button', 'Chip', 'Decision card', 'Navigation', 'Project card', 'Section heading', 'Statistic', 'Timeline row', 'Tool card & Tooltip'];
const cases = ['Voximplant Kit', 'DataGPT', 'Hooko', 'Peak Hotel', 'Yellow Leaf', 'Index Law Firm', 'Blaustrom', 'Cravus', 'PromShyna', 'Gutsul Made', 'Team Sternfit', 'Pet Care', 'SQUARE', 'Kitchen Chatbot', 'Telegram File Picker', 'Design Cup', 'IVR System', 'OFFF Conference', 'Professions', 'Quit University'];
export const hiddenSections = ['Accessibility', 'Writing', 'Wordmark', 'Before and after', 'Steps', 'Media', 'Project identity', 'Project tags', 'Project filter', 'Theme switch', 'Icon'];
const under = (parent, titles) => titles.map(title => `${parent} / ${title}`);
export const documentationContract = {
  'DESIGN.md': [
    'Purpose and sources of truth', 'Foundations',
    ...under('Foundations', ['Color', 'Typography', 'Spacing and layout', 'Motion', 'Icons']),
    'Components', ...under('Components', [...components, 'Documented parts']),
    'Website sections', ...under('Website sections', ['Header and navigation', 'Hero', 'Work', 'Impact', 'About', 'Contact', 'Footer', '404']),
    'Case studies', ...under('Case studies', cases),
    'Interaction and motion behaviour', ...under('Interaction and motion behaviour', ['Case-study open and close', 'Reveals and decorative motion', 'Scrolling', 'Media loading and controls', 'Reduced motion']),
    'Accessibility', 'Copy rules',
  ],
  'docs/design-system.md': [
    'Purpose and sources', 'Inventory and naming', 'Navigation and lifecycle', 'Frames, cards and stages', 'Catalog controls',
    'Foundations', ...under('Foundations', ['Color', 'Typography', 'Spacing & layout', 'Motion', 'Icons']),
    'Component pages', ...under('Component pages', components),
    'Code tabs', 'Overview and cover rendering',
    'Documented parts', ...under('Documented parts', hiddenSections), 'Validation and maintenance',
  ],
  'AGENTS.md': ['Workspace and documentation', 'Scope and handoff', 'Check levels', 'Local production preview', 'Original media and encoding', 'Overview cover workflow', 'Evidence retention'],
};

/** External workspace documents are optional in a standalone deployment checkout. */
export function validateDocumentationStructure(file, text) {
  if (text === undefined) return [];
  const sections = documentationSections(text), errors = [];
  for (const path of documentationContract[file]) {
    const matches = sections.filter(section => section.path === path);
    if (matches.length !== 1 || !matches[0].body) errors.push(`${file}: missing, empty or duplicate section ${path}`);
  }
  return errors;
}

export function validateWorkspaceDocumentation(root) {
  return Object.keys(documentationContract).flatMap(file => {
    const path = resolve(root, '..', file);
    return validateDocumentationStructure(file, existsSync(path) ? readFileSync(path, 'utf8') : undefined);
  });
}
