# dannymcgiffin.com — audit and proposed direction

17 September 2026 · Review only · No website files changed

The existing visual identity is worth keeping. The central problem is that the site repeatedly sells a narrower engagement than the business described in the brief. It establishes workflow diagnosis and implementation as the category, then asks visitors to qualify themselves for that category. A leader facing a consequential decision could reasonably conclude that Danny is not the person to call unless the problem is already a process that needs automating.

The proposed evolution keeps Astro, Newsreader, Geist, forest green, bone, strong display typography, and architectural restraint. It changes the order of the argument: **recognize the problem → demonstrate judgment through work → explain how Danny helps → invite a conversation.**

## 1. Scope, evidence, and unresolved inputs

Three versions must be distinguished:

| Version | Verified state | How this report uses it |
|---|---|---|
| Published dannymcgiffin.com | Astro v7.2.0; Operations Engineering positioning; Workflow Teardown funnel | Primary audit baseline |
| Repository committed `HEAD`, `e87e7b9` | Astro source matching the principal published copy, routes, schema, and visual tokens inspected | Existing implementation to evolve; deployed commit identity itself was not verified |
| Current `/srv/dev/dmcg` working tree | Extensive uncommitted replacement with Svelte/Vite; Astro files deleted locally; separate illustrations and new copy | Preserve this work; do not mistake it for the published implementation |
| `/tmp/dmcg-positioning-preview` | Earlier Astro positioning patch, including About and selected cases | Draft evidence only, not the deployed site or approved redesign |

An approved Astro implementation needs to preserve the current local work first, then reconcile the root with the existing committed Astro application. This is restoration of the requested existing implementation, not a new framework migration. Do not apply the earlier positioning patch wholesale: some of its claims remain unverified, and it is not this report's approved design.

**Reference inventory:** nine URLs were supplied and inspected through browser rendering and/or page content. Eight image paths were supplied and all eight were opened. They represent seven distinct references: Lando Norris, CMO Paris, Permanent Equity twice, Snøhetta, Terminal, AIM, and Simon Sarris. No supplied screenshot was found for Getty or Bennett & Clive; those were inspected live. Four additional screenshot files needed to meet the stated total of 12 have not been supplied or identified. This is a report on the supplied set, not a claim to have reviewed 12 files. The reference section remains provisional until that discrepancy is resolved.

No additional visual inspiration was sought. Several supplied long captures have large blank areas or duplicated/pinned material; these are insufficient evidence of intentional empty space. Live browser checks confirmed loading and animation states complicate capture. The report does not recommend reproducing those artifacts.

Methods: read-only repository inspection; direct source reads from Git and current files; live HTML, metadata, JSON-LD, sitemap and llms.txt checks; desktop Chrome at 1440px; homepage at 390px and 320px; mobile checks of Contact, Writing, and Northern Virginia; visual inspection of supplied screenshots and live reference captures. This is not a full accessibility, performance, cross-browser, or research-statistics audit. No production build was run because no implementation was changed.

The code graph was dated September 2 and its coverage checks reported missing or untracked current paths. Conclusions therefore rely on direct source and live checks. Vault consultation did not surface measurement records for the proposed cases. Earlier memory helped identify the separate Astro preview and previous proof concerns; it was not treated as current factual verification.

## 2. Confirmed problems

### Homepage: the whole argument is narrower than the intended business

