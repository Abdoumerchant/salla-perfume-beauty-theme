const fs=require('node:fs');
const path=require('node:path');
const dir=__dirname;
let html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
html=html.replace('<link rel="stylesheet" href="styles.css">',()=>`<style>${fs.readFileSync(path.join(dir,'styles.css'),'utf8')}</style>`);
for(const file of ['catalog.js','engine.js','app.js'])html=html.replace(`<script src="${file}"></script>`,()=>`<script>${fs.readFileSync(path.join(dir,file),'utf8')}</script>`);
fs.writeFileSync(path.join(dir,'demo.html'),html);
console.log('Built offline demo.html');
