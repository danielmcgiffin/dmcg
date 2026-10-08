# Visual language

Editorial, personal, understated, and professional.

- Forest green, warm bone, and restrained neutrals.
- Newsreader for headings; Geist for body copy and navigation.
- Generous spacing and legible body text. Avoid excessive small labels.
- A shared sidebar on desktop, with one native disclosure menu on mobile.
- Text and fine dividing rules organize the work; avoid decorative cards and repeated CTA bands.
- Use the existing portrait and publication artwork without cropping away their content.
- No rotating headlines, animation libraries, gradients, or parallax.

All page structure comes from `BaseLayout.astro`. Colors, fonts and layout dimensions live in
`src/styles/global.css`. Page styles only cover differences in the content layout.
Avoid CSS that detects which header or page generation is present.