The [published homepage](https://dannymcgiffin.com/) introduces Operations Engineering, frames the problem as growing back-office work, and describes Danny's value as returning capacity. These are understandable and commercially concrete, but they do not communicate ambiguous decisions, conflicting interpretations, organizational design, or choosing whether a major initiative should proceed.

The narrowing continues through the page:

- **Hero and introductory deck:** operational labor and margin, followed by onboarding, reporting, approvals, spreadsheets, and data entry. These examples train the reader to bring repetitive work.
- **“A simple rule”:** the useful technology principle is followed by a general assertion that businesses have workflow problems. That replaces one premature diagnosis with another.
- **“The work”:** the findings list ends at what should be built. It offers a technician's investigation of a process rather than an advisor's investigation of a business situation.
- **“Why this works”:** the six-step sequence assumes elimination, simplification, and building are the path. Choosing a direction or stopping an initiative is not legible as a complete outcome.
- **Proof:** only the document-generation case is developed. It demonstrates useful implementation, but does not establish the scale or judgment in the ERP and operating-model examples.
- **Offer:** the diagnostic is explicitly a Workflow Teardown, credited toward a build. Even the reassurance about not building frames advice as a prelude to possible implementation.
- **Founder and closing sections:** operations engineering returns as the identity; the closing trigger is hiring another person. The intended category never displaces the narrower one.

**Repetition map:** the introductory deck, technology principle, findings list, six-step method, case explanation, and offer outcomes all repeat some form of observe work → remove steps → redesign → build. Preserve the underlying principle once. Use the recovered space to answer different questions: what kinds of decisions, what stakes, why Danny, what engagement, what next.

### Navigation and About

Desktop primary navigation provides “What I do,” “Teardown,” the home link, and a booking CTA. Writing is missing from both the homepage header and footer. The `/writing/` index nevertheless contains four published articles.

The live `/about/` URL returned HTTP 404. The homepage's founder paragraph is the only substantial visible background on that route. An About page exists in the separate Astro preview, and another in the Svelte app; neither should be described as the published About page.

On the live mobile homepage the two informational navigation links disappear without a replacement menu. The visitor retains the name and booking CTA but loses primary navigation. At 320px, the name wraps to two lines and the header has little spare room.

### Measured mobile and browser observations

At 390×844, the first homepage proof starts approximately **5,646px** below the top; at 320×844 it starts approximately **6,352px** down. On the 1440×1000 desktop check it starts approximately **4,688px** down. These are rendering observations, not user-behavior measurements.

No horizontal overflow was found on the homepage at 320px or 390px, or on Contact, Northern Virginia, and Writing at 390px. No uncaught JavaScript exceptions were recorded during the final checks of those four pages. The keyboard's first Tab reached the visible skip link. These checks do not establish full accessibility compliance.

The local-page H1 occupies about 344px vertically on a 390px-wide phone. On Writing, the desktop-style number gutter and action placement leave the first long article title in a narrow column, causing excessive wrapping. Preserve the desktop writing layout but place its metadata above/below full-width titles on mobile. The mobile Contact opening spends most of its first screen on a repeated entity/location description, rather than information that makes starting easier.

### Contact

The [Contact page](https://dannymcgiffin.com/contact/) explicitly makes the first conversation a qualification step for a $5,000 Workflow Teardown. Its preparation questions require a process, frequency, participants, and time consumption. A leader who knows something is wrong but cannot name the process is discouraged by the intake framing.

The page repeats the company description and location while withholding the practical action until after a four-cell information grid. One cell explains that there is no public phone number or general inbox. This is administrative detail occupying the same visual weight as how to start.

The existing Cal.com destination is real in the site's links. This audit did not book an appointment or verify the contents and availability of the scheduler. Preserve the destination pending a normal end-to-end check; do not invent an inbox, response time, or form backend.

### Northern Virginia

The [local page](https://dannymcgiffin.com/northern-virginia-ai-workflow-automation/) has useful, specific geography and clearly identifies Herndon as the base. Keep that factual anchoring.

Its category, qualification criteria, examples, first paid step, and closing CTA all limit the work to repeatable operational friction. The assertion that this is the only kind of work Danny takes on directly contradicts the supplied positioning. Multiple passages restate redesign-before-automation. The page's length is not adding equivalent decision value.

### Writing and stale offers

The [Writing index](https://dannymcgiffin.com/writing/) is one of the stronger existing layouts: readable serif titles, compact dates, useful summaries, and ruled rows. Preserve it and make it discoverable.

The articles provide specific thinking about owner dependency, software procurement, institutional knowledge, and AI. They are better evidence of judgment than a new generic philosophy manifesto. However:

- “The $300,000 Lesson” is a candid account of an unsuccessful internal role. It is evidence of reflection, not a $300,000 client saving or success metric.
- “Your Vendor Already Told You What It Doesn't Do” demonstrates a concrete way to examine mismatched requirements and spending. It is a strong homepage selection.
- “Your Company Keeps Books on the Money—and Nothing Else” has useful business observations but pivots heavily toward AI readiness. It also attributes tacit knowing to Karl Polanyi; the relevant author is Michael Polanyi. The [publisher's record](https://press.uchicago.edu/ucp/books/book/chicago/T/bo6035368) confirms this correction.
- Some AI passages make absolute claims about models never asking questions or accessing context. These need technical qualification rather than being promoted as universal capability limits.

The [research briefing](https://dannymcgiffin.com/still-on-tools/) still sells the $5,000 diagnostic and its build credit. It acknowledges that its sources do not isolate the $5–50M audience, yet its opening and urgency language make broad claims about that audience. The attribution and sampling caveats are useful; the leap from those samples to prevalence and competitive urgency remains an inference. The underlying studies were not independently re-audited in this task.

The [assessment page](https://dannymcgiffin.com/score-one-workflow/) promises a ten-question result, then states the form is not live and will ship in the next deploy. The briefing's assessment CTA therefore leads to an unavailable capability.

The old AI Opportunity Sprint URL redirects to the research briefing, yet both `llms.txt` and the live sitemap still list it as a page/product destination. The committed Astro redirect configuration also differs from the hosting redirects for the old workflow-review path. Consolidate these rules; do not preserve competing redirect definitions accidentally.

### Machine-readable positioning

The live HTML confirms that the narrow category is embedded beyond the visible copy:

| Surface | Current problem | Proposed change |
|---|---|---|
| Homepage title, description, OG and Twitter metadata | Operations Engineering and labor-capacity positioning | Business advisor and designer; consequential business problems |
| `Person.jobTitle` | Operations engineer | Independent business advisor and designer |
| Person description | Describes a founder-led engineering firm instead of clearly describing the person | Person-specific description, direct working relationship |
| `knowsAbout` | Dominated by workflows, integration, internal tools, automation, AI implementation | Include strategy, operating models, organizational design, decisions, ownership, business systems, customer/employee experience; retain technology as a capability |
| `ProfessionalService` | Narrow description plus sitewide $5,000 Teardown `Offer` | Align with advisory/design/build; remove the obsolete primary offer and price |
| Local `Service` | Operations Engineering | Business advisory and operating-model/business-systems design with the existing truthful geography |
| `llms.txt` | Workflow automation and AI consultant; stale sprint link | Concise matching description and real current destinations |
| OG image | Generic atrium image, no name or positioning | Newsreader/Geist composition with Danny's name and concise positioning |
| Person image / service logo | Both reuse the atrium OG image | Use an actual approved portrait and real mark if available; otherwise omit misleading image roles |
| Sitemap / redirects / internal links | Retired product destination still listed; old funnel links remain | One coherent route inventory, only canonical indexable destinations in sitemap |

Keep stable entity IDs, canonical handling, article metadata, RSS, existing analytics configuration, and useful social-profile links. Updating positioning does not justify replacing that infrastructure. `llms.txt` consistency is worthwhile; it is not a promise of AI-search visibility.

## 3. Design judgments: what feels weak and why

These are assessments of communication, not claims about measured conversion performance or who authored the site.

**The atrium is atmospheric but interchangeable.** It could front an architecture firm, property developer, or enterprise-services business. It conveys seriousness without explaining Danny's particular judgment. Its origin was not verified, so this report does not label it stock or AI-generated as a fact. It does have the impersonal, idealized quality that can make a site feel generated.

**The hero accumulates effects.** Full-bleed architecture, image darkening, grain, visible grid lines, clipped text reveals, huge type, and a bottom action bar all operate at once. The underlying perspective is already strong; the overlay grid does not describe anything the visitor needs to understand. The page should communicate deliberateness through alignment and decisions about content, not through extra technical markings.

**Repeated section treatment makes distinct ideas feel equivalent.** A small label, oversized serif heading, explanatory copy, and dark/light change recur. The very long six-verb method headline receives more visual emphasis than the evidence. Scale should follow what helps a buyer decide.

**The proof language hides useful specificity.** Labels such as “sanitized case study,” and claims that an applet “just plain works,” are less useful than context, Danny's role, the change, and the measurement boundary. Confidentiality should be handled in the facts, not advertised as a production note.

**The contact grid looks assembled from a component template.** Location, intake criteria, and absence of an inbox do not merit four equally sized cells. A conversational opening with the action beside it and concise supporting information would better match the intended interaction.

**Some copy sounds generic despite the strong type.** “Solutions that stick,” the six-stage method, and repeated inventories of software/integrations/tools/AI are familiar consulting language without sufficient situational evidence. This is an editorial diagnosis, not proof of AI authorship.

**The local Svelte drafts are not a ready-made answer.** Their problem framing is closer to the brief, but repeated “No framework / No deck / No package” statements sell opposition instead of useful judgment. Advisory work may quite properly use a framework or produce a deck. The large percentage claims there need verification, and its architectural diagram adds another metaphor without documenting a real business. Do not import those elements merely because they are newer.

## 4. What should be preserved

1. **Newsreader 300 roman and italic + Geist 400/600.** The serif supplies thought and personality; the sans serif makes evidence and navigation readable. No replacement font search is needed.
2. **The actual palette:** forest `#0f1b14`, darker forest `#0b100d`, bone `#efeee8`, ink `#171a17`, green `#2f6845`, and restrained light-green accent `#a4d392`.
3. **Large type with real whitespace.** Keep room around the opening and the business-design thesis. Reduce space where it merely delays evidence.
4. **Fine rules, disciplined margins, quiet labels.** Use rules to separate entries and align facts, not to decorate blank space.
5. **The existing writing-list treatment and article reading layout.** These are already appropriate to evidence of thinking.
6. **The principle of understanding work before prescribing technology.** Broaden its application; retain its plain meaning.
7. **Direct access to Danny and a clear action.** Preserve the existing scheduling integration, subject to verification, while changing the invitation.
8. **Astro's static pages, content collection, responsive image infrastructure, RSS, canonicals, and schema foundation.** Repair their content and configuration rather than replace them.
9. **Existing accessibility foundations:** skip link, semantic headings, focus styles, and reduced-motion provisions. Verify their behavior after changes.

## 5. The reference set: useful principles, not a composite imitation

| Reference | Observed principle | Application to Danny | What does not transfer |
|---|---|---|---|
| [Lando Norris](https://landonorris.com/) — supplied timestamp `19_27_22.677Z` | Large declarations alternate with compact labels, objects, and very different compositions; identity is unmistakable | Let the opening and thesis have scale, then compress into practical case detail | Fan-site spectacle, neon branding, helmet galleries, long loading/scroll choreography |
| [CMO Paris](https://cmoparis.com/en/) — timestamp `19_27_41.712Z` | Material and craft imagery provide substance; sparse copy lets the subject carry the page; image sizes vary | Use real work or useful documents if available; give one strong composition room | Borrowed luxury material imagery or decorative texture unsupported by Danny's work |
| [Permanent Equity](https://www.permanentequity.com/) — named file and timestamp `19_27_59.050Z` | Substantial writing addresses owners directly; compact practical links sit beside the larger argument | Explain fit, working relationship, and next step without a pricing-card funnel | Its extensive investment navigation and content volume; Danny does not need to imitate firm scale |
| [Snøhetta](https://www.snohetta.com/) — named file | A broad practice is established in one sentence and substantiated by work; images, lists, and tables have different jobs | State Danny's scope succinctly, then show consequential cases before method | An architecture portfolio without genuine project imagery; a huge discipline taxonomy |
| [Terminal](https://terminal-industries.com/) — named file | A recognizable operational setting leads into concrete problems, useful detail, proof, and conversion | Put context beside outcomes; show what changes for the buyer | SaaS calculator, product UI, logo wall, cards and feature carousel without real equivalents |
| [Getty / Persepolis](https://persepolis.getty.edu/) — live inspection | A coherent setting and controlled sequence focus attention on one idea at a time | Organize the story so each section advances the reader's understanding | Loading gates, audio, immersive navigation, or a historical environment as an advisory metaphor |
| [AIM](https://aim.obys.agency/) — named file | Extreme typographic scale is counterbalanced by small metadata, indexes, rules, and aligned columns | Use decisive scale contrast and compact factual annotations | Huge logo takeover, experimental legibility, empty animation capture space, or its generic AI promotional phrasing |
| [Bennett & Clive](https://bennettandclive.com/) — live inspection | Work names and actual production imagery dominate; persistent navigation stays blunt and legible | Demonstrate the work before explaining capabilities; keep navigation literal | Celebrity/client-name spectacle without permission or equivalently recognizable proof |
| [Simon Sarris](https://simonsarris.com/) — named file | A single personal image and four plainly named destinations create a distinctive, economical entrance | Keep Danny recognizably a person; make Writing and About obvious | A bare personal index that assumes the visitor already knows why to hire him |

Across the set, the recurring lesson is **specific subject matter, deliberate scale contrast, and different treatments for different kinds of information**. It is not universally minimalism: Permanent Equity is dense; CMO is image-led; AIM is typographically forceful. Danny needs the practical detail of the first, the confidence of the latter, and proof that is appropriate to an advisor.

The two Permanent Equity screenshots count as two supplied files, not independent confirmation of a trend. The visibly blank passages in AIM/Terminal and duplicate passages in Lando's long capture are excluded from spacing conclusions.

## 6. Proposed visual and structural direction

**One dominant visual idea: a large, plain statement of the business problem, followed by closely set evidence of judgment.** The contrast between those two scales organizes the page. No new illustrative metaphor is necessary.

Keep the forest opening, bone reading surface, and forest closing. Let the middle sections share the same surface, using spacing, type size, alignment, and rules to create transitions. This avoids turning every new thought into another alternating color band.

The opening should be an asymmetric typographic composition within the existing broad margins: a substantial Newsreader headline, a short Geist introduction, and one clear conversation link. Use restrained italic emphasis only where it changes the reading. Initial sizing targets are roughly 88–112px on wide desktop and 46–58px on phones, adjusted to actual line breaks. The goal is a coherent statement, not the largest possible font.

Remove the atrium as the dominant hero and OG image. Retain its source asset, but remove its use here for the specific reasons above. Remove the hero grain and decorative grid. Do not replace them with another generic photograph, generated building, wireframe, dashboard, or abstract object. The first screen should already contain meaningful information; a vast empty green field would not be an acceptable substitute.

Use a roughly 55–70-character reading measure for sustained prose. Place compact labels in a narrow left column on desktop and directly above the associated text on mobile. Keep evidence visible without hover, carousels, or accordion expansion. Motion should be optional and brief; the headline, evidence, navigation, and CTA must be immediately available.

### Proposed homepage, in the requested order

| Section | Communication job | Concrete treatment and content |
|---|---|---|
| **1. Hero** | Tell the right leader why Danny is relevant | Eyebrow: independent business advisor and designer. Headline: “Problems that don't fit neatly into a job description.” Short supporting copy identifies owners/leaders, meaningful stakes, and an unclear answer. Primary CTA: “Tell me what's going on.” Secondary text link: selected work. |
| **2. Serious proof** | Establish judgment and range before method | Lead with the ERP decision, subject to verification. Follow with the federal operating model, then the document workflow as evidence Danny can execute. Use compact case entries, not three identical metric cards. Each names situation, Danny's role, intervention, and supported result. |
| **3. Situations** | Let visitors recognize their own problem | Five or six ruled entries: owner bottleneck; strategy/operating mismatch; growth adding overhead; systems that don't fit; leadership disagreement; several plausible answers. Add one sentence of consequence to each. Fold AI into a situation rather than a separate service tile. |
| **4. How Danny thinks** | Explain the quality of judgment | Three concise passages: see reality; find the real problem; design a better business. Explain incentives, decision rights, economics, and tradeoffs. State the technology principle once. No forced six-stage delivery funnel. |
| **5. Ways to work** | Make engagement options legible | Advisory, Design, Build as three open rows with a short description and possible tangible output. Advisory might end in a decision; Design might end in an operating model; Build makes an agreed design work. These are modes, not mandatory phases or pricing tiers. |
| **6. Deliberate business design** | Establish the larger point of view | Give “Great businesses don't happen by chance” a large serif treatment. A short paragraph explains how customers, employees, economics, ownership, decisions, incentives, systems, workflows, and technology affect one another. No nine-node diagram needed. |
| **7. Writing** | Supply evidence of thinking | Three selected articles with one-line reasons to read, using the existing ruled-list language. Prioritize procurement judgment and founder decision rights alongside one AI piece. Link to all writing. |
| **8. Contact** | Make the next action easy | “Tell me what's going on.” Explain that an important problem, decision, or unresolved situation is enough to begin. Use the existing booking destination and a Contact link; no predefined product qualification. |

“Magic is the moat” should be a secondary idea, if used at all: the apparent ease customers and employees experience when the underlying decisions and systems reinforce each other. It should not compete with the hero or become an unexplained brand slogan. Do not invent an essay with that title if one is not available.

### The approximately 30-second read

This is a proposed communication test, not a measured current result:

- **0–5 seconds:** the headline and category establish consequential, cross-functional business problems and the person who helps.
- **5–15 seconds:** the first scroll shows a high-stakes decision and an operating-model example, establishing a ceiling above small automation.
- **15–25 seconds:** short situation headings let the reader identify their own difficulty. The page makes clear that the right answer may be a decision or organizational change.
- **25–30 seconds:** the conversation CTA is obvious; the visitor need not diagnose the problem or buy a product first.

On mobile, the opening must be content-sized rather than locked to an elaborate full-screen animation. The first proof should begin on the first substantive scroll, not after six screens of method. A reader should also be able to reach About and Writing directly from the mobile menu.

## 7. Supporting-page recommendations

**About:** open with the requested idea about problems that do not fit a job description. Follow with three short case narratives showing the recurring pattern: situation, what was unclear, stakes, Danny's role, decision/design, outcome. Explicitly distinguish internal leadership from consulting work. Then use a short background paragraph to explain the breadth. Notre Dame and Army service appear in drafts but should be confirmed before publication. Avoid importing family details from the old preview without a reason and confirmation. End with how this experience helps a client now.

**Contact:** put the invitation and booking action together near the top. Useful prompts: what is happening, what is at stake, what has already been tried, and what remains uncertain. Say that the problem need not be neatly framed. Explain that the first conversation helps determine whether Danny can help and what a sensible next step might be. Do not promise free substantive consulting, a response deadline, or specific availability without confirmation. Keep Herndon and direct work with Danny in supporting copy. Remove the four-cell grid and obsolete Teardown gate.

**Northern Virginia:** retain the existing URL initially to avoid an unnecessary URL migration while the content changes. The old slug is imperfect, but the page title, H1, description, schema, and body can establish the correct category. Use a title such as “Business Advisory in Northern Virginia | Danny McGiffin.” Lead with the kinds of consequential problems, then describe advisory, operating-model design, and systems work. Preserve the true service area in one useful passage. Include a relevant verified case and the conversation CTA. Do not create town-specific doorway pages. Search traffic and backlinks were not inspected, so no ranking preservation is guaranteed. A later URL rename would need its own evidence and direct 301 plan.

**Writing:** preserve article URLs, dates, RSS, and individual voices. Select for relevance instead of rewriting every essay to match a sales page. Correct the Polanyi attribution and review the identified absolute AI claims. Edit obsolete commercial CTAs and internal links. Keep any broader essay revision outside this approval scope unless explicitly included.

**Old offer routes:** preserve the substantive `/still-on-tools/` briefing as a writing/resource page, remove its product ladder and unsupported urgency, and stop advertising a live assessment. Retire the unfinished `/score-one-workflow/` page with a direct redirect to the briefing, updating links to describe the briefing rather than an assessment. Keep the old sprint/workflow-review redirects direct and consistent, and remove redirected URLs from the sitemap. Do not silently launch the missing quiz or email capture.

## 8. Claims and evidence register

A published claim is evidence of what the site says, not independent proof of the event. None of the following should acquire extra precision during rewriting.

| Claim or detail | What was found | Required treatment |
|---|---|---|
| ERP project stopped because the operating model did not fit | Supplied as a possible example in the brief; present in prior patch and local drafts | Confirm Danny's role, circumstances, and outcome. Lead with judgment once confirmed. |
| “Before millions more were spent” / PE-backed company | Stronger wording in drafts, not substantiated by measurement or project records found | Do not translate into “saved millions.” Confirm remaining commitment and avoided expenditure; otherwise use an accurate qualitative statement. |
| Federal operating model at a major professional-services firm | Brief and Astro preview describe it | Confirm role, scope, internal-versus-client relationship, implementation status, and permitted level of identification. |
| 70% less rework, 50% faster coordination, 60% faster delivery | Current uncommitted Svelte homepage | No measurement basis found. Hold from publication until baseline, period, definitions, and attribution are established. Do not attach these numbers to the federal case by proximity. |
| Federal contractor: 1→15 people, $200K→$2M, 100% retention | Current uncommitted Svelte homepage | Confirm time period, revenue definition, retained population, Danny's contribution, and publication permission. Not ready to reuse. |
| $64M classified global deployment completed in four months | Current uncommitted Svelte homepage | Confirm factual basis, Danny's precise role, and what may be disclosed. Do not reproduce classified-project details based solely on website draft copy. |
| Approximately 100→15 hours annually | Published homepage, brief, earlier drafts | Confirm annualization, comparable workload, estimate versus logged measurement, and whether ongoing checking/maintenance is included. |
| 85% reduction / 85 hours reclaimed | Arithmetic derived from 100 and 15 | Mathematically consistent, but no more certain than the inputs. Prefer one qualified expression of the result over three versions. |
| Roger Porres quotation and title | Published homepage and preview | Verify exact approved wording, attribution, and permission. “Anonymous client” plus a named/title-attributed testimonial is not reliably anonymous. Keep the institution unnamed unless explicitly authorized. |
| $5,000, two weeks, full credit toward build | Published offer, Contact/local/resource copy, JSON-LD | Existing commercial terms, not invented claims. Remove from the primary funnel under the new direction; do not replace with new prices or timing. Confirm if the product remains active elsewhere. |
| Notre Dame / Army logistics officer | Local About and Astro preview | Confirm factual wording; concise background, not inflated credentials. |
| Founder-led firm / every engagement led by Danny | Live site | The brief supports an independent advisor. Use direct singular language; imply no additional staff or delivery capacity. |
| Questionnaire and scoring | Advertised, explicitly unavailable on destination | Retire the promise unless separately commissioned and implemented. |
| AI market percentages and urgency | Briefing contains figures and sample caveats | Keep source-specific claims distinguishable from inference; no new generalized prevalence claim without source verification. |
| “Most companies” have workflow rather than technology problems | Broad assertion without evidence on homepage/local page | Replace with situated possibilities, consistent with diagnosing before deciding. |
| General guarantees of reliable operation / easy maintenance | Case copy asserts them without detail | Replace with supported observations and bounded outcomes. Do not promise universal reliability. |

Useful proof does not require a percentage. A well-supported account of identifying a mismatch, framing a decision, and helping leadership stop the wrong project can be stronger than an ungrounded savings number.

## 9. Missing decision-support information

A prospective client should be able to establish:

- Whether their unresolved decision is sufficient reason to call, even without a defined workflow.
- Whether Danny works directly with them, and which examples were internal roles versus outside engagements.
- What advisory can produce when implementation is not required.
- What access to leadership, staff, and actual work an engagement may need.
- How scope is agreed after the first conversation, without invented fees or standard durations.
- Which situations make the work worthwhile: meaningful stakes, cross-functional consequences, and willingness to examine the facts.
- Where Danny is based and whether in-person or remote work is appropriate; avoid expanding geographic promises without confirmation.
- What happens after the contact action and how to use the actual available channel.

Place the answers in Ways to Work, About, and Contact. Do not build a giant FAQ that restates the homepage.

## 10. Significant changes proposed for approval

| ID | Change | Reason / boundary |
|---|---|---|
| R1 | Preserve local Svelte work, then reconcile the existing Astro baseline for implementation | Required to honor the requested framework without losing unrelated work |
| R2 | Replace primary operations/automation category across visible pages | Match the actual buyer and problem scope |
| R3 | Recompose hero; remove atrium, grain, grid and essential text reveals from this usage | Give attention to Danny's proposition and early evidence; keep source assets |
| R4 | Move serious cases immediately below hero | Establish consequential judgment before asking for trust in a method |
| R5 | Publish only verified case facts; qualify estimates; distinguish role type | Prevent draft metrics and experience from becoming misleading proof |
| R6 | Replace repeated findings/method/deck passages with situations and three thinking principles | Each section answers a different client question |
| R7 | Replace the Teardown/build ladder with Advisory, Design, Build | Advisory must be a complete engagement option |
| R8 | Add one concise deliberate-business-design thesis | Explain the wider point of view without another decorative motif |
| R9 | Add selected writing to homepage and explicit Writing navigation | Make existing thinking discoverable |
| R10 | Create published About around the pattern of work | Supply the missing reason to trust Danny's breadth |
| R11 | Rebuild Contact invitation and remove product qualification | Accept important ambiguity rather than require a prediagnosed workflow |
| R12 | Reframe the local page while retaining its URL and factual geography | Preserve continuity while correcting positioning |
| R13 | Update shared titles, descriptions, schema, llms.txt and OG artwork/roles | Make machine-readable and visible identities agree |
| R14 | Remove stale primary offer references, repair redirects/sitemap, retire unfinished assessment | Avoid conflicting funnels and unavailable capabilities |
| R15 | Preserve writing layouts; correct identified attribution and narrow problematic claims/CTAs | Protect credibility without wholesale essay rewriting |
| R16 | Use three principal color fields, varied density, ruled evidence, restrained labels | Create rhythm without a repeated dark/light section template |
| R17 | Add usable mobile navigation, full-width mobile writing titles, and content-driven responsive hierarchy | Preserve access and bring evidence closer to the opening |
| R18 | Verify the approved implementation against this register | Prevent scope drift and distinguish source/build success from visual acceptance |

## 11. Risks and assumptions requiring verification

**Risks:** broader positioning can become vague without strong cases; removing the priced offer can reduce qualification unless fit and engagement information remain concrete; rebuilding over the dirty root can lose work unless preserved; old URLs and links can be broken by indiscriminate cleanup; too much display typography can again delay substance; case anonymity can be undone by testimonial attribution.

**Assumptions:** the target buyer and category in this brief supersede prior agency/operations-engineering positioning; the existing scheduling destination remains desired; the ERP and operating-model cases are available for public use at some factual level; the stated regional base is current; the eight supplied images may be the intended set despite the repeated reference to 12. None of these assumptions authorizes invented proof, new integrations, or deployment.

**Approval boundary:** the report proposes the changes above, not a framework replacement, new booking infrastructure, newsletter launch, quiz build, invented work gallery, or general rewrite of the writing archive. The four missing screenshot inputs and case verification remain visible dependencies. Report approval should not be interpreted as factual approval of every draft number.

## 12. Implementation verification after approval

Run the restored Astro application locally and run its production build. Resolve build and browser exceptions. Check the full homepage and supporting pages at desktop and 320/390/768px widths; include actual scrolling, keyboard navigation, focus visibility, menu dismissal, 200% text/zoom behavior, readable contrast, reduced motion, and a usable page without animation.

Verify navigation, CTA destinations, internal links, article links, fragments, redirects, the 404 response, canonical URLs, JSON-LD validity and entity consistency, OG image/text, sitemap, RSS, llms.txt, and removed offer references. Verify that Person/image and service/logo properties describe real assets. Avoid a false claim that a passing build proves any of these browser outcomes.

For visual review, compare each R1–R18 item to the result, including the opening/proof proximity and the 30-second reading test. Name incomplete items explicitly. Deployment remains a separate authorized action.

After that verification, identify the single weakest section and propose one bounded correction. No second whole-site redesign. Any further implementation must name the section and one change, with unrelated copy, spacing, imagery, and functionality held fixed.

---

Supporting captures and extracted live page evidence are in `/tmp/dmcg-audit/`. The report and inspection artifacts were written outside the repository. No code, content, dependencies, commits, or deployment were changed by this audit.
