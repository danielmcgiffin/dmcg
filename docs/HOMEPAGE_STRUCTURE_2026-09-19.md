# Homepage structure — September 19, 2026

Implemented locally from Danny's supplied Nuno Dantas Melo architecture direction. Retained Astro, Newsreader/Geist, forest/bone palette, and the four existing source-bounded case studies.

Homepage: hero → selected work → compact practice areas → Advisory / Design / Build → About Danny → conversation. Removed the homepage situations, thinking framework, business-design thesis, and selected essays. Writing remains available through navigation. The hero links to the existing calendar. The closing invitation reads “Have a problem worth figuring out?”; other pages retain their existing closing title through component defaults.

Evidence: case claims and linked qualifications are unchanged. The Army-to-consulting/operator career sequence comes from Danny's current instruction. No testimonials, client logos, additional case studies, credentials, or prices were invented. Verified testimonials and permissioned organization names remain absent; no placeholder proof is published. Contact continues through the existing calendar and contact page.

Validation:
- `npm run build`: exit 0, Astro check 0 errors/warnings/hints. Existing empty-proof-collection and MDX bundler notices remain.
- `npm test`: 6 passed, 0 failed; updated existing homepage-order expectation.
- `git diff --check`: exit 0.
- Built output served locally with Python HTTP server; Chromium checked at 1440, 768, 390 and 320 CSS pixels. No horizontal overflow or uncaught JavaScript exceptions; correct section order and calendar URL confirmed.
- Desktop and mobile full-page screenshots visually inspected. Temporary screenshots: `/tmp/dmcg-implementation/sept19-home-{width}.png`.

No commit or deployment. Existing unrelated working-tree changes preserved. This pass does not repeat the earlier full accessibility audit.
