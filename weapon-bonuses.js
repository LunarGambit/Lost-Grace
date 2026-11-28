// Fixed weapon bonuses are separate from randomly rolled Mythic/Holy innates.
export const weaponBonusStats={
 BattleAxe:['attack','crit'], Bow:['attack','crit'], Crossbow:['crit','critDamage'],
 Sling:['attackSpeed','attack'], Cudgel:['magicAttack','statusChance'],
 Hammer:['attack','statusChance'], HandAxe:['attackSpeed','crit'],
 Spear:['attack','attackRange'], Javelin:['magicAttack','crit'],
 Staff:['magicAttack','statusDamage'], WalkingStick:['attack','magicAttack','attackSpeed'],
 Wand:['magicAttack','statusChance'], ThrowingKnives:['attack','magicAttack','attackSpeed'],
 VoodooDoll:['statusChance','statusDamage']
};
export function weaponBonuses(name,rarity){
 const tier=['common','uncommon','rare','mythic','holy'].indexOf(rarity);
 if(tier<0||!weaponBonusStats[name])return {};
 const value=5*(tier+1);
 return Object.fromEntries(weaponBonusStats[name].map(stat=>[stat,value]));
}

export function offhandBonuses(name,rarity){
 const tier=['common','uncommon','rare','mythic','holy'].indexOf(rarity)+1;
 if(!tier)return {};
 return name==='Pouch'?{projectiles:tier}:name==='Quiver'?{critDamage:5*tier}:{};
}
