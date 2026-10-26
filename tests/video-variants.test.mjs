import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {walkthroughs} from '../src/data/walkthroughs.ts';
import { getVideoVariant } from '../src/data/video-variants.ts';

const records = JSON.parse(readFileSync(new URL('../src/data/video-variants.json', import.meta.url)));
const filesUnder = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? filesUnder(new URL(entry.name + '/', directory)) : [new URL(entry.name, directory)]);
const videos = filesUnder(new URL('../public/projects/', import.meta.url)).filter(file => file.pathname.endsWith('.mp4'));
const registered = new Set();
assert.equal(Object.keys(records).length, 46, 'All original recordings have explicit provenance and quality receipts');
for (const [src, record] of Object.entries(records)) {
  assert.equal(getVideoVariant(src + '?cache=1'), getVideoVariant(src), 'Query strings preserve the same media provenance');
  assert.ok(record.originalWidth > 0 && record.originalHeight > 0 && record.originalBytes > 0);
  if (record.card) assert.ok(record.mobile, 'Every card loop has an explicit phone version');
  if (record.minimumViewportWidth) {
    assert.ok(Object.values(walkthroughs).some(item=>item.src===src),'Every desktop-only video is a configured walkthrough');
    assert.equal(record.minimumViewportWidth, 1024);
    assert.match(readFileSync(new URL('../src/scripts/walkthrough.ts', import.meta.url), 'utf8'), /matchMedia\('\(min-width: 1024px\)'\)/);
    assert.equal(record.mobile, undefined, 'Desktop-only walkthrough has no unreachable phone output');
  }
  if (!record.minimumViewportWidth && !record.card && record.originalBytes > 5 * 1024 * 1024) assert.ok(record.mobile, 'Heavy case recordings have a phone version');
  for (const [kind, output] of [['desktop', record.desktop], ['mobile', record.mobile]]) {
    if (!output) continue;
    const file = new URL('../public' + output.src, import.meta.url), bytes = readFileSync(file);
    registered.add(file.pathname);
    assert.equal(bytes.length, output.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), output.sha256, 'Delivered bytes are exactly the accepted full-duration SSIM candidate');
    assert.ok(output.ssim >= .97, 'Full RGB SSIM meets the approved quality floor');
    assert.ok(output.width <= record.originalWidth && output.height <= record.originalHeight, 'Never upscale');
    assert.ok(bytes.includes(Buffer.from('avc1')), 'Web files use H.264 MP4');
    let offset = 0, moov = -1, mdat = -1;
    while (offset + 8 <= bytes.length) {
      let size = bytes.readUInt32BE(offset);
      if (size === 1) size = Number(bytes.readBigUInt64BE(offset + 8));
      if (size === 0) size = bytes.length - offset;
      assert.ok(size >= 8 && offset + size <= bytes.length, 'Valid MP4 boxes');
      const type = bytes.toString('ascii', offset + 4, offset + 8);
      if (type === 'moov') moov = offset;
      if (type === 'mdat') mdat = offset;
      offset += size;
    }
    assert.ok(moov >= 0 && mdat > moov, 'Faststart is verified from actual file atoms');
    if (output.retainedOriginal) assert.equal(output.sha256, record.originalSha256, 'Insufficient savings preserves the byte-identical original');
    else {
      assert.ok(output.bytes <= record.originalBytes * .8, 'Every replacement saves at least 20%');
      if (record.card) assert.ok(Math.max(output.width, output.height) <= (kind === 'mobile' ? 960 : 1440));
      else assert.ok(output.width <= (kind === 'mobile' ? 960 : 1920) && (kind === 'mobile' || output.height <= 1080));
    }
  }
}
assert.deepEqual(new Set(videos.map(file => file.pathname)), registered, 'No unregistered videos or speculative variants ship');
assert.equal(getVideoVariant('/missing.mp4'), undefined);
console.log('PASS: all web/phone video bytes match their quality receipts, limits, original provenance and faststart.');

for(const item of Object.values(walkthroughs)){const record=records[item.src];assert.ok(record,'Every walkthrough has provenance');assert.equal(record.minimumViewportWidth,1024);assert.equal(record.mobile,undefined);assert.equal(record.desktop.audio,true);}
