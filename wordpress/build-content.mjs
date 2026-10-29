import { readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parse } from '../node_modules/parse5/dist/index.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const attr = (n, key) => n.attrs?.find(a => a.name === key)?.value || '';
const classes = n => attr(n, 'class').split(/\s+/);
const has = (n, c) => classes(n).includes(c);
const children = n => (n.childNodes || []).filter(c => c.tagName);
const text = n => n.nodeName === '#text' ? n.value : (n.childNodes || []).map(text).join('');
const find = (n, test) => !n ? undefined : test(n) ? n : (n.childNodes || []).map(c => find(c, test)).find(Boolean);
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const block = (name, attrs, html) => `<!-- wp:${name}${Object.keys(attrs).length ? ' ' + JSON.stringify(attrs) : ''} -->\n${html}\n<!-- /wp:${name} -->\n`;
const dynamic = (name, attrs = {}) => `<!-- wp:${name} ${JSON.stringify(attrs)} /-->\n`;
const group = (body, className = '', attrs = {}) => block('group', { ...(className ? {className} : {}), layout: {type: 'constrained'}, ...attrs }, `<div${attrs.anchor ? ` id="${esc(attrs.anchor)}"` : ''} class="wp-block-group${attrs.align ? ' align' + attrs.align : ''}${className ? ' ' + className : ''}">${body}</div>`);
const paragraph = body => block('paragraph', {}, `<p>${body}</p>`);
const heading = (body, level = 2, anchor = '') => block('heading', { ...(level !== 2 ? {level} : {}), ...(anchor ? {anchor} : {}) }, `<h${level} class="wp-block-heading"${anchor ? ` id="${esc(anchor)}"` : ''}>${body}</h${level}>`);
const columns = (bodies, widths = []) => block('columns', {}, `<div class="wp-block-columns">${bodies.map((body, i) => block('column', widths[i] ? {width: widths[i]} : {}, `<div class="wp-block-column"${widths[i] ? ` style="flex-basis:${widths[i]}"` : ''}>${body}</div>`)).join('')}</div>`);
const button = (href, label, secondary = false) => block('button', secondary ? {className: 'is-style-outline'} : {}, `<div class="wp-block-button${secondary ? ' is-style-outline' : ''}"><a class="wp-block-button__link wp-element-button" href="${esc(href)}">${label}</a></div>`);
const buttons = body => block('buttons', {}, `<div class="wp-block-buttons">${body}</div>`);

