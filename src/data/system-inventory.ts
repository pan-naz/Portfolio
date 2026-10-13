import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, basename, relative } from 'node:path';

export interface SourceToken {
  name: string; light: string; dark: string; resolvedLight: string; resolvedDark: string;
  users: string[]; tier: 'primitive' | 'semantic' | 'component'; category: string; owner?: string;
}
export interface ComponentUsage { file: string; props: Record<string, string>; code: string; label?: string; }
export interface SourceComponent {
  name: string; file: string; usages: ComponentUsage[]; tokens: string[];
  props: { name: string; type: string; optional: boolean; conditional?: boolean }[]; source: string;
}
const filesUnder = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const path = resolve(directory, entry.name);
  return entry.isDirectory() ? filesUnder(path) : [path];
});
export function readSystemTokens(css: string) {
  const read = (block: string): Record<string, string> => Object.fromEntries([...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, key, value]) => [key, value.trim()]));
  const light = Object.assign({}, ...[...css.matchAll(/(?:^|\n):root(?:\s*,[^{}]+)?\s*\{([^}]+)\}/g)].map(([, block]) => read(block))) as Record<string, string>;
  const dark = { ...light, ...Object.assign({}, ...[...css.matchAll(/:root\[data-theme=(?:'dark'|"dark")\][^{]*\{([^}]+)\}/g)].map(([,block])=>read(block))) };
  const value = (palette: Record<string, string>, name: string, seen = new Set<string>()): string => {
    if (seen.has(name)) throw Error(`Cyclic system token: ${name}`);
    const next = new Set([...seen, name]);
    return (palette[name] || '').replace(/var\(--([\w-]+)\)/g, (_, dependency: string) => value(palette, dependency, next));
  };
  return { light, dark, value };
}
export function buildSystemInventory(root = process.cwd()) {
  const read = (file: string) => readFileSync(resolve(root, file), 'utf8');
  const all = filesUnder(resolve(root, 'src')).filter(file => /\.(astro|ts|css)$/.test(file));
  const websitePages = all.filter(file => file.includes('/pages/') && file.endsWith('.astro') && !file.includes('design-system'));
  const reachable = new Set<string>();
  const visit = (file: string) => {
    if (reachable.has(file)) return;
    reachable.add(file);
    for (const [, specifier] of readFileSync(file, 'utf8').matchAll(/import\s+[\s\S]*?from\s+['"]([^'"]+\.astro)['"]/g)) visit(resolve(dirname(file), specifier));
  };
  websitePages.forEach(visit);
  const infrastructure = new Set(['SiteMetadata', 'PortfolioPage', 'CaseStudyPage', 'CaseStudyContent', 'CaseStudyLayer', 'StandaloneCaseStyles']);
  const projectOnly = new Set(['HookoHero', 'HookoPhoneFrame']);
  const componentFiles = [...reachable].filter(file => file.includes('/components/') && !infrastructure.has(basename(file, '.astro')) && !projectOnly.has(basename(file, '.astro')) && !(file.endsWith('CaseStudy.astro') && !basename(file).startsWith('CaseStudy'))).sort();
  const sources = all.filter(file => !file.includes('/pages/design-system') && !/\/(?:DS[^/]*\.astro|(?:design-system(?:-[\w-]+)?|ds-components|system-[\w-]+)\.ts|(?:design-system|static-preview|tokens)\.css)$/.test(file));
  const css = read('src/styles/tokens.css');
  const palettes = readSystemTokens(css);
  const definitions = new Set(Object.keys(palettes.light));
  const consumers = new Map<string, Set<string>>();
  for (const file of sources) {
    for (const [, name] of readFileSync(file, 'utf8').matchAll(/(?<![\w-])--([\w-]+)(?![\w-])/g)) {
      if (!definitions.has(name)) continue;
      if (!consumers.has(name)) consumers.set(name, new Set());
      consumers.get(name)!.add(relative(root, file));
    }
  }
  const used = new Set(consumers.keys());
  const visitToken = (name: string) => {
    for (const raw of [palettes.light[name], palettes.dark[name]]) for (const [, dependency] of (raw || '').matchAll(/var\(--([\w-]+)/g)) {
      if (!used.has(dependency)) { used.add(dependency); visitToken(dependency); }
    }
  };
  [...used].forEach(visitToken);
  const owner = (name: string) => name === 'control-border' ? 'Button' : name === 'radius-project-logo' ? 'ProjectIdentity' : name === 'project-identity-tags-gap' ? 'ProjectTags' : name.startsWith('footer-pile-') ? 'SiteFooter' : name.startsWith('waterfall-') ? 'HeroWaterfall' : name.startsWith('project-card-') || name.startsWith('project-identity-') ? 'ProjectCard' : name === 'shadow-overlay' ? 'IconButton' : name === 'shadow-floating-navigation' ? 'NavigationItem' : undefined;
  const category = (name: string) => /^(color-|waterfall-icon-color$|footer-pile-icon-color$|focus-ring$|control-border$|backdrop-)/.test(name) ? 'color' : /^(font-|text-|type-|letter-spacing-|line-height-)/.test(name) ? 'typography' : name.startsWith('space-') ? 'spacing' : /^(radius-|shadow-)/.test(name) ? 'shape' : /^(duration-|delay-|ease-|stagger-|distance-|rotation-|intro-stage-|scale-|project-tilt-|work-filter-)/.test(name) ? 'motion' : name.startsWith('icon-') ? 'iconography' : 'layout';
  const tokens: SourceToken[] = [...used].filter(name => definitions.has(name)).sort().map(name => ({
    name, light: palettes.light[name], dark: palettes.dark[name], resolvedLight: palettes.value(palettes.light, name), resolvedDark: palettes.value(palettes.dark, name), users: [...(consumers.get(name) || [])],
    tier: owner(name) ? 'component' : /^(color-(white|paper(?:-\d+)?|mist|stone|silver|pewter|graphite|smoke|charcoal|ink(?:-\d+)?|night|orange(?:-light)?)$|radius-\d|shadow-overlay-light|ease-stage-entrance)/.test(name) ? 'primitive' : 'semantic', category: category(name), owner: owner(name),
  }));
  const components: SourceComponent[] = componentFiles.map(file => {
    const name = basename(file, '.astro');
    const source = readFileSync(file, 'utf8');
    const usages: ComponentUsage[] = [];
    for (const caller of [...reachable]) {
      if (caller === file) continue;
      const text = readFileSync(caller, 'utf8');
      const imports = [...text.matchAll(/import\s+(\w+)\s+from\s+['"]([^'"]+\.astro)['"]/g)].filter(([, , specifier]) => resolve(dirname(caller), specifier) === file);
      for (const [, local] of imports) for (const match of text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '').matchAll(new RegExp(`<${local}\\b([^>]*?)(?:/>|>)`, 'g'))) {
        const props = Object.fromEntries([...match[1].matchAll(/([\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|\{([^{}]*)\}))?/g)].map(([, key, double, single, expression]) => [key, double ?? single ?? (expression !== undefined ? `{${expression}}` : 'true')]));
        if (props['data-ds-chrome'] && caller.endsWith('/ThemeToggle.astro') && props.appearance === 'catalog') continue;
        const tail = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '').slice((match.index || 0) + match[0].length);
        const inner = match[0].endsWith('/>') ? '' : tail.slice(0, tail.indexOf(`</${local}>`)).trim();
        const label = inner && /^[^<{}]+$/.test(inner) ? inner : undefined;
        usages.push({ file: relative(root, caller), props, code: match[0].endsWith('/>') ? match[0] : `${match[0]}${inner}</${local}>`, label });
      }
    }
    let propsBlock = source.match(/interface Props[^\{]*\{([\s\S]*?)\}/)?.[1] || '';
    const typeAlias = source.match(/type Props\s*=([\s\S]*?)\nconst /)?.[1];
    const localInputs = new Set((source.match(/const \{([^}]+)\}[^;]*Astro.props;/)?.[1] || '').split(',').map(input=>input.trim().split(/[ :=]/)[0]));
    const inherited = source.match(/interface Props extends (\w+)\s*\{/ )?.[1];
    if (inherited) {
      const imported = [...source.matchAll(/import type \{([^}]+)\} from ['"]([^'"]+)['"]/g)].find(([,names])=>names.split(',').map(name=>name.trim()).includes(inherited));
      if (imported) {
        const dependency = resolve(dirname(file), imported[2]+'.ts');
        propsBlock += readFileSync(dependency,'utf8').match(new RegExp(`interface ${inherited}\\s*\\{([\\s\\S]*?)\\}`))?.[1] || '';
      }
    }
    const inputSource = typeAlias || propsBlock;
    const inputProps = [...inputSource.matchAll(/(?:[;{]|^)\s*([a-zA-Z][\w]*)(\?)?\s*:\s*([^;}]+)/g)].filter(([,prop,,type])=>type.trim() !== 'never' && (!typeAlias || localInputs.has(prop)));
    const props = [...new Map(inputProps.map(([,prop,optional,type]) => [prop, {name: prop, type: type.trim(), optional: Boolean(optional), conditional: Boolean(typeAlias && !optional)}])).values()];
    const names = new Set([...source.matchAll(/(?<![\w-])--([\w-]+)(?![\w-])/g)].map(([, token]) => token));
    const classes = [...new Set([...source.matchAll(/\bclass(?::list)?=(?:"([^"]+)"|'([^']+)'|\{([\s\S]*?)\})/g)].flatMap(([,double,single,expression]) => (double ?? single ?? [...(expression || '').matchAll(/['"]([^'"]+)['"]/g)].map(([,value])=>value).join(' ')).split(/\s+/)).filter(value=>/^[a-z][\w-]+$/.test(value)))];
    for (const stylesheet of sources.filter(path => path.endsWith('.css') && !/^\/\* Project-only:/.test(readFileSync(path, 'utf8')))) {
      for (const [, selectors, body] of readFileSync(stylesheet, 'utf8').matchAll(/([^{}]+)\{([^{}]*)\}/g)) if (classes.some(cls => new RegExp('\\.' + cls + '(?=--|__|[^\\w-]|$)').test(selectors))) for (const [, token] of body.matchAll(/var\(--([\w-]+)/g)) names.add(token);
    }
    return { name, file: relative(root, file), usages, source, props, tokens: tokens.filter(token => names.has(token.name) || token.owner === name).map(token => token.name) };
  });
  const iconNames = new Set<string>();
  // Foundation device glyphs are genuine catalog consumers, not specimen variants.
  for (const file of [...reachable, resolve(root, 'src/components/DSFoundations.astro')]) {
    const source = readFileSync(file, 'utf8');
    for (const [, name] of source.matchAll(/<Icon\b[^>]*\bname=["']([\w-]+)["']/g)) iconNames.add(name);
    for (const [, name] of source.matchAll(/<IconButton\b[^>]*\bicon=["']([\w-]+)["']/g)) iconNames.add(name);
  }
  const privateNames = new Set<string>();
  const projectValues = new Set<string>();
  const projectBackgroundImages = new Set<string>();
  const colorLiterals = (text: string) => [...text.matchAll(/#[\da-f]{3,8}\b|rgba?\([^)]*\)/gi)].map(([value]) => value.toLowerCase().replace(/^#([\da-f])([\da-f])([\da-f])$/, '#$1$1$2$2$3$3'));
  const sharedCss = sources.filter(file => file.endsWith('.css') && !/^\/\* Project-only:/.test(readFileSync(file,'utf8'))).map(file => readFileSync(file,'utf8')).join('\n');
  const sharedValues = new Set(colorLiterals(css + sharedCss));
  // Shared narrative/media APIs are not private brand variables merely because
  // a project supplies their local layout value. Never promote brand variables.
  const sharedNames = new Set([...sharedCss.matchAll(/(?<![\w-])--([\w-]+)(?![\w-])/g)].map(([,name])=>name));
  const projectFonts = new Set<string>();
  const projectSources = all.filter(file => file.endsWith('-case-study.ts') || file.includes('/components/') && /(?:[A-Z]\w+|Recording)CaseStudy\.astro$/.test(file) || file.endsWith('.css') && /^\/\* Project-only:/.test(readFileSync(file,'utf8')));
  const projectText = projectSources.map(file => readFileSync(file,'utf8')).join('\n');
  const backgroundFields = new Set([...projectText.matchAll(/url\(['"]?\$\{\w+\.(\w+)\}/g)].map(([,field])=>field));
  for (const field of backgroundFields) for (const [, image] of projectText.matchAll(new RegExp(`["']?${field}["']?\\s*:\\s*["']([^"']+)["']`, 'g'))) projectBackgroundImages.add(image);
  for (const file of projectSources) {
    const text = readFileSync(file, 'utf8');
    for (const value of colorLiterals(text)) if (!sharedValues.has(value)) projectValues.add(value);
    for (const [, image] of text.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)) if (!image.includes('${') && !/\.woff2?$/.test(image)) projectBackgroundImages.add(image);
    for (const [, name] of text.matchAll(/(?<![\w-])--([\w-]+)(?![\w-])/g)) if (!definitions.has(name) && !sharedNames.has(name)) privateNames.add(name);
    for (const [, family] of text.matchAll(/@font-face\s*\{[^}]*font-family:\s*['"]([^'"]+)['"]/g)) projectFonts.add(family);
  }
  return { tokens, components, iconNames: [...iconNames].sort(), unusedTokens: [...definitions].filter(name => !used.has(name)), privateNames: [...privateNames], projectValues: [...projectValues], projectBackgroundImages: [...projectBackgroundImages], projectFonts: [...projectFonts], palettes, root };
}
