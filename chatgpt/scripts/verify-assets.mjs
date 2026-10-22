import {readFile,stat} from 'node:fs/promises';
import assert from 'node:assert/strict';
for(const name of ['duckdb-eh.wasm','duckdb-mvp.wasm']){
 const packed=await readFile(`public/duckdb/${name}.gz`);
 const unpacked=await new Response(new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
 const raw=await readFile(`public/duckdb/${name}`);assert.ok(raw.equals(Buffer.from(unpacked)));
 assert.ok((await stat(`dist/client/duckdb/${name}.gz`)).size<25*1024*1024);
 console.log(`PASS gzip transport + DecompressionStream: ${name}, ${packed.length} bytes`);
}