const assets = new Set();
function url(value) {
  if (value.startsWith('https://dannymcgiffin.com/')) value = value.slice('https://dannymcgiffin.com'.length);
  if (value.startsWith('/') && /\.(jpg|png|svg|webp|pdf)(\?|$)/i.test(value)) {
    assets.add(value.split('?')[0]);
    return `/wp-content/uploads/dmcg${value}`;
  }
  return value;
}
function inline(n) {
  if (n.nodeName === '#text') return esc(n.value);
  if (!n.tagName || ['script', 'style'].includes(n.tagName) || has(n, 'sr-only')) return '';
  const body = (n.childNodes || []).map(inline).join('');
  if (n.tagName === 'br') return '<br>';
  if (n.tagName === 'a') return `<a href="${esc(url(attr(n,'href')))}"${attr(n,'target') ? ` target="${esc(attr(n,'target'))}" rel="noopener noreferrer"` : ''}>${body}</a>`;
  if (['strong','em','code','sup','sub','s'].includes(n.tagName)) return `<${n.tagName}>${body}</${n.tagName}>`;
  // Old layout depended on CSS to separate adjacent text spans.
  if (['span','small','time'].includes(n.tagName)) return ` ${body} `;
  return body;
}
const inlines = n => (n.childNodes || []).map(inline).join('').trim();
const convertChildren = n => (n.childNodes || []).map(convert).join('');
function convert(n) {
  const tag = n.tagName;
  if (!tag || ['script','style','summary'].includes(tag) || has(n,'sr-only')) return '';
  if (/^h[1-6]$/.test(tag)) return heading(inlines(n), Number(tag[1]), attr(n,'id'));
  if (tag === 'p') return paragraph(inlines(n));
  if (tag === 'img') return block('image', {sizeSlug:'full',linkDestination:'none'}, `<figure class="wp-block-image size-full"><img src="${esc(url(attr(n,'src')))}" alt="${esc(attr(n,'alt'))}"/></figure>`);
  if (tag === 'figure' && find(n, x => x.tagName === 'blockquote')) {
    const quote = find(n, x => x.tagName === 'blockquote');
    const caption = children(n).find(x=>x.tagName==='figcaption');
    return block('quote', {}, `<blockquote class="wp-block-quote">${convertChildren(quote)}${caption ? `<cite>${inlines(caption)}</cite>` : ''}</blockquote>`);
  }
  if (tag === 'blockquote') return block('quote', {}, `<blockquote class="wp-block-quote">${convertChildren(n)}</blockquote>`);
  if (tag === 'ul' || tag === 'ol') return block('list', tag==='ol' ? {ordered:true} : {}, `<${tag} class="wp-block-list">${children(n).map(li=>block('list-item',attr(li,'id')?{anchor:attr(li,'id')}:{},`<li${attr(li,'id')?` id="${esc(attr(li,'id'))}"`:''}>${(li.childNodes||[]).map(c=>['ul','ol'].includes(c.tagName)?convert(c):inline(c)).join('')}</li>`)).join('')}</${tag}>`);
  if (tag === 'details') {
    const summary = children(n).find(c=>c.tagName==='summary');
    return block('details', {...(attr(n,'id')?{anchor:attr(n,'id')}:{})}, `<details class="wp-block-details"${attr(n,'id')?` id="${esc(attr(n,'id'))}"`:''}><summary>${summary?inlines(summary):''}</summary>${convertChildren(n)}</details>`);
  }
  if (tag === 'dl') return group(children(n).map(item => group(children(item).map(c=>c.tagName==='dt'?heading(inlines(c),3):paragraph(inlines(c))).join(''),'dmcg-deliverable')).join(''),'dmcg-deliverables');
  if (tag === 'a') {
    const h = children(n).find(c=>/^h[1-6]$/.test(c.tagName));
    if (h) return group(children(n).map(c=>c===h?heading(`<a href="${esc(url(attr(n,'href')))}">${inlines(h)}</a>`,Number(h.tagName[1])):c.tagName==='span'?paragraph(`<a href="${esc(url(attr(n,'href')))}">${inlines(c)}</a>`):convert(c)).join(''),'dmcg-card');
    if (classes(n).some(c=>c.includes('button'))) return buttons(button(url(attr(n,'href')),inlines(n),classes(n).some(c=>c.includes('secondary'))));
    return paragraph(inline(n));
  }
  if (has(n,'consulting-actions') || has(n,'direct-contact-actions')) return buttons(children(n).filter(c=>c.tagName==='a').map((c,i)=>button(url(attr(c,'href')),inlines(c),i>0)).join(''));
  if (has(n,'consulting-intro')) return group(columns(children(n).map(convert),['66.66%','33.33%']),'dmcg-hero', {align:'wide'});
  if (has(n,'about-person')) return columns([...children(n)].reverse().map(convert),['66.66%','33.33%']);
  if (has(n,'writing-intro')) return group(columns(children(n).map(convert),['66.66%','33.33%']),'dmcg-hero',{align:'wide'});
  if (has(n,'consulting-testimonials')) return group(columns(children(n).map(convert)),'dmcg-testimonials',{align:'wide'});
  if (has(n,'consulting-services') || has(n,'case-index')) return group(convertChildren(n),'dmcg-card-grid',{align:'wide'});
  if (has(n,'contact-hub-links')) return group(children(n).map(c=>paragraph(`<a href="${esc(url(attr(c,'href')))}">${inlines(c)}</a>`)).join(''),'dmcg-links');
  if (has(n,'contact-hub-portrait')) return convertChildren(n);
  if (['small','time'].includes(tag)) return paragraph(inlines(n));
  if (['section','header','aside'].includes(tag)) return group(convertChildren(n),has(n,'consulting-close') || has(n,'conversation') || has(n,'about-contact') ? 'dmcg-section dmcg-closing' : 'dmcg-section', {...(has(n,'selected-work')?{align:'wide'}:{}),...(attr(n,'id')?{anchor:attr(n,'id')}:{})});
  if (['div','article','main','nav'].includes(tag)) return convertChildren(n);
  if (tag === 'figure') return convertChildren(n);
  if (tag === 'hr') return block('separator',{},'<hr class="wp-block-separator has-alpha-channel-opacity"/>');
  throw new Error(`Unmapped content element: ${tag}`);
}

