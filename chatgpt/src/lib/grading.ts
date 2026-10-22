import type {Result} from './engine';
export function compareResults(actual:Result,expected:Result,ordered=false){
 if(actual.rows.some(row=>row.some(v=>typeof v==='number'&&!Number.isFinite(v))))return {pass:false,message:'结果包含 NaN 或 Infinity，请检查零分母并使用 NULLIF 处理。'};
 if(actual.truncated)return {pass:false,message:'结果超过1000行，无法完整判题。请按题意筛选或聚合。'};
 if(actual.columns.length!==expected.columns.length)return {pass:false,message:`需要 ${expected.columns.length} 列，你返回了 ${actual.columns.length} 列。请检查 SELECT 字段。`};
 if(actual.columns.some((c,i)=>c.toLowerCase()!==expected.columns[i].toLowerCase()))return {pass:false,message:`列名或顺序不符合要求。预期：${expected.columns.join('、')}。请使用题目指定的别名。`};
 if(actual.rows.length!==expected.rows.length)return {pass:false,message:`预期 ${expected.rows.length} 行，实际 ${actual.rows.length} 行。检查筛选条件、关联与去重。`};
 const key=(row:Result['rows'][number])=>JSON.stringify(row.map(v=>typeof v==='number'?Math.round(v*1e6)/1e6:v));
 const a=actual.rows.map(key),b=expected.rows.map(key);
 if(!ordered){a.sort();b.sort();}
 const pass=a.every((r,i)=>r===b[i]);
 return {pass,message:pass?'结果正确！你已完成这道练习。':`结果值${ordered?'或排序':''}与标准结果不同。检查指标口径、日期边界和聚合计算。`};
}
