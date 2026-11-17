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
test('policy links use HTTPS or the exact approved email address without attached data',()=>{
 for(const text of [policy.ja,policy.en])for(const section of text.sections)for(const link of section.links??[])assert.ok(policy.links[link.key]);
 for(const [key,url] of Object.entries(policy.links)){const parsed=new URL(url);assert.equal(parsed.protocol,key==='email'?'mailto:':'https:');assert.equal(parsed.username,'');assert.equal(parsed.password,'');}
 const contact=new URL(policy.links.support);assert.equal(contact.hostname,'github.com');assert.equal(contact.pathname,'/akmrbaby/know-gacha/issues/new');
 for(const key of ['body','email','deviceId','history'])assert.equal(contact.searchParams.has(key),false);
});

test('private contact uses only the user-provided address and is present in both policy versions',()=>{
 assert.equal(policy.supportEmail,'knowgacha.dev@gmail.com');assert.equal(policy.links.email,'mailto:'+policy.supportEmail);
 const mail=new URL(policy.links.email);assert.equal(mail.pathname,policy.supportEmail);assert.equal(mail.search,'');assert.equal(mail.hash,'');
 for(const locale of ['ja','en']){
  const feedback=policy[locale].sections.find(section=>section.id==='feedback');
  assert.ok(feedback.paragraphs.join(' ').includes(policy.supportEmail));assert.ok(feedback.links.some(link=>link.key==='email'));assert.ok(feedback.links.some(link=>link.key==='googlePrivacy'));
 }
 assert.ok(fs.readFileSync('legal/README.md','utf8').includes(policy.supportEmail));
});
