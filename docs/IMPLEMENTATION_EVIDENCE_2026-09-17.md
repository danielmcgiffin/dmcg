# Approved redesign: implementation and evidence

Date: September 17, 2026. Implementation authorized by “implement the plan.”
Scope: `docs/APPROVED_AUDIT_2026-09-17.md`, supplemented by Danny's four supplied case accounts.
Status: implemented locally, production build verified. Not committed or deployed.

## Recommendation register

| Item | Implementation |
| --- | --- |
| R1 | Restored the existing committed Astro application after preserving all 37 files from the local Svelte application in `archive/site-2026-09-17-svelte/`. Every SHA256 manifest entry reverified after implementation. Existing unrelated files remain untouched. |
| R2 | Homepage, About, Contact, local page and shared identity now describe independent business advisory and design for consequential cross-functional problems. |
| R3 | Large Newsreader opening replaces the atrium/grain/grid/reveal composition. Existing source artwork retained. Essential content does not require animation or JavaScript. |
| R4 | Selected work immediately follows the hero. ERP decision leads; federal operating model, firm growth and Navy program show breadth. |
| R5 | Used Danny's supplied case accounts, retaining role distinctions and estimate/outcome qualifications. See evidence boundaries below. |
| R6 | Recognizable client situations and three thinking principles replace repetitive process explanations. |
| R7 | Advisory, Design and Build are independent engagement options without a mandatory product ladder. |
| R8 | One deliberate-business-design thesis follows the engagement section. No additional decorative system diagram. |
| R9 | Three existing essays appear on the homepage; Writing is in desktop/mobile navigation and footer. |
| R10 | Published About follows the recurring problem-solving pattern with four case narratives and direct homepage anchors. |
| R11 | Contact invites an unresolved situation and links to the existing calendar. Removed the $5,000 qualification gate. |
| R12 | Local page retains its established URL and Northern Virginia service areas, with broader advisory positioning. Locations are service areas, not claimed offices. |
| R13 | Updated titles, descriptions, Person/ProfessionalService schema, knowsAbout, jobTitle, llms.txt and typographic OG artwork. Removed structured offer and misleading person image. Canonicals exclude tracking queries. |
| R14 | Retired offer and unfinished assessment routes redirect directly to retained research; excluded from sitemap. Removed obsolete funnel claims. |
| R15 | Preserved writing URLs, layouts and RSS. Corrected Polanyi attribution and narrowed unsupported AI claims. Research briefing keeps sources and sample caveats without urgency/competitive promises. Dates now render in UTC consistently. |
| R16 | Forest opening, bone body and forest close; varied evidence layouts, restrained rules and generous typography retain the established palette and font system. |
| R17 | Native mobile navigation, keyboard dismissal, full-width writing titles and responsive layouts. Proof begins approximately 547px down at 390px viewport width. |
| R18 | Build, generated-site tests, browser inspection, mobile/keyboard/accessibility checks and this register completed. |

## Evidence boundaries

Danny supplied the four case narratives directly during implementation. They are client-authorized first-person evidence, not independently audited financial records.

- ERP: cancellation is an outcome; alternative architecture cost of 2–5% and one-fifth the time are explicitly estimates. No claim that the alternative was implemented or that $2.5M was realized savings.
- Growth: approximately $200K to $2M is firm-wide recognized revenue; team retention relates to the stated growth period. Danny's operating role is distinguished from the founder's commercial role.
- Navy: approximately $250M reduction in reported improper payments and roughly 45% lower error rates are program-level outcomes with finance/payment experts. They are not cash recovered or solely attributed savings.
- Federal operating model: executive approval and potential broader application are supported. No unsupported post-implementation percentage improvements.

The new case accounts replace tentative proof in the audit. Unconfirmed testimonials, school metrics and unrelated credentials were not published. No client names, prices or engagement outcomes were invented.

## Validation

- `npm run build`: exit 0; Astro check reports 0 errors, 0 warnings, 0 hints. Production output generated successfully. Earlier clean builds also emitted nonblocking empty-proof-collection and MDX bundler directive notices.
- `npm test`: 6 passed, 0 failed. Checks built metadata/schema, internal links/assets/fragments, retired redirects/sitemap, homepage order, case qualifications, RSS/llms/404.
- `git diff --check`: exit 0.
- Production preview: `npm run preview -- --host 127.0.0.1 --port 4323 --ignore-lock`. Homepage responds 200; nonexistent route responds 404.
- Chromium desktop/mobile review: homepage at 1440, 768, 390 and 320 CSS pixels; no horizontal overflow. Also reviewed About, Contact, local page, Writing, an article and research briefing at desktop/mobile widths.
- Automated axe WCAG 2 A/AA and 2.1 AA scans: zero violations on the seven reviewed development pages at desktop/mobile widths, and repeated on production About, Contact, local and Writing mobile pages.
- Keyboard skip link focuses and navigates to main content. Mobile menu opens, closes on selection and Escape, and returns focus on Escape. Reduced-motion and JavaScript-disabled homepage checks completed.
- Reflow check at 720 CSS pixels with 2x device scale: no overflow. This is a viewport/reflow approximation, not a native browser zoom certification.
- No uncaught JavaScript exceptions recorded in the browser run.
- Calendar destination rendered the existing 30-minute meeting and available times. No booking submitted. Production contact link preserves `src=contact` and incoming UTM parameters across pages.
- Share image rendered and visually inspected at 1200×630 with the local fonts.
- Svelte preservation manifest reverified: 37/37 files match.

Browser evidence and scripts are in `/tmp/dmcg-implementation/`; these temporary artifacts are not committed or guaranteed permanent.

## Infrastructure and limits

Existing Astro, MDX, fonts, analytics and hosting configuration retained. npm installation resolved the existing semver ranges to Astro 7.3.3; the original committed pnpm lock used 7.2.0. The generated npm lockfile is authoritative for the current npm CI workflow; the original pnpm lock remains as baseline history. No migration to another framework.

No deployment or live-site change has been made. Hosting-level 301 rules are checked in source/generated output; their production behavior must be verified after an authorized deployment. Browser review used Chromium; Safari/Firefox and assistive-technology user testing were not performed. Automated accessibility checks are not a complete accessibility audit. Analytics delivery to the external service was not independently verified.

The supplied reference set contained eight local screenshots, rather than the stated twelve. The audit studied those and the nine supplied websites; no missing screenshots were fabricated.

## One remaining design weakness

The “How I think” section is the most conventional part of the composition: three equal columns express the philosophy clearly, but less distinctively than the adjacent evidence.

Proposed next pass, not implemented: **One fix pass, scoped to “How I think.” Replace the abstract explanation under “Find the real problem” with one compact ERP example showing the shift from implementing software to obtaining trustworthy reporting. Change nothing else.**
