/** Build the portable HTML. For authoring: npm install, then npm run build.
 * End users only open index.html; no Node.js is needed to study.
 */
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const root = __dirname;
async function main() {
  let packageDir;
  try { packageDir = path.dirname(require.resolve('tailwindcss/package.json')); }
  catch {
    const globalRoot = cp.execSync('npm root -g', {encoding:'utf8'}).trim();
    packageDir = path.join(globalRoot, 'tailwindcss');
  }
  const {compile} = require(path.join(packageDir, 'dist/lib.js'));
  const cssInput = fs.readFileSync(path.join(packageDir, 'theme.css'), 'utf8') + '\n' +
    fs.readFileSync(path.join(packageDir, 'preflight.css'), 'utf8') + '\n@tailwind utilities;';
  const builder = await compile(cssInput);
  const candidates = ['flex','grid','items-center','items-start','justify-between','justify-center','gap-2','gap-3','gap-4','min-w-0','w-full','text-left','font-semibold','text-sm','flex-wrap','md:grid-cols-2','lg:grid-cols-3'];
  const compiled = builder.build(candidates);
  fs.writeFileSync(path.join(root,'tailwind-compiled.css'), compiled);
  const design = fs.readFileSync(path.join(root,'design.css'),'utf8');
  const data = JSON.stringify(JSON.parse(fs.readFileSync(path.join(root,'pilot-data.json'),'utf8'))).replace(/</g,'\\u003c');
  const app = fs.readFileSync(path.join(root,'app.js'),'utf8');
  const html = fs.readFileSync(path.join(root,'template.html'),'utf8')
    .replace('/*__CSS__*/',compiled+'\n'+design)
    .replace('/*__DATA__*/',data)
    .replace('/*__APP__*/',app);
  fs.writeFileSync(path.join(root,'../index.html'),html);
  console.log('Built index.html:', Buffer.byteLength(html), 'bytes; Tailwind',JSON.parse(fs.readFileSync(path.join(packageDir,'package.json'))).version);
}
main().catch(e=>{console.error(e);process.exit(1);});
