import * as duckdb from '@duckdb/duckdb-wasm';
import {safeQueryBody} from './queryPolicy';
export type Result={columns:string[];rows:(string|number|boolean|null)[][];elapsed:number;truncated:boolean};
let db:duckdb.AsyncDuckDB|undefined;
let connection:duckdb.AsyncDuckDBConnection|undefined;
let starting:Promise<void>|undefined;
let generation=0;
export async function initialize(){
 if(connection) return;
 if(starting) return starting;
 const current=generation;
 starting=(async()=>{
  const bundle=await duckdb.selectBundle({mvp:{mainModule:'/duckdb/duckdb-mvp.wasm',mainWorker:'/duckdb/duckdb-browser-mvp.worker.js'},eh:{mainModule:'/duckdb/duckdb-eh.wasm',mainWorker:'/duckdb/duckdb-browser-eh.worker.js'}});
  const worker=new Worker(bundle.mainWorker!);
  const instance=new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(duckdb.LogLevel.ERROR),worker);
  db=instance;
  const packed=await fetch(bundle.mainModule+'.gz');
  if(!packed.ok)throw new Error('SQL引擎资源下载失败，请检查网络后重试。');
  const buffer=new Uint8Array(await packed.arrayBuffer());
  const wasm=buffer[0]===31&&buffer[1]===139?await new Response(new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():buffer;
  const moduleURL=URL.createObjectURL(new Blob([wasm],{type:'application/wasm'}));
  try{await instance.instantiate(moduleURL);}finally{URL.revokeObjectURL(moduleURL);}
  const response=await fetch('/data/voca.duckdb');
  if(!response.ok) throw new Error('模拟数据库加载失败，请检查网络后重试。');
  await instance.registerFileBuffer('voca.duckdb',new Uint8Array(await response.arrayBuffer()));
  await instance.open({path:'voca.duckdb',accessMode:duckdb.DuckDBAccessMode.READ_ONLY,query:{castBigIntToDouble:true,castDecimalToDouble:true}});
  const conn=await instance.connect();
  await conn.query("SET enable_external_access=false;");
  await conn.query("SET autoinstall_known_extensions=false; SET autoload_known_extensions=false;");
  await conn.query("SET lock_configuration=true;");
  if(current!==generation){await instance.terminate();throw new Error('查询已取消');}
  connection=conn;
 })().catch(async error=>{connection=undefined;await db?.terminate();db=undefined;throw error;}).finally(()=>{starting=undefined;});
 return starting;
}
export async function resetEngine(){generation++;connection=undefined;const old=db;db=undefined;starting=undefined;await old?.terminate();}
export async function runSQL(sql:string):Promise<Result>{
 await initialize();
 const conn=connection!;
 const start=performance.now();
 const work=async()=>{
  // Native tokenizer prevents stacked statements; the parser enforces a SELECT
  // relation through the subquery context. READ_ONLY remains the write boundary.
  const clean=safeQueryBody(sql,await db!.tokenize(sql));
  const statement=await conn.prepare(`SELECT * FROM (${clean}\n) AS lab_result LIMIT 1001`);
  let table;
  try{table=await statement.query();}finally{await statement.close();}
  const columns=table.schema.fields.map(f=>f.name);
  const rows=table.toArray().slice(0,1000).map(r=>columns.map((column,index)=>{
   const v=r[column];
   if(v!=null&&/^Date/.test(table.schema.fields[index].type.toString()))return new Date(Number(v)).toISOString().slice(0,10);
   return v==null?null:typeof v==='bigint'?String(v):typeof v==='number'||typeof v==='boolean'?v:String(v);
  }));
  return {columns,rows,elapsed:Math.round(performance.now()-start),truncated:table.numRows>1000};
 };
 let timer:ReturnType<typeof setTimeout>;
 try{return await Promise.race([work(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>{void resetEngine();reject(new Error('查询超过15秒，已重启执行引擎。请缩小查询范围后重试。'));},15000);})]);}finally{clearTimeout(timer!);}
}
export function explainError(error:unknown){
 const raw=error instanceof Error?error.message:String(error);
 let help='请检查 SQL 拼写、字段名和括号；可以展开提示，逐步缩小查询范围。';
 if(/column.*not found|referenced column|Binder Error/i.test(raw))help='字段找不到或分组不完整。请在数据字典核对字段名；聚合时，非聚合字段应加入 GROUP BY。';
 if(/table.*not exist|Catalog Error/i.test(raw))help='找不到数据表。请核对 FROM 后的表名；例如用户表是 users。';
 if(/syntax|Parser|解析/i.test(raw))help='语法没有被识别。检查英文逗号、单引号、关键字顺序和成对括号。';
 if(/read.only|READ_ONLY|SELECT 或 WITH|Cannot execute statement/i.test(raw))help='练习数据库是只读的。请使用单条 SELECT 或 WITH 查询分析数据。';
 if(/external|Permission|disabled/i.test(raw))help='学习环境已关闭外部文件、网络数据与扩展访问，请只查询内置模拟表。';
 return {help,raw};
}
