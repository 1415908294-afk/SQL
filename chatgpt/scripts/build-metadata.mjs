import {readFile,writeFile,mkdir} from 'node:fs/promises';
import ts from 'typescript';
const code=ts.transpileModule(await readFile('src/content/catalog.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {exercises}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
await mkdir('server',{recursive:true});await writeFile('server/catalog.json',JSON.stringify(exercises));
