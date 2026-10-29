# WordPress/Ollie site and static publication

The production site is a static export of the reviewed WordPress/Ollie pages, hosted on the existing `dmcg` Cloudflare Worker. WordPress is a local rendering tool, not a public production service. The online WordPress editor is not required.

## Static publication on Cloudflare

The authoritative content is `wordpress/content.json`. The deployable, versioned public snapshot is `wordpress/static/`.

With the local WordPress preview running and the reviewed manifest imported:

```sh
npm run static:export --prefix wordpress
npm run static:check --prefix wordpress
```

The exporter requests anonymous page renders, copies only public assets, strips admin/development metadata, rewrites preview URLs, restores public indexing and canonical URLs, preserves the existing GA4/click tracking, and generates redirects, sitemap, RSS, robots, and a release fingerprint. No PHP, database, cookies, credentials, or admin interface is published. The local WordPress database and original source are preserved.

Commit the reviewed static snapshot, its export report, and manifest. Publish using the manual **Deploy WordPress static site** GitHub Actions workflow. It validates the snapshot, records the previous Cloudflare deployment for rollback, and deploys with the repository's existing Cloudflare secret. For an already authenticated local Cloudflare CLI, `npm run deploy` validates and publishes the same snapshot.

The scheduled Substack workflow now syncs source data only; it cannot overwrite this site with the old Astro build. New content requires an explicit static export and publication. Do not run the historical Astro-to-WordPress generator to recreate the reviewed manifest.

`release.json` exposes the manifest fingerprint so live publication can be verified. A rollback can redeploy a previous Cloudflare Worker version recorded in the deployment workflow logs. No hosting subscription or WordPress runtime is needed for the public site.

---

# Ollie WordPress preview

A separate local WordPress Playground site using the free Ollie 1.6.5 theme. The Astro app and deployment remain in place. Existing copy is populated as editable WordPress blocks: 18 pages and four dated essay posts.

From the repository root:

```sh
npm ci --prefix wordpress
npm run dev --prefix wordpress
```

Open http://127.0.0.1:9400/ for the site and http://127.0.0.1:9400/wp-admin/ for the editor. The preview automatically logs you in as the local administrator and binds only to localhost. Stop with Ctrl-C.

The first run installs WordPress and activates Ollie from the pinned official theme download in `blueprint.json`, then automatically restarts the saved site so local authentication is consistent across workers. Subsequent runs retain editor changes. `npm run setup --prefix wordpress` explicitly reapplies the theme and site options; it does not reset the database. Search-engine indexing is discouraged.

WordPress files, SQLite database, uploads, and editor changes persist in ignored `wordpress/site/`. Back up that whole directory before moving machines or deleting local files; Git does not back up the database. Playground caches downloads under `~/.wordpress-playground/`. This is a development preview, not production hosting.

The pre-overhaul source, including the uncommitted edits, is preserved in `../archive/site-2026-10-29-pre-ollie/`. That backup contains file hashes and restoration instructions. Source copy remains in `../src/lib/content/` as well as the backup.

Theme: https://wordpress.org/themes/ollie/
Tooling: https://github.com/WordPress/wordpress-playground/tree/trunk/packages/playground/cli

Production WordPress hosting and domain migration remain separate work and require an explicit deployment request.


## Content and structure

The homepage leads with building operations that can keep up with the business’s ambitions, names recognizable operating problems, explains the work, and features growth, deployment, and operating-model cases. Its booking invitation appears in the hero. The existing testimonials remain intact. The shared header links Work, Services, Writing, About, and Contact; Elsewhere sits in the footer. Contact links to the four focused engagements. Writing includes the four local essays and the existing Substack links. Six case studies and the research page retain their original URLs. Offer scope, prices, caveats, and booking source tags come from the existing copy.

Edit pages in **Pages**, essays in **Posts**, and shared navigation, header, footer, palette, and layouts in **Appearance → Editor**. Images are registered in the Media Library. Native blocks include headings, paragraphs, columns, cards built with Groups, quotes, buttons, lists, images, and Details.

The WordPress database is now the editable working copy. The original Astro source is preserved separately; WordPress edits do not sync back into it. Substack entries are a snapshot of the existing list, not a live WordPress feed integration.

## Repeat the source import

With the WordPress preview running:

```sh
npm run content:import --prefix wordpress
```

The import reads `wordpress/content.json` directly, preserving the reviewed WordPress copy. It keeps page IDs stable, preserves page hierarchy and original essay dates, and stops before changing pages or templates if it detects subsequent editor changes. Existing Site Editor style changes are retained. To deliberately replace edited imported content after review, use `npm run content:import --prefix wordpress -- --replace`.

Every import first saves the WordPress files and SQLite database to an ignored timestamped archive in `wordpress/backups/`. The authenticated import endpoint is installed temporarily and removed in a `finally` block. `site-content.php` remains installed as a small must-use plugin for descriptions and historical URL redirects. Generated `content.json` and `import-report.json` are ignored.

To recover a snapshot: stop the preview, move the current `wordpress/site/` aside, and extract the chosen archive into `wordpress/` (each archive contains a `site/` directory). Restart the preview. Keep these backups private because they include local WordPress configuration and database state.


## October 29 positioning review

WordPress now uses **Independent Strategy & Operations Partner** as the category. Home, Contact, the About introduction, the engagement overview, and the footer reflect the supplied review. The case-study evidence, offer prices and scope, URLs, portraits, and testimonials are preserved; the introductory-call labels now say “Schedule a conversation.” A pre-revision manifest and a full WordPress snapshot are saved in ignored `backups/`.

To reconstruct the reviewed copy from the preserved Astro source deliberately, run `npm run build` at the repository root, then `npm run content:build --prefix wordpress`. This regenerates the manifest and applies `revise-positioning.mjs`; it does not read later editor changes from the WordPress database. Back up and review before doing this. Import the resulting manifest separately with `npm run content:import --prefix wordpress`.

The final refinements below add three broader service categories without adding new fixed fees or changing the four focused engagements. No new result, client claim, or publication is implied.


## Final positioning refinements

`wordpress/content.json` is the authoritative portable final content. Do not regenerate it from Astro. The historical `content:build` command predates the final WordPress refinements and must not be used to restore this handoff.

The homepage keeps its headline, CTAs, featured cases, testimonials, and layout; only the two hero paragraphs change. `/offers/` is labeled Services and presents Business & Operations Design, Implementation & Transformation, and Independent Advisory & Fractional Leadership, followed by the four unchanged focused engagements. Each category has a conversation link. Work leads with growth, deployment, and operating-model design. Services is added after Work in the native header navigation, and Contact links to the Services overview.

The final changes can be reproduced on the supplied revised manifest with `npm run content:refine --prefix wordpress`, followed by `npm run content:import --prefix wordpress` against a running local preview. The refinement script is idempotent and edits the manifest directly; it never reads or rebuilds Astro. Fresh restores simply import the included final manifest.

Imports now skip unchanged pages, posts, templates, and Global Styles; changed pages retain their original publication dates. The final application changed only Home, Services, Work, the Contact-to-Services link, and the shared header. Other WordPress content records and the original source/archive are preserved.

Before/after desktop and mobile screenshots, machine-readable checks, and publication-readiness notes are in `wordpress/review/final-refinements/`.

The final restore check also hardened local authentication: the importer reads the REST nonce from the Site Editor’s API settings rather than accepting an unrelated form nonce. Explicit legacy redirects run before WordPress canonical guessing. These changes do not alter the site design or content.