async function htmlFiles(dir) {
  const entries = await readdir(dir,{withFileTypes:true});
  return (await Promise.all(entries.map(e=>e.isDirectory()?htmlFiles(path.join(dir,e.name)):e.name==='index.html'?[path.join(dir,e.name)]:[]))).flat();
}
const pages=[], redirects=[];
for (const file of await htmlFiles(path.join(root,'dist'))) {
  const route='/' + path.relative(path.join(root,'dist'),file).replace(/index\.html$/,'');
  if (route.startsWith('/404/')) continue;
  const doc=parse(await readFile(file,'utf8'));
  const main=find(doc,n=>n.tagName==='main');
  if(!main) {
    const refresh=find(doc,n=>n.tagName==='meta' && attr(n,'http-equiv').toLowerCase()==='refresh');
    const target=attr(refresh,'content').match(/url=(.+)$/i)?.[1];
    if(target) redirects.push({from:route,to:target});
    continue;
  }
  const h1=find(main,n=>n.tagName==='h1');
  const description=attr(find(doc,n=>n.tagName==='meta' && attr(n,'name')==='description'),'content');
  const title=route==='/'?'Home':({'/work/':'Work','/writing/':'Writing','/about/':'About','/contact/':'Contact','/elsewhere/':'Elsewhere'}[route]||text(h1).trim());
  const content=convertChildren(main);
  const normalized=s=>s.replace(/\s+/g,' ').trim();
  const targetText=normalized(text(parse(content)));
  function verify(n) {
    if(['p','h1','h2','h3','dt','dd','summary','figcaption'].includes(n.tagName) && !has(n,'sr-only')) {
      // Spans used to be separated visually by layout CSS; normalize their boundaries.
      const sourceText=normalized(text(parse(inlines(n))));
      if(sourceText && !targetText.includes(sourceText)) throw new Error(`Missing copy at ${route}: ${sourceText.slice(0,120)}`);
    }
    for(const child of n.childNodes||[]) verify(child);
  }
  verify(main);
  const article=route.match(/^\/writing\/([^/]+)\/$/);
  let articleFields={};
  if(article) {
    const source=await readFile(path.join(root,'src/content/writing',`${article[1]}.mdx`),'utf8');
    const front=source.split('---')[1];
    const date=front.match(/^publishedAt:\s*(\d{4}-\d{2}-\d{2})/m)?.[1];
    const tags=[...front.matchAll(/^\s+-\s+(.+)$/gm)].map(m=>m[1].trim());
    articleFields={type:'post',date,tags};
  }
  pages.push({route,title,description,content,type:'page',...articleFields});
}
const writing=pages.find(p=>p.route==='/writing/');
const localEssays=pages.filter(p=>p.type==='post').sort((a,b)=>b.date.localeCompare(a.date));
// Expose the existing local essays alongside the preserved Substack links.
const essays=heading('Essays',2)+group(localEssays.map(p=>group(heading(`<a href="${esc(p.route)}">${esc(p.title)}</a>`,3)+paragraph(esc(p.description))+paragraph(esc(new Date(`${p.date}T00:00:00Z`).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}))),'dmcg-card')).join(''),'dmcg-card-grid',{align:'wide'});
// The hero contains nested groups: locate its final image/columns/group closure.
const split=writing.content.indexOf('<!-- /wp:columns -->');
const boundary=writing.content.indexOf('<!-- /wp:group -->',split)+'<!-- /wp:group -->'.length;
if(split<0 || boundary<0) throw new Error('Writing hero boundary not found');
writing.content=writing.content.slice(0,boundary)+essays+heading('Latest on Substack',2)+writing.content.slice(boundary);
// A real parent page keeps every existing /offers/<slug>/ URL intact.
{
  const doc=parse(await readFile(path.join(root,'dist/contact/index.html'),'utf8'));
  const list=find(doc,n=>has(n,'contact-offers'));
  pages.push({route:'/offers/',title:'Focused engagements',description:'A few ways to start working together.',content:heading('Focused engagements',1)+paragraph('These are a few ways to start. We can also discuss work that doesn’t fit one of these engagements.')+convert(list)});
}
const nav=[['Work','/work/'],['Writing','/writing/'],['About','/about/'],['Contact','/contact/']];
const navBlocks=nav.map(([label,href])=>dynamic('navigation-link',{label,url:href,kind:'custom'})).join('');
const navigation=block('navigation',{overlayMenu:'mobile',icon:'menu',layout:{type:'flex',justifyContent:'right'}},navBlocks);
const header=group(group(dynamic('site-title',{level:0})+navigation,'',{align:'wide',layout:{type:'flex',justifyContent:'space-between',flexWrap:'wrap'}}));
const footer=group(columns([
  dynamic('site-title',{level:0})+paragraph('Business &amp; Technology Advisor')+paragraph('Based outside Washington, DC, and working with businesses across the DC area.'),
  heading('Get in touch',3)+paragraph('<a href="mailto:danny@dannymcgiffin.com">danny@dannymcgiffin.com</a>')+paragraph('<a href="/elsewhere/">Elsewhere ↗</a>')+paragraph('<a href="/writing/">Built that Way — writing on business and technology</a>')
])+paragraph('© 2026 Danny McGiffin'),'dmcg-footer',{align:'wide'});
const template=dynamic('template-part',{slug:'header',tagName:'header',className:'site-header'})+block('group',{tagName:'main',layout:{type:'default'},className:'dmcg-main'},`<main class="wp-block-group dmcg-main">${dynamic('post-content',{align:'full',layout:{type:'constrained'}})}</main>`)+dynamic('template-part',{slug:'footer',tagName:'footer',className:'site-footer'});
const globalStyles={version:3,settings:{layout:{contentSize:'760px',wideSize:'1160px'},color:{palette:[
  {slug:'primary',name:'Forest',color:'#244b3a'},{slug:'primary-accent',name:'Forest tint',color:'#e4e9e2'},{slug:'primary-alt',name:'Sage',color:'#a9b9a6'},{slug:'primary-alt-accent',name:'Dark forest',color:'#183326'},
  {slug:'main',name:'Ink',color:'#17261c'},{slug:'main-accent',name:'Muted ink',color:'#4d5a50'},{slug:'base',name:'Bone',color:'#faf8f2'},{slug:'secondary',name:'Muted',color:'#4d5a50'},{slug:'tertiary',name:'Soft bone',color:'#f0eee6'},{slug:'border-light',name:'Light border',color:'#dadfd5'},{slug:'border-dark',name:'Dark border',color:'#354c3d'}]}},styles:{color:{background:'var:preset|color|base',text:'var:preset|color|main'},css:`.dmcg-main{padding:clamp(2rem,5vw,5rem) 1.5rem}.dmcg-section{margin-block:3rem}.dmcg-hero{margin-bottom:3.5rem}.dmcg-hero img{border-radius:1rem;max-width:340px}.dmcg-card-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.5rem}.dmcg-card{padding:1.75rem;border:1px solid var(--wp--preset--color--border-light);border-radius:.75rem;margin:0!important;background:var(--wp--preset--color--base)}.dmcg-card h2,.dmcg-card h3{font-size:1.55rem}.dmcg-closing{padding:2rem;background:var(--wp--preset--color--tertiary);border-radius:.75rem}.dmcg-testimonials{padding-block:1rem}.dmcg-testimonials blockquote{font-size:1.1rem;margin:0;padding:1rem 1.5rem}.dmcg-testimonials cite{display:block;font-size:.9rem;margin-top:1rem}.dmcg-footer{padding:3rem 1.5rem;border-top:1px solid var(--wp--preset--color--border-light)}.site-header{padding:1.25rem 1.5rem;border-bottom:1px solid var(--wp--preset--color--border-light)}.site-header .wp-block-site-title{font-size:1.25rem}.dmcg-deliverable{padding-block:1rem;border-bottom:1px solid var(--wp--preset--color--border-light)}.wp-block-details{padding:1.25rem 0;border-bottom:1px solid var(--wp--preset--color--border-light)}.wp-block-details summary{font-weight:600;cursor:pointer}.wp-block-details[open]>summary{margin-bottom:1rem}.wp-block-image img{height:auto}.wp-block-heading{overflow-wrap:break-word}@media(max-width:781px){.dmcg-card-grid{grid-template-columns:1fr}.dmcg-main{padding-inline:1.25rem}.dmcg-closing{padding:1.5rem}.dmcg-hero img{max-width:240px}.site-header .wp-block-site-title{font-size:1.1rem}}`}};
await writeFile(path.join(root,'wordpress/content.json'),JSON.stringify({pages,redirects,assets:[...assets],header,footer,template,globalStyles},null,2)+'\n');
console.log(`Prepared ${pages.length} pages and ${assets.size} assets from the built Astro site.`);
