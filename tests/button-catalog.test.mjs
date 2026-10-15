import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateButtonCatalog} from '../scripts/validate-button.mjs';
import {buttonGroups,buttonProps,buttonUsage} from '../src/data/system-button.ts';
import {buildSystemInventory} from '../src/data/system-inventory.ts';
assert.deepEqual(validateButtonCatalog(),[]);
const model=buildSystemInventory();
for(const name of ['Button','IconButton','TextLink']){
 const component=model.components.find(component=>component.name===name);
 assert.deepEqual(buttonProps(component).map(prop=>[prop.name,prop.type]),component.props.map(prop=>[prop.name,prop.type]));
 assert(buttonProps(component).every(prop=>prop.description));
 assert(buttonUsage(name).includes('import '+name));
}
assert.deepEqual(buttonGroups.map(group=>group.cards.length),[5,4,4]);
const scroll=readFileSync('src/scripts/smooth-scroll.ts','utf8');
assert(scroll.includes("surface.matches('[data-ds-nav-scroll]')")&&scroll.includes('!canMove')&&scroll.includes('wheelOwner = owner'));
assert(!readFileSync('src/components/IconButton.astro','utf8').includes('className.includes'));
console.log('Merged action catalog keeps real variants/source props and releases vertical wheel input from content and navigation edges.');
