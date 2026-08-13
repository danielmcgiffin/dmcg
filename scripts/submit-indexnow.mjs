#!/usr/bin/env node

/**
 * Submit live sitemap URLs to IndexNow after deploy.
 * Usage: node scripts/submit-indexnow.mjs
 */

const SITE = 'https://dannymcgiffin.com';
const KEY = '92720a99bd409729090e7e967f9413ec';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const sitemapResponse = await fetch(`${SITE}/sitemap-0.xml`);
if (!sitemapResponse.ok) {
	throw new Error(`Could not read sitemap: ${sitemapResponse.status}`);
}

const sitemap = await sitemapResponse.text();
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

if (urls.length === 0) {
	throw new Error('Sitemap contained no URLs.');
}

const payload = {
	host: 'dannymcgiffin.com',
	key: KEY,
	keyLocation: `${SITE}/${KEY}.txt`,
	urlList: urls
};

const response = await fetch(ENDPOINT, {
	method: 'POST',
	headers: { 'content-type': 'application/json; charset=utf-8' },
	body: JSON.stringify(payload)
});

const body = await response.text();
console.log(`IndexNow ${response.status} ${response.statusText}`);
if (body) console.log(body);
if (!response.ok && response.status !== 202) {
	process.exit(1);
}
console.log(`Submitted ${urls.length} URLs.`);
