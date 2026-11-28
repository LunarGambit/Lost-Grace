import assert from 'node:assert/strict';
import {waveRules,waveRewards,bloodDiamondBonus,WaveRun} from './wave-system.js';
assert.deepEqual([waveRules(1).quota,waveRules(1).bossHp,waveRules(1).grace,waveRules(1).gold],[50,150,100,50]);
assert.equal(waveRules(2).hpMultiplier,1.05);
assert.equal(waveRules(70).speedMultiplier,1.0345);
assert.equal(waveRules(70).bossHp,95000000);
assert.equal(waveRules(70).gold,1400);
assert.equal(waveRules(35).equipment,8);
assert.equal(waveRules(56).minRarity,3);
assert.equal(waveRules(29).maxRarity,4);
assert.equal(bloodDiamondBonus(1,6000),.1);
assert.equal(bloodDiamondBonus(5,5999),.45);
assert.equal(waveRewards(5,{coinpurse:10,bloodDiamond:5,damageTaken:6000}).gold,200);
const run=new WaveRun();
assert.equal(run.tick(1,{population:750}),0);
assert.equal(run.tick(.5,{population:749}),1);
assert.equal(run.tick(.5,{population:749}),1);
for(let i=0;i<49;i++)assert.equal(run.kill(),null);
assert.equal(run.kill({support:true}),null);
assert.equal(run.kill(),'boss');
assert.equal(run.kill({boss:true}),'complete');
const stopped=run.combatTime;
run.tick(100);assert.equal(run.combatTime,stopped);
run.closeRewards();run.tick(20,{menuOpen:true});assert.equal(run.preparation,30);
run.tick(10);assert.equal(run.preparation,20);assert.equal(run.combatTime,stopped);
assert.equal(run.nextWave(),true);run.tick(5);const time=run.combatTime;run.retry();assert.equal(run.combatTime,time);assert.equal(run.cupsSpent,1);
console.log('Wave rules and lifecycle checks passed.');
const {waveRarityWeights,holyLuckMultiplier,rollWaveRarity}=await import('./wave-system.js');
assert.equal(holyLuckMultiplier(1000),2);assert.equal(holyLuckMultiplier(1500),3);
assert.equal(waveRarityWeights(1,1500)[4],0);
assert.equal(waveRarityWeights(29,1000)[4],.1);
assert.ok(Math.abs(waveRarityWeights(29,1500)[4]-.15)<1e-12);
for(let w=1;w<=70;w++)for(const luck of [0,500,1000,1500]){const p=waveRarityWeights(w,luck);assert.ok(Math.abs(p.reduce((a,b)=>a+b,0)-1)<1e-12);assert.ok(p.every(x=>x>=0));}
assert.equal(rollWaveRarity(56,0,()=>0),'mythic');
console.log('Wave rarity restrictions and Luck checks passed.');


for(let wave=1;wave<=70;wave++){const rules=waveRules(wave);assert.equal(rules.hpMultiplier,1.05**(wave-1));assert.equal(rules.damageMultiplier,1.002**(wave-1));assert.equal(rules.bossDamageMultiplier,1.25**(wave-1));assert.equal(rules.speedMultiplier,1+.0005*(wave-1));assert.equal(rules.spawnRate,wave*6);assert.equal(rules.cap,750);}

assert.equal(waveRewards(1,{monkeys:5}).gold,63);
assert.equal(waveRewards(1,{monkeys:5,coinpurse:10,bloodDiamond:5,damageTaken:6000}).gold,113);

const expectedGrace=[100, 100, 100, 100, 500, 100, 100, 100, 200, 500, 200, 200, 200, 200, 500, 200, 200, 200, 300, 500, 300, 300, 300, 300, 500, 300, 300, 300, 400, 1000, 400, 400, 400, 400, 1000, 400, 400, 400, 500, 1000, 500, 500, 500, 500, 1000, 500, 500, 500, 600, 600, 1000, 600, 600, 600, 1000, 600, 600, 600, 700, 1000, 700, 700, 700, 700, 1000, 700, 700, 700, 700, 1000];
assert.deepEqual(Array.from({length:70},(_,i)=>waveRules(i+1).grace),expectedGrace);
assert.equal(waveRewards(5,{centeredSelf:2,graceAffix:5}).grace,575);

for(const wave of [1,5,10,70]){
 const spawning=new WaveRun();spawning.wave=wave;
 assert.equal(spawning.tick(.5),wave*3);
 spawning.phase='boss';assert.equal(spawning.tick(.5),wave*3);
 assert.equal(spawning.tick(.5,{population:749}),1);
 assert.equal(spawning.spawnCredit,0);
 assert.equal(spawning.tick(.5,{population:750}),0);
}

assert.deepEqual(waveRewards(1,{spiritualAlignment:1}),{grace:150,scrap:75,gold:75});
assert.deepEqual(waveRewards(1,{spiritualAlignment:2}),waveRewards(1,{spiritualAlignment:1}));
assert.equal(waveRewards(5,{spiritualAlignment:1,coinpurse:10,bloodDiamond:5,damageTaken:6000}).gold,250);

assert.deepEqual(Array.from({length:70},(_,i)=>waveRules(i+1).bossHp),[150, 225, 300, 450, 600, 750, 900, 1050, 1200, 5000, 7500, 9000, 12000, 15000, 18000, 21000, 24000, 27000, 30000, 33000, 45000, 52500, 60000, 67500, 75000, 82500, 90000, 97500, 105000, 112500, 150000, 225000, 300000, 375000, 450000, 525000, 600000, 675000, 750000, 825000, 1500000, 1950000, 2400000, 2850000, 3300000, 3750000, 4500000, 5250000, 6000000, 6750000, 12000000, 13500000, 15000000, 16500000, 18000000, 19500000, 21000000, 22500000, 24000000, 25500000, 30000000, 45000000, 50000000, 65000000, 70000000, 75000000, 80000000, 85000000, 90000000, 95000000]);
