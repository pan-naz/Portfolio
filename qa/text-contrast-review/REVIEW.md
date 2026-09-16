# Text color contrast review · 13 September 2026

**Subsequent user decisions:** Restore 0 → 1 to the shared accent color and bold weight (700). This is now the current treatment. The primary-color correction and its screenshot below are historical; the 2.78:1 light-theme contrast remains a known design exception. The latest palette sets light secondary to `#6E6B68` and light tertiary to `#A19C98`; primary/secondary contrast is enforced, while tertiary is reserved for supplementary or large text. Automated checks cover the full role/surface matrix and label tertiary guidance accurately.

All three text roles meet WCAG 2.2 AA normal-text contrast on the three supported solid backgrounds, in both themes. Existing role values remain unchanged. One actual website use of brand orange failed and was corrected.

## Measurements

Ratios below are the lowest across canvas, surface and surface-subtle. All 18 combinations pass the 4.5:1 normal-text threshold, using unrounded calculations.

| Role | Light minimum | Dark minimum |
| --- | --- | --- |
| Primary | 15.39:1 | 13.53:1 |
| Secondary | 5.27:1 | 6.46:1 |
| Tertiary | 4.75:1 | 4.84:1 |

WCAG tests text against its background, not primary against secondary or tertiary. Use size, weight, grouping and semantic headings to reinforce the subtle secondary/tertiary distinction. Meaning must not depend on color alone. Primary is for main reading and actions, secondary for supporting descriptions, tertiary for supplementary metadata. All remain opaque.

Sources: [WCAG 2.2 SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [SC 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html).

## 1. Website light theme · issue found and fixed

The 18px, weight-700 hero statistic “0 → 1” used #F86A46 on #FAF8F7, measuring 2.7775:1. It fails even the 3:1 large-text threshold and is below the size for the bold large-text exception. It now uses --text-primary, measuring 16.94:1 in both themes. Bold emphasis remains. Source and rendered computed colors were checked. The current animated title was preserved.

Before:

![Light website before correction](</Users/nazariypankiv/Documents/Codex (Portfolio)/portfolio-website/qa/text-contrast-review/01-light-before.png>)

After:

![Light website with primary statistic text](</Users/nazariypankiv/Documents/Codex (Portfolio)/portfolio-website/qa/text-contrast-review/03-light-fixed.png>)

## 2. DS light theme · pass

Nine live measurements match the token calculation. The tertiary minimum is 4.75:1 on subtle surface. Do not reduce opacity to make it quieter.

![Light theme live contrast matrix](</Users/nazariypankiv/Documents/Codex (Portfolio)/portfolio-website/qa/text-contrast-review/02-ds-light.png>)

## 3. DS dark theme · pass

All nine live measurements pass, with tertiary at a minimum of 4.84:1 on subtle surface. The website synchronized to the same theme and rendered the fixed statistic as #FAF8F7 on #171716. Original light theme restored after verification.

![Dark theme live contrast matrix](</Users/nazariypankiv/Documents/Codex (Portfolio)/portfolio-website/qa/text-contrast-review/04-ds-dark.png>)

## Verification and limits

- `validate:contrast` now runs in both `pnpm check` and `pnpm build`; both pass. It checks all 18 combinations plus the hero statistic. Threshold comparison does not round failures into passes.
- Updated DS usage guidance, DESIGN.md and README with the shared contrast contract.
- This is a scoped text-color review, not a full WCAG conformance audit. Solid token pairs do not establish contrast over every moving canvas frame, image, gradient, opacity transition or masked marquee edge. Those effects need separate contextual checks. Inactive controls and decorative brand marks were not treated as normal reading text.
