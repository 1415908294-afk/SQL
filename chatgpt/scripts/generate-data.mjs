import { DuckDBInstance } from '@duckdb/node-api';
import {mkdir,rm,writeFile} from 'node:fs/promises';
await mkdir('public/data',{recursive:true});
await rm('public/data/voca.duckdb',{force:true});
const db=await DuckDBInstance.create('public/data/voca.duckdb');
const c=await db.connect();
await c.run(`
CREATE TABLE channels(channel_id INTEGER PRIMARY KEY, channel_name VARCHAR, channel_type VARCHAR);
INSERT INTO channels VALUES (1,'小红书','内容'),(2,'自然搜索','自然'),(3,'抖音','广告'),(4,'好友推荐','裂变');
CREATE TABLE users AS SELECT i::INTEGER user_id, '学员' || lpad(i::VARCHAR,3,'0') user_name,
 DATE '2027-01-01' + ((i-1)%28)::INTEGER signup_date,
 ((i-1)%4+1)::INTEGER channel_id,
 CASE WHEN i%3=0 THEN '职场英语' WHEN i%3=1 THEN '日常交流' ELSE '考试提升' END learning_goal
 FROM range(1,121) t(i);
CREATE TABLE signup_events AS SELECT user_id event_id,user_id,signup_date event_date,'signup' event_name FROM users;
CREATE TABLE ai_conversations AS SELECT (u.user_id*10+n)::INTEGER conversation_id,u.user_id,
 u.signup_date+n::INTEGER conversation_date,(60+(u.user_id*17+n*31)%540)::INTEGER duration_seconds,
 (3+(u.user_id+n)%20)::INTEGER message_count,
 CASE WHEN n%2=0 THEN '情景对话' ELSE '自由对话' END conversation_mode
 FROM users u CROSS JOIN range(0,8) t(n) WHERE (u.user_id+n)%3<>0 AND (n=0 OR u.user_id%5<>0);
CREATE TABLE orders AS SELECT user_id::INTEGER order_id,user_id,signup_date+2 paid_date,
 CASE WHEN user_id%2=0 THEN 39.0 ELSE 99.0 END::DECIMAL(10,2) amount,
 CASE WHEN user_id%7=0 THEN 'refunded' ELSE 'paid' END status
 FROM users WHERE user_id%4=0 OR user_id%9=0;
CREATE TABLE activity_events AS SELECT row_number() OVER ()::INTEGER event_id,user_id,conversation_date event_date,'ai_conversation' event_name FROM ai_conversations
 UNION ALL SELECT 10000+user_id,user_id,signup_date,'app_open' FROM users
 UNION ALL SELECT 20000+user_id,user_id,signup_date+7,'lesson_view' FROM users WHERE user_id%4=0;
CHECKPOINT;`);
const tables=['users','signup_events','ai_conversations','channels','orders','activity_events'];
const counts={};
for(const table of tables){const r=await c.runAndReadAll(`SELECT count(*)::INTEGER n FROM ${table}`);counts[table]=r.getRowObjects()[0].n;}
c.closeSync(); db.closeSync();
await writeFile('public/data/manifest.json',JSON.stringify({label:'Voca Demo 全部为模拟数据，不来自任何真实产品后台',version:1,dateRange:['2027-01-01','2027-02-04'],counts},null,2));
console.log(counts);
