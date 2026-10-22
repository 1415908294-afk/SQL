import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {handleTutor} from './tutor.mjs';
const root=path.resolve('dist');
const mime={'.html':'text/html;charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.gz':'application/gzip','.duckdb':'application/octet-stream','.svg':'image/svg+xml','.ttf':'font/ttf'};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://127.0.0.1:8787');
  if(url.pathname==='/api/tutor'){
   const chunks=[];let length=0;for await(const chunk of req){length+=chunk.length;if(length>30000){res.writeHead(413);res.end('请求过大');return;}chunks.push(chunk);}
   const request=new Request(url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})});
   const response=await handleTutor(request,process.env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
  }
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
  let target=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  try{if(!(await stat(target)).isFile())throw Error();}catch{res.writeHead(404);res.end('文件不存在');return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:await readFile(target));
 }catch{res.writeHead(500);res.end('本地服务异常');}
});
server.listen(8787,'127.0.0.1',()=>console.log('SQL Growth Lab http://127.0.0.1:8787 · API密钥仅由后端读取'));
