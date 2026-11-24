// Chest item tiers and limits are separate from the five gear rarities.
export const itemChart={
 'oracles-eye':['gold',2], 'coinpurse':['blue',10], 'blood-diamond':['purple',5],
 'bigger-rocks':['white',10], 'stone-club':['white',10], ironbark:['white',10],
 'sharpened-bone':['white',10], quickcord:['white',10], 'stone-tools':['blue',10],
 hardtack:['white',10], 'fortunes-knuckle':['white',10], hotshot:['purple',6],
 'iron-hammer':['purple',6], 'close-quarters':['purple',6], 'heavy-swings':['purple',5],
 'field-medic':['purple',5], 'bloodied-fang':['purple',6], 'ancient-hide':['purple',6],
 graveplate:['purple',6], 'broken-horseshoe':['purple',4], deathspark:['purple',6],
 'radiant-grace':['gold',6], 'golden-cup':['gold',2], 'power-rune':['gold',1], 'titans-might':['gold',1],
 'rabbits-foot':['blue',5], 'soul-wisp':['white',10], 'sharp-claws':['blue',5], 'soul-siphon':['blue',5],
 'timeless-hourglass':['gold',1], 'unstable-grace':['purple',5], pyrotechnics:['purple',5],
 permafrost:['purple',5], 'energy-of-the-gods':['purple',5], 'ancient-wrappings':['purple',5],
 'fallens-wing':['blue',5], acrobatics:['blue',5], 'rough-hide':['blue',5],
 'ravens-feather':['blue',5], 'wide-stance':['blue',5], 'quick-reflexes':['blue',5],
 adaptation:['purple',5], counterstrike:['purple',5],
 'light-conversion':['purple',6], 'dark-conversion':['purple',6]
};
export const newItems=[
 ['rabbits-foot',"Rabbit's Foot",'+50 Luck per copy'],['soul-wisp','Soul Wisp','+5% magic attack per copy'],
 ['sharp-claws','Sharp Claws','Heal 0.5 HP per melee hit per copy'],['soul-siphon','Soul Siphon','Heal 0.2 HP per ranged hit per copy'],
 ['timeless-hourglass','Timeless Hourglass','Combat items trigger one additional time'],
 ['unstable-grace','Unstable Grace','Ranged hits launch one homing missile per copy at another enemy'],
 ['pyrotechnics','Pyrotechnics','1% chance per copy to burn for 1% maximum HP per second for 5 seconds'],
 ['permafrost','Permafrost','1% chance per copy to freeze for 0.5 seconds'],
 ['energy-of-the-gods','Energy of the Gods','1% chance per copy to shock nearby enemies, slowing them 15% for 3 seconds'],
 ['ancient-wrappings','Ancient Wrappings','1% chance per copy to poison for 3% maximum HP per second for 3 seconds'],
 ['fallens-wing',"Fallen's Wing",'Fall 10% slower per copy'],['acrobatics','Acrobatics','Deal 10% more damage per copy while airborne'],
 ['rough-hide','Rough Hide','Reflect 10% of damage taken per copy to enemies within 15 units'],
 ['ravens-feather',"Raven's Feather",'Gain 10% attack speed per copy while airborne'],
 ['wide-stance','Wide Stance','Gain 5% block chance per copy'],['quick-reflexes','Quick Reflexes','Gain 5% evade chance per copy'],
 ['adaptation','Adaptation','Blocking builds defense stacks that expire after 3 seconds without another block'],
 ['counterstrike','Counterstrike','Evading builds attack stacks that expire after 3 seconds without another evade'],
 ['light-conversion','Light Conversion','Converts 50% ATK to MATK, plus 5 percentage points per additional copy'],
 ['dark-conversion','Dark Conversion','Converts 50% MATK to ATK, plus 5 percentage points per additional copy']
];
export function chestWeights(luck){
  const multiplier=1+Math.max(0,Math.min(1000,luck))/100,exponent=1.5*Math.log(1.5);
  const weights=[55,30,10,5].map((base,index)=>base*Math.pow(multiplier,-(3-index)*exponent));
  const total=weights.reduce((sum,weight)=>sum+weight,0);
  return Object.fromEntries(['white','blue','purple','gold'].map((tier,index)=>[tier,100*weights[index]/total]));
}
export function convertAttackStats(attack,magicAttack,lightCopies,darkCopies){
 const fraction=copies=>copies>0?Math.min(1,.5+.05*(copies-1)):0;
 const light=attack*fraction(lightCopies),dark=magicAttack*fraction(darkCopies);
 return {attack:attack-light+dark,magicAttack:magicAttack-dark+light};
}
