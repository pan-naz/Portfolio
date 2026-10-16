/** One natural order for direct component tokens, including numbered spacing steps. */
export const compareTokenNames = (a:string,b:string) => a.localeCompare(b,'en',{numeric:true});
export const componentTokenPatterns = {
 color:/^--color-/,
 type:/^--(?:font|text|line-height|letter-spacing)/,
 size:/^--(?:control|icon|navigation-dot)-|^--header-height$|^--(?:project-logo-size|case-hero-fit)$/,
 spacing:/^--(?:space|button-padding)-|^--header-(?:clearance|inset)$|^--project-identity-tags-gap$/,
 shape:/^--radius-|^--media-frame-radius-outset$/,
 elevation:/^--(?:shadow|layer)-/,
 motion:/^--(?:duration|delay|ease|distance|rotation|scale|stagger|project-tilt)-/,
};
