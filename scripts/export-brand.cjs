// Export the approved artwork to native asset formats. Requires ImageMagick 7.
// Generated source images are retained unchanged in assets/brand/.
const {execFileSync}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const render=args=>execFileSync('magick',args,{maxBuffer:32*1024*1024});
function inspect(file) {
 const [width,height]=render(['identify','-format','%w %h',file]).toString().split(' ').map(Number);
 const pixels=render([file,'-depth','8','rgba:-']);
 let maxRadius=0,transparent=0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const alpha=pixels[(y*width+x)*4+3];
  if(alpha)maxRadius=Math.max(maxRadius,Math.hypot(x+0.5-width/2,y+0.5-height/2));
  if(alpha<255)transparent++;
 }
 return {width,height,maxRadius,transparent};
}
function adaptive(source,output) {
 const input=inspect(source);
 const size=Math.floor(input.width*306/input.maxRadius);
 render([source,'-resize',`${size}x${size}`,'-gravity','center','-background','none','-extent','1024x1024','-strip',`PNG32:${output}`]);
 const result=inspect(output);
 if(result.maxRadius>1024*33/108)throw new Error(`${output} exceeds Android's 66dp circular safe zone`);
 console.log(output,JSON.stringify(result));
}
render(['assets/brand/approved-icon.png','-resize','1024x1024','-alpha','off','-strip','PNG24:assets/icon.png']);
render(['assets/brand/approved-icon.png','-resize','64x64','-alpha','off','-strip','PNG24:assets/favicon.png']);
render(['assets/brand/mascot-source.png','-channel','A','-threshold','50%','+channel','-resize','1024x1024','-strip','PNG32:assets/splash-icon.png']);
const stencil=inspect('assets/brand/monochrome-stencil.png');
render(['-size',`${stencil.width}x${stencil.height}`,'xc:white','(','assets/brand/monochrome-stencil.png','-colorspace','Gray','-threshold','50%',')','-alpha','off','-compose','CopyOpacity','-composite','-strip','PNG32:assets/brand/monochrome.png']);
adaptive('assets/splash-icon.png','assets/android-icon-foreground.png');
adaptive('assets/brand/monochrome.png','assets/android-icon-monochrome.png');
// The same centered safe silhouette is used by OS and JS splash screens.
fs.copyFileSync('assets/android-icon-foreground.png','assets/splash-icon.png');
render(['-size','1024x1024','xc:#DCE9E2','-strip','PNG24:assets/android-icon-background.png']);
for(const file of ['assets/icon.png','assets/favicon.png','assets/splash-icon.png']){
 const info=inspect(file);
 if(file.includes('splash') ? !info.transparent : info.transparent)throw new Error(`${file} has incorrect transparency`);
 console.log(file,JSON.stringify(info));
}
