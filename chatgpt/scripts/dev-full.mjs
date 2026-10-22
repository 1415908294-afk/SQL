import {spawn} from 'node:child_process';
const children=[spawn(process.execPath,['--env-file-if-exists=.env','server/index.mjs'],{stdio:'inherit'}),spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1'],{stdio:'inherit'})];
for(const s of ['SIGINT','SIGTERM'])process.on(s,()=>{for(const child of children)child.kill();process.exit();});
for(const child of children)child.on('exit',code=>{for(const c of children)if(c!==child)c.kill();process.exit(code??0);});
