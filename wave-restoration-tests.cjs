const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/index.html','utf8');
function fn(name){const start=source.indexOf('function '+name+'(');assert.ok(start>=0);let i=source.indexOf('{',start)+1,n=1,q=null,esc=false;for(;n;i++){const c=source[i];if(q){if(esc)esc=false;else if(c==='\\')esc=true;else if(c===q)q=null;}else if(['"',"'",'`'].includes(c))q=c;else if(c==='{')n++;else if(c==='}')n--;}return source.slice(start,i);}
class Vector{constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z});}clone(){return new Vector(this.x,this.y,this.z)}copy(v){Object.assign(this,v);return this}}
const outer=()=>({isObject3D:true,position:new Vector(2,3,4),visible:true,parent:null});
(async()=>{const {WaveCheckpoint}=await import('./wave-checkpoint.js'),{WaveRun}=await import('./wave-system.js');
 const nodes=new Map(),noop=()=>{},scene={add(o){o.parent=this;},remove(o){o.parent=null;}};
 const c={captureWaveServices:()=>({}),restoreWaveServices:()=>{},console,structuredClone,waveMode:true,cupCheckpoint:new WaveCheckpoint(),waveRun:new WaveRun(),cupWorld:null,player:{outer:outer(),visual:{visible:true},hp:100,maxHp:100,gearHp:0},scene,THREE:{Matrix4:class{}},druidOriginal:null,bossEventMembers:new Set(),meleeBubbleProgress:new Map(),gearStatsCache:{},inventory:['sword'],runeInventory:[null],itemCounts:{'golden-cup':2},itemStartKills:{},gearCatalog:{sword:{affixes:{attack:1}}},loadout:{ranged:{weapon:'sword'}},collectibleCounts:{snake:0},abilityClock:{activeUntil:0},powerupUntil:{},enchantRescue:{},ranks:{},activeMapEvent:null,activeComet:null,removeBossBar:noop,updateXP:noop,updateStamina:noop,renderHealth:noop,renderItemInventory:noop,updateMapProgress:noop,updateWaveHUD:noop,$:id=>{if(!nodes.has(id))nodes.set(id,{style:{}});return nodes.get(id);}};
 for(const name of ['purchaseChests','chests','bonePiles','collectibleDrops','calcifiedGrace','powerupDrops','drops','itemDrops','obelisks','wolves','rocks','bowShots','swipes','ironWaves','radiantWaves','bossFlames'])c[name]=[];
 for(const name of [...fn('captureWaveCheckpoint').match(/scalars:\{([^}]+)\}/)[1].split(',')])c[name]=0;
 c.gold=100;c.xp=50;c.elapsed=20;c.waveRun.combatTime=20;
 const chest={outer:outer(),opened:false},bone={outer:outer()},collectible={outer:outer(),key:'snake'};c.purchaseChests.push(chest);c.bonePiles.push(bone);c.collectibleDrops.push(collectible);
 vm.createContext(c);for(const name of ['snapshotEntry','restoreRecord','captureWaveCheckpoint','restoreCupState'])vm.runInContext(fn(name),c);
 vm.runInContext('captureWaveCheckpoint()',c);
 chest.opened=true;chest.items=['new-offer'];c.bonePiles.length=0;c.collectibleDrops.length=0;c.collectibleCounts.snake=1;c.gold=999;c.gearCatalog.sword.affixes.attack=5;c.itemCounts['golden-cup']=5;c.waveRun.combatTime=80;c.waveRun.phase='boss';c.wolves.push({outer:outer()});
 c.saved=c.cupCheckpoint.consume();vm.runInContext('restoreCupState(saved)',c);
 assert.equal(c.gold,100);assert.equal(c.elapsed,20);assert.equal(c.waveRun.combatTime,80);assert.equal(c.waveRun.phase,'combat');assert.equal(c.itemCounts['golden-cup'],1);assert.equal(c.gearCatalog.sword.affixes.attack,1);assert.equal(c.collectibleCounts.snake,0);assert.equal(c.bonePiles[0],bone);assert.equal(c.collectibleDrops[0],collectible);assert.equal(chest.opened,false);assert.equal(chest.items,undefined);assert.equal(c.wolves.length,0);assert.equal(c.player.cupPowerUntil,80);
 c.saved=c.cupCheckpoint.consume();vm.runInContext('restoreCupState(saved)',c);assert.equal(c.itemCounts['golden-cup'],0);assert.equal(c.cupCheckpoint.consume(),null);
 const frames=[],elements=[];c.selectedClass=()=>'Druid';c.createDeathPreview=()=>()=>{};c.document={createElement:tag=>{const e={tag,style:{},setAttribute(){},append(){},remove(){this.removed=true;}};elements.push(e);return e;},body:{append(){}}};c.requestAnimationFrame=f=>frames.push(f);c.keys=new Set();c.releaseGamePointer=noop;c.requestGamePointer=noop;c.cupRestoring=false;c.cupCheckpoint.capture({items:{'golden-cup':1}});
 vm.runInContext(fn('beginCupRestore'),c);let restoredCalled=false;c.restoreCupState=()=>{restoredCalled=true;};
 assert.equal(vm.runInContext('beginCupRestore()',c),true);const button=elements.find(e=>e.tag==='button');assert.equal(button.disabled,true);assert.equal(restoredCalled,false);
 frames.shift()();assert.equal(button.disabled,true);frames.shift()();assert.equal(restoredCalled,true);assert.equal(button.disabled,false);assert.equal(button.style.opacity,'1');assert.equal(c.paused,true);button.onclick();assert.equal(c.paused,false);assert.equal(c.cupRestoring,false);
 console.log('Respawn screen passed: disabled and dim until restoration completes; simulation resumes only on click.');
 console.log('Actual restoration adapter passed: purchases, pickups, gear, currencies, retained combat time, enemy cleanup, repeat consumption.');
})().catch(e=>{console.error(e);process.exitCode=1});
