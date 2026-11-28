// Luck changes rarity separately from the adaptive equipment/rune drop rate.
export function enemyGearWeights(luck=0){
 const holy=.02*(1+Math.max(0,Math.min(1500,luck))/500),factor=(1-holy)/.98;
 return [.60*factor,.20*factor,.13*factor,.05*factor,holy];
}
export function rollEnemyGearRarity(luck=0,random=Math.random){
 const names=['common','uncommon','rare','mythic','holy'],weights=enemyGearWeights(luck);let r=random();
 for(let i=0;i<weights.length;i++){r-=weights[i];if(r<0)return names[i];}return 'holy';
}
export function enemyDropLuckMultiplier(luck=0){const x=Math.max(0,Math.min(1500,luck))/1000;return 1+x/3+2*x*x/3;}
export function adaptiveEnemyDropChance(kills,itemChanceBonus=0,luck=0){
 const baseline=.035,bonusRate=Math.min(.05,Math.max(0,baseline+itemChanceBonus/100));
 const baseChance=Math.min(.05,2/Math.max(40,kills)*(bonusRate/baseline));
 return Math.min(1,baseChance*enemyDropLuckMultiplier(luck));
}
