import {handleTutor} from '../server/tutor.mjs';

export default {
 async fetch(request,env){
  const path=new URL(request.url).pathname;
  if(path==='/api/health')return Response.json({service:'sql-growth-lab',tutorConfigured:!!env.DEEPSEEK_API_KEY},{headers:{'Cache-Control':'no-store'}});
  if(path==='/api/tutor')return handleTutor(request,env);
  if(path.startsWith('/api/'))return Response.json({error:'接口不存在'},{status:404});
  return env.ASSETS.fetch(request);
 }
};
