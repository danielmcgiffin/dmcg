import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';

// Apply the supplied October 29 positioning review to the WordPress working copy.
// The preserved Astro source and pre-Ollie archive are intentionally independent.
const manifest = new URL('./content.json', import.meta.url);
const data = JSON.parse(await readFile(manifest, 'utf8'));
if (data.positioningReview === '2026-10-29') {
  console.log('The October 29 positioning revision is already applied.');
  process.exit(0);
}
const esc = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const block = (name, attrs, html) => `<!-- wp:${name}${Object.keys(attrs).length ? ' ' + JSON.stringify(attrs) : ''} -->\n${html}\n<!-- /wp:${name} -->\n`;
const p = text => block('paragraph', {}, `<p>${esc(text)}</p>`);
const h = (text, level = 2, anchor) => block('heading', { ...(level !== 2 ? { level } : {}), ...(anchor ? { anchor } : {}) }, `<h${level} class="wp-block-heading"${anchor ? ` id="${anchor}"` : ''}>${esc(text)}</h${level}>`);
const group = (html, className = '', wide = false) => block('group', { ...(wide ? {align:'wide'} : {}), ...(className ? {className} : {}), layout:{type:'constrained'} }, `<div class="wp-block-group${wide ? ' alignwide' : ''}${className ? ' ' + className : ''}">${html}</div>`);
const button = (href, text, outline = false) => block('button', outline ? {className:'is-style-outline'} : {}, `<div class="wp-block-button${outline ? ' is-style-outline' : ''}"><a class="wp-block-button__link wp-element-button" href="${esc(href)}">${esc(text)}</a></div>`);
const buttons = html => block('buttons', {}, `<div class="wp-block-buttons">${html}</div>`);
const columns = (items, widths) => block('columns', {align:'wide'}, `<div class="wp-block-columns alignwide">${items.map((body,i) => block('column', {width:widths[i]}, `<div class="wp-block-column" style="flex-basis:${widths[i]}">${body}</div>`)).join('')}</div>`);
const list = items => block('list', {}, `<ul class="wp-block-list">${items.map(item => block('list-item', {}, `<li>${esc(item)}</li>`)).join('')}</ul>`);
function blocks(content) {
  const roots = [], stack = [];
  for (const match of content.matchAll(/<!--\s*(\/?)wp:([\w/-]+)(?:\s+(\{.*?\}))?\s*(\/)?-->/g)) {
    if (match[1]) {
      const node = stack.pop();
      if (!node || node.name !== match[2]) throw new Error('Unbalanced block markup');
      node.end = match.index + match[0].length;
      node.raw = content.slice(node.start, node.end) + '\n';
    } else {
      const node = { name:match[2], attrs:JSON.parse(match[3] || '{}'), start:match.index, children:[] };
      (stack.length ? stack.at(-1).children : roots).push(node);
      if (match[4]) {node.end = match.index + match[0].length; node.raw = content.slice(node.start,node.end) + '\n';}
      else stack.push(node);
    }
  }
  if(stack.length) throw new Error('Unclosed block markup');
  return roots;
}
const page = route => {
  const result = data.pages.find(p => p.route === route);
  if (!result) throw new Error(`Missing page ${route}`);
  return result;
};
const home = page('/');
const testimonial = blocks(home.content).find(b => b.attrs.className === 'dmcg-testimonials');
if(!testimonial) throw new Error('Existing testimonials not found; refusing to replace the homepage.');
const portrait = block('image', {sizeSlug:'full',linkDestination:'none'}, '<figure class="wp-block-image size-full"><img src="/wp-content/uploads/dmcg/headshot.jpg" alt="Danny McGiffin"/></figure>');
const category = 'Independent Strategy & Operations Partner';
const cta = 'Schedule a conversation';
const booking = src => `https://cal.com/dannymcgiffin/30min?src=${src}`;

const featured = [
  {slug:'growth', title:'Building the company underneath 10× growth', summary:'Helped build the management, delivery, and operating systems of a professional-services firm as its recognized revenue grew approximately tenfold.'},
  {slug:'64m-deployment', title:'Leading a $64M technology deployment', summary:'Led a complex deployment across internal teams, vendors, and customer stakeholders, completing the planned scope despite funding and approval delays.'},
  {slug:'operating-model', title:'Redesigning an operating model to make collaboration work', summary:'Redesigned responsibilities, incentives, and decision rights, and won executive approval for a new federal-market operating model.'},
];
const card = entry => group(
  block('heading',{level:3},`<h3 class="wp-block-heading"><a href="/work/${entry.slug}/">${esc(entry.title)}</a></h3>`)
  + p(entry.summary)
  + block('paragraph',{},`<p><a href="/work/${entry.slug}/">Read the case ↗</a></p>`), 'dmcg-card');
