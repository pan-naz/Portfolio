import { waterfallIconNodes } from './waterfall-icon-data';

import { waterfallIconSize } from './waterfall-constants';

let paths: Path2D[] | undefined;

export function createWaterfallPaths() {
  if (paths) return paths;
  const scale = new DOMMatrix().scale(waterfallIconSize / 24);
  paths = waterfallIconNodes.map((nodes) => {
    const source = new Path2D();
    for (const [tag, attrs] of nodes) {
      if (tag === 'path') source.addPath(new Path2D(String(attrs.d)));
      else if (tag === 'circle') {
        const circle = new Path2D();
        circle.arc(Number(attrs.cx), Number(attrs.cy), Number(attrs.r), 0, Math.PI * 2);
        source.addPath(circle);
      } else if (tag === 'rect') {
        const rect = new Path2D();
        rect.roundRect(Number(attrs.x), Number(attrs.y), Number(attrs.width), Number(attrs.height), Number(attrs.rx ?? 0));
        source.addPath(rect);
      } else throw new Error(`Unsupported utility icon shape: ${tag}`);
    }
    const path = new Path2D();
    path.addPath(source, scale);
    return path;
  });
  return paths;
}
