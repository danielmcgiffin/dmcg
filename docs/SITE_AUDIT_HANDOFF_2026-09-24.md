# September 24 site audit follow-through

The site changes in this pass are local source edits. Publishing is a separate step under the repository's deployment rule. No live behavior below is claimed until checked after a deploy.

## Decisions reflected in the copy

- The primary booking action is **Get a second opinion**. It opens a **free 30-minute introductory call**. We discuss the business and main pain points, explore the situation, and decide together whether to dig deeper. A paid review is scoped and priced separately.
- The ERP license was $1.25M contracted over five years. Implementation was originally estimated at $600K and later at least $1.2M total with custom code, yielding a projected license-plus-implementation path of at least $2.45M. About $350K had been paid when implementation stopped. The alternative's full implementation was estimated at about $50K, roughly 2% of that projected ERP path. These are different cost periods and components, and no realized saving or release from the license contract is claimed. The license outcome is still under negotiation.
- The operating-model case establishes executive approval only. Rollout and behavior change were not verified.
- Danny reports no vendor compensation or affiliations. The paid Substack tier is available for deeper business teardowns and longer essays on designing work. No publishing cadence is promised.
- Public case copy leads with the strongest supported decision or result. It distinguishes estimates from paid amounts and program outcomes from recovered cash; source-access and rollout-evidence limitations stay in this handoff unless needed to prevent a misleading public claim.

## Account changes for Danny

### Cal.com event

Edit the existing `/dannymcgiffin/30min` event so the URL in the site continues to work.

Suggested title: **Get a second opinion — free 30-minute introduction**

Suggested description:

> We'll talk about your business and main pain points, explore what might be driving them, and decide together whether a deeper review makes sense. Bring a proposal, requirements document, or a few examples if they help; you do not need a finished brief. This free video call is an introduction, not a full systems assessment or written recommendation. If we decide to work together, we will agree on the question, scope, timing, output, and fee before paid work begins.

An optional intake prompt could be: **What decision or pain point would you like to discuss? Is there a deadline?** Keep name and email as the only required fields. Check the event title, description, duration, price, location, and confirmation page after saving.

### Analytics and conversion reporting

