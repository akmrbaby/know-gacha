const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const policy=require('../src/legal/policy.json');
const {render}=require('../scripts/export-privacy.cjs');
test('public Japanese and English policies match the exact source shipped in the app',()=>{
 for(const locale of ['ja','en'])assert.equal(fs.readFileSync(`legal/privacy-${locale}.md`,'utf8'),render(locale),'regenerate public policy after changing app copy');
});
test('both languages cover the same disclosures and reference the same providers',()=>{
 assert.deepEqual(policy.ja.sections.map(s=>s.id),policy.en.sections.map(s=>s.id));
 for(let i=0;i<policy.ja.sections.length;i++)assert.deepEqual((policy.ja.sections[i].links??[]).map(l=>l.key),(policy.en.sections[i].links??[]).map(l=>l.key));
 for(const section of policy.en.sections)for(const paragraph of section.paragraphs)assert.ok(!/[\u3040-\u30ff\u3400-\u9fff]/.test(paragraph));
 assert.ok(policy.en.sections.find(s=>s.id==='updates').paragraphs.join(' ').includes('client identifier'));
 assert.ok(policy.en.sections.find(s=>s.id==='feedback').paragraphs.join(' ').includes('public'));
});
test('policy links are explicit HTTPS destinations and contact never includes device data or a guessed address',()=>{
 for(const text of [policy.ja,policy.en])for(const section of text.sections)for(const link of section.links??[])assert.ok(policy.links[link.key]);
 for(const url of Object.values(policy.links)){const parsed=new URL(url);assert.equal(parsed.protocol,'https:');assert.equal(parsed.username,'');assert.equal(parsed.password,'');}
 const contact=new URL(policy.links.support);assert.equal(contact.hostname,'github.com');assert.equal(contact.pathname,'/akmrbaby/know-gacha/issues/new');
 for(const key of ['body','email','deviceId','history'])assert.equal(contact.searchParams.has(key),false);
});
