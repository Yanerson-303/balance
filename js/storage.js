"use strict";
Nexo.store = (() => {
 const KEY='nexovida_data_v1';
 const defaults = () => ({version:1,settings:{name:'',currency:'COP',monthlyBudget:0,monthlySalary:0,savingsGoal:0,payday:'quincenal',calorieGoal:2000,proteinGoal:120,carbGoal:240,fatGoal:65,waterGoal:2000,weightGoal:0,theme:'light'},transactions:[],tasks:[],foods:[],meals:[],water:[],weights:[],notes:[]});
 const safeList=['transactions','tasks','foods','meals','water','weights','notes'];
 const normalize = raw => {
    const base=defaults();
    if(!raw||typeof raw!=='object'||Array.isArray(raw))return base;
    base.settings={...base.settings,...(raw.settings&&typeof raw.settings==='object'&&!Array.isArray(raw.settings)?raw.settings:{})};
    for(const key of safeList)base[key]=Array.isArray(raw[key])?raw[key].filter(x=>x&&typeof x==='object'&&typeof x.id==='string'&&x.id.length<120).slice(0,30000):[];
    return base;
 };
 let data;
 try {data=normalize(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{data=defaults();}
 function save(){
   try {localStorage.setItem(KEY,JSON.stringify(data));return true;}
   catch(err){Nexo.toast?.('No se pudo guardar. Revisa el espacio disponible en el navegador.','error');console.error(err);return false;}
 }
 function commit(){save();Nexo.render?.();}
 function add(section,obj){obj.id=obj.id||Nexo.util.uid();obj.createdAt=obj.createdAt||new Date().toISOString();data[section].push(obj);commit();return obj.id;}
 function update(section,id,values){const i=data[section].findIndex(x=>x.id===id);if(i>=0){data[section][i]={...data[section][i],...values};commit();return true;}return false;}
 function remove(section,id){const before=data[section].length;data[section]=data[section].filter(x=>x.id!==id);if(before!==data[section].length){commit();return true;}return false;}
 function exportBackup(){const d=new Date(),stamp=d.toISOString().slice(0,10);Nexo.util.download(`nexo-vida-respaldo-${stamp}.json`,JSON.stringify({...data,exportedAt:d.toISOString()},null,2),'application/json;charset=utf-8');}
 function importBackup(raw,mode){
    if(!raw||typeof raw!=='object'||raw.version!==1||!Array.isArray(raw.transactions)||!Array.isArray(raw.tasks)||!Array.isArray(raw.notes))throw new Error('El archivo no es un respaldo válido de Nexo Vida versión 1.');
    const fresh=normalize(raw);
    if(mode==='replace')data=fresh;
    else {for(const k of safeList){const m=new Map(data[k].map(x=>[x.id,x]));for(const x of fresh[k])m.set(x.id,x);data[k]=[...m.values()];}}
    save();Nexo.render?.();return true;
 }
 function saveSettings(values){data.settings={...data.settings,...values};try{document.cookie=`nexo_currency=${encodeURIComponent(data.settings.currency)};max-age=31536000;SameSite=Lax;path=/`;}catch{}commit();}
 return {get data(){return data;},save,commit,add,update,remove,exportBackup,importBackup,saveSettings,KEY};
})();