Danny supplied GA4 measurement ID `G-ZYTMP3PS7G`. Production builds now include it by default; `PUBLIC_GA_MEASUREMENT_ID` remains an optional build-time override. Local development leaves GA4 off unless the override is set. After deployment, use GA4 Realtime to verify page views and `booking_click`, `email_click`, and `subscription_click` events. [Register `cta_placement` as an event-scoped custom dimension](https://support.google.com/analytics/answer/14240153?hl=en) to report clicks by placement. These are click counts, not completed conversions.

Local browser verification blocked outbound Google requests and confirmed that booking, email, and the Elsewhere Substack link queue the expected GA4 click event with the expected placement. This verifies the site instrumentation, not delivery into the GA4 property.

For completed bookings, use the [Cal.com Google Analytics app](https://cal.com/apps/ga4) with the same measurement ID if it is available in the account, and verify an actual test booking in both Cal.com and GA4. Check the completion event name and whether Cal.com retains the `src` placement in the booking record; neither is verified yet. Cal.com's booking list remains the source of truth for confirmed meetings. For completed subscriptions, enter the GA4 ID in [Substack's Analytics setting](https://support.substack.com/hc/en-us/articles/52667879688980-How-do-I-use-the-Analytics-section-on-Substack) and use the [subscriber dashboard](https://support.substack.com/hc/en-us/articles/360058529871-How-do-I-use-the-subscriber-dashboard-on-Substack) as the source of truth for free and paid subscribers. The site links to the direct subscribe page with placement tags.

Record qualified conversations and opportunities manually at first. Count actual email inquiries from the inbox, rather than treating an email-link click as an inquiry.

### Cloudflare and search

The live HTTP apex currently responds `200`. Because this domain has other subdomains, use a [Cloudflare Single Redirect](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/create-dashboard/) scoped to `http://dannymcgiffin.com/*` with target `https://dannymcgiffin.com/${1}`, status `301`, and **Preserve query string** enabled. A zone-wide [Always Use HTTPS setting](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/always-use-https/) affects all hosts and subdomains. After the rule is deployed, check that HTTP requests for the homepage and a deep path return a permanent redirect to the same HTTPS path.

After the site is published, use Google Search Console's URL Inspection for the homepage, advisory page, ERP case, Writing page, and Northern Virginia page. Confirm the sitemap at `https://dannymcgiffin.com/sitemap-index.xml`, inspect the indexed canonical and last crawl, and request recrawling of materially changed pages. Record the baseline before attributing any later change to this work.

### Baseline recorded 2026-09-24

The apex HTTP redirect is live. Zone setting `always_use_https` is still `off`. A Single Redirect named "Redirect apex HTTP to HTTPS" matches `http://dannymcgiffin.com/*`, targets `https://dannymcgiffin.com/${1}`, uses status `301`, and preserves the query string. The existing "Redirect from WWW to root" rule was left in place.

Checked after the rule was active:

- `http://dannymcgiffin.com/` returns `301` to `https://dannymcgiffin.com/`.
- `http://dannymcgiffin.com/writing/` returns `301` to `https://dannymcgiffin.com/writing/`.
- `http://dannymcgiffin.com/northern-virginia-ai-workflow-automation/?utm=audit` returns `301` to the same HTTPS path and query, and that URL returns `200`.
- `http://todo.dannymcgiffin.com/` still returns `200`. `http://marketing.dannymcgiffin.com/` still redirects to its own HTTPS host.
- `http://www.dannymcgiffin.com/writing/` still returns `522`. The existing www rule matches `https://www.*` only.

`https://dannymcgiffin.com/sitemap-index.xml` returns `200` and lists `sitemap-0.xml`, which contains the same 11 public URLs as before this pass. `/advisory/` and `/work/erp-second-opinion/` are not published; both return `404`.

Search Console URL Inspection was not completed. Signed-in sessions for `danielmcgiffin@gmail.com` and `danny@cursus.tools` both get "you don't have access" for `sc-domain:dannymcgiffin.com` and the `https://dannymcgiffin.com/` property. No indexed canonical, last crawl, or recrawl request was recorded. Do not attribute a later indexing change to this pass. Inspection and recrawl of the homepage, advisory page, ERP case, Writing page, and Northern Virginia page wait on Search Console access and on publishing the new pages.

### Navy evidence and buyer feedback

Danny confirmed that the roughly $250M comparison comes from internal program reporting for 2015 and 2019, and that the roughly 45% error-rate comparison also comes from an internal report. He no longer has access to those reports and could not identify the two years behind the error-rate comparison. Public copy leads with the results while defining the $250M as a decline in estimated improper payments across the program, not recovered cash. The source limitation belongs in this internal handoff; the public copy does not imply that the Navy AFRs substantiate the figures.

The eight local Navy AFR PDFs provided for this task were readable. The FY2019 Department of the Navy AFR says on PDF page 36 that improper-payment disclosures are presented in the DoD AFR on behalf of the Navy. The FY2021 Navy AFR says on PDF page 266 that payment-integrity information is reported at the DoD agency level. The FY2019 DoD AFR's payment tables (printed pages 203–205) aggregate programs across components and do not establish these Navy-specific comparisons. Its Military Pay methodology changed substantially in FY2019, so its 2018–2019 amount is not a substitute for the internal Navy measure. No public AFR is linked on the site as proof of the $250M or 45% claim.

After publication, ask five plausible buyers to walk through the homepage, one case, the advisory page, and the Cal event. Note what they think the first call includes, any objection or confusion, and whether they can find the next step. Review those notes alongside actual inquiries and completed bookings before further copy changes.

## Local verification at handoff

- `npm run build`: passed Astro check (0 errors, 0 warnings, 0 hints) and generated 14 pages.
- `npm test`: 9 passed, 0 failed.
- `git diff --check`: passed.
- Browser checks: seven routes at 360, 390, 600, 768, 1024, and 1440px (42 combinations), with no horizontal overflow or missing booking link; mobile menu and accordion keyboard checks passed.
- Local mobile Lighthouse on the homepage: performance 99, accessibility 100, best practices 100, SEO 100; FCP 1.2s, LCP 2.0s, CLS 0.005, TBT 0ms. This is a lab result, not field data or a live-site result.
