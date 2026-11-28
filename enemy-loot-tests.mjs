import assert from 'node:assert/strict';
import {enemyGearWeights,rollEnemyGearRarity,enemyDropLuckMultiplier,adaptiveEnemyDropChance} from './enemy-loot.js';
assert.deepEqual(enemyGearWeights(0),[.60,.20,.13,.05,.02]);
for(const [luck,holy] of [[0,.02],[500,.04],[1000,.06],[1500,.08]]){const weights=enemyGearWeights(luck);assert.equal(weights[4],holy);assert.ok(Math.abs(weights.reduce((a,b)=>a+b,0)-1)<1e-12);}
for(const [luck,multiplier] of [[0,1],[1000,2],[1500,3]]){assert.equal(enemyDropLuckMultiplier(luck),multiplier);for(const kills of [10,40,100,1000])assert.ok(Math.abs(adaptiveEnemyDropChance(kills,0,luck)-adaptiveEnemyDropChance(kills,0,0)*multiplier)<1e-12);}
for(const [roll,tier] of [[.3,'common'],[.7,'uncommon'],[.85,'rare'],[.95,'mythic'],[.99,'holy']])assert.equal(rollEnemyGearRarity(0,()=>roll),tier);
console.log('Enemy rarity weights, Luck milestones, and adaptive drop chance passed.');
