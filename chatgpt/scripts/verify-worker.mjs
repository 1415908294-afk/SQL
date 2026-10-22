import assert from 'node:assert/strict';
import worker from '../dist/server/index.js';
let r=await worker.fetch(new Request('https://example.test/api/health'),{DEEPSEEK_API_KEY:'test-key-not-real'});
assert.equal(r.status,200);assert.deepEqual(await r.json(),{service:'sql-growth-lab',tutorConfigured:true});
r=await worker.fetch(new Request('https://example.test/api/tutor',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://example.test'},body:JSON.stringify({mode:'hint',exerciseId:1,step:0})}),{});assert.equal(r.status,200);assert.equal((await r.json()).source,'local');
r=await worker.fetch(new Request('https://example.test/api/no-such-route'),{});assert.equal(r.status,404);
let served=false;r=await worker.fetch(new Request('https://example.test/'),{ASSETS:{fetch:async()=>{served=true;return new Response('frontend');}}});assert.ok(served);assert.equal(await r.text(),'frontend');
console.log('PASS built Worker: health, API route, missing route, ASSETS binding.');
