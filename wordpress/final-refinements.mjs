import { readFile, writeFile } from 'node:fs/promises';

// Refine the revised WordPress manifest directly. Never regenerate it from Astro.
const file = new URL('./content.json', import.meta.url);
const data = JSON.parse(await readFile(file, 'utf8'));
if (data.finalRefinements === '2026-10-29') {
  console.log('Final refinements are already present.');
  process.exit(0);
}
const esc = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const block = (name, attrs, html) => `<!-- wp:${name}${Object.keys(attrs).length ? ' ' + JSON.stringify(attrs) : ''} -->\n${html}\n<!-- /wp:${name} -->\n`;
const p = s => block('paragraph',{},`<p>${esc(s)}</p>`);
const h = (s,level=2) => block('heading',level===2?{}:{level},`<h${level} class="wp-block-heading">${esc(s)}</h${level}>`);
const section = html => block('group',{className:'dmcg-section',layout:{type:'constrained'}},`<div class="wp-block-group dmcg-section">${html}</div>`);
const booking = source => block('buttons',{},`<div class="wp-block-buttons">${block('button',{},`<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://cal.com/dannymcgiffin/30min?src=${source}">Schedule a conversation</a></div>`)}</div>`);
const page = route => {
  const item=data.pages.find(p=>p.route===route);
  if(!item) throw Error(`Missing page: ${route}`);
  return item;
};
function once(content, before, after) {
  if(content.split(before).length!==2) throw Error(`Expected one match: ${before.slice(0,100)}`);
  return content.replace(before,after);
}
function blocks(content) {
  const roots=[], stack=[];
  for(const match of content.matchAll(/<!--\s*(\/?)wp:([\w/-]+)(?:\s+(\{.*?\}))?\s*(\/)?-->/g)) {
    if(match[1]) {
      const node=stack.pop();
      if(!node || node.name!==match[2]) throw Error('Unbalanced block markup');
      node.end=match.index+match[0].length;
      node.raw=content.slice(node.start,node.end);
    } else {
      const node={name:match[2],attrs:JSON.parse(match[3]||'{}'),start:match.index,children:[]};
      (stack.length?stack.at(-1).children:roots).push(node);
      if(match[4]) {node.end=match.index+match[0].length;node.raw=content.slice(node.start,node.end);}
      else stack.push(node);
    }
  }
  if(stack.length) throw Error('Unclosed block markup');
  return roots;
}
const flatten = nodes => nodes.flatMap(n=>[n,...flatten(n.children)]);

const home=page('/');
home.content=once(home.content,
  p('I help owners and executives of growing companies build the operations they need to accomplish their goals.'),
  p('I help owners and executives of growing companies make their businesses easier to run and more capable of growth.'));
home.content=once(home.content,
  p('I look at how the whole business works, find what’s holding it back, and design and implement better ways of operating—across people, processes, systems, and technology.'),
  p("When too many decisions land on the owner's desk, good people are buried in manual work, or major initiatives struggle to get moving, I find the underlying problems, design a better way of operating, and help make it happen."));

const services=page('/offers/');
const focused=blocks(services.content).find(b=>b.name==='list');
if(!focused || !focused.raw.includes('/offers/tech-audit/')) throw Error('Existing focused engagements were not found.');
services.title='Services';
services.type='page';
services.description='Business and operations design, implementation and transformation, independent advisory, and fractional leadership with Danny McGiffin. Explore services and focused engagements.';
services.content=h('Ways to work together',1)
  +p('I help owners and executives build the operations they need to become the businesses they want to be. The engagement starts with what you’re trying to accomplish.')
  +section(h('Business & Operations Design')
    +p('For companies trying to grow, improve performance, or overcome organizational constraints.')
    +p('I diagnose how the business works, identify the underlying constraints, and design better operating models, responsibilities, workflows, and organizational capabilities.')
    +booking('services-design'))
  +section(h('Implementation & Transformation')
    +p('For companies that know something needs to change but need help making it happen.')
    +p('I lead implementation initiatives, redesign workflows, coordinate technical resources, and improve systems and processes. I work with your team to carry changes through to adoption.')
    +booking('services-implementation'))
  +section(h('Independent Advisory & Fractional Leadership')
    +p('For owners and executives who need experienced judgment or operating leadership without immediately hiring a permanent executive.')
    +p('That can include executive advisory, operational infrastructure development, interim leadership, fractional operations leadership, and support for complex decisions.')
    +booking('services-advisory'))
  +p('I also accept subcontracted work from consulting firms that need experienced strategy, operations, or transformation delivery capacity.')
  +block('paragraph',{},'<p>If you’re not sure where to start, <a href="/contact/">tell me what you’re trying to accomplish</a>.</p>')
  +h('Focused engagements')
  +p('These are specific starting points for technology and data work, rather than the full scope of my practice. Each has its own scope, pricing, and details.')
  +focused.raw+'\n';

const work=page('/work/');
const grid=flatten(blocks(work.content)).find(b=>b.attrs.className==='dmcg-card-grid');
const cards=grid?.children.filter(b=>b.attrs.className==='dmcg-card');
const order=['growth','64m-deployment','operating-model','erp-decision','navy-improper-payments','negotiation-policy'];
if(cards?.length!==6) throw Error('Expected exactly six existing Work cards.');
const sorted=order.map(slug=>{
  const card=cards.find(c=>c.raw.includes(`href="/work/${slug}/"`));
  if(!card) throw Error(`Missing existing Work card: ${slug}`);
  return card.raw;
});
work.content=work.content.slice(0,cards[0].start)+sorted.join('\n')+work.content.slice(cards.at(-1).end);

const nav=flatten(blocks(data.header)).find(b=>b.name==='navigation');
if(!nav || nav.children.map(n=>n.attrs.label).join('|')!=='Work|Writing|About|Contact') throw Error('Expected the existing four-link header navigation.');
const workLink=nav.children[0];
data.header=data.header.slice(0,workLink.end)+'\n<!-- wp:navigation-link {"label":"Services","url":"/offers/","kind":"custom"} /-->'+data.header.slice(workLink.end);

// Contact is the existing internal route to the focused engagements.
const contact=page('/contact/');
const contactList=blocks(contact.content).find(b=>b.name==='list');
if(!contactList) throw Error('Contact engagement list not found.');
contact.content=contact.content.slice(0,contactList.start)
  +block('paragraph',{},'<p>For operational design, implementation, advisory, or leadership support, <a href="/offers/">explore all services</a>.</p>')
  +contact.content.slice(contactList.start);

data.finalRefinements='2026-10-29';
await writeFile(file,JSON.stringify(data,null,2)+'\n');
console.log('Updated the two hero paragraphs, Services page, Work card order, header navigation, and one Contact-to-Services link.');
