import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const here=fileURLToPath(new URL('./',import.meta.url));
const output=path.join(here,'static');
const bytes=await readFile(path.join(here,'content.json'));
const manifest=JSON.parse(bytes);
const release=JSON.parse(await readFile(path.join(output,'release.json'),'utf8'));
const report=JSON.parse(await readFile(path.join(here,'static-export-report.json'),'utf8'));
const origin='https://dannymcgiffin.com';
assert.equal(release.manifestSha256,createHash('sha256').update(bytes).digest('hex'));
assert.equal(manifest.pages.length,22);
const unescape=s=>s.replaceAll('&amp;','&').replaceAll('&#038;','&');
async function resolveFile(url,from) {
  const u=new URL(unescape(url),origin+from);
  if(u.origin!==origin)return;
  let route=u.pathname;
  if(route==='/feed/')route='/feed.xml';
  if(!path.extname(route))route=route.replace(/\/?$/,'/')+'index.html';
  const filename=path.join(output,route.slice(1));
  assert.ok((await stat(filename).catch(()=>null))?.isFile(),`Missing local destination: ${url} from ${from}`);
  if(u.hash&&filename.endsWith('.html')) {
    const html=await readFile(filename,'utf8');
    assert.ok(html.includes(`id="${decodeURIComponent(u.hash.slice(1))}"`),`Missing anchor ${url} from ${from}`);
  }
}
let localLinks=0,bookings=0;
for(const page of manifest.pages) {
  const filename=path.join(output,page.route==='/'?'index.html':page.route.slice(1)+'index.html');
  const html=await readFile(filename,'utf8');
  assert.ok(!/127\.0\.0\.1|localhost|noindex|id="wpadminbar"|wpApiSettings|wp-login\.php|\/wp-admin\//.test(html),`Private/development marker in ${page.route}`);
  assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length,1,page.route);
  assert.ok(html.includes(`rel="canonical" href="${origin+page.route}"`),`Canonical ${page.route}`);
  assert.ok(html.includes('G-ZYTMP3PS7G'),`Existing analytics missing from ${page.route}`);
  const expected=report.pages.find(p=>p.route===page.route);
  assert.equal(createHash('sha256').update(html).digest('hex'),expected.sha256,`Snapshot hash ${page.route}`);
  for(const match of html.matchAll(/(?:href|src|poster)="([^"]+)"/g)) {
    const value=match[1];
    if(value.startsWith('mailto:')||value.startsWith('data:')||!value)continue;
    const url=new URL(unescape(value),origin+page.route);
    if(url.hostname==='cal.com') {
      assert.equal(url.pathname,'/dannymcgiffin/30min');assert.ok(url.searchParams.get('src'));bookings++;
    }
    if(url.origin===origin){await resolveFile(value,page.route);localLinks++;}
  }
  for(const match of html.matchAll(/<script[^>]+type="importmap"[^>]*>([\s\S]*?)<\/script>/g)) {
    for(const value of Object.values(JSON.parse(match[1]).imports||{}))await resolveFile(value,page.route);
  }
}
const work=await readFile(path.join(output,'work/index.html'),'utf8');
const workOrder=[...work.matchAll(/<h2[^>]*><a[^>]*href="\/work\/([^/]+)\//g)].map(m=>m[1]);
assert.deepEqual(workOrder,['growth','64m-deployment','operating-model','erp-decision','navy-improper-payments','negotiation-policy']);
const home=await readFile(path.join(output,'index.html'),'utf8');
assert.ok(home.includes('make their businesses easier to run and more capable of growth.'));
assert.deepEqual([...home.matchAll(/<h3[^>]*><a[^>]*href="\/work\/([^/]+)\//g)].map(m=>m[1]),['growth','64m-deployment','operating-model']);
const services=await readFile(path.join(output,'offers/index.html'),'utf8');
for(const title of ['Business &amp; Operations Design','Implementation &amp; Transformation','Independent Advisory &amp; Fractional Leadership'])assert.ok(services.includes(title),title);
const redirects=await readFile(path.join(output,'_redirects'),'utf8');
for(const r of manifest.redirects)for(const source of [r.from,r.from.replace(/\/$/,'')])assert.ok(redirects.includes(`${source} ${r.to} 301`));
assert.ok((await readFile(path.join(output,'robots.txt'),'utf8')).includes('Allow: /'));
assert.ok(!(await readFile(path.join(output,'robots.txt'),'utf8')).includes('Disallow: /'));
async function inspect(dir) {
  for(const entry of await readdir(dir,{withFileTypes:true})) {
    const full=path.join(dir,entry.name);if(entry.isDirectory()){await inspect(full);continue;}
    assert.ok(!/\.(php|sqlite|db|toml|env|sql|log)$/.test(entry.name),`Unexpected runtime file ${full}`);
    if(entry.name.endsWith('.css')) {
      const css=await readFile(full,'utf8');
      for(const m of css.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g))if(!m[1].startsWith('data:')&&!m[1].startsWith('#'))await resolveFile(m[1],'/'+path.relative(output,full));
    }
  }
}
await inspect(output);
console.log(`Static snapshot valid: ${manifest.pages.length} pages, ${report.assets.length} WordPress assets, ${localLinks} local references, ${bookings} tracked booking links, and ${manifest.redirects.length} legacy redirects.`);
