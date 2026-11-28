const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
(async()=>{
 const {crossStatBonuses}=await import('./item-data.js');
 const stats={attack:100,magicAttack:200,defense:100,magicDefense:100,maxHp:1000,evade:10,block:5,projectiles:10};
 assert.equal(crossStatBonuses(stats,{'supressing-fire':1}).evade,15);
 assert.equal(crossStatBonuses({...stats,projectiles:100},{'supressing-fire':1}).evade,35);
 assert.equal(crossStatBonuses(stats,{'iron-defense':1}).block,15);
 assert.equal(crossStatBonuses({...stats,defense:1000},{'iron-defense':1}).block,30);
 assert.equal(crossStatBonuses(stats,{'winged-sandals':1}).attack,100);
 const source=fs.readFileSync('index.html','utf8'),start=source.indexOf('function wingedSandalsDamageMultiplier()'),end=source.indexOf('function itemBlastVisual(',start);
 let owned=true,moving=true,speedBonus=1,base=(50.65/12)*1.25*1.5*1.1;
 const ctx={itemCount:id=>id==='winged-sandals'&&owned?1:0,player:{},movementInput:()=>({lengthSq:()=>moving?1:0}),keys:new Set(),sprintExhausted:false,stamina:10,partyMoveSpeed:sprint=>base*speedBonus*(sprint?2:1),equippedBloodMagic:()=>({dealt:0})};vm.createContext(ctx);vm.runInContext(source.slice(start,end),ctx);
 assert.equal(ctx.unstoppableDamageMultiplier(),1);speedBonus=1.2;assert.ok(Math.abs(ctx.unstoppableDamageMultiplier()-1.1)<1e-10);
 ctx.keys.add('shiftleft');assert.ok(Math.abs(ctx.unstoppableDamageMultiplier()-1.7)<1e-10);
 moving=false;assert.ok(Math.abs(ctx.unstoppableDamageMultiplier()-1.1)<1e-10);
 owned=false;assert.equal(ctx.unstoppableDamageMultiplier(),1);
 console.log('Cross-stat caps and Winged Sandals damage/sprinting checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1});
