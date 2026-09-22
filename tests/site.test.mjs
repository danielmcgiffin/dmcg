import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';
import { parse } from 'parse5';
const dist=resolve('dist');
const origin='https://dannymcgiffin.com';
async function files(dir){const out=[];for(const f of await readdir(dir,{withFileTypes:true})){const path=join(dir,f.name);if(f.isDirectory())out.push(...await files(path));else out.push(path);}return out;}
const all=await files(dist);
function flatten(node){return [node,...(node.childNodes??[]).flatMap(flatten)];}
function attr(node,key){return node.attrs?.find(a=>a.name===key)?.value;}
function content(node){if(['style','script'].includes(node.tagName))return '';return node.nodeName==='#text'?node.value:(node.childNodes??[]).map(content).join('');}
const pages=await Promise.all(all.filter(f=>f.endsWith('.html')).map(async file=>{const html=await readFile(file,'utf8');const nodes=flatten(parse(html));return {file,html,nodes,route:'/'+relative(dist,file).replace(/index\.html$/,''),redirect:nodes.some(n=>n.tagName==='meta'&&attr(n,'http-equiv')==='refresh')};}));
const normal=pages.filter(p=>!p.redirect&&p.route!=='/404.html');
const attrs=(p,tag,key)=>p.nodes.filter(n=>n.tagName===tag).map(n=>attr(n,key));
const retired=['/workflow-review/','/ai-opportunity-sprint/','/score-one-workflow/'];
test('built pages have coherent metadata and entity graphs without retired positioning',()=>{
 const titles=new Set();
 for(const p of normal){
  const title=content(p.nodes.find(n=>n.tagName==='title'));assert.ok(title);assert.ok(!titles.has(title),`duplicate title ${title}`);titles.add(title);
  assert.equal(p.nodes.filter(n=>n.tagName==='h1').length,1,p.route);
  assert.equal(attr(p.nodes.find(n=>n.tagName==='html'),'lang'),'en');
  const meta=name=>attr(p.nodes.find(n=>n.tagName==='meta'&&(attr(n,'name')===name||attr(n,'property')===name)),'content');
  assert.ok(meta('description')?.length>25,p.route);assert.equal(meta('og:title'),title);assert.equal(meta('og:description'),meta('description'));
  assert.equal(attr(p.nodes.find(n=>n.tagName==='link'&&attr(n,'rel')==='canonical'),'href'),origin+p.route);
  assert.equal(meta('og:url'),origin+p.route);assert.equal(meta('og:image'),origin+'/og-systems-decision.png');
  const graph=p.nodes.filter(n=>n.tagName==='script'&&attr(n,'type')==='application/ld+json').flatMap(n=>{const data=JSON.parse((n.childNodes??[]).map(n=>n.value??'').join(''));assert.equal(data['@context'],'https://schema.org');return data['@graph']??[data];});
  const person=graph.find(n=>n['@type']==='Person');const service=graph.find(n=>n['@type']==='ProfessionalService');
  assert.equal(person.jobTitle,'Independent business advisor and designer');assert.equal(person['@id'],origin+'/#person');assert.equal(person.image,undefined);assert.equal(service.makesOffer,undefined);assert.equal(service.logo,origin+'/favicon.svg');assert.ok(person.knowsAbout.includes('Organizational design'));
  assert.doesNotMatch(p.html,/Workflow Teardown|Fixed-Price Workflow Build|workflow automation and AI consultant|Operations engineer|\$5,000/);
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
 for(const route of retired){assert.ok(rules.includes(`${route} /still-on-tools/ 301`));assert.ok(rules.includes(`${route.slice(0,-1)} /still-on-tools/ 301`));assert.ok(!sitemap.includes(origin+route));const p=pages.find(p=>p.route===route);assert.ok(p?.redirect,route);assert.match(p.html,/\/still-on-tools\//);for(const page of normal)assert.ok(!attrs(page,'a','href').includes(route));}
 assert.ok(!sitemap.includes('404'));for(const p of normal)assert.ok(sitemap.includes(origin+p.route),p.route);
});
test('homepage provides consulting navigation, expandable evidence, and independent engagement modes',()=>{
 const home=normal.find(p=>p.route==='/');const headings=home.nodes.filter(n=>n.tagName==='h2').map(n=>attr(n,'id'));
 assert.deepEqual(headings,['triggers-title','decision-title','engagement-title','expertise-title','work-title','about-title','conversation-title']);
 assert.equal(home.nodes.filter(n=>n.tagName==='details'&&n.childNodes.some(c=>c.tagName==='summary')).length,5);
 assert.ok(attrs(home,'img','src').includes('/danny-mcgiffin.jpg'));
 for(const name of ['Advisory','Design','Build'])assert.ok(home.nodes.some(n=>n.tagName==='h3'&&content(n).startsWith(name)));
 assert.match(content(parse(home.html)),/A clear decision not to buy or build anything can be the whole result/);
 for(const href of ['/about/','/writing/','/contact/'])assert.ok(attrs(home,'a','href').includes(href));
});
test('case claims retain role and measurement boundaries',()=>{
 const about=normal.find(p=>p.route==='/about/');const text=content(parse(about.html));
 for(const fragment of ['erp','collaboration','growth','navy'])assert.ok(about.nodes.some(n=>attr(n,'id')===fragment));
 assert.match(text,/design estimates, not measured implementation results/);assert.match(text,/recognized revenue/);assert.match(text,/program-level results from a collaborative effort/);assert.match(text,/not a claim of \$250 million in recovered cash/);
 assert.doesNotMatch(text,/70%|50% faster|60%|Roger Porres|\$64M/);
});
test('RSS, llms, and the custom 404 remain usable',async()=>{
 const rss=await readFile(join(dist,'rss.xml'),'utf8');assert.equal((rss.match(/<item>/g)||[]).length,4);
 const llms=await readFile(join(dist,'llms.txt'),'utf8');assert.match(llms,/independent business advisor and designer/);assert.doesNotMatch(llms,/Workflow Teardown|AI Opportunity Sprint/);
 const missing=pages.find(p=>p.route==='/404.html');assert.ok(missing);assert.ok(missing.nodes.some(n=>attr(n,'name')==='robots'&&attr(n,'content')==='noindex'));
});
