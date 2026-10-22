import {DuckDBInstance} from '@duckdb/node-api';
import ts from 'typescript';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const source=ts.transpileModule(await readFile('src/content/catalog.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {exercises,stages,schema}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
assert.equal(stages.length,7);assert.equal(schema.length,6);assert.ok(exercises.length>=10);
const db=await DuckDBInstance.create('public/data/voca.duckdb',{access_mode:'READ_ONLY'}),c=await db.connect();
const expected={};
for(const e of exercises){
 const parsed=await c.runAndReadAll(`SELECT json_serialize_sql('${e.sql.replaceAll("'","''")}') AS ast`);
 const ast=JSON.parse(parsed.getRowObjects()[0].ast);
 assert.ok(!ast.error,`SQL parser #${e.id}: ${JSON.stringify(ast)}`);
 const result=await c.runAndReadAll(e.sql);
 const columns=result.columnNames();
 const json=result.getRowObjectsJson();
 const rows=json.map(row=>columns.map(column=>{const value=row[column];return typeof value==='string'&&/^-?\d+(\.\d+)?$/.test(value)?Number(value):value;}));
 assert.ok(rows.length>0,`Exercise ${e.id} has no rows`);
 expected[e.id]={columns,rows,elapsed:0,truncated:false};
 console.log(`PASS #${String(e.id).padStart(2,'0')} ${e.title}: ${rows.length} rows; parser=${ast.statements[0].node.type}`);
}
for(const sql of ['DELETE FROM users','UPDATE users SET user_name=\'x\'','DROP TABLE users','CREATE TABLE injected(x INT)','INSERT INTO users SELECT * FROM users']){
 await assert.rejects(()=>c.run(sql),/read.only|READ_ONLY|read-only/i);console.log('PASS READ_ONLY:',sql);
}
const users=await c.runAndReadAll('SELECT COUNT(*)::INTEGER n FROM users');assert.equal(users.getRowObjects()[0].n,120);
const orphan=await c.runAndReadAll('SELECT COUNT(*)::INTEGER n FROM activity_events a LEFT JOIN users u ON a.user_id=u.user_id WHERE u.user_id IS NULL');assert.equal(orphan.getRowObjects()[0].n,0);
const gs=ts.transpileModule(await readFile('src/lib/grading.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {compareResults}=await import('data:text/javascript;base64,'+Buffer.from(gs).toString('base64'));
const r=rows=>({columns:['a'],rows,elapsed:0,truncated:false});
assert.ok(compareResults(r([[1],[2]]),r([[2],[1]]),false).pass);
assert.ok(!compareResults(r([[1],[2]]),r([[2],[1]]),true).pass);
assert.ok(!compareResults(r([[1],[1],[2]]),r([[1],[2],[2]])).pass);
assert.ok(!compareResults(r([[null]]),r([['null']])).pass);
assert.ok(compareResults(r([[1.00000001]]),r([[1]])).pass);
assert.ok(!compareResults({...r([[1]]),truncated:true},r([[1]])).pass);
console.log('PASS grading: order, duplicates, NULL, numeric tolerance, truncation');
await writeFile('src/content/expected.json',JSON.stringify(expected,null,2));
c.closeSync();db.closeSync();
console.log('Verified all exercises, read-only protection, relations and grading.');
