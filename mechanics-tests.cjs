const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const root = __dirname;
const html = fs.readFileSync(root + '/index.html', 'utf8');
const between = (start,end) => {
  const a=html.indexOf(start),b=html.indexOf(end,a+start.length);
  assert.ok(a>=0&&b>a,`Cannot find ${start}`);
  return html.slice(a,b);
};
const loadModule = async path => import('data:text/javascript;base64,'+fs.readFileSync(path).toString('base64'));
(async()=>{
  const {classes,classStats,gearValues,rarityBonus}=await loadModule(root+'/mechanics-data.js');
  const {itemChart,newItems,chestWeights,convertAttackStats}=await loadModule(root+'/item-data.js');
  const {ordinaryEnemyHealth,enemyDamageMultiplier,enemySpeedMultiplier}=await loadModule(root+'/enemy-scaling.js');
  for(const [minutes,hp] of [[0,12],[5,25.2],[10,45.6],[20,108],[30,199.2]])assert.ok(Math.abs(ordinaryEnemyHealth(minutes*60)-hp)<1e-8);
  assert.equal(enemyDamageMultiplier(300),1);assert.equal(enemyDamageMultiplier(360),1.15);assert.equal(enemyDamageMultiplier(330),1.075);
  assert.equal(enemySpeedMultiplier(0),1);assert.equal(enemySpeedMultiplier(3600),1.3);assert.equal(enemySpeedMultiplier(7200),1.3);
  for(let t=1;t<=7200;t+=37){assert.ok(ordinaryEnemyHealth(t)>ordinaryEnemyHealth(t-1));assert.ok(ordinaryEnemyHealth(t)-ordinaryEnemyHealth(t-1)<1);assert.ok(enemySpeedMultiplier(t)>=enemySpeedMultiplier(t-1))}
  let attachments=fs.readFileSync(root+'/equipment-attachments.js','utf8')
    .replace("import * as THREE from 'three';",'const THREE={};')
    .replace("import {loadStaticModel} from './new-model-loader.js';",'const loadStaticModel=()=>{};');
  const {equipment,compatibilityMessage}=await import('data:text/javascript;base64,'+Buffer.from(attachments).toString('base64'));
  const magics=['SpiritFocus','WitchesTalisman','SoulStone'];
  for(const offhand of magics){assert.equal(compatibilityMessage('HandAxe',offhand,false).length>0,true);assert.equal(compatibilityMessage('HandAxe',offhand,true),'');assert.equal(compatibilityMessage('Wand',offhand,true),'')}
  assert.notEqual(compatibilityMessage('Bow','WoodShield',false),'');
  assert.equal(compatibilityMessage('Bow','Quiver',false),'');
  assert.notEqual(compatibilityMessage('Staff','Quiver',true),'');
  assert.equal(compatibilityMessage('Sling','Pouch',false),'');
  assert.notEqual(compatibilityMessage('BattleAxe','WoodShield',false),'');
  for(const [name,c] of Object.entries(classes)){assert.ok(gearValues[c.starter],name);assert.equal(classStats(name,1).hp,c.base[0]);assert.ok(classStats(name,100).hp>c.base[0])}
  const pickupCtx={playerClassStats:()=>classStats('Ranger',1),prototypeShared:()=>0};vm.createContext(pickupCtx);vm.runInContext(between('function generalPickupRange()', 'function tickLoot('),pickupCtx);
  for(const name of Object.keys(classes)){pickupCtx.playerClassStats=()=>classStats(name,1);const stats=classStats(name,1);assert.equal(pickupCtx.gracePickupRange(),Math.max(stats.meleeRange,stats.rangedRange),name)}
  pickupCtx.playerClassStats=()=>classStats('Ranger',1);pickupCtx.prototypeShared=()=>50;assert.equal(pickupCtx.gracePickupRange(),22.5);assert.equal(pickupCtx.generalPickupRange(),15);
  const combatCtx={Math,elapsed:0,ranks:{stone:0},gearStats:()=>({defense:0,evade:0,block:0}),enchantRescue:{ranged:{immune:0}},enemyDamageMultiplier:()=>1,testInvulnerable:false,activePowerup:()=>false,itemCount:()=>0,enchanted:()=>false,renderHealth(){},livingMembers:()=>[{}]};
  vm.createContext(combatCtx);vm.runInContext('function contactAttack(w,targets){'+between('for(const contact of targets){','}if(dist<=w.reach')+'}}',combatCtx);
  const fighter={alive:true,kind:'ranged',hp:100,outer:{position:{}},visual:{}},contacts=[{member:fighter,position:{x:0,y:0,z:0}}],foe=()=>({outer:{position:{x:0,y:0,z:0}},reach:2,hitHeight:1,hitCooldown:0,damage:20});
  const first=foe(),second=foe();combatCtx.contactAttack(first,contacts);combatCtx.contactAttack(second,contacts);combatCtx.contactAttack(first,contacts);assert.equal(fighter.hp,80);assert.equal(first.hitCooldown,.25);assert.equal(second.hitCooldown,.25);
  assert.deepStrictEqual(chestWeights(0),{white:55,blue:30,purple:10,gold:5});
  const luck=chestWeights(100);assert.ok(Math.abs(luck.white-38.82)<.01);assert.ok(Math.abs(luck.gold-12.5)<.01);
  for(const n of [0,25,100,200,500,1000,2000]){const weights=chestWeights(n);assert.ok(Math.abs(Object.values(weights).reduce((sum,x)=>sum+x,0)-100)<1e-8);assert.ok(Object.values(weights).every(x=>x>=0))}
  assert.deepStrictEqual(chestWeights(2000),chestWeights(1000));
  for(const [id] of newItems){assert.ok(itemChart[id],id);assert.ok(fs.existsSync(root+'/assets/chest-items/'+id+'.png'),id)}
  assert.deepStrictEqual(itemChart['light-conversion'],['purple',6]);assert.deepStrictEqual(itemChart['dark-conversion'],['purple',6]);
  assert.deepStrictEqual(convertAttackStats(100,40,1,0),{attack:50,magicAttack:90});
  assert.deepStrictEqual(convertAttackStats(100,40,0,6),{attack:130,magicAttack:10});
  assert.deepStrictEqual(convertAttackStats(100,40,1,1),{attack:70,magicAttack:70});

  const fitCtx={modelForItem:item=>item.equipModel};vm.createContext(fitCtx);
  vm.runInContext(between('const projectileWeapons=', 'let prototypeItemSerial='),fitCtx);
  for(const weapon of ['Bow','Crossbow','Sling','Javelin','Wand','ThrowingKnives']){
    assert.equal(fitCtx.affixFitsItem('projectiles',{slot:'weapon',equipModel:weapon}),true);
    assert.equal(fitCtx.affixFitsItem('targets',{slot:'weapon',equipModel:weapon}),false);
  }
  for(const weapon of ['Cudgel','HandAxe','BattleAxe','Spear','Hammer','Staff','WalkingStick']){
    assert.equal(fitCtx.affixFitsItem('projectiles',{slot:'weapon',equipModel:weapon}),false);
    assert.equal(fitCtx.affixFitsItem('targets',{slot:'weapon',equipModel:weapon}),weapon==='Cudgel');
  }
  assert.equal(fitCtx.affixFitsItem('projectiles',{slot:'gloves'}),true);
  for(const key of ['hp','attackSpeed','crit','pickupRange','attackRange','stamina','attack','defense','moveSpeed','regen','healing','scrap','buffDuration','graceGain','itemChance'])assert.equal(fitCtx.affixFitsItem(key,{slot:'weapon',equipModel:'Bow'}),true,key);
  for(const key of ['magicAttack','block','evade','jumpControl','staminaDrain','bossQuality','obeliskRange']){
    assert.equal(fitCtx.affixFitsItem(key,{slot:'weapon',equipModel:'Bow'}),false,key);
    assert.equal(fitCtx.affixFitsItem(key,{slot:'head'}),true,key);
  }

  const floorCtx={Math,indexedTerrainHeight:(x,z)=>Math.abs(x)>=2?10:null};vm.createContext(floorCtx);
  vm.runInContext(between('const towerFloorBounds=[];', 'function surfaceHeightBelow(')+'\ntowerFloorBounds.push({min:{x:-10,y:0,z:-10},max:{x:10,y:20,z:10}});',floorCtx);
  assert.equal(floorCtx.towerGapSupport(0,0,10.8,0),10);
  assert.equal(floorCtx.towerGapSupport(15,0,10.8,0),0);
  floorCtx.indexedTerrainHeight=x=>x>=2?10:null;
  assert.equal(floorCtx.towerGapSupport(0,0,10.8,0),0);

  class Vec3{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}clone(){return new Vec3(this.x,this.y,this.z)}length(){return Math.hypot(this.x,this.y,this.z)}multiplyScalar(n){this.x*=n;this.y*=n;this.z*=n;return this}addScaledVector(v,n){this.x+=v.x*n;this.y+=v.y*n;this.z+=v.z*n;return this}}
  class GapRay{set(origin){this.origin=origin}intersectObjects(){return Math.abs(this.origin.z)>=1?[{distance:.5}]:[]}}
  const wallCtx={THREE:{Vector3:Vec3,Raycaster:GapRay},towerWallMeshes:[{}],towerFloorBounds:[{min:{x:-5,y:-5,z:-5},max:{x:5,y:10,z:5}}]};vm.createContext(wallCtx);vm.runInContext(between('const towerWallGapRay=', 'function moveAroundRocks('),wallCtx);
  assert.equal(wallCtx.towerWallGapBlocked(new Vec3(),new Vec3(1,0,0),.65),true);
  assert.equal(wallCtx.towerWallGapBlocked(new Vec3(20,0,0),new Vec3(1,0,0),.65),false);

  const vector=x=>({x,y:0,distanceToSquared(other){return (this.x-other.x)**2},clone(){return {y:0,lerp(){return this}}}});
  const enemies=[1,2,3].map(x=>({hp:100,outer:{position:vector(x)}})),hits=[];
  const meleeCtx={wolves:enemies,Math,nearbyEnemies:()=>enemies,meleeAttackRange:()=>10,modelForItem:()=> 'Cudgel',gearCatalog:{weapon:{}},loadout:{ranged:{weapon:'weapon'}},gearStats:()=>({targets:2,healing:0,attackSpeed:0}),playCombatAnimation(){},prototypeCritFactor:()=>1,buffs:{attack:0,rate:1},weaponAttackPower:()=>10,itemDamageMultiplier:()=>1,cupMultiplier:()=>1,activePowerup:()=>false,itemHit:(enemy,damage)=>{hits.push(enemy);enemy.hp-=damage},prototypeHealOnHit:()=>0,itemCount:()=>0,elapsed:0,addCombatEffect(){},renderHealth(){},weaponRateMultiplier:()=>1,equipment:{Cudgel:{}}};
  vm.createContext(meleeCtx);vm.runInContext(between('function selectCudgelTarget(', 'function meleeAttackRange('),meleeCtx);
  const meleeMember={outer:{position:vector(0)}};meleeCtx.attackSingleMelee(meleeMember,0,false);assert.deepStrictEqual(hits,enemies);
  hits.length=0;enemies.splice(1);meleeMember.meleeCooldown=0;meleeCtx.attackSingleMelee(meleeMember,0,false);assert.equal(hits.length,3);assert.ok(hits.every(e=>e===enemies[0]));

  const glowSource=between('const statusGlowDefs=', 'const ENEMY_WALK_POSES=');
  for(const pair of ["['burnUntil',0xff2929]","['freezeUntil',0x2389ff]","['poisonUntil',0x2de34a]","['shockUntil',0xffdf20]"])assert.ok(glowSource.includes(pair));
  assert.ok(html.includes('updateEnemyBatches();updateEnemyStatusGlows();'));

  const slotCode=between('function prototypeSlotLimit(', 'function eligiblePrototypeAffixes(');
  const slotCtx={equipment,modelForItem:item=>item.equipModel,itemCount:()=>0};vm.createContext(slotCtx);vm.runInContext(slotCode,slotCtx);
  for(const name of ['SpiritFocus','WitchesTalisman','SoulStone','Pouch','Quiver','WoodShield','StoneShield','BoneShield'])for(const [rarity,limit] of Object.entries({common:1,uncommon:2,rare:3,mythic:4,holy:5}))assert.equal(slotCtx.prototypeSlotLimit({slot:'offhand',rarity,equipModel:name}),limit);
  for(const [rarity,limit] of Object.entries({common:2,uncommon:3,rare:4,mythic:5,holy:6}))assert.equal(slotCtx.prototypeSlotLimit({slot:'weapon',rarity,equipModel:'BattleAxe'}),limit);
  for(const weapon of ['Bow','Crossbow'])for(const [rarity,limit] of Object.entries({common:1,uncommon:1,rare:2,mythic:3,holy:3}))assert.equal(slotCtx.prototypeSlotLimit({slot:'weapon',rarity,equipModel:weapon}),limit);
  const innateCtx={equipment,modelForItem:item=>item.equipModel,eligibleInnates:()=>['attack','defense','hp'],Math};
  vm.createContext(innateCtx);vm.runInContext(between('function fillInnates(it){','function makePrototypeItem('),innateCtx);
  const mythic={slot:'weapon',rarity:'mythic',equipModel:'BattleAxe'},holy={slot:'weapon',rarity:'holy',equipModel:'BattleAxe'};
  innateCtx.fillInnates(mythic);innateCtx.fillInnates(holy);assert.equal(mythic.innates.length,2);assert.equal(holy.innates.length,3);
  for(const weapon of ['Bow','Crossbow']){const a={slot:'weapon',rarity:'mythic',equipModel:weapon},b={slot:'weapon',rarity:'holy',equipModel:weapon};innateCtx.fillInnates(a);innateCtx.fillInnates(b);assert.equal(a.innates.length,2);assert.equal(b.innates.length,3)}

  const equipped={equipModel:'Wand',rarity:'common',slot:'weapon',innates:[],affixes:{},magical:true};
  const statsCtx={gearStatsCache:{},playerClassStats:()=>classStats('Witch',1),loadout:{ranged:{weapon:'wand'}},gearCatalog:{wand:equipped},rarityTiers:[{id:'common'}],rarityBonus,gearValues,convertAttackStats,modelForItem:item=>item?.equipModel||null,prototypeInnateDefs:{},prototypeRollDefs:{},namedArmorEffects:[],itemCount:()=>0,killBonus:()=>0,counterStacks:0,adaptationStacks:0,isPlayerAirborne:()=>false,progressionLevel:1,isMagicWeapon:item=>!!item?.magical};
  vm.createContext(statsCtx);vm.runInContext(between('function gearStats(role){','function syncGearHealth()'),statsCtx);
  assert.ok(Math.abs(statsCtx.weaponAttackPower()-31.5)<1e-8);assert.equal(statsCtx.gearStats('ranged').evade,10);
  equipped.magical=false;assert.ok(Math.abs(statsCtx.weaponAttackPower()-5.25)<1e-8);
  statsCtx.itemCount=id=>id==='light-conversion'?1:0;statsCtx.gearStatsCache={};
  assert.ok(Math.abs(statsCtx.weaponAttackPower()-2.625)<1e-8);
  equipped.magical=true;assert.ok(Math.abs(statsCtx.weaponAttackPower()-34.125)<1e-8);
  statsCtx.itemCount=id=>id==='light-conversion'||id==='dark-conversion'?1:0;statsCtx.gearStatsCache={};
  assert.ok(Math.abs(statsCtx.weaponAttackPower()-18.375)<1e-8);

  let seed=123456;const math=Object.create(Math);math.random=()=>((seed=Math.imul(seed,1664525)+1013904223|0)>>>0)/4294967296;
  const defs=Object.entries(itemChart).map(([id,[tier,max]])=>({id,tier,max}));
  const chestCtx={itemDefs:defs,itemCount:()=>0,itemLuck:()=>0,chestWeights,Math:math};vm.createContext(chestCtx);
  vm.runInContext(between('function rollChestOffers(){','function renderItemOffers()'),chestCtx);
  const counts={white:0,blue:0,purple:0,gold:0};
  for(let i=0;i<12000;i++){const offers=chestCtx.rollChestOffers();assert.equal(offers.length,3);assert.equal(new Set(offers).size,3);assert.ok(!offers.includes('iron-hammer'));counts[itemChart[offers[0]][0]]++}
  for(const [tier,expected] of Object.entries({white:.55,blue:.30,purple:.10,gold:.05}))assert.ok(Math.abs(counts[tier]/12000-expected)<.025,`${tier}: ${counts[tier]}`);

  const enchantCode=between('let enchantConfirmationPending=false;','function renderGear(){');
  const weapon={equipModel:'HandAxe',enchantable:true,enchantFlipped:false},messages={};
  const ctx={loadout:{ranged:{weapon:'weapon',offhand:null}},gearCatalog:{weapon},xp:100,modelForItem:item=>item?.equipModel||null,isMagicWeapon:item=>!!item?.enchantFlipped,compatibilityMessage,gameConfirm:async()=>false,syncGearHealth(){},updateXP(){},renderGear(){},$(id){return messages[id]||(messages[id]={textContent:''})}};
  vm.createContext(ctx);vm.runInContext(enchantCode,ctx);await ctx.toggleWeaponEnchantment();assert.equal(ctx.xp,100);assert.equal(weapon.enchantFlipped,false);
  ctx.gameConfirm=async()=>true;await ctx.toggleWeaponEnchantment();assert.equal(ctx.xp,90);assert.equal(weapon.enchantFlipped,true);
  ctx.gearCatalog.shield={equipModel:'WoodShield'};ctx.loadout.ranged.offhand='shield';await ctx.toggleWeaponEnchantment();assert.equal(ctx.xp,81);assert.equal(weapon.enchantFlipped,false);
  await ctx.toggleWeaponEnchantment();assert.equal(ctx.xp,81);assert.equal(weapon.enchantFlipped,false);

  const statusCode=between('function procEnemyEffects(enemy){','function tickCombatItems(dt){');
  const statusEnemy={hp:100,outer:{position:{distanceToSquared:()=>0}}},statusCtx={elapsed:10,itemCount:id=>['pyrotechnics','ancient-wrappings','permafrost','energy-of-the-gods'].includes(id)?1:0,Math:{random:()=>0},nearbyEnemies:()=>[statusEnemy]};
  vm.createContext(statusCtx);vm.runInContext(statusCode,statusCtx);statusCtx.procEnemyEffects(statusEnemy);
  assert.equal(statusEnemy.burnUntil,15);assert.equal(statusEnemy.poisonUntil,13);assert.equal(statusEnemy.freezeUntil,10.5);assert.equal(statusEnemy.freezeImmuneUntil,11);assert.equal(statusEnemy.shockUntil,13);
  statusCtx.elapsed=10.6;statusCtx.procEnemyEffects(statusEnemy);assert.equal(statusEnemy.freezeUntil,10.5);
  const dotEnemy={hp:100,maxHp:100,burnUntil:15,poisonUntil:13};
  const tickCtx={elapsed:11,adaptationStacks:0,counterStacks:0,wolves:[dotEnemy],homingMissiles:[],testEnemiesProtected:false,killEnemy(){},itemCount:()=>0};
  vm.createContext(tickCtx);vm.runInContext(between('function tickCombatItems(dt){','function launchUnstableMissiles('),tickCtx);tickCtx.tickCombatItems(1);assert.equal(dotEnemy.hp,96);
  const spawnCode=between('function spawnEnemy(){','function spawnRaidElite(');
  class Object3D{constructor(){this.position={set(){}}}}
  for(const [random,index] of [[.1,1],[.4,5],[.9,6]]){
    const ctx={SAVAGE_MODEL_INDEX:6,Math:{...Math,random:()=>random,PI:Math.PI,cos:Math.cos,sin:Math.sin,floor:Math.floor},player:{outer:{position:{x:0,z:0}}},ordinarySpawnDistance:()=>1,prepareEnemyRenderType:()=>({duration:1}),THREE:{Object3D},ordinarySavageHp:()=>100,elapsed:0,wolves:[],placeEnemyAtSpawn(){},enemyGridDirty:false};
    vm.createContext(ctx);vm.runInContext(spawnCode,ctx);ctx.spawnEnemy();assert.equal(ctx.wolves[0].enemyKind,index);assert.equal(ctx.wolves[0].hp,100);assert.equal(ctx.wolves[0].maxHp,100);assert.ok(ctx.wolves[0].batchedEnemy);
  }
  console.log('Verified class stats, equipment restrictions, slot and innate counts, chest odds, enchantment cost, combat status timing, and batched enemy variants.');
})().catch(error=>{console.error(error);process.exitCode=1});
