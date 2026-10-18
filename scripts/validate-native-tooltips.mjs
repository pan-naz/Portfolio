import fs from 'node:fs';import path from 'node:path';
/** Read actual tags, not escaped Code examples or script/style text. Templates count too. */
export function validateRenderedNativeTooltips(html,label='rendered markup'){
 const errors=[];let head=false,raw='';
 for(const match of html.matchAll(/<!--[\s\S]*?-->|<\/?([a-z][\w:-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi)){
  if(!match[1])continue;const name=match[1].toLowerCase(),closing=match[0][1]==='/';
  if(raw){if(closing&&name===raw)raw='';continue;}
  if(name==='head'){head=!closing;continue;}
  if(closing)continue;
  const attributes=[...match[2].matchAll(/([^\s"'<>\/=]+)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g)];
  if(attributes.some(([,name])=>name.toLowerCase()==='title'))errors.push(`${label}: native title attribute on <${name}>.`);
  if(name==='title'&&!head)errors.push(`${label}: hover-producing <title> outside the document head.`);
  if(name==='script'||name==='style')raw=name;
 }
 return errors;
}
/** document.title is metadata; native tooltip creation anywhere else is forbidden. */
export function validateNativeTooltipScripts(source,label='runtime source'){
 const errors=[];
 if(/\.(?:setAttribute|toggleAttribute)\(\s*['"]title['"]|\.setAttributeNS\([^,]*,\s*['"]title['"]|(?<!document)\.title\s*=(?!=)|\.createElement(?:NS)?\([^)]*['"]title['"]/i.test(source))errors.push(`${label}: runtime must not create native browser tooltip sources.`);
 return errors;
}
export function validateNativeTooltipSources(root=process.cwd()){
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
 return walk(path.join(root,'src/scripts')).filter(f=>/\.[jt]s$/.test(f)).flatMap(file=>validateNativeTooltipScripts(fs.readFileSync(file,'utf8'),path.relative(root,file)));
}
export function validateBuiltNativeTooltips(root=process.cwd()){
 const directory=path.join(root,'dist'),walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
 return walk(directory).filter(file=>file.endsWith('.html')).flatMap(file=>validateRenderedNativeTooltips(fs.readFileSync(file,'utf8'),path.relative(root,file)));
}
