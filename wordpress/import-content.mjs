import { readFile, writeFile, mkdir, copyFile, unlink } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=fileURLToPath(new URL('./',import.meta.url));
const root=path.dirname(here.slice(0,-1));
const origin='http://127.0.0.1:9400';
const payload=JSON.parse(await readFile(path.join(here,'content.json'),'utf8'));
payload.replace=process.argv.includes('--replace');
const backup=path.join(here,'backups');
await mkdir(backup,{recursive:true});
const stamp=new Date().toISOString().replaceAll(':','-');
const archive=path.join(backup,`before-content-${stamp}.tar.gz`);
execFileSync('tar',['-czf',archive,'-C',here,'site']);
console.log(`WordPress files and database backed up to ${archive}`);
const cookies=new Map();
async function request(url,options={}) {
  for(let i=0;i<8;i++) {
    const response=await fetch(url,{...options,redirect:'manual',headers:{...options.headers,Cookie:[...cookies].map(([k,v])=>`${k}=${v}`).join('; ')}});
    for(const cookie of response.headers.getSetCookie()) { const [pair]=cookie.split(';');const at=pair.indexOf('=');cookies.set(pair.slice(0,at),pair.slice(at+1)); }
    if(response.status>=300 && response.status<400 && response.headers.has('location')) {url=new URL(response.headers.get('location'),url).href;continue;}
    return response;
  }
  throw new Error('Too many redirects');
}
const admin=await request(`${origin}/wp-admin/site-editor.php`);
const adminHtml=await admin.text();
const nonce=adminHtml.match(/wpApiSettings\s*=\s*\{[^;]+?"nonce"\s*:\s*"([^"]+)"/)?.[1]
  || adminHtml.match(/wp\.apiFetch\.createNonceMiddleware\(\s*["']([^"']+)["']/)?.[1];
if(!nonce) throw new Error('Could not obtain an authenticated WordPress REST nonce. Start the local preview with automatic login.');
const mu=path.join(here,'site/wp-content/mu-plugins');
await mkdir(mu,{recursive:true});
await copyFile(path.join(here,'site-content.php'),path.join(mu,'dmcg-site-content.php'));
for(const asset of payload.assets) {
  if(!asset.startsWith('/') || asset.includes('..')) throw new Error(`Invalid asset path ${asset}`);
  const dest=path.join(here,'site/wp-content/uploads/dmcg',asset);
  await mkdir(path.dirname(dest),{recursive:true});
  await copyFile(path.join(root,'public',asset),dest);
}
const importer=path.join(mu,'dmcg-import.php');
try {
  await copyFile(path.join(here,'import-content.php'),importer);
  const response=await request(`${origin}/?rest_route=/dmcg-import/v1/content`,{method:'POST',headers:{'Content-Type':'application/json','X-WP-Nonce':nonce},body:JSON.stringify(payload)});
  const result=await response.text();
  if(!response.ok) throw new Error(`Import failed (${response.status}): ${result}`);
  const report=JSON.parse(result);
  await writeFile(path.join(here,'import-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(`Imported ${report.pages.length} pages; active theme: ${report.theme}; registered ${report.media} media assets.`);
  for(const page of report.pages) console.log(`${page.id}: ${page.route}`);
} finally {
  await unlink(importer).catch(()=>{});
}
