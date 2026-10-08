import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';
import { parse } from 'parse5';
const dist=resolve('dist');
const origin='https://dannymcgiffin.com';
async function files(dir){const out=[];for(const f of await readdir(dir,{withFileTypes:true})){const path=join(dir,f.name);if(f.isDirectory())out.push(...await files(path));else out.push(path);}return out;}
const all=await files(dist);
const substackPosts=JSON.parse(await readFile(resolve('src/data/substack-posts.json'),'utf8'));
function flatten(node){return [node,...(node.childNodes??[]).flatMap(flatten)];}
function attr(node,key){return node.attrs?.find(a=>a.name===key)?.value;}
function content(node){if(['style','script'].includes(node.tagName))return '';return node.nodeName==='#text'?node.value:(node.childNodes??[]).map(content).join('');}
const pages=await Promise.all(all.filter(f=>f.endsWith('.html')).map(async file=>{const html=await readFile(file,'utf8');const nodes=flatten(parse(html));return {file,html,nodes,route:'/'+relative(dist,file).replace(/index\.html$/,''),redirect:nodes.some(n=>n.tagName==='meta'&&attr(n,'http-equiv')==='refresh')};}));
const normal=pages.filter(p=>!p.redirect&&p.route!=='/404.html');
const attrs=(p,tag,key)=>p.nodes.filter(n=>n.tagName===tag).map(n=>attr(n,key));
const retired={'/workflow-review/':'/still-on-tools/','/ai-opportunity-sprint/':'/still-on-tools/','/score-one-workflow/':'/still-on-tools/','/advisory/':'/offers/second-opinion/','/ai/':'/offers/ai-opportunity/','/work/erp-second-opinion/':'/work/erp-decision/','/case-studies/':'/work/','/case-studies/erp-second-opinion/':'/work/erp-decision/','/case-studies/operating-model/':'/work/operating-model/','/case-studies/growth/':'/work/growth/','/case-studies/navy-improper-payments/':'/work/navy-improper-payments/','/tech-audit/':'/offers/tech-audit/','/second-opinion/':'/offers/second-opinion/','/ai-opportunity/':'/offers/ai-opportunity/','/data-connection/':'/offers/data-connection/'};
const offerRoutes=['/offers/tech-audit/','/offers/second-opinion/','/offers/ai-opportunity/','/offers/data-connection/'];
const caseRoutes=['/work/erp-decision/','/work/operating-model/','/work/growth/','/work/navy-improper-payments/'];
const selectedRoutes=['/work/erp-decision/','/work/64m-deployment/','/work/negotiation-policy/'];
const CTA='Schedule Our First Chat';
test('built pages have coherent metadata and entity graphs without retired positioning',async()=>{
 const titles=new Set();
 for(const p of normal){
  const title=content(p.nodes.find(n=>n.tagName==='title'));assert.ok(title);assert.ok(!titles.has(title),`duplicate title ${title}`);titles.add(title);
  if(p.route==='/')assert.equal(title,'Danny McGiffin | Business & Technology Advisor');else assert.match(title,/^.+ \| Danny McGiffin$/,p.route);
  assert.equal(p.nodes.filter(n=>n.tagName==='h1').length,1,p.route);
  assert.equal(attr(p.nodes.find(n=>n.tagName==='html'),'lang'),'en');
  const meta=name=>attr(p.nodes.find(n=>n.tagName==='meta'&&(attr(n,'name')===name||attr(n,'property')===name)),'content');
  assert.ok(meta('description')?.length>25,p.route);assert.equal(meta('og:title'),title);assert.equal(meta('og:description'),meta('description'));
  assert.equal(attr(p.nodes.find(n=>n.tagName==='link'&&attr(n,'rel')==='canonical'),'href'),origin+p.route);
  assert.equal(meta('og:url'),origin+p.route);const image=meta('og:image');assert.ok(image?.startsWith(origin+'/og/'),p.route);await assert.doesNotReject(access(join(dist,new URL(image).pathname)),image);
  const graph=p.nodes.filter(n=>n.tagName==='script'&&attr(n,'type')==='application/ld+json').flatMap(n=>{const data=JSON.parse((n.childNodes??[]).map(n=>n.value??'').join(''));assert.equal(data['@context'],'https://schema.org');return data['@graph']??[data];});
  const person=graph.find(n=>n['@type']==='Person');const service=graph.find(n=>n['@type']==='ProfessionalService');
  assert.equal(person.jobTitle,'Business & Technology Advisor');assert.equal(person['@id'],origin+'/#person');assert.equal(person.image,undefined);assert.equal(service.makesOffer,undefined);assert.equal(service.logo,origin+'/favicon.svg');assert.ok(person.knowsAbout.includes('Organizational design'));
  assert.doesNotMatch(p.html,/Workflow Teardown|Fixed-Price Workflow Build|workflow automation and AI consultant|Operations engineer|Business Advisor &amp; Designer|Get a second opinion|See if it’s a fit|\$7,500 fixed fee|~\$500k|~5%|redress/i);
 }
});
test('all generated local links, assets, and fragments resolve',async()=>{
 for(const p of normal){for(const node of p.nodes){for(const key of ['href','src']){const value=attr(node,key);if(!value||value.startsWith('data:')||value.startsWith('mailto:'))continue;const url=new URL(value,origin+p.route);if(url.origin!==origin)continue;
  const path=decodeURIComponent(url.pathname);const target=join(dist,path.endsWith('/')?path+'index.html':path);await assert.doesNotReject(access(target),`${p.route}: ${value}`);
  if(url.hash){const page=pages.find(p=>p.file===target);assert.ok(page,`fragment target page ${value}`);assert.ok(page.nodes.some(n=>attr(n,'id')===decodeURIComponent(url.hash.slice(1))),`${p.route}: missing fragment ${value}`);}
 }}}
});
test('retired routes redirect directly and are excluded from the sitemap and navigation',async()=>{
 const rules=await readFile(join(dist,'_redirects'),'utf8');const sitemap=await readFile(join(dist,'sitemap-0.xml'),'utf8');
 for(const [route,target] of Object.entries(retired)){assert.ok(rules.includes(`${route} ${target} 301`),route);assert.ok(rules.includes(`${route.slice(0,-1)} ${target} 301`),route);assert.ok(!sitemap.includes(origin+route));const p=pages.find(p=>p.route===route);assert.ok(p?.redirect,route);assert.ok(p.html.includes(target),route);for(const page of normal)assert.ok(!attrs(page,'a','href').includes(route),`${page.route} links ${route}`);}
 assert.ok(!sitemap.includes('404'));for(const p of normal)assert.ok(sitemap.includes(origin+p.route),p.route);
});

