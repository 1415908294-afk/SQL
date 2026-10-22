// Optional Cloudflare Pages adapter. Sites static deployment uses local hints;
// deploy this adapter with the source when enabling a hosted DeepSeek proxy.
import {handleTutor} from '../../server/tutor.mjs';
export const onRequest = ({request,env}) => handleTutor(request,env);
