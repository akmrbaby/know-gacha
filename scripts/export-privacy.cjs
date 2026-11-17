const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const policy=require(path.join(root,'src/legal/policy.json'));
function render(locale){
 const text=policy[locale];
 const date=locale==='ja'?`最終改定日：${policy.updatedOn}`:`Last updated: ${policy.updatedOn}`;
 const operator=locale==='ja'?`運営者：${policy.operator}`:`Operator: ${policy.operator}`;
 const other=locale==='ja'?'[English](privacy-en.md)':'[日本語](privacy-ja.md)';
 return [`# KnowGacha — ${text.title}`,'',other,'',date,'',operator,'',text.introduction,'',...text.sections.flatMap(section=>[`## ${section.title}`,'',...section.paragraphs.flatMap(paragraph=>[paragraph,'']),...(section.links??[]).flatMap(link=>[`[${link.label}](${policy.links[link.key]})`,''])])].join('\n');
}
if(require.main===module){
 for(const locale of ['ja','en']){
  const file=path.join(root,`legal/privacy-${locale}.md`),expected=render(locale);
  if(process.argv.includes('--check')){if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==expected){process.stderr.write(`${path.relative(root,file)} needs regeneration\n`);process.exitCode=1;}}
  else{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,expected);}
 }
}
module.exports={render};