home.description = 'Danny McGiffin helps owners and executives of growing companies design better operations and carry change through implementation.';
home.content = group(columns([
  p(category)
  + h('Build a business that can keep up with your ambitions.',1,'hero-title')
  + p('I help owners and executives of growing companies build the operations they need to accomplish their goals.')
  + p('I look at how the whole business works, find what’s holding it back, and design and implement better ways of operating—across people, processes, systems, and technology.')
  + buttons(button(booking('hero'),cta)+button('/work/','See my work',true))
  + p('We can start with a free 30-minute conversation. No polished brief required.'),
  portrait,
], ['66.66%','33.33%']), 'dmcg-hero', true)
+ group(h('When I can help')
  + p('Growth creates opportunities. It also exposes the limitations of how a business operates. You might recognize some of these:')
  + list([
    'The company is growing, but running it is getting harder.',
    'Too many decisions and problems still end up on the owner’s desk.',
    'People spend too much time on manual work, coordination, and fixing mistakes.',
    'Systems and processes haven’t kept pace with the business.',
    'There’s a major initiative underway, but getting from strategy to execution is proving difficult.',
  ])
  + p('These problems rarely belong to just one department. Solving them means understanding the business as a whole.'), 'dmcg-section')
+ group(h('What I do')
  + h('Understand the business.',3)
  + p('I work with leadership and the people doing the work to understand how the company operates, where its constraints lie, and what’s actually causing them.')
  + h('Design a better way.',3)
  + p('That might mean changing the operating model, clarifying responsibilities, redesigning workflows, improving data, or introducing new technology.')
  + h('Make it happen.',3)
  + p('I help build and implement the solution, working with your team until the new way of operating works.'), 'dmcg-section')
+ group(h('Selected work',2,'work-title')
  + group(featured.map(card).join(''),'dmcg-card-grid',true)
  + block('paragraph',{},'<p><a href="/work/">Explore my work ↗</a></p>'), 'dmcg-section',true)
+ testimonial.raw
+ group(h('What are you trying to build?')
  + p('Whether your company has outgrown the way it operates, you’re contemplating a major change, or you simply know there’s a better way to work, I’d be interested to hear about it.')
  + p('We can start with a free 30-minute conversation. No polished brief required.')
  + buttons(button(booking('closing'),cta)+button('/contact/','Or send me a note',true)), 'dmcg-section dmcg-closing');

const contact = page('/contact/');
const oldContact = blocks(contact.content);
const offersStart = oldContact.findIndex(b => b.name === 'heading' && b.attrs.anchor === 'offers');
if(offersStart < 0) throw new Error('Existing Contact offer list not found.');
const engagementList = oldContact.slice(offersStart).map(b=>b.raw).join('');
const practice = [
  'I work with businesses through focused advisory projects, operational design and improvement, implementation engagements, and fractional or interim leadership.',
  'I also partner with consulting firms that need experienced strategy, operations, or transformation delivery capacity.',
  'If you’re facing a complex business problem, building something new, or need an experienced pair of hands to lead an important initiative, let’s talk.',
];
contact.description = 'Talk with Danny McGiffin about business operations, implementation, fractional leadership, or consulting partnerships. Start with a free 30-minute conversation.';
contact.content = p('Contact') + h('Tell me what you’re trying to accomplish.',1)
  + p('You don’t need a polished brief. The first 30-minute video call is free: we talk about your business, what you’re trying to accomplish, and where I could help.')
  + buttons(button(booking('contact'),cta)+button('mailto:danny@dannymcgiffin.com?subject=Let%E2%80%99s%20talk%20about%20my%20business','Or send an email',true))
  + practice.map(p).join('')
  + engagementList;

const about = page('/about/');
about.description = 'Danny McGiffin works across strategy, operations, and technology to help owners and executives design better businesses and carry change through implementation.';
about.content = about.content
  .replace(p('I’m Danny McGiffin. I live and work in the DC area.'),p('I work across the whole business: where it’s trying to go, how it makes money, and how the work gets done.'))
  .replace(p('My work has taken me from Army logistics to consulting, company operations, and technology delivery. Today I work independently with owners and executives.'),p('I help owners and executives understand what’s getting in the way, design a better way of operating, and carry the changes through. My background spans Army logistics, consulting, company operations, and technology delivery.'));

const offers = page('/offers/');
offers.description = 'Work with Danny McGiffin on business operations, implementation, or independent leadership. Focused technology engagements offer specific starting points.';
offers.content = h('Ways to work together',1) + practice.slice(0,2).map(p).join('')
  + h('Focused engagements')
  + p('These are specific starting points for technology and data work. We can also discuss an engagement shaped around the business problem you need to solve.')
  + blocks(offers.content).filter(b=>b.name==='list').map(b=>b.raw).join('');

data.footer = data.footer.replace(p('Business & Technology Advisor'),p(category))
  .replace(p('Based outside Washington, DC, and working with businesses across the DC area.'),'');
if(data.footer.includes('Business &amp; Technology Advisor')) throw new Error('Footer category replacement failed.');
data.siteDescription = category;
// Keep the call invitation consistent without changing booking URLs or source tags.
for (const item of data.pages) item.content = item.content.replaceAll('Schedule Our First Chat',cta);
data.positioningReview = '2026-10-29';
await mkdir(new URL('./backups/',import.meta.url),{recursive:true});
await copyFile(manifest,new URL(`./backups/content-before-positioning-${Date.now()}.json`,import.meta.url));
await writeFile(manifest,JSON.stringify(data,null,2)+'\n');
console.log('Revised Home, Contact, About introduction, engagement overview, footer category, and booking labels. Original source and case-study evidence preserved.');
