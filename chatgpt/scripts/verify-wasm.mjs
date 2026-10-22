import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
const require=createRequire(import.meta.url);
process.on('uncaughtException',e=>{console.error('WASM verification failed:',e.message);process.exit(1);});
const d=require('@duckdb/duckdb-wasm/blocking');
const db=await d.createDuckDB({mvp:{mainModule:path.resolve('public/duckdb/duckdb-mvp.wasm')},eh:{mainModule:path.resolve('public/duckdb/duckdb-eh.wasm')}},new d.ConsoleLogger(d.LogLevel.ERROR),d.NODE_RUNTIME);
await db.instantiate();
db.registerFileBuffer('voca.duckdb',new Uint8Array(await readFile('public/data/voca.duckdb')));
db.open({path:'voca.duckdb',accessMode:d.DuckDBAccessMode.READ_ONLY,query:{castBigIntToDouble:true,castDecimalToDouble:true}});
const c=db.connect();
c.query('SET enable_external_access=false');
c.query('SET autoinstall_known_extensions=false; SET autoload_known_extensions=false;');
c.query('SET lock_configuration=true');
console.log('WASM version:',db.getVersion());
console.log('WASM users:',c.query('SELECT COUNT(*) n FROM users').toArray().map(String));
const standard=JSON.parse(await readFile('src/content/expected.json','utf8'));
const compile=async file=>{const code=ts.transpileModule(await readFile(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));};
const {exercises}=await compile('src/content/catalog.ts');
const {compareResults}=await compile('src/lib/grading.ts');
const {safeQueryBody}=await compile('src/lib/queryPolicy.ts');
for(const e of exercises){
 const clean=safeQueryBody(e.sql,db.tokenize(e.sql));
 const statement=c.prepare(`SELECT * FROM (${clean}\n) AS lab_result LIMIT 1001`);
 const table=statement.query();statement.close();
 const columns=table.schema.fields.map(f=>f.name);
 const rows=table.toArray().map(r=>columns.map((col,i)=>{const v=r[col];if(v!=null&&/^Date/.test(table.schema.fields[i].type.toString()))return new Date(Number(v)).toISOString().slice(0,10);return v==null?null:typeof v==='bigint'?String(v):typeof v==='number'||typeof v==='boolean'?v:String(v);}));
 const verdict=compareResults({columns,rows,elapsed:0,truncated:false},standard[e.id],e.ordered);
 assert.ok(verdict.pass,`WASM exercise ${e.id}: ${verdict.message}; actual=${JSON.stringify(rows.slice(0,2))} expected=${JSON.stringify(standard[e.id].rows.slice(0,2))}`);
 console.log(`PASS WASM #${e.id} ${rows.length} rows`);
}
for(const sql of ['DELETE FROM users','UPDATE users SET user_name=\'x\'','DROP TABLE users','CREATE TABLE injected(x INT)','INSERT INTO users SELECT * FROM users']){
 assert.throws(()=>c.query(sql),/read.only|READ_ONLY|read-only/i);console.log('PASS WASM read-only:',sql);
}
for(const sql of ["SELECT * FROM read_csv('/unregistered-file.csv')","SELECT * FROM read_csv('https://example.com/data.csv')","SET enable_external_access=true"]){assert.throws(()=>c.query(sql));console.log('PASS WASM access protection:',sql);}
for(const sql of ['SELECT 1; SELECT 2','WITH x AS (SELECT 1) DELETE FROM users','SELECT 1; DROP TABLE users','SELECT 1) x; SET enable_external_access=true; --','DELETE FROM users']){assert.throws(()=>{const clean=safeQueryBody(sql,db.tokenize(sql));c.prepare(`SELECT * FROM (${clean}\n) AS lab_result LIMIT 1001`);});console.log('PASS WASM query parser:',sql);}
for(const sql of ["SELECT '你好;' AS text; -- trailing comment",'/* comment */ WITH x AS (SELECT 1 AS a) SELECT * FROM x;','SELECT $$a;b$$ AS text;']){const clean=safeQueryBody(sql,db.tokenize(sql));const p=c.prepare(`SELECT * FROM (${clean}\n) lab_result LIMIT 1001`);assert.equal(p.query().numRows,1);p.close();console.log('PASS WASM quoted semicolon / comment:',sql);}
assert.equal(Number(c.query('SELECT COUNT(*) n FROM users').get(0).n),120);
c.close();db.reset();console.log('All WASM runtime validations passed.');
