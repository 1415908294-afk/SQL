import {rm,access} from 'node:fs/promises';
import path from 'node:path';
const project=path.resolve('.'),target=path.resolve(project,'dist');
await access(path.join(project,'package.json'));
if(path.dirname(target)!==project||path.basename(target)!=='dist')throw new Error('构建输出路径校验失败');
await rm(target,{recursive:true,force:true});
