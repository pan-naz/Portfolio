# Responsive contract

Keep CSS and JavaScript conditions literal and synchronized when changing an approved behaviour. CSS custom properties cannot replace media-query conditions. This document adds no transform and changes no threshold.

| Boundary | Existing role |
| --- | --- |
| ≤767 / ≥768 px | Phone versus wider composition: gutters, section spacing, media radius, stacked case layouts, header drawer and native versus desktop-capable scroll |
| ≤1023 / ≥1024 px | Tablet grids and precise-pointer control/filter magnets |
| ≤1327 / ≥1328 px | Compact desktop impact/contact type and hero composition guide |
| ≤1439 / ≥1440 px | Wide homepage composition and hero width |

Component exceptions remain local and deliberate: 359px for narrow Pet Care/Picker grids; 380px for compact homepage type; 479px for Cravus/Yellow Leaf grids; 560px for Hooko and Index/service/decision-card layouts; 599px for catalog controls; 600px for video controls; 899px for the catalog index; 900/901px for Hooko and service tiles; 1100px for compact-card caption layout; 1279px for Hooko demos; 1559px for catalog layout. Do not round or consolidate these boundaries without approving their resulting layout changes.

Capabilities are separate from width. Smooth wheel scrolling requires ≥768px, a fine pointer and no reduced motion. Desktop Work staging uses hover + fine pointer + zero touch points. Control/filter magnets additionally require ≥1024px and hover. Touch/coarse pointers keep visible video controls; reduced motion retains the existing static/reveal/playback behaviour. A width alone does not imply a desktop input device.

The compact body type role has one numeric source (`--type-body-compact: 1.125`) and two unit-preserving aliases: `--text-body-compact` at 18px and `--text-body-compact-relative` at 1.125rem. Consumers retain their original px/rem behaviour when a browser's default root font size changes. Stat/contact sizes remain fixed 48px/64px.

UI tokens live in `src/styles/tokens.css`: primitives → theme semantic roles → compatibility/component roles. Fixed-Light overlay tokens remain independent of theme-aware navigation. Case-study brand values stay in their project scope and keep their exact values. Named layer values apply within the existing stacking contexts; project artwork's local stacking stays local.
