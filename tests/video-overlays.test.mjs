import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { projects, collectionProjects } from '../src/data/portfolio.ts';

const cases = [...projects, ...collectionProjects];
assert.equal(cases.length, 20, 'The gate covers the complete case-study inventory');
const routes = ['/', '/design-system/', ...cases.map(project => `/case-studies/${project.id}/`)];
const policy = 'nodownload noplaybackrate noremoteplayback';
function checkVideos(markup, location) {
  const videos = [...markup.matchAll(/<video\b[^>]*>/gi)];
  for (const [video] of videos) {
    assert.match(video, /\sdisablepictureinpicture(?:\s|=|>)/i, `${location}: picture-in-picture disabled`);
    assert.match(video, /\sdisableremoteplayback(?:\s|=|>)/i, `${location}: remote playback disabled`);
    assert.equal(video.match(/\scontrolslist="([^"]*)"/i)?.[1], policy, `${location}: exact shared control policy`);
  }
  return videos.length;
}
let total = 0, fallbacks = 0, templates = 0;
for (const route of routes) {
  // Read raw output: noscript and popup template videos must be checked as well.
  const html = readFileSync(new URL(`../dist${route}index.html`, import.meta.url), 'utf8');
  const count = checkVideos(html, route);
  total += count;
  if (route === '/' || route === '/design-system/') assert.ok(count > 0, `${route} has live video consumers`);
  for (const [, fallback] of html.matchAll(/<noscript\b[^>]*>([\s\S]*?)<\/noscript>/gi)) {
    fallbacks += checkVideos(fallback, `${route} no-JavaScript fallback`);
  }
  if (route === '/') {
    for (const project of cases) {
      const template = html.match(new RegExp(`<template\\b[^>]*data-case-template="${project.id}"[^>]*>([\\s\\S]*?)<\\/template>`))?.[1];
      assert.ok(template, `${project.id} popup template is covered`);
      templates += checkVideos(template, `${project.id} popup template`);
    }
  }
}
assert.ok(total > 0 && fallbacks > 0 && templates > 0, 'Rendered, fallback and popup coverage must stay active');

const sourceFiles = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? sourceFiles(new URL(`${entry.name}/`, directory)) : [new URL(entry.name, directory)]);
const videoRenderers = sourceFiles(new URL('../src/', import.meta.url)).filter(file =>
  /\.(astro|[cm]?[jt]sx?)$/.test(file.pathname) && /<video\b/.test(readFileSync(file, 'utf8')));
assert.deepEqual(videoRenderers.map(file => file.pathname.split('/src/')[1]), ['components/DeferredVideo.astro'], 'All video markup uses one shared renderer');
const renderer = readFileSync(videoRenderers[0], 'utf8');
assert.equal([...renderer.matchAll(/const browserVideoPolicy\s*=/g)].length, 1, 'Define the policy once');
assert.equal([...renderer.matchAll(/<video\s+\{\.\.\.attributes\}\s+\{\.\.\.browserVideoPolicy\}/g)].length, 2, 'The policy applies after callers to both native elements');
console.log(`Video overlay policy: ${routes.length} routes, ${total} videos, including ${fallbacks} fallbacks and ${templates} popup videos`);
