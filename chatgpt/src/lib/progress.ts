type Progress={completed:number[];lessons:number[];days:Record<string,number>;mistakes:number[]};
const blank:Progress={completed:[],lessons:[],days:{},mistakes:[]};
export function loadProgress():Progress{try{const v=JSON.parse(localStorage.getItem('sql-growth-lab:v1')||'null');return v&&Array.isArray(v.completed)&&Array.isArray(v.lessons)&&v.days&&Array.isArray(v.mistakes)?v:structuredClone(blank);}catch{return structuredClone(blank);}}
export function saveProgress(value:Progress){try{localStorage.setItem('sql-growth-lab:v1',JSON.stringify(value));return true;}catch{return false;}}
export function today(){return new Date().toLocaleDateString('sv-SE');}
export function download(name:string,text:string,type='text/plain'){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function csvValue(value:unknown){let s=value==null?'':String(value);if(/^[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