test('homepage introduces Danny and links to completed work and contact',()=>{
 const home=normal.find(p=>p.route==='/');const text=content(parse(home.html));const hrefs=attrs(home,'a','href');
 assert.deepEqual(home.nodes.filter(n=>n.tagName==='h2').map(n=>attr(n,'id')),['work-title','conversation-title']);
 assert.equal(content(home.nodes.find(n=>n.tagName==='h1')).trim(),'Danny McGiffin');
 assert.ok(attrs(home,'img','src').includes('/headshot.jpg'));
 const cards=home.nodes.filter(n=>n.tagName==='a'&&attr(n,'class')==='consulting-service');
 assert.deepEqual(cards.map(n=>attr(n,'href')),selectedRoutes);
 assert.equal((text.match(/Danny asks thought-provoking, challenging questions/g)||[]).length,1);
 for(const href of ['/work/','/writing/','/contact/'])assert.ok(hrefs.includes(href),href);
 assert.ok(hrefs.includes('https://cal.com/dannymcgiffin/30min?src=closing'));
 for(const route of offerRoutes)assert.ok(!hrefs.includes(route),`homepage links offer ${route}`);
 assert.doesNotMatch(text,/How we can work together|When you hear yourself saying/);
});
test('navigation lists Work, Writing, About, Contact, Elsewhere; the name links home',()=>{
 for(const p of normal){
  const nav=p.nodes.find(n=>n.tagName==='nav'&&attr(n,'aria-label')==='Primary navigation');assert.ok(nav,p.route);
  const labels=flatten(nav).filter(n=>n.tagName==='a').map(n=>content(n).replace(/\s*↗$/,'').trim());
  assert.deepEqual(labels,['Work','Writing','About','Contact','Elsewhere'],p.route);
  for(const route of offerRoutes)assert.ok(!flatten(nav).some(n=>attr(n,'href')===route),`${p.route} nav links ${route}`);
  const identity=p.nodes.find(n=>['advisor-identity','site-identity'].includes(attr(n,'class')));
  assert.deepEqual(identity.childNodes.map(n=>content(n).trim()).filter(Boolean),['DANNY McGIFFIN','Business & Technology Advisor']);
  assert.deepEqual(flatten(identity).filter(n=>n.tagName==='a').map(n=>attr(n,'href')),['/'],'name links home');
 }
});
test('every booking link uses the one call to action and keeps its source tag',()=>{
 for(const p of normal){for(const node of p.nodes.filter(n=>n.tagName==='a'&&attr(n,'href')?.startsWith('https://cal.com/'))){
  assert.match(attr(node,'href'),/^https:\/\/cal\.com\/dannymcgiffin\/30min\?src=[\w-]+$/,p.route);
  if(p.route!=='/still-on-tools/')assert.ok(content(node).includes(CTA),`${p.route}: ${content(node)}`);
 }}
});
test('offer pages share one skeleton with price, timing, fit, and FAQ',()=>{
 const expected={'/offers/tech-audit/':['$5,000 fixed fee','10 business days'],'/offers/second-opinion/':['From $2,500, fixed quote','5 business days'],'/offers/ai-opportunity/':['$5,000 fixed fee','10 business days'],'/offers/data-connection/':['From $7,500, fixed quote','Typically 3–6 weeks']};
 for(const [route,[price,time]] of Object.entries(expected)){
  const p=normal.find(p=>p.route===route);assert.ok(p,route);const text=content(parse(p.html));
  assert.ok(text.includes(price),route);assert.ok(text.includes(time),route);assert.match(text,/What you get/);assert.match(text,/The details/);assert.match(text,/When this is a good fit/);
  assert.ok(attrs(p,'a','href').some(href=>href?.startsWith('https://cal.com/')),route);
 }
 const second=content(parse(normal.find(p=>p.route==='/offers/second-opinion/').html));
 assert.match(second,/proceed, proceed with changes, or stop/);assert.match(second,/no vendor commissions, referral fees, or resale margins/);assert.match(second,/no vendor compensation or affiliations/);
 const data=content(parse(normal.find(p=>p.route==='/offers/data-connection/').html));assert.match(data,/without buying a new system/);assert.match(data,/QuickBooks/);assert.match(data,/governed data layer/);
});
test('visible copy uses curly apostrophes',()=>{
 for(const p of normal)assert.doesNotMatch(content(parse(p.html)),/[A-Za-z]'[A-Za-z]/,p.route);
});

test('contact and elsewhere have distinct jobs and a working email destination',()=>{
 const contact=normal.find(p=>p.route==='/contact/');
 const elsewhere=normal.find(p=>p.route==='/elsewhere/');
 assert.ok(contact && elsewhere);
 const email='mailto:danny@dannymcgiffin.com';
 assert.ok(attrs(contact,'a','href').some(href=>href?.startsWith(email)));
 assert.ok(attrs(elsewhere,'a','href').includes(email));
 for(const p of normal) {
  if(['/','/about/'].includes(p.route)) continue;
  assert.ok(attrs(p,'a','href').includes('/elsewhere/'),p.route);
 }
});
test('production pages include the configured GA4 loader',()=>{
 for(const p of normal){
  const loaders=p.nodes.filter(n=>n.tagName==='script'&&attr(n,'src')?.startsWith('https://www.googletagmanager.com/gtag/js'));
  assert.equal(loaders.length,1,p.route);
  assert.equal(attr(loaders[0],'src'),'https://www.googletagmanager.com/gtag/js?id=G-ZYTMP3PS7G');
  assert.match(p.html,/window\.gtag\s*=\s*function gtag\(\)/);
 }
});
test('case claims retain role and measurement boundaries',()=>{
 const index=normal.find(p=>p.route==='/work/');for(const route of caseRoutes)assert.ok(attrs(index,'a','href').includes(route),route);
 const caseText=route=>content(parse(normal.find(p=>p.route===route).html));
 for(const route of caseRoutes){const text=caseText(route);for(const heading of ['The situation','The problem','What I found','The decision','The result'])assert.ok(text.includes(heading),`${route}: ${heading}`);}
 const erpText=caseText('/work/erp-decision/');
 assert.match(erpText,/CEO canceled the implementation/);assert.match(erpText,/full implementation estimated at about \$50K/);assert.match(erpText,/five-year license had already been contracted/);
 assert.doesNotMatch(erpText,/saved.*\$|realized savings(?!\.)/);assert.match(erpText,/not a claim of realized savings/);
 for(const figure of ['$1.25M','$600K','$1.2M','$2.45M','$350K','$50K'])assert.ok(erpText.includes(figure),figure);
 assert.match(caseText('/work/operating-model/'),/executive team approved the model/);assert.doesNotMatch(caseText('/work/operating-model/'),/behavior changed because/);
 const growth=caseText('/work/growth/');assert.match(growth,/recognized revenue/);
 const navy=caseText('/work/navy-improper-payments/');assert.match(navy,/internal program reporting/);assert.match(navy,/not recovered cash/);assert.match(navy,/From 2015 to 2019/);assert.match(navy,/roughly \$250 million less in estimated improper payments/);assert.match(navy,/error rates fell by about 45%/);
 const all=normal.map(p=>p.html).join('');
 assert.doesNotMatch(all,/roughly \$2\.5M ERP implementation|roughly \$1\.5M ERP license|came in +at/);
 assert.doesNotMatch(all,/more than \$1M in additional customization|more than \$1 million in additional customization/);
 assert.doesNotMatch(content(parse(normal.find(p=>p.route==='/about/').html)),/70%|50% faster|60%|Roger Porres|\$64M/);
});

test('advisory and writing journeys expose next steps and source evidence',()=>{
 const advisory=normal.find(p=>p.route==='/offers/second-opinion/');const writing=normal.find(p=>p.route==='/writing/');const research=normal.find(p=>p.route==='/still-on-tools/');
 assert.ok(advisory && writing && research);
 assert.match(content(parse(advisory.html)),/free 30-minute (introduction|conversation)/);
 assert.match(content(parse(advisory.html)),/no vendor compensation or affiliations/);
 const writingLinks=attrs(writing,'a','href');
 assert.ok(writingLinks.some(href=>href?.startsWith('https://dannymcgiffin.substack.com/subscribe')));
 assert.deepEqual(writingLinks.filter(href=>href?.startsWith('https://dannymcgiffin.substack.com/p/')),substackPosts.map(post=>post.href));
 assert.ok(!writingLinks.includes('/still-on-tools/'));
 assert.ok(!writingLinks.some(href=>href?.startsWith('/writing/')&&href!=='/writing/'));
 for(const p of normal.filter(p=>p.route.startsWith('/writing/')&&p.route!=='/writing/')){
  assert.ok(p.nodes.some(n=>n.tagName==='aside'&&attr(n,'class')?.includes('article-next-step')),p.route);
  assert.ok(attrs(p,'a','href').includes('/about/'),p.route);
  assert.ok(attrs(p,'a','href').some(href=>href?.startsWith('https://dannymcgiffin.substack.com/subscribe')),p.route);
 }
 for(const host of ['kaufman','rsmus','mckinsey','deloitte'])assert.ok(attrs(research,'a','href').some(href=>href?.includes(host)),host);
});
test('RSS, llms, and the custom 404 remain usable',async()=>{
 const rss=await readFile(join(dist,'rss.xml'),'utf8');assert.equal((rss.match(/<item>/g)||[]).length,4);
 const llms=await readFile(join(dist,'llms.txt'),'utf8');assert.match(llms,/independent business & technology advisor/);for(const route of offerRoutes)assert.ok(llms.includes(origin+route),route);assert.doesNotMatch(llms,/Workflow Teardown|AI Opportunity Sprint/);
 const missing=pages.find(p=>p.route==='/404.html');assert.ok(missing);assert.ok(missing.nodes.some(n=>attr(n,'name')==='robots'&&attr(n,'content')==='noindex'));
});

test('AI assessment is discoverable, priced, and separates illustrative economics from proof',()=>{
 const ai=normal.find(p=>p.route==='/offers/ai-opportunity/');assert.ok(ai);
 const contactPage=normal.find(p=>p.route==='/contact/');assert.ok(attrs(contactPage,'a','href').includes('/offers/ai-opportunity/'));
 const text=content(parse(ai.html));
 assert.match(text,/\$5,000 fixed fee/);assert.equal((text.match(/Danny asks thought-provoking, challenging questions/g)||[]).length,0);assert.match(text,/10 business days/);
 assert.match(text,/Fictional business\. Assumed figures/);
 assert.match(text,/Labor cost is not recoverable savings/);
 assert.match(text,/Worth the fee, or your money back/);
 assert.match(text,/within seven calendar days of the review/);
 assert.match(text,/refund the full fee/);
 const samples=ai.nodes.filter(n=>n.tagName==='details'&&attr(n,'name')==='sample-opportunity');
 assert.equal(samples.length,3);assert.equal(samples.filter(n=>attr(n,'open')!==undefined).length,1);
 for(const label of ['Test now','Investigate','Don’t bother'])assert.ok(samples.some(n=>content(n).includes(label)));
 assert.ok(attrs(ai,'a','href').includes('https://cal.com/dannymcgiffin/30min?src=ai-opportunity-hero'));
 assert.ok(attrs(ai,'a','href').includes('/work/erp-decision/'));
});

// Publishing unfinished copy and accidentally reintroducing a second shell are real regressions.
test('every page has one shared shell and no unfinished copy', () => {
 for (const page of normal) {
  assert.doesNotMatch(content(parse(page.html)), /\[TODO:|\bTBD\b|Lorem ipsum/i, page.route);
  assert.equal(page.nodes.filter(n => n.tagName === 'main').length, 1, page.route);
  assert.equal(page.nodes.filter(n => n.tagName === 'header' && attr(n, 'class') === 'site-header').length, 1, page.route);
  assert.equal(page.nodes.filter(n => n.tagName === 'footer').length, 1, page.route);
 }
});
test('Ed’s approved testimonial is attributed and precedes selected work', () => {
 const home = normal.find(p => p.route === '/');
 const text = content(parse(home.html));
 assert.match(text, /Ed Burns/);
 assert.match(text, /CEO at Burns Logistics/);
 assert.ok(text.indexOf('Danny asks thought-provoking') < text.indexOf('Selected work'));
 for (const route of selectedRoutes) {
  const page = normal.find(p => p.route === route);
  assert.ok(page, route);
  assert.ok(content(parse(page.html)).length > 300, route);
 }
});
