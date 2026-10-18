import fs from 'node:fs';
export function validateTitleAlignment(root=process.cwd()) {
  const read=file=>fs.readFileSync(`${root}/${file}`,'utf8'),errors=[];
  const type=read('src/styles/typography.css').split('/* Title alignment')[1]||'';
  for(const marker of ['block-size: 1cap','vertical-align: baseline','text-box-trim: trim-start','text-box-edge: cap alphabetic','align-self: center','justify-self: start','.title-align-line > .title-align-control { line-height: 0; grid-template-rows: max-content; }','@media (min-width: 768px)','var(--text-heading-l)','var(--line-height-heading-l)'])if(!type.includes(marker))errors.push(`Missing native title alignment: ${marker}`);
  if(/(?:translate|transform|\d+(?:\.\d+)?px)\s*[:(;]/.test(type))errors.push('Title alignment cannot use translated or measured pixel offsets.');
  const helper=read('src/components/AlignedChapterCopy.astro');
  if(!helper.includes('inert aria-hidden="true"')||helper.match(/<slot\s*\/>/g)?.length!==2||/<script\b/.test(helper))errors.push('Intrinsic chapter reservation must be inert, hidden and CSS-only, from the same slot.');
  const narrative=read('src/styles/case-study-narrative.css');
  if(!narrative.includes('.title-pair-measure { display: none; }')||!narrative.includes('grid-row: 2 / 4')||!narrative.includes('grid-row: 1 / 3'))errors.push('Split copy must preserve the original title track and extend below it.');
  return errors;
}
