import {unlink,stat} from 'node:fs/promises';
// Keep the production assets below static-host per-file limits. Sources remain.
for(const name of ['duckdb-mvp.wasm','duckdb-eh.wasm']){
 const target=`dist/client/duckdb/${name}`;
 await stat(`${target}.gz`);
 await unlink(target);
}
