import { readFile, writeFile, mkdir, readdir, copyFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parse, parseFragment, serialize } from '../node_modules/parse5/dist/index.js';

const here=fileURLToPath(new URL('./',import.meta.url));
const root=path.dirname(here.slice(0,-1));
const origin='http://127.0.0.1:9400';
const production='https://dannymcgiffin.com';
const output=path.join(here,'static');
const manifestBytes=await readFile(path.join(here,'content.json'));
const manifest=JSON.parse(manifestBytes);
const assets=new Set(), fetched=new Set();
const attr=(n,key)=>n.attrs?.find(a=>a.name===key)?.value||'';
const find=(n,test)=>test(n)?n:(n.childNodes||[]).map(c=>find(c,test)).find(Boolean);
const walk=(n,fn)=>{fn(n);for(const c of n.childNodes||[])walk(c,fn);};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const local=url=>new URL(url,origin).origin===origin;
const assetPath=url=>/\.(css|js|mjs|woff2?|ttf|otf|svg|png|jpe?g|webp|gif|avif|ico|pdf)(?:[?#]|$)/i.test(url);
function queue(url,base=origin) {
  if(!url||url.startsWith('data:')||url.startsWith('#'))return;
  const resolved=new URL(url,base);
  if(resolved.origin===origin&&assetPath(resolved.pathname))assets.add(resolved.pathname);
}
function rewrite(s) {return s.replaceAll(origin,'').replaceAll(origin.replaceAll('/','\\/'),'');}
async function fetchPublic(url) {
  const response=await fetch(url,{headers:{Cookie:'playground_auto_login_already_happened=1'},redirect:'manual'});
  if(!response.ok)throw Error(`Public export failed: ${url} (${response.status})`);
  return response;
}
function prune(n) {
  n.childNodes=(n.childNodes||[]).filter(c=>{
    const rel=attr(c,'rel'), id=attr(c,'id');
    if(c.tagName==='meta'&&['robots','generator'].includes(attr(c,'name')))return false;
    if(c.tagName==='link'&&(rel==='EditURI'||rel==='shortlink'||rel==='https://api.w.org/'||rel==='dns-prefetch'||attr(c,'href').includes('/wp-json/')||attr(c,'href').includes('/comments/feed/')))return false;
    if(c.tagName==='script'&&(id==='wp-emoji-settings'||attr(c,'type')==='speculationrules'||(c.childNodes||[]).some(t=>t.value?.includes('wp-emoji-settings'))))return false;
    return true;
  });
  for(const c of n.childNodes)prune(c);
}
const analyticsSource=await readFile(path.join(root,'src/components/Analytics.astro'),'utf8');
const analyticsEvents=analyticsSource.match(/<script is:inline>([\s\S]*?)<\/script>/)?.[1]
  .replace("destination.hostname === 'therealmcgiffin.substack.com'","destination.hostname === 'dannymcgiffin.substack.com'");
const gaId=(await readFile(path.join(root,'src/config.ts'),'utf8')).match(/GA_MEASUREMENT_ID\s*=\s*'([^']+)'/)?.[1];
if(!gaId||!analyticsEvents)throw Error('Existing analytics configuration could not be preserved.');
const analytics=`<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(gaId)}"></script><script>window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};window.gtag('js',new Date());window.gtag('config',${JSON.stringify(gaId)});</script><script>${analyticsEvents}</script>`;
function exportHtml(source,page) {
  const doc=parse(source);prune(doc);
  const head=find(doc,n=>n.tagName==='head');
  const canonical=find(head,n=>n.tagName==='link'&&attr(n,'rel')==='canonical');
  if(canonical)canonical.attrs.find(a=>a.name==='href').value=production+page.route;
  const title=find(head,n=>n.tagName==='title');
  const publicTitle=page.route==='/'?`Danny McGiffin | ${manifest.siteDescription}`:`${page.title} | Danny McGiffin`;
  title.childNodes=[{nodeName:'#text',value:publicTitle,parentNode:title}];
  const extra=parseFragment(`<meta name="robots" content="index, follow"><meta property="og:type" content="${page.type==='post'?'article':'website'}"><meta property="og:title" content="${esc(publicTitle)}"><meta property="og:description" content="${esc(page.description)}"><meta property="og:url" content="${production+page.route}"><meta property="og:image" content="${production}/wp-content/uploads/dmcg/headshot.jpg"><link rel="icon" href="/favicon.svg">${analytics}`);
  for(const node of extra.childNodes){node.parentNode=head;head.childNodes.push(node);}
  walk(doc,n=>{
    for(const a of n.attrs||[]) {
      if(['src','href','poster'].includes(a.name)&&a.value)queue(a.value);
      if(a.name==='srcset')for(const candidate of a.value.split(','))queue(candidate.trim().split(/\s+/)[0]);
    }
    if(n.tagName==='style')for(const text of n.childNodes||[])scanCss(text.value||'',origin);
    if(n.tagName==='script'&&attr(n,'type')==='importmap') {
      const map=JSON.parse(n.childNodes.map(c=>c.value||'').join(''));
      for(const value of Object.values(map.imports||{}))queue(value);
    }
  });
  let html=rewrite(serialize(doc)).replaceAll(`${production}/feed/`,`${production}/feed.xml`);
  if(/127\.0\.0\.1|localhost|id="wpadminbar"|noindex|wpApiSettings|wp-login\.php/.test(html))throw Error(`Private/development markers remain at ${page.route}`);
  return html.replace(/[ \t]+$/gm,'');
}
function scanCss(css,base) {
  for(const match of css.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g))queue(match[1],base);
  for(const match of css.matchAll(/@import\s+["']([^"']+)["']/g))queue(match[1],base);
}
// Only replace this generated output directory; the working site and originals stay intact.
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
const pages=[];
for(const page of manifest.pages) {
  const source=await (await fetchPublic(origin+page.route)).text();
  const html=exportHtml(source,page);
  const destination=path.join(output,page.route==='/'?'index.html':page.route.slice(1)+'index.html');
  await mkdir(path.dirname(destination),{recursive:true});await writeFile(destination,html);
  pages.push({route:page.route,title:page.title,sha256:createHash('sha256').update(html).digest('hex')});
}
while([...assets].some(p=>!fetched.has(p))) {
  const pathname=[...assets].find(p=>!fetched.has(p));fetched.add(pathname);
  let bytes;
  try { bytes=await readFile(path.join(root,'public',pathname.slice(1))); }
  catch(error) {
    if(error.code!=='ENOENT')throw error;
    const response=await fetchPublic(origin+pathname);
    bytes=Buffer.from(await response.arrayBuffer());
  }
  if(/\.(css|m?js)$/.test(pathname)) {
    let source=bytes.toString();
    if(pathname.endsWith('.css'))scanCss(source,origin+pathname);
    else {
      for(const match of source.matchAll(/(?:from\s*|import\s*\(?)\s*["']([^"']+)["']/g))if(match[1].startsWith('.'))queue(match[1],origin+pathname);
    }
    bytes=Buffer.from(rewrite(source).replace(/[ \t]+$/gm,''));
  }
  const destination=path.join(output,pathname.slice(1));await mkdir(path.dirname(destination),{recursive:true});await writeFile(destination,bytes);
}
async function copyPublic(dir) {
  for(const entry of await readdir(dir,{withFileTypes:true})) {
    const src=path.join(dir,entry.name);if(entry.isDirectory()){await copyPublic(src);continue;}
    if(!entry.isFile()||entry.name.startsWith('_')||['robots.txt','llms.txt'].includes(entry.name))continue;
    const dest=path.join(output,path.relative(path.join(root,'public'),src));await mkdir(path.dirname(dest),{recursive:true});await copyFile(src,dest);
  }
}
await copyPublic(path.join(root,'public'));
const home=await readFile(path.join(output,'index.html'),'utf8');
const notFound=parse(home);const main=find(notFound,n=>n.tagName==='main');
const content=parseFragment('<h1 class="wp-block-heading">Page not found.</h1><p>The page may have moved. You can <a href="/work/">explore my work</a>, <a href="/offers/">see my services</a>, or <a href="/contact/">get in touch</a>.</p>');main.childNodes=content.childNodes;for(const n of main.childNodes)n.parentNode=main;
const nfTitle=find(notFound,n=>n.tagName==='title');nfTitle.childNodes=[{nodeName:'#text',value:'Page not found | Danny McGiffin',parentNode:nfTitle}];
const nfCanonical=find(notFound,n=>n.tagName==='link'&&attr(n,'rel')==='canonical');if(nfCanonical)nfCanonical.parentNode.childNodes=nfCanonical.parentNode.childNodes.filter(n=>n!==nfCanonical);
await writeFile(path.join(output,'404.html'),serialize(notFound));
const redirectRules=manifest.redirects.flatMap(r=>[`${r.from.replace(/\/$/,'')} ${r.to} 301`,`${r.from} ${r.to} 301`]);
redirectRules.push('/rss.xml /feed.xml 301','/feed /feed.xml 301','/feed/ /feed.xml 301','/home / 301','/home/ / 301');
await writeFile(path.join(output,'_redirects'),[...new Set(redirectRules)].join('\n')+'\n');
await writeFile(path.join(output,'_headers'),'/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n\n/wp-content/*\n  Cache-Control: public, max-age=86400\n\n/wp-includes/*\n  Cache-Control: public, max-age=86400\n');
const sitemap=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p=>`<url><loc>${production+p.route}</loc></url>`).join('')}</urlset>`;
await writeFile(path.join(output,'sitemap.xml'),sitemap);
await writeFile(path.join(output,'sitemap-index.xml'),`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${production}/sitemap.xml</loc></sitemap></sitemapindex>`);
await writeFile(path.join(output,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${production}/sitemap-index.xml\n`);
await writeFile(path.join(output,'llms.txt'),`# Danny McGiffin\n\n${manifest.siteDescription}\n\n${manifest.pages.map(p=>`- ${p.title}: ${production+p.route}\n  ${p.description}`).join('\n')}\n`);
const posts=manifest.pages.filter(p=>p.type==='post').sort((a,b)=>b.date.localeCompare(a.date));
await writeFile(path.join(output,'feed.xml'),`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Danny McGiffin writing</title><link>${production}/writing/</link><description>Essays on business, technology, and how work actually gets done.</description>${posts.map(p=>`<item><title>${esc(p.title)}</title><link>${production+p.route}</link><guid>${production+p.route}</guid><pubDate>${new Date(p.date+'T12:00:00Z').toUTCString()}</pubDate><description>${esc(p.description)}</description></item>`).join('')}</channel></rss>`);
await writeFile(path.join(output,'release.json'),JSON.stringify({site:'dmcg',source:'WordPress/Ollie',manifestSha256:createHash('sha256').update(manifestBytes).digest('hex'),exportedAt:new Date().toISOString(),routes:pages.map(p=>p.route)},null,2)+'\n');
await writeFile(path.join(here,'static-export-report.json'),JSON.stringify({pages,assets:[...fetched].sort(),publicOrigin:production,manifestSha256:createHash('sha256').update(manifestBytes).digest('hex')},null,2)+'\n');
console.log(`Exported ${pages.length} public pages and ${fetched.size} WordPress assets to ${output}.`);
