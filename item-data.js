// Chest item tiers and limits are separate from the five gear rarities.
export const itemChart={
 'oracles-eye':['gold',2], 'coinpurse':['blue',10], pestilence:['blue',10], plauge:['purple',5], riot:['purple',5], 'deep-cuts':['purple',5], 'seeing-stars':['purple',5], 'break-a-leg':['purple',5], 'crushing-skulls':['purple',5], 'blood-diamond':['purple',5],
 'bigger-rocks':['white',10], 'stone-club':['white',10], ironbark:['white',10],
 'sharpened-bone':['white',10], quickcord:['white',10], 'stone-tools':['blue',10],
 hardtack:['white',10], 'fortunes-knuckle':['white',10], hotshot:['purple',6],
 unstoppable:['purple',5], 'iron-hammer':['purple',6], 'close-quarters':['purple',6], 'heavy-swings':['purple',5],
 'field-medic':['purple',5], 'bloodied-fang':['purple',6], 'ancient-hide':['purple',6],
 graveplate:['purple',6], 'broken-horseshoe':['purple',4], deathspark:['purple',6],
 'radiant-grace':['gold',6], 'golden-cup':['gold',2], 'power-rune':['gold',1], 'titans-might':['gold',1],
 'rabbits-foot':['blue',5], 'soul-wisp':['white',10], 'sharp-claws':['blue',5], 'soul-siphon':['blue',5],
 'timeless-hourglass':['gold',1], 'unstable-grace':['purple',5], pyrotechnics:['purple',5],
 permafrost:['purple',5], 'energy-of-the-gods':['purple',5], 'ancient-wrappings':['purple',5],
 'fallens-wing':['blue',5], acrobatics:['blue',5], 'rough-hide':['blue',5],
 'ravens-feather':['blue',5], 'wide-stance':['blue',5], 'quick-reflexes':['blue',5],
 adaptation:['purple',5], counterstrike:['purple',5],
 'light-conversion':['purple',6], 'dark-conversion':['purple',6],
 'blood-pact':['purple',5], 'locust-swarm':['gold',3], canibilism:['gold',3],
 'wings-of-light':['gold',5], 'overcharged':['gold',1], 'warriors-feast':['gold',1], 'well-rested':['gold',1], 'the-best-offense':['gold',1], 'winged-sandals':['gold',1], 'supressing-fire':['gold',1], 'iron-defense':['gold',1], 'the-best-defense':['gold',1]
};
export const newItems=[
 ['wings-of-light','Wings of Light','Hold jump while falling to hover for up to 6 seconds; +1 second per additional copy'],
 ['blood-pact','Blood Pact','Deal 15% more damage per copy; lose 1 HP per copy each attack'],
 ['locust-swarm','Locust Swarm','Bleed, crushing blow, burn and poison deal 25% more damage per copy; their effects reflect onto you at 25%, plus 5% per additional copy'],
 ['canibilism','Canibilism','Heal 2 HP per copy for each damage-over-time tick on an enemy'],
 ['overcharged','Overcharged','Reduce class ability cooldown by 50%'],
 ['unstoppable','Unstoppable','While sprinting, deal 15% increased damage per copy'],
 ['warriors-feast',"Warriors Feast",'+2.5% of maximum HP as ATK and MATK'],
 ['well-rested','Well Rested','+5% of maximum HP as defense and magic defense'],
 ['the-best-offense','The Best Offense','+5% of defense as ATK and MATK'],
 ['winged-sandals','Winged Sandals','Gain ATK and MATK equal to 50% of movement speed increase, up to 350 each'],
 ['supressing-fire','Supressing Fire','+0.2 percentage points of evasion per extra projectile'],
 ['iron-defense','Iron Defense','Gain block chance equal to 0.5% of current Defense, up to +25% block chance'],
 ['the-best-defense','The Best Defense','+15% of combined ATK and MATK as defense'],
 ['riot','Riot','Enemies killed by bleed or crushing blow have a 2% chance per copy to explode for 100% ATK in a 10-unit radius'],
 ['deep-cuts','Deep Cuts','Physical attacks have a 1% chance per copy to bleed for 3% maximum HP per second for 3 seconds, plus 10% ATK per half-second tick'],
 ['seeing-stars','Seeing Stars','Physical attacks have a 1% chance per copy to stun for 0.5 seconds, scaling with ATK'],
 ['break-a-leg','Break A Leg','Physical attacks have a 1% chance per copy to maim enemies within 8 units, slowing them 15% for 3 seconds, scaling with ATK'],
 ['crushing-skulls','Crushing Skulls','Physical attacks have a 1% chance per copy to cause a crushing blow for 3% maximum HP per second for 3 seconds, plus 10% ATK per half-second tick'],
 ['plauge','Plauge','Enemies killed by burn or poison have a 2% chance per copy to explode, dealing 100% of your magic attack as magical damage within 10 units'],
 ['pestilence','Pestilence','On killing an afflicted enemy, each active magical or physical status has a 5% chance per copy to spread to enemies within 10 units for its remaining duration'],
 ['rabbits-foot',"Rabbit's Foot",'+50 Luck per copy'],['soul-wisp','Soul Wisp','+5% magic attack per copy'],
 ['sharp-claws','Sharp Claws','Heal 0.5 HP per melee hit per copy'],['soul-siphon','Soul Siphon','Heal 0.5 HP per ranged hit per copy'],
 ['timeless-hourglass','Timeless Hourglass','Combat items trigger one additional time'],
 ['unstable-grace','Unstable Grace','Ranged hits launch one homing missile per copy at another enemy'],
 ['pyrotechnics','Pyrotechnics','Magical attacks have a 5% chance per copy to burn for 3% maximum HP per second for 3 seconds, plus 10% MATK per half-second tick'],
 ['permafrost','Permafrost','Magical attacks have a 5% chance per copy to freeze for 0.5 seconds, with duration increased by 0.1% per MATK'],
 ['energy-of-the-gods','Energy of the Gods','Magical attacks have a 5% chance per copy to shock nearby enemies, slowing them 15% for 3 seconds, with duration increased by 0.1% per MATK'],
 ['ancient-wrappings','Ancient Wrappings','Magical attacks have a 5% chance per copy to poison for 3% maximum HP per second for 3 seconds, plus 10% MATK per half-second tick'],
 ['fallens-wing',"Fallen's Wing",'Fall 15% slower per copy'],['acrobatics','Acrobatics','Deal 10% more damage per copy while airborne'],
 ['rough-hide','Rough Hide','Reflect 10% of damage taken per copy to enemies within 15 units'],
 ['ravens-feather',"Raven's Feather",'Gain 10% attack speed per copy while airborne'],
 ['wide-stance','Wide Stance','Gain 5% block chance per copy'],['quick-reflexes','Quick Reflexes','Gain 5% evade chance per copy'],
 ['adaptation','Adaptation','Blocking builds defense and magic defense stacks that expire after 3 seconds without another block'],
 ['counterstrike','Counterstrike','Evading builds attack stacks that expire after 3 seconds without another evade'],
 ['light-conversion','Light Conversion','Converts 50% ATK to MATK, plus 5 percentage points per additional copy'],
 ['dark-conversion','Dark Conversion','Converts 50% MATK to ATK, plus 5 percentage points per additional copy']
];
export function chestWeights(luck){
  const value=Math.max(0,Math.min(1000,luck));
  const effectiveLuck=value<=350?value*(190.35115100188494/350):value<=500?190.35115100188494+(value-350)*(191.21592367184886/150):381.5670746737338+(value-500)*(618.4329253262662/500);
  const multiplier=1+effectiveLuck/100,exponent=1.5*Math.log(1.5);
  const weights=[70,15,6,1.5].map((base,index)=>base*Math.pow(multiplier,-(3-index)*exponent));
  const total=weights.reduce((sum,weight)=>sum+weight,0);
  return Object.fromEntries(['white','blue','purple','gold'].map((tier,index)=>[tier,100*weights[index]/total]));
}
export function convertAttackStats(attack,magicAttack,lightCopies,darkCopies){
 const fraction=copies=>copies>0?Math.min(1,.5+.05*(copies-1)):0;
 const light=attack*fraction(lightCopies),dark=magicAttack*fraction(darkCopies);
 return {attack:attack-light+dark,magicAttack:magicAttack-dark+light};
}

// All conversions use the same snapshot before these items contribute.
export function crossStatBonuses(stats,counts){const n=id=>counts[id]||0, hp=stats.maxHp, def=stats.defense, atk=stats.attack;const addedAttack=n('warriors-feast')*hp*.025+n('the-best-offense')*def*.05+n('winged-sandals')*Math.min(350,Math.round(Math.max(0,stats.movementIncrease)*.5)),currentDefense=def+n('well-rested')*hp*.05+n('the-best-defense')*(atk+stats.magicAttack)*.15;return {attack:atk+addedAttack,magicAttack:stats.magicAttack+addedAttack,defense:currentDefense,magicDefense:stats.magicDefense+n('well-rested')*hp*.05,evade:stats.evade+n('supressing-fire')*stats.projectiles*.2,block:stats.block+n('iron-defense')*Math.min(25,Math.max(0,currentDefense)*.005)}}
