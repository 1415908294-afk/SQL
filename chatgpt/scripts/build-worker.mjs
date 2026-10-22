import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
await mkdir('dist/server',{recursive:true});
await build({entryPoints:['worker/index.mjs'],outfile:'dist/server/index.js',bundle:true,platform:'browser',format:'esm',target:'es2022',minify:true});
const hosting=JSON.parse(await readFile('.openai/hosting.json','utf8'));
delete hosting.static;
await mkdir('dist/.openai',{recursive:true});
await writeFile('dist/.openai/hosting.json',JSON.stringify(hosting,null,2));
// Also supports direct Cloudflare Workers deployment outside Sites.
await writeFile('dist/server/wrangler.json',JSON.stringify({name:'sql-growth-lab',main:'index.js',compatibility_date:'2026-10-22',assets:{directory:'../client',binding:'ASSETS',run_worker_first:['/api/*']}},null,2));
