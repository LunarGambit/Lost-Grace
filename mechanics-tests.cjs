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
  const {refreshDot,drainDotTicks}=await loadModule(root+'/ability-core.js');
  const {classes,classStats,gearValues,rarityBonus}=await loadModule(root+'/mechanics-data.js');
  const {itemChart,newItems,chestWeights,convertAttackStats}=await loadModule(root+'/item-data.js');
  const {ordinaryEnemyHealth,enemyDamageMultiplier,ordinaryEnemyDamageMultiplier,ordinarySpawnScale,enemySpeedMultiplier}=await loadModule(root+'/enemy-scaling.js');
  for(const [minutes,hp] of [[0,12],[5,25.2],[10,45.6],[20,170.4],[30,352.8]])assert.ok(Math.abs(ordinaryEnemyHealth(minutes*60)-hp)<1e-8);
  assert.equal(enemyDamageMultiplier(300),1);assert.equal(enemyDamageMultiplier(360),1.15);assert.equal(enemyDamageMultiplier(330),1.075);
  assert.equal(enemySpeedMultiplier(0),1);assert.equal(enemySpeedMultiplier(3600),1.3);assert.equal(enemySpeedMultiplier(5400),1.3);assert.ok(Math.abs(enemySpeedMultiplier(5460)-1.365)<1e-9);assert.ok(Math.abs(enemySpeedMultiplier(7200)-3.25)<1e-9);
  for(let t=1;t<=7200;t+=37){assert.ok(ordinaryEnemyHealth(t)>ordinaryEnemyHealth(t-1));assert.ok(enemySpeedMultiplier(t)>=enemySpeedMultiplier(t-1))}
  const hp45=ordinaryEnemyHealth(2700),hp44=ordinaryEnemyHealth(2640),hp46=ordinaryEnemyHealth(2760);assert.ok(Math.abs(hp45-7344)<1e-8);assert.ok(Math.abs(ordinaryEnemyHealth(1800)-352.8)<1e-8);assert.ok(ordinaryEnemyHealth(2250)>ordinaryEnemyHealth(1800));assert.ok(Math.abs(ordinaryEnemyHealth(2700.001)-hp45)<.01);assert.ok(Math.abs((hp46-hp45)-20*(12*(1+.16*46+.012*46*46)-12*(1+.16*45+.012*45*45))*2)<1e-8);assert.ok(Math.abs(ordinaryEnemyDamageMultiplier(2760)-ordinaryEnemyDamageMultiplier(2700)-.6)<1e-9);assert.ok(Math.abs(ordinaryEnemyDamageMultiplier(2700)-ordinaryEnemyDamageMultiplier(2640)-.3)<1e-9);
  let attachments=fs.readFileSync(root+'/equipment-attachments.js','utf8')
    .replace("import * as THREE from 'three';",'const THREE={};')
    .replace("import {loadStaticModel} from './new-model-loader.js';",'const loadStaticModel=()=>{};');
  const {equipment,compatibilityMessage}=await import('data:text/javascript;base64,'+Buffer.from(attachments).toString('base64'));
  const magics=['SpiritFocus','WitchesTalisman','SoulStone'];
  for(const offhand of magics){assert.equal(compatibilityMessage('HandAxe',offhand,false).length>0,true);assert.equal(compatibilityMessage('HandAxe',offhand,true),'');assert.equal(compatibilityMessage('Wand',offhand,true),'')}
  for(const weapon of ['HandAxe','Cudgel'])for(const shield of ['WoodShield','StoneShield','BoneShield'])for(const magical of [false,true])assert.equal(compatibilityMessage(weapon,shield,magical),'');
  assert.notEqual(compatibilityMessage('Bow','WoodShield',false),'');
  assert.equal(compatibilityMessage('Bow','Quiver',false),'');
  assert.notEqual(compatibilityMessage('Staff','Quiver',true),'');
  assert.equal(compatibilityMessage('Sling','Pouch',false),'');
  assert.notEqual(compatibilityMessage('BattleAxe','WoodShield',false),'');
  for(const [name,c] of Object.entries(classes)){assert.ok(gearValues[c.starter],name);assert.equal(classStats(name,1).hp,c.base[0]);assert.ok(classStats(name,100).hp>c.base[0])}
  const pickupCtx={playerClassStats:()=>classStats('Ranger',1),prototypeShared:()=>0};vm.createContext(pickupCtx);vm.runInContext(between('function generalPickupRange()', 'function tickLoot('),pickupCtx);
  for(const name of Object.keys(classes)){pickupCtx.playerClassStats=()=>classStats(name,1);const stats=classStats(name,1);assert.equal(pickupCtx.gracePickupRange(),Math.max(stats.meleeRange,stats.rangedRange),name)}
  pickupCtx.playerClassStats=()=>classStats('Ranger',1);pickupCtx.prototypeShared=()=>50;assert.equal(pickupCtx.gracePickupRange(),22.5);assert.equal(pickupCtx.generalPickupRange(),15);
  const gearDrop={id:'gear',age:0,outer:{rotation:{y:0},position:{distance:14}}},runeDrop={id:'rune',age:0,outer:{rotation:{y:0},position:{distance:14}}},lootCtx={itemCount:()=>0,livingMembers:()=>[{}],itemDrops:[gearDrop,runeDrop],chests:[],purchaseChests:[],gearCatalog:{gear:{slot:'weapon'},rune:{slot:'rune'}},canReceiveGear:()=>true,receiveGear:()=>true,memberPosition:()=>({distanceTo:p=>p.distance}),generalPickupRange:()=>10,gracePickupRange:()=>15,remove:(items,item)=>items.splice(items.indexOf(item),1)};vm.createContext(lootCtx);vm.runInContext(between('function tickLoot(dt){','const bossBarEntries='),lootCtx);lootCtx.tickLoot(.1);assert.equal(lootCtx.itemDrops.length,0);const eliteChest={freeEliteChest:true,armed:true,items:['choice'],outer:{position:{distance:1}}},regularChest={freeEliteChest:false,armed:true,items:['choice'],outer:{position:{distance:1}}};let openedChest=null;lootCtx.purchaseChests=[eliteChest,regularChest];lootCtx.openChest=c=>{openedChest=c};lootCtx.tickLoot(.1);assert.equal(openedChest,eliteChest);eliteChest.armed=false;openedChest=null;lootCtx.tickLoot(.1);assert.equal(openedChest,null);eliteChest.outer.position.distance=3;lootCtx.tickLoot(.1);assert.equal(eliteChest.armed,true);eliteChest.outer.position.distance=1;lootCtx.tickLoot(.1);assert.equal(openedChest,eliteChest);
  const defenseCtx={Math};vm.createContext(defenseCtx);vm.runInContext(between('function avoidanceOverflowReduction(', 'function gearStats('),defenseCtx);
  for(const [defense,expected] of [[0,0],[800,800/ (800+8000/3)],[8000,.75],[16000,.75]])assert.ok(Math.abs(defenseCtx.defenseReduction(defense)-expected)<1e-12);
  const bloodCtx={modelForItem:item=>item?.equipModel,isMagicWeapon:()=>true,rarityTiers:['common','uncommon','rare','mythic','holy'].map(id=>({id})),gearCatalog:{w:{element:'bloodmagic',rarity:'holy'}},loadout:{ranged:{weapon:'w'}}};vm.createContext(bloodCtx);vm.runInContext(between('function bloodMagicBonuses(', 'function innateWeaponStatus('),bloodCtx);for(const [i,rarity] of ['common','uncommon','rare','mythic','holy'].entries()){const bonus=bloodCtx.bloodMagicBonuses({element:'bloodmagic',rarity});assert.equal(bonus.dealt,55+5*i);assert.equal(bonus.taken,5+5*i);assert.equal(bonus.cost,1+i)}assert.equal(bloodCtx.bloodMagicBonuses({element:'poison',rarity:'holy'}).dealt,0);assert.equal(bloodCtx.bloodMagicBonuses({equipModel:'VoodooDoll',rarity:'common'}).dealt,55);assert.equal(bloodCtx.bloodMagicBonuses({equipModel:'VoodooDoll',rarity:'holy',element:'fire'}).dealt,0);assert.equal(compatibilityMessage('VoodooDoll','ShrunkenHead',true),'');assert.notEqual(compatibilityMessage('VoodooDoll','ShrunkenHead',false),'');assert.deepStrictEqual(gearValues.VoodooDoll,[10,20,0,0]);assert.deepStrictEqual(gearValues.ShrunkenHead,[0,0,15,15]);assert.equal(bloodCtx.equippedBloodMagic().taken,25);bloodCtx.isMagicWeapon=()=>false;assert.equal(bloodCtx.equippedBloodMagic().taken,0);
  const damageTypeCtx={};vm.createContext(damageTypeCtx);vm.runInContext(between('function enemyDamageTypeForModel(', 'function defenseReduction('),damageTypeCtx);for(const model of ['Wolf/WolfAnimations.glb','Nephilim/Nephilim.glb','NephilimElite/NephilimElite.glb','NephilimEnraged/NephilimEnraged.glb','Titan/Titan.glb'])assert.equal(damageTypeCtx.enemyDamageTypeForModel(model),'magic');for(const model of ['Bear/Bear.glb','Giant/Giant.glb','Cyclops/Cyclops.glb','Savage/Savage.glb'])assert.equal(damageTypeCtx.enemyDamageTypeForModel(model),'physical');
  const combatMath=Object.create(Math);combatMath.random=()=>.99;const combatCtx={avoidanceOverflowReduction:defenseCtx.avoidanceOverflowReduction,equippedBloodMagic:()=>({taken:0}),defenseReduction:defenseCtx.defenseReduction,Math:combatMath,elapsed:0,ranks:{stone:0},gearStats:()=>({defense:0,evade:0,block:0}),currentAbility:()=>({}),enchantRescue:{ranged:{immune:0}},enemyDamageMultiplier:()=>1,ordinaryEnemyDamageMultiplier:()=>1,testInvulnerable:false,activePowerup:()=>false,itemCount:()=>0,enchanted:()=>false,renderHealth(){},livingMembers:()=>[{}]};
  vm.createContext(combatCtx);vm.runInContext('function contactAttack(w,targets){'+between('for(const contact of targets){','}if(dist<=w.reach')+'}}',combatCtx);
  const fighter={alive:true,kind:'ranged',hp:100,outer:{position:{}},visual:{}},contacts=[{member:fighter,position:{x:0,y:0,z:0}}],foe=()=>({outer:{position:{x:0,y:0,z:0}},reach:2,hitHeight:1,hitCooldown:0,damage:20});
  const first=foe(),second=foe();combatCtx.contactAttack(first,contacts);combatCtx.contactAttack(second,contacts);combatCtx.contactAttack(first,contacts);assert.equal(fighter.hp,80);assert.equal(first.hitCooldown,.25);assert.equal(second.hitCooldown,.25);
  combatCtx.gearStats=()=>({defense:0,magicDefense:8000,evade:0,block:0});fighter.hp=100;const magical=foe();magical.damageType='magic';combatCtx.contactAttack(magical,contacts);assert.equal(fighter.hp,97);fighter.hp=100;const physical=foe();physical.damageType='physical';combatCtx.contactAttack(physical,contacts);assert.equal(fighter.hp,90);
  combatCtx.equippedBloodMagic=()=>({taken:15});fighter.hp=100;combatCtx.contactAttack(foe(),contacts);assert.equal(fighter.hp,88.5);combatCtx.gearStats=()=>({defense:0,evade:100,block:0});combatMath.random=()=>0;fighter.hp=100;combatCtx.contactAttack(foe(),contacts);assert.equal(fighter.hp,100);combatMath.random=()=>.99;fighter.hp=100;combatCtx.contactAttack(foe(),contacts);assert.ok(Math.abs(fighter.hp-90.225)<1e-8);assert.equal(defenseCtx.avoidanceOverflowReduction({evade:100,block:105}),.35);assert.equal(defenseCtx.avoidanceOverflowReduction({evade:200,block:100}),.75);
  for(const [tier,weight] of Object.entries({white:70,blue:15,purple:6,gold:1.5}))assert.ok(Math.abs(chestWeights(0)[tier]-100*weight/92.5)<1e-10);
  assert.ok(Math.abs(chestWeights(350).gold-8)<.01);assert.ok(Math.abs(chestWeights(500).gold-15)<.01);assert.ok(Math.abs(chestWeights(1000).gold-32.692)<.01);
  for(const n of [0,25,100,200,500,1000,2000]){const weights=chestWeights(n);assert.ok(Math.abs(Object.values(weights).reduce((sum,x)=>sum+x,0)-100)<1e-8);assert.ok(Object.values(weights).every(x=>x>=0))}
  assert.deepStrictEqual(chestWeights(2000),chestWeights(1000));
  for(const [id] of newItems){assert.ok(itemChart[id],id);assert.ok(fs.existsSync(root+'/assets/chest-items/'+id+'.png'),id)}
  assert.deepStrictEqual(itemChart['light-conversion'],['purple',6]);assert.deepStrictEqual(itemChart['dark-conversion'],['purple',6]);
  assert.deepStrictEqual(convertAttackStats(100,40,1,0),{attack:50,magicAttack:90});
  assert.deepStrictEqual(convertAttackStats(100,40,0,6),{attack:130,magicAttack:10});
  assert.deepStrictEqual(convertAttackStats(100,40,1,1),{attack:70,magicAttack:70});

  const fitCtx={modelForItem:item=>item.equipModel};vm.createContext(fitCtx);
  vm.runInContext(between('const projectileWeapons=', 'let prototypeItemSerial='),fitCtx);
  for(const weapon of ['Bow','Crossbow','Sling','Javelin','Wand','ThrowingKnives','Staff']){
    assert.equal(fitCtx.affixFitsItem('projectiles',{slot:'weapon',equipModel:weapon}),true);
    assert.equal(fitCtx.affixFitsItem('targets',{slot:'weapon',equipModel:weapon}),false);
  }
  for(const weapon of ['Cudgel','HandAxe','BattleAxe','Spear','Hammer','WalkingStick']){
    assert.equal(fitCtx.affixFitsItem('projectiles',{slot:'weapon',equipModel:weapon}),false);
    assert.equal(fitCtx.affixFitsItem('targets',{slot:'weapon',equipModel:weapon}),false);
  }
  assert.equal(fitCtx.affixFitsItem('projectiles',{slot:'gloves'}),true);
  for(const key of ['hp','attackSpeed','crit','pickupRange','attackRange','stamina','attack','defense','moveSpeed','regen','healing','buffDuration','graceGain'])assert.equal(fitCtx.affixFitsItem(key,{slot:'weapon',equipModel:'Bow'}),true,key);
  for(const key of ['block','evade','staminaDrain','obeliskRange']){
    assert.equal(fitCtx.affixFitsItem(key,{slot:'weapon',equipModel:'Bow'}),false,key);
    assert.equal(fitCtx.affixFitsItem(key,{slot:'head'}),true,key);
  }

  for(const slot of ['weapon','head','chest','waist','boots','gloves','offhand'])for(const key of ['jumpControl','bossQuality','itemChance','scrap'])assert.equal(fitCtx.affixFitsItem(key,{slot,equipModel:'Bow'}),false);

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
  const damageItems={'close-quarters':1},damageBonusCtx={itemCount:id=>damageItems[id]||0,isPlayerAirborne:()=>false};vm.createContext(damageBonusCtx);vm.runInContext(between('function itemDamageMultiplier(role){','\n// Transient combat effects'),damageBonusCtx);assert.equal(damageBonusCtx.itemDamageMultiplier('melee'),1.5);assert.equal(damageBonusCtx.itemDamageMultiplier('ranged'),1);damageItems['close-quarters']=3;assert.equal(damageBonusCtx.itemDamageMultiplier('melee'),1.6);assert.equal(damageBonusCtx.itemDamageMultiplier('ranged'),1);
  const meleeCtx={bloodPactAttack:()=>false,wolves:enemies,Math,nearbyEnemies:()=>enemies,meleeAttackRange:()=>10,selectedClass:()=> 'Warrior',activeAbility:()=>false,abilityClock:{form:null},modelForItem:()=> 'Cudgel',gearCatalog:{weapon:{}},loadout:{ranged:{weapon:'weapon'}},gearStats:()=>({targets:2,healing:0,attackSpeed:0}),playCombatAnimation(){},prototypeCritFactor:()=>1,buffs:{attack:0,rate:1},weaponAttackPower:()=>10,itemDamageMultiplier:()=>1,cupMultiplier:()=>1,activePowerup:()=>false,weaponHit:(enemy,damage)=>{hits.push(enemy);enemy.hp-=damage},prototypeHealOnHit:()=>0,itemCount:()=>0,elapsed:0,addCombatEffect(){},renderHealth(){},weaponRateMultiplier:()=>1,equipment:{Cudgel:{}}};
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
  const statsCtx={innateProjectileCount:()=>0,shieldBlockChances:{},magicOffhandChances:{},applyCrossStats:(role,stats)=>stats,gearStatsCache:{},currentAbility:()=>({}),playerClassStats:()=>classStats('Witch',1),loadout:{ranged:{weapon:'wand'}},gearCatalog:{wand:equipped},rarityTiers:[{id:'common'}],rarityBonus,gearValues,convertAttackStats,modelForItem:item=>item?.equipModel||null,prototypeInnateDefs:{},prototypeRollDefs:{},namedArmorEffects:[],itemCount:()=>0,killBonus:()=>0,counterStacks:0,adaptationStacks:0,isPlayerAirborne:()=>false,progressionLevel:1,isMagicWeapon:item=>!!item?.magical};
  statsCtx.collectibleCounts=Object.fromEntries(['totem','snake','salamander','spider','squirrel','rabbit','mushroom','monkey','raven','turtle','scorpion','wasp'].map(k=>[k,0]));vm.createContext(statsCtx);vm.runInContext(between('function gearStats(role){','function syncGearHealth()'),statsCtx);
  assert.ok(Math.abs(statsCtx.weaponAttackPower()-31.5)<1e-8);assert.equal(statsCtx.gearStats('ranged').evade,10);
  const collectibleBaseline={...statsCtx.gearStats('ranged')};for(const [key,fields] of Object.entries({totem:['defense','magicDefense'],snake:['attackSpeed'],salamander:['attack'],spider:['magicAttack'],squirrel:['moveSpeed'],mushroom:['hp'],monkey:['pickupRange'],raven:['evade'],turtle:['block'],scorpion:['statusChance'],wasp:['statusDamage']})){statsCtx.collectibleCounts[key]=1;statsCtx.gearStatsCache={};const after=statsCtx.gearStats('ranged');for(const field of fields)assert.ok(after[field]>(collectibleBaseline[field]||0),key+' '+field);statsCtx.collectibleCounts[key]=0}statsCtx.gearStatsCache={};

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
  const counts={white:0,blue:0,purple:0,gold:0};let ironHammerSeen=false;
  for(let i=0;i<12000;i++){const offers=chestCtx.rollChestOffers();assert.equal(offers.length,3);assert.equal(new Set(offers).size,3);ironHammerSeen ||= offers.includes('iron-hammer');counts[itemChart[offers[0]][0]]++}assert.ok(ironHammerSeen, 'Iron Hammer should appear in regular chests');
  for(const [tier,expected] of Object.entries({white:70/92.5,blue:15/92.5,purple:6/92.5,gold:1.5/92.5}))assert.ok(Math.abs(counts[tier]/12000-expected)<.025,`${tier}: ${counts[tier]}`);

  const enchantCode=between('let enchantConfirmationPending=false;','function renderGear(){');
  const weapon={equipModel:'HandAxe',enchantable:true,enchantFlipped:false},messages={};
  const ctx={loadout:{ranged:{weapon:'weapon',offhand:null}},gearCatalog:{weapon},xp:100,modelForItem:item=>item?.equipModel||null,isMagicWeapon:item=>!!item?.enchantFlipped,compatibilityMessage,gameConfirm:async()=>false,syncGearHealth(){},updateXP(){},renderGear(){},$(id){return messages[id]||(messages[id]={textContent:''})}};
  vm.createContext(ctx);vm.runInContext(enchantCode,ctx);await ctx.toggleWeaponEnchantment();assert.equal(ctx.xp,100);assert.equal(weapon.enchantFlipped,false);
  ctx.gameConfirm=async()=>true;await ctx.toggleWeaponEnchantment();assert.equal(ctx.xp,90);assert.equal(weapon.enchantFlipped,true);
  ctx.gearCatalog.shield={equipModel:'WoodShield'};ctx.loadout.ranged.offhand='shield';await ctx.toggleWeaponEnchantment();assert.equal(ctx.xp,81);assert.equal(weapon.enchantFlipped,false);
  await ctx.toggleWeaponEnchantment();assert.ok(Math.abs(ctx.xp-72.9)<1e-9);assert.equal(weapon.enchantFlipped,true);

  const statusCode=between('function rawStatusChance(base){','function tickCombatItems(dt){');
  const statusEnemy={hp:100,outer:{position:{distanceToSquared:()=>0}}},statusCtx={elapsed:10,itemCount:id=>['pyrotechnics','ancient-wrappings','permafrost','energy-of-the-gods'].includes(id)?1:0,Math:{random:()=>0,max:Math.max,min:Math.min},gearStats:()=>({magicAttack:0}),refreshDot,nearbyEnemies:()=>[statusEnemy]};
  vm.createContext(statusCtx);vm.runInContext(statusCode,statusCtx);statusCtx.procEnemyEffects(statusEnemy);
  assert.equal(statusEnemy.burnUntil,13);assert.equal(statusEnemy.burnRate,.03);assert.equal(statusEnemy.poisonUntil,13);assert.equal(statusEnemy.freezeUntil,10.5);assert.equal(statusEnemy.freezeImmuneUntil,11);assert.equal(statusEnemy.shockUntil,13);
  statusCtx.elapsed=10.6;statusCtx.procEnemyEffects(statusEnemy);assert.equal(statusEnemy.freezeUntil,10.5);
  const dotEnemy={hp:100,maxHp:100,burnUntil:15,poisonUntil:13,burnNext:10.5,poisonNext:10.5};
  const tickCtx={unstoppableDamageMultiplier:()=>1,elapsed:11,adaptationStacks:0,counterStacks:0,wolves:[dotEnemy],homingMissiles:[],testEnemiesProtected:false,drainDotTicks,gearStats:()=>({magicAttack:0}),killEnemy(){},itemCount:()=>0};
  vm.createContext(tickCtx);vm.runInContext(between('function tickCombatItems(dt){','function applyRuneStatus('),tickCtx);tickCtx.tickCombatItems(1);assert.equal(dotEnemy.hp,96);
  const spawnCode=between('function spawnEnemy(){','function spawnRaidElite(');
  class Object3D{constructor(){this.position={set(){}}}}
  for(const [random,index] of [[.1,1],[.4,5],[.9,6]]){
    const ctx={SAVAGE_MODEL_INDEX:6,files:['','Wolf','','','','Bear','Savage'],enemyDamageTypeForModel:damageTypeCtx.enemyDamageTypeForModel,Math:{...Math,random:()=>random,PI:Math.PI,cos:Math.cos,sin:Math.sin,floor:Math.floor},player:{outer:{position:{x:0,z:0}}},ordinarySpawnDistance:()=>1,prepareEnemyRenderType:()=>({duration:1}),THREE:{Object3D},ordinarySavageHp:()=>100,elapsed:0,wolves:[],placeEnemyAtSpawn(){},enemyGridDirty:false};
    vm.createContext(ctx);vm.runInContext(spawnCode,ctx);ctx.spawnEnemy();assert.equal(ctx.wolves[0].enemyKind,index);assert.equal(ctx.wolves[0].damageType,index===1?'magic':'physical');assert.equal(ctx.wolves[0].hp,100);assert.equal(ctx.wolves[0].maxHp,100);assert.ok(ctx.wolves[0].batchedEnemy);
  }
  const mdefCounts={};statsCtx.itemCount=id=>mdefCounts[id]||0;statsCtx.killBonus=id=>id==='graveplate'&&mdefCounts.graveplate?50:0;statsCtx.adaptationStacks=0;const getMdef=()=>{statsCtx.gearStatsCache={};return statsCtx.gearStats('ranged').magicDefense};const baseMdef=getMdef();mdefCounts.ironbark=2;assert.ok(Math.abs(getMdef()-baseMdef*1.1)<1e-8);mdefCounts.graveplate=1;assert.ok(Math.abs(getMdef()-baseMdef*1.6)<1e-8);mdefCounts.adaptation=2;statsCtx.adaptationStacks=10;assert.ok(Math.abs(getMdef()-(baseMdef*1.6+20))<1e-8);mdefCounts['titans-might']=1;assert.equal(getMdef(),0);
  assert.equal(fitCtx.affixFitsItem('magicAttack',{slot:'weapon',equipModel:'Wand'}),true);
  const spellCounts={};statsCtx.itemCount=id=>spellCounts[id]||0;statsCtx.killBonus=id=>id==='bloodied-fang'&&spellCounts[id]?50:0;statsCtx.gearStatsCache={};statsCtx.prototypeInnateDefs={magicAttack:{holy:25}};statsCtx.namedArmorEffects=['magicAttack'];equipped.innates=[];equipped.namedBonus=undefined;const magicBase=statsCtx.gearStats('ranged').magicAttack;spellCounts['bloodied-fang']=1;spellCounts['titans-might']=1;statsCtx.gearStatsCache={};assert.ok(Math.abs(statsCtx.gearStats('ranged').magicAttack-magicBase*2.5)<1e-8);equipped.innates=['magicAttack'];equipped.rarity='holy';equipped.namedBonus=0;statsCtx.rarityTiers=[{id:'common'},{id:'uncommon'},{id:'rare'},{id:'mythic'},{id:'holy'}];statsCtx.gearStatsCache={};assert.ok(Math.abs(statsCtx.gearStats('ranged').magicAttack-30*1.15*2.9)<1e-8);
  for(let extra=0;extra<=100;extra++){const multiplier=fitCtx.projectileOverflowBonus(extra);assert.ok(Math.abs(Math.min(20,1+extra)*multiplier-(1+extra))<1e-9)}
  assert.deepStrictEqual(itemChart.pestilence,['blue',10]);
  const spreadCode=between('function spreadPestilence(', 'function killEnemy('),near={hp:100,outer:{position:{distanceToSquared:()=>25}}},far={hp:100,outer:{position:{distanceToSquared:()=>121}}},immune={hp:100,freezeImmuneUntil:11,outer:{position:{distanceToSquared:()=>1}}},victim={hp:0,burnUntil:14,freezeUntil:10.4,poisonUntil:12,shockUntil:13,deadlyPoisonUntil:14,sorcererBurnUntil:14,outer:{position:{}}},spreadCtx={elapsed:10,itemCount:id=>id==='pestilence'?10:0,Math:{random:()=>0,min:Math.min,max:Math.max},nearbyEnemies:()=>[victim,near,far,immune],applyBurn:(target,duration,rate)=>{target.burnUntil=10+duration;target.burnRate=rate},refreshDot:(target,key,time,duration)=>{target[key+'Until']=time+duration;target[key+'Next']=time+.5}};vm.createContext(spreadCtx);vm.runInContext(spreadCode,spreadCtx);spreadCtx.spreadPestilence(victim);for(const key of ['burn','freeze','poison','shock','deadlyPoison','sorcererBurn'])assert.equal(near[key+'Until'],victim[key+'Until'],key);assert.equal(far.burnUntil,undefined);assert.equal(immune.freezeUntil,undefined);
  assert.deepStrictEqual(itemChart.plauge,['purple',5]);
  const blastCalls=[],plaugeCounts={plauge:5},plaugeCtx={itemCount:id=>plaugeCounts[id]||0,Math:{min:Math.min,random:()=>0},itemExplosion:(pos,radius,damage)=>blastCalls.push([pos,radius,damage]),gearStats:()=>({magicAttack:200})};vm.createContext(plaugeCtx);vm.runInContext(between('function triggerPlauge(', 'function killEnemy('),plaugeCtx);const blastEnemy={outer:{position:'source'}};plaugeCtx.triggerPlauge(blastEnemy,'attack');assert.equal(blastCalls.length,0);plaugeCtx.triggerPlauge(blastEnemy,'magicStatus');assert.deepStrictEqual(blastCalls,[['source',10,200]]);plaugeCounts['timeless-hourglass']=1;plaugeCtx.triggerPlauge(blastEnemy,'magicStatus');assert.equal(blastCalls.length,3);plaugeCtx.Math.random=()=>.1;plaugeCtx.triggerPlauge(blastEnemy,'magicStatus');assert.equal(blastCalls.length,3);
  const runeCtx={elapsed:10,itemCount:()=>0,Math:{random:()=>.149,max:Math.max,min:Math.min},gearStats:()=>({magicAttack:100}),refreshDot};vm.createContext(runeCtx);vm.runInContext(between('function rawStatusChance(base){','function procEnemyEffects('),runeCtx);vm.runInContext(between('function applyRuneStatus(', 'function itemHit('),runeCtx);for(const [element,key] of [['fire','burnUntil'],['ice','freezeUntil'],['poison','poisonUntil'],['electric','shockUntil']]){const e={};runeCtx.applyRuneStatus(e,element);assert(e[key]>10,element)}runeCtx.Math.random=()=>.15;const miss={};runeCtx.applyRuneStatus(miss,'fire');assert.equal(miss.burnUntil,undefined);runeCtx.Math.random=()=>0;const runeImmune={freezeImmuneUntil:11};runeCtx.applyRuneStatus(runeImmune,'ice');assert.equal(runeImmune.freezeUntil,undefined);
  const dropCtx={Math:{random:()=>0,floor:Math.floor,min:Math.min},armorBases:Array(5),weaponBases:Array(10),offhandBases:Array(5),runeDefinitions:{fire:{},ice:{},poison:{},electric:{},bleed:{},stun:{},maim:{},crushing:{}},rollItem:()=> 'gear'};vm.createContext(dropCtx);vm.runInContext(between('function rollEnemyDrop(', 'const bagMaterials='),dropCtx);for(const [roll,want] of [[0,'gear'],[20/24,'rune_fire'],[20.5/24,'rune_ice'],[21/24,'rune_poison'],[21.5/24,'rune_electric'],[22/24,'rune_bleed'],[22.5/24,'rune_stun'],[23/24,'rune_maim'],[23.5/24,'rune_crushing']]){dropCtx.Math.random=()=>roll;assert.equal(dropCtx.rollEnemyDrop(),want)}
  const statusMatkTarget={hp:1000,maxHp:1000,burnUntil:15,burnNext:10.5,poisonUntil:15,poisonNext:10.5,deadlyPoisonUntil:15,deadlyPoisonNext:10.5,sorcererBurnUntil:15,sorcererBurnNext:10.5};tickCtx.elapsed=10.5;tickCtx.wolves=[statusMatkTarget];tickCtx.gearStats=()=>({magicAttack:100});tickCtx.tickCombatItems(.5);assert.equal(statusMatkTarget.hp,900);const ice100={},shock100={};runeCtx.Math.random=()=>0;runeCtx.applyRuneStatus(ice100,'ice');runeCtx.applyRuneStatus(shock100,'electric');assert.ok(Math.abs(ice100.freezeUntil-10.55)<1e-9);assert.ok(Math.abs(shock100.shockUntil-13.3)<1e-9);
  const burnTarget={hp:1000,maxHp:1000,burnUntil:13,burnNext:10.5,burnRate:.03};tickCtx.elapsed=10.5;tickCtx.wolves=[burnTarget];tickCtx.gearStats=()=>({magicAttack:100});tickCtx.tickCombatItems(.5);assert.equal(burnTarget.hp,975);const strongBurn={burnUntil:12,burnRate:.03};runeCtx.applyBurn(strongBurn,5,.01);assert.equal(strongBurn.burnRate,.03);assert.equal(strongBurn.burnUntil,12);
  const spreadStrong={hp:100,outer:{position:{distanceToSquared:()=>1}}};victim.burnRate=.03;spreadCtx.nearbyEnemies=()=>[spreadStrong];spreadCtx.applyBurn=runeCtx.applyBurn;spreadCtx.spreadPestilence(victim);assert.equal(spreadStrong.burnRate,.03);assert.equal(spreadStrong.burnUntil,14);
  assert.equal(ordinarySpawnScale(599.99),1);assert.equal(ordinarySpawnScale(600),.5);assert.equal(ordinaryEnemyDamageMultiplier(600),1.75);assert.ok(Math.abs(ordinaryEnemyDamageMultiplier(660)-2.05)<1e-9);assert.ok(Math.abs(ordinaryEnemyHealth(600)-45.6)<1e-9);assert.ok(Math.abs(ordinaryEnemyHealth(660)-(2*12*(1+.16*11+.012*121)-45.6))<1e-9);assert.ok(Math.abs(ordinaryEnemyHealth(600.001)-ordinaryEnemyHealth(600))<.001);assert.ok(html.includes("(w.raidElite||w.boss)?(w.goldReward||0):(w.randomElite?40:4))"));
  console.log('Verified class stats, equipment restrictions, slot and innate counts, chest odds, enchantment cost, combat status timing, and batched enemy variants.');
})().catch(error=>{console.error(error);process.exitCode=1});
