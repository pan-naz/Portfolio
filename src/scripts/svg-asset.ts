// SVG sources are trusted, build-time repository assets. Namespace fragment IDs
// so a shared mark can appear on a card, in a template and in a case together.
export function scopeSvgFragmentIds(source: string, namespace: string) {
  const ids = [...source.matchAll(/\bid=["']([^"']+)["']/g)].map(([, id]) => id);
  const scoped = new Map(ids.map(id => [id, `${namespace}-${id}`]));
  return source.replace(/\bid=(["'])([^"']+)\1/g, (_, quote, id) => `id=${quote}${scoped.get(id)}${quote}`)
    .replace(/url\(\s*(["']?)#([^\s)"']+)\1\s*\)/g, (match, quote, id) => scoped.has(id) ? `url(${quote}#${scoped.get(id)}${quote})` : match)
    .replace(/\b((?:xlink:)?href)=(["'])#([^"']+)\2/g, (match, name, quote, id) => scoped.has(id) ? `${name}=${quote}#${scoped.get(id)}${quote}` : match);
}

export function prepareSvgAsset(source: string, namespace: string) {
  const root = scopeSvgFragmentIds(source, namespace).match(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/i);
  if (!root) throw new Error('Expected an SVG asset.');
  const attributes = Object.fromEntries([...root[1].matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(([, name, value]) => [name, value]));
  if (!attributes.viewBox) throw new Error('SVG asset requires a viewBox.');
  delete attributes.width;
  delete attributes.height;
  delete attributes.xmlns;
  return { attributes, body: root[2] };
}

/** Transition copies keep their complete SVG, with fragments independent of the hidden source. */
let svgCopySequence = 0;
export function rescopeSvgAssets(root: ParentNode) {
  root.querySelectorAll<SVGElement>('svg').forEach(svg => {
    // IDs only need to be unique within this document. Do not require secure-
    // context APIs: the Wi-Fi preview is served over ordinary HTTP.
    const scoped = prepareSvgAsset(svg.outerHTML, `svg-copy-${++svgCopySequence}`);
    svg.innerHTML = scoped.body;
    for (const [name, value] of Object.entries(scoped.attributes)) svg.setAttribute(name, value);
  });
}
