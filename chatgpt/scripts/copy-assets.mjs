import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
await mkdir('public/duckdb',{recursive:true});
for(const name of ['duckdb-mvp.wasm','duckdb-browser-mvp.worker.js','duckdb-eh.wasm','duckdb-browser-eh.worker.js']) await copyFile(`node_modules/@duckdb/duckdb-wasm/dist/${name}`,`public/duckdb/${name}`);
for(const name of ['duckdb-mvp.wasm','duckdb-eh.wasm'])await writeFile(`public/duckdb/${name}.gz`,gzipSync(await readFile(`public/duckdb/${name}`),{level:9}));
