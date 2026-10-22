// Offsets from DuckDB's tokenizer are UTF-8 byte offsets, not JS string indices.
export function safeQueryBody(sql:string,tokens:{offsets:number[];types:number[]}){
 const bytes=new TextEncoder().encode(sql),decode=new TextDecoder();
 if(!tokens.offsets.length)throw new Error('请先输入一条 SELECT 或 WITH 查询。');
 const first=decode.decode(bytes.slice(tokens.offsets[0],tokens.offsets[1]??bytes.length)).trim().toUpperCase();
 if(!/^(SELECT|WITH)\b/.test(first))throw new Error('每次只能运行一条 SELECT 或 WITH 查询。');
 let end=bytes.length;
 tokens.offsets.forEach((offset,i)=>{
  // A semicolon inside a quoted string is STRING_CONSTANT, not OPERATOR.
  if(tokens.types[i]===3&&bytes[offset]===59){
   if(i!==tokens.offsets.length-1)throw new Error('每次只能运行一条 SELECT 或 WITH 查询。');
   end=offset;
  }
 });
 return decode.decode(bytes.slice(0,end));
}
