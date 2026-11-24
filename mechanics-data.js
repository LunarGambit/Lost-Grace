// Values supplied in the class and equipment chart; level 1 uses the base values.
export const classes = {
  Amazon:   {base:[150,10,5,15,10,1.4,15,8,12,.15], gain:[6,.2,.1,.2,.1,.004,.15], starter:'Javelin'},
  Druid:    {base:[200,10,10,25,25,1,25,10,10,.10], gain:[8,.25,.2,.3,.3,.006,.35], starter:'Cudgel',offhand:'WoodShield'},
  Ranger:   {base:[150,15,5,15,10,1,15,5,15,.10], gain:[6,.2,.1,.2,.1,.005,.15], starter:'Sling'},
  Sorcerer: {base:[100,5,15,10,35,1.2,10,8,15,.10], gain:[4,.15,.3,.2,.35,.003,.1], starter:'Staff'},
  Warrior:  {base:[250,15,5,35,15,1,50,10,5,.05], gain:[10,.3,.1,.5,.15,.005,.5], starter:'BattleAxe'},
  Witch:    {base:[100,5,15,10,35,1.2,10,5,12,.10], gain:[4,.1,.3,.1,.5,.0015,.1], starter:'Wand'}
};
export function classStats(name, level=1) {
  const c=classes[name]||classes.Ranger, n=Math.max(0,Math.min(99,level-1));
  const [hp,attack,magicAttack,defense,magicDefense,attackSpeed,stamina]=c.base.map((v,i)=>v+(c.gain[i]||0)*n);
  return {hp,attack,magicAttack,defense,magicDefense,attackSpeed,stamina,meleeRange:c.base[7],rangedRange:c.base[8],evade:c.base[9]};
}
// [attack, magic attack, defense, magic defense], before rarity bonuses.
export const gearValues={
 BattleAxe:[25,10,5,5],Bow:[10,10,0,0],Crossbow:[15,5,0,0],Sling:[0,0,0,0],
 Cudgel:[10,5,0,0],Hammer:[25,10,5,5],HandAxe:[10,5,0,0],Spear:[25,5,5,5],
 Javelin:[5,10,0,0],Staff:[0,15,0,0],WalkingStick:[20,20,0,0],Wand:[0,15,0,0],ThrowingKnives:[10,10,0,0],
 WoodShield:[5,5,10,5],StoneShield:[5,5,25,10],BoneShield:[10,10,50,35],
 WitchesTalisman:[0,10,5,5],SoulStone:[0,5,10,10],SpiritFocus:[0,15,25,25],Pouch:[5,5,0,0],Quiver:[10,10,0,0]
};
export const enchantableWeapons=new Set(['Bow','Cudgel','HandAxe','Javelin','Staff','WalkingStick','Wand','ThrowingKnives']);
export const magicalBaseWeapons=new Set(['Staff','Wand']);
export const rarityBonus={common:.05,uncommon:.075,rare:.10,mythic:.125,holy:.15};
