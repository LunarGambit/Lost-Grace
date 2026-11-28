const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
class V{constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z})}clone(){return new V(this.x,this.y,this.z)}sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this}dot(v){return this.x*v.x+this.y*v.y+this.z*v.z}addScaledVector(v,s){this.x+=v.x*s;this.y+=v.y*s;this.z+=v.z*s;return this}lengthSq(){return this.dot(this)}copy(v){Object.assign(this,v);return this}}
const enemy=(x,z)=>({hp:1000,outer:{position:new V(x,0,z)}});
const targets=[enemy(0,1),enemy(0,11.9),enemy(4.1,6),enemy(0,12.1),enemy(0,-1)];let healed=0;
const wave={origin:new V(),dir:new V(0,0,1),range:12,width:8,distance:0,hits:new Map(),member:{},sprite:{position:new V()},zone:{}};
let hourglass=0;
const ctx={wolves:targets,buffs:{attack:0},prototypeCritFactor:()=>1,weaponAttackPower:()=>100,itemDamageMultiplier:()=>1,itemCount:id=>id==='iron-hammer'?1:id==='timeless-hourglass'?hourglass:0,cupMultiplier:()=>1,activePowerup:()=>false,weaponHit:(e,d)=>e.hp-=d,prototypeHealOnHit:()=>healed++,gearStats:()=>({healing:0}),elapsed:0,ironWaves:[wave],scene:{remove(){}},updateIronWaveBatch(){}};
vm.createContext(ctx);vm.runInContext(html.slice(html.indexOf('function applyIronShatterDamage('),html.indexOf('function isPlayerAirborne(')),ctx);
ctx.applyIronShatterDamage(wave);
assert.deepEqual(targets.map(e=>e.hp),[895,895,1000,1000,1000]);assert.equal(wave.distance,0);assert.equal(healed,2);
ctx.tickIronWaves(.1);ctx.tickIronWaves(1);assert.deepEqual(targets.map(e=>e.hp),[895,895,1000,1000,1000]);
hourglass=1;wave.hits.clear();ctx.applyIronShatterDamage(wave);assert.equal(targets[1].hp,685);
const attack=html.slice(html.indexOf('function attackIronWave('),html.indexOf('function applyIronShatterDamage('));assert.match(attack,/applyIronShatterDamage\(wave\)/);
console.log('Iron Hammer immediate full-area hit, bounds, no delayed duplicate damage, and Hourglass checks passed.');
