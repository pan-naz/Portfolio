import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects, collectionProjects, tools } from '../src/data/portfolio.ts';
import { hookoTools } from '../src/data/hooko-case-study.ts';
import { competitors } from '../src/data/datagpt-case-study.ts';
import { waterfallIconNodes } from '../src/scripts/waterfall/waterfall-icon-data.ts';
import { icons } from '../src/data/icons.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const filesUnder = directory => readdirSync(resolve(root, directory), { withFileTypes: true }).flatMap(entry => {
  const path = `${directory}/${entry.name}`;
  return entry.isDirectory() ? filesUnder(path) : [path];
});

export function validateVectorSvg(source, label) {
  const errors = [];
  const viewBox = source.match(/<svg\b[^>]*\bviewBox=["']([^"']+)["']/i)?.[1].trim().split(/[\s,]+/).map(Number);
  if (!viewBox || viewBox.length !== 4 || viewBox.some(value => !Number.isFinite(value)) || viewBox[2] <= 0 || viewBox[3] <= 0) errors.push(`${label}: SVG requires a valid viewBox.`);
  if (!/<\/(?:\w+:)?svg\s*>/i.test(source)) errors.push(`${label}: SVG must have a closing root.`);
  if (/<(?:\w+:)?(?:image|foreignObject|script)\b/i.test(source) || /data:image\//i.test(source)) errors.push(`${label}: use self-contained vector geometry, without bitmap/image wrappers or scripts.`);
  const references = [
    ...[...source.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)].map(([, value]) => value),
    ...[...source.matchAll(/\burl\(\s*["']?([^\s)"']+)/gi)].map(([, value]) => value),
  ];
  if (references.some(value => !value.startsWith('#'))) errors.push(`${label}: SVG references must stay inside the vector asset.`);
  if (!/<(?:path|circle|rect|ellipse|line|polyline|polygon)\b/i.test(source)) errors.push(`${label}: SVG must contain vector shapes.`);
  return errors;
}

export function validateSvgAssets() {
  const errors = [];
  const marks = [
    ...[...projects, ...collectionProjects].map(project => project.logo).filter(Boolean),
    ...tools.map(tool => tool.logo),
    ...hookoTools.map(tool => tool.logo),
    ...competitors.map(([, , logo]) => logo),
    '/favicon.svg',
  ];
  for (const asset of new Set(marks)) {
    if (!asset.startsWith('/') || extname(asset) !== '.svg') errors.push(`${asset}: standalone logos and icons must use local SVG assets.`);
    else if (!existsSync(resolve(root, `public${asset}`))) errors.push(`${asset}: SVG asset is missing.`);
  }
  const svgFiles = [...filesUnder('public'), ...filesUnder('src/assets/personas')].filter(path => extname(path) === '.svg');
  for (const path of svgFiles) errors.push(...validateVectorSvg(read(path), path));
  const rasterMarks = filesUnder('public').filter(path => /(?:logo|app-icon)\.(?:png|jpe?g|webp|gif|ico)$/i.test(path));
  for (const path of rasterMarks) errors.push(`${path}: archive original raster marks outside the public website assets.`);

  const svgRenderers = new Set(['Icon.astro', 'Logo.astro', 'SvgAsset.astro']);
  for (const path of filesUnder('src').filter(path => path.endsWith('.astro'))) {
    const source = read(path);
    if (/[☰✕✖↗]/u.test(source) || /<IconButton\b[^>]*>[\s\S]*?×[\s\S]*?<\/IconButton>/.test(source)) errors.push(`${path}: control icons must use shared SVG components instead of character glyphs.`);
    if (/<image\b/.test(source)) errors.push(`${path}: nested logos must use SvgAsset, without SVG image wrappers.`);
    if (!svgRenderers.has(path.split('/').at(-1))) {
      for (const [svg] of source.matchAll(/<svg\b[^>]*>/g)) {
        if (!/\brole="img"/.test(svg)) errors.push(`${path}: standalone SVG icons must use the shared Icon or SvgAsset component.`);
      }
    }
    if (/<img\b[^>]*\bsrc=\{(?:logo|tool\.logo)\}/.test(source) || /<img\b[^>]*\bsrc=["'][^"']+\.svg["']/.test(source)) errors.push(`${path}: SVG marks must render through the shared SvgAsset component.`);
  }
  // The animated canvases consume SVG shapes rather than bitmap icon sources.
  const supportedShapes = new Set(['path', 'circle', 'rect']);
  if (waterfallIconNodes.some(nodes => !nodes.length || nodes.some(([tag]) => !supportedShapes.has(tag)))) errors.push('Animated icon geometry contains an unsupported or non-vector source.');
  if (Object.values(icons).some(icon => !icon.nodes.length || icon.nodes.some(([tag]) => !supportedShapes.has(tag)))) errors.push('Shared UI icons must contain vector geometry.');
  const logo = read('src/components/Logo.astro');
  if (!logo.includes('<svg') || !logo.includes('<path')) errors.push('The portfolio wordmark must render as SVG paths.');
  return { errors, assets: svgFiles.length, animatedIcons: waterfallIconNodes.length };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = validateSvgAssets();
  if (result.errors.length) { console.error(result.errors.join('\n')); process.exit(1); }
  console.log(`SVG assets verified: ${result.assets} self-contained vector files, generated wordmarks and ${result.animatedIcons} SVG-derived animated icons.`);
}
