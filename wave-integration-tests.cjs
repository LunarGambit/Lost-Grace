const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
function extract(name){const start=html.indexOf('function '+name+'(');assert.ok(start>=0);let p=html.indexOf('{',start),depth=1,i=p+1,quote=null,escape=false;for(;depth&&i<html.length;i++){const c=html[i];if(quote){if(escape)escape=false;else if(c==='\\')escape=true;else if(c===quote)quote=null;continue;}if(c==='"'||c==="'"||c==='`'){quote=c;continue;}if(c==='{')depth++;if(c==='}')depth--;}return html.slice(start,i);}
(async()=>{
 const {waveRules}=await import('./wave-system.js');
 const calls=[],context={waveRun:{wave:1},waveRules,resumeWaveEvent:()=>calls.push('resume'),chestCometIndex:0,chestCometLocations:Array.from({length:150},(_,i)=>({x:i,z:0})),generatedWorld:{heightAt:()=>0},THREE:{Vector3:class{constructor(x,y,z){Object.assign(this,{x,y,z});}}},spawnScheduledChest:p=>calls.push(p),reforgePending:0,blacksmithVisitsPending:0,announceEvent:()=>{}};
 vm.createContext(context);vm.runInContext(extract('beginWaveServices'),context);
 for(let w=1;w<=70;w++){context.waveRun.wave=w;vm.runInContext('beginWaveServices()',context);assert.equal(context.chestCometIndex,Math.min(w*5,150));}
 assert.equal(context.reforgePending,10);assert.equal(context.blacksmithVisitsPending,10);assert.equal(calls.filter(x=>typeof x==='object').length,150);
 const inventory=[null],ui={textContent:''};Object.assign(context,{gearCatalog:{a:{name:'Test',rarity:'common'}},autoScrapRarities:new Set(),scrapValues:{common:5},scrap:0,inventory,makePrototypeItem:id=>id+'-instance',$:()=>ui});
 vm.runInContext(extract('giveWaveEquipment'),context);vm.runInContext("giveWaveEquipment('a',0,1)",context);assert.equal(inventory[0],'a-instance');
 context.autoScrapRarities.add('common');vm.runInContext("giveWaveEquipment('a',0,1)",context);assert.equal(context.scrap,5);
 console.log('Actual game adapters: all 70 chest/service schedules, inventory delivery, and auto-scrap passed.');
})().catch(e=>{console.error(e);process.exitCode=1});
