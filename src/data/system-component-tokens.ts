/** One natural order for direct component tokens, including numbered spacing steps. */
export const compareTokenNames = (a:string,b:string) => a.localeCompare(b,'en',{numeric:true});
export const componentTokenPatterns = {
 color:/^--color-/,
 type:/^--(?:font|text|line-height|letter-spacing)/,
 size:/^--(?:control|icon|navigation-dot)-|^--header-height$/,
 spacing:/^--(?:space|button-padding)-|^--header-(?:clearance|inset)$/,
 shape:/^--radius-/,
 elevation:/^--(?:shadow|layer)-/,
 motion:/^--(?:duration|ease|distance|rotation|scale|stagger)-/,
};
