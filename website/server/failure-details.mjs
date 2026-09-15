// Deliberately exclude upstream reason, rejected writing, labels and identity.
const CATEGORIES = Object.freeze({violence:'Violence',violence_against_women:'Violence against women',politics:'Politics',real_people:'Real people and leaders',child_sexual_content:'Child sexual content',dangerous_acts:'Dangerous acts',heavy_obscenity:'Heavy obscenity',hate_and_slurs:'Hate speech and slurs'});
const get=(value,key)=>value&&typeof value==='object'&&!Array.isArray(value)?Object.getOwnPropertyDescriptor(value,key)?.value:undefined;
const count=value=>Number.isSafeInteger(value)&&value>=0&&value<=1000000?value:null;
export function contentSafety(value){
  if(!value||typeof value!=='object'||Array.isArray(value))return null;
  const failure=get(value,'instrument_failure')??get(value,'instrumentFailure');
  const entries=get(value,'refused_categories')??get(value,'categories');
  const ids=Array.isArray(entries)?[...new Set(entries.slice(0,32).map(entry=>get(entry,'id')).filter(id=>typeof id==='string'&&Object.hasOwn(CATEGORIES,id)))]:[];
  return {instrumentFailure:typeof failure==='boolean'?failure:null,categories:failure===true?[]:ids.map(id=>({id,label:CATEGORIES[id]}))};
}
export function serviceQuota(value){
  if(!value||typeof value!=='object'||Array.isArray(value))return null;
  const result={scope:'music-service',daily:count(get(value,'daily_quota')??get(value,'daily')),used:count(get(value,'used_today')??get(value,'used')),remaining:count(get(value,'remaining_today')??get(value,'remaining'))};
  return [result.daily,result.used,result.remaining].some(v=>v!==null)?result:null;
}
