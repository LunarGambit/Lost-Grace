// Chest item tiers and limits are separate from the five gear rarities.
export const itemChart={
 'oracles-eye':['gold',2], 'coinpurse':['blue',10], pestilence:['blue',10], plauge:['purple',5], riot:['purple',5], 'deep-cuts':['blue',5], 'seeing-stars':['blue',5], 'break-a-leg':['blue',5], 'crushing-skulls':['blue',5], 'blood-diamond':['purple',5],
 'bigger-rocks':['white',10], 'stone-club':['white',10], ironbark:['white',10],
 'sharpened-bone':['white',10], quickcord:['white',10], 'stone-tools':['blue',10],
 hardtack:['white',10], 'fortunes-knuckle':['white',10], hotshot:['purple',6],
 unstoppable:['purple',5], 'iron-hammer':['purple',6], 'close-quarters':['purple',6], 'heavy-swings':['blue',5],
 'field-medic':['blue',5], 'bloodied-fang':['purple',6], 'ancient-hide':['purple',6],
 graveplate:['purple',6], 'broken-horseshoe':['purple',4], deathspark:['purple',6],
 'radiant-grace':['gold',6], 'golden-cup':['gold',2], 'power-rune':['gold',1], 'titans-might':['gold',1],
 'rabbits-foot':['blue',5], 'soul-wisp':['white',10], 'sharp-claws':['blue',5], 'soul-siphon':['blue',5],
 'timeless-hourglass':['gold',1], 'unstable-grace':['purple',5], pyrotechnics:['blue',5],
 permafrost:['blue',5], 'energy-of-the-gods':['blue',5], 'ancient-wrappings':['blue',5],
 'fallens-wing':['blue',5], acrobatics:['blue',5], 'rough-hide':['blue',5],
 'ravens-feather':['blue',5], 'wide-stance':['blue',5], 'quick-reflexes':['blue',5],
 adaptation:['purple',5], counterstrike:['purple',5],
 'light-conversion':['purple',6], 'dark-conversion':['purple',6],
 'blood-pact':['purple',5], 'locust-swarm':['gold',3], canibilism:['gold',3],
 'centered-self':['white',10], 'spiritual-alignment':['gold',1], soles:['white',10], alchemy:['white',10], chemistry:['white',10], rations:['blue',10], 'enchanted-defense':['purple',6], fortitude:['purple',6],
 'blood-thirsty':['gold',3], 'hunters-eye':['gold',5], 'wings-of-light':['gold',5], 'overcharged':['gold',1], 'warriors-feast':['gold',1], 'well-rested':['gold',1], 'the-best-offense':['gold',1], 'winged-sandals':['gold',1], 'supressing-fire':['gold',1], 'iron-defense':['gold',1], 'the-best-defense':['gold',1]
};
export const newItems=[
 ['centered-self','Centered Self',"+5% Grace gained per copy, including wave-completion Grace. Adds to other Grace reward bonuses."],
 ['spiritual-alignment','Spiritual Alignment',"+50% wave-completion Grace, scrap, and gold. Adds to other reward bonuses; does not increase equipment rewards."],
 ['soles','Soles','Increase movement speed by 2.5% per copy'],
 ['alchemy','Alchemy','Add 1 percentage point per copy to existing status application chances'],
 ['chemistry','Chemistry',"+5% damage-over-time damage and freeze, stun, shock and maim duration per copy. Does not extend damaging status durations."],
 ['rations','Rations','Increase healing received by 2.5% per copy'],
 ['enchanted-defense','Enchanted Defense','Convert 50% of defense into magic defense; +5 percentage points per additional copy'],
 ['fortitude','Fortitude','Convert 50% of magic defense into defense; +5 percentage points per additional copy'],
 ['blood-thirsty','Blood Thirsty','Heal 1 HP per attack hit per copy; healing can exceed maximum HP by 25% per copy'],
 ['hunters-eye',"Hunter's Eye",'Critical hits have a 5% chance to deal 3× their normal critical damage; +2.5 percentage points per additional copy'],
 ['wings-of-light','Wings of Light',"Hold jump while falling to hover for up to 6 seconds; +1 second per additional copy. Movement speed is 40% lower while hovering. Sprinting while airborne consumes stamina with this item."],
 ['blood-pact','Blood Pact','Deal 15% more damage per copy; lose 1 HP per copy each attack'],
 ['locust-swarm','Locust Swarm',"+25% damage-over-time damage per copy. Applying a damaging status also applies it to you, using your maximum HP and attack power, at 25% strength plus 5 percentage points per additional copy."],
 ['canibilism','Canibilism','Heal 2 HP per copy for each damage-over-time tick on an enemy'],
 ['overcharged','Overcharged',"Halve class ability cooldown from 90 to 45 seconds."],
 ['unstoppable','Unstoppable','While sprinting, deal 15% increased damage per copy'],
 ['warriors-feast',"Warriors Feast",'+5% of maximum HP as ATK and MATK; +10% healing received'],
 ['well-rested','Well Rested','+5% of maximum HP as defense and magic defense; +10% healing received'],
 ['the-best-offense','The Best Offense','+10% of combined defense and magic defense as ATK and MATK'],
 ['winged-sandals','Winged Sandals','Deal 0.5% more damage for every 1% movement-speed increase. Sprinting contributes.'],
 ['supressing-fire','Supressing Fire','+0.5 percentage points of evasion per extra projectile, capped at +25 percentage points'],
 ['iron-defense','Iron Defense','Gain block chance equal to 5% of combined Defense and Magic Defense, up to +25% block chance'],
 ['the-best-defense','The Best Defense','+15% of combined ATK and MATK as defense'],
 ['riot','Riot','Enemies killed by bleed or crushing blow have a 2% chance per copy to explode for 100% ATK in a 10-unit radius'],
 ['deep-cuts','Deep Cuts','Physical attacks have a 5% chance per copy to bleed for 3% maximum HP per second for 3 seconds, plus 10% ATK per half-second tick. Against bosses, each tick instead deals 0.1% maximum HP plus 5% ATK, before damage bonuses'],
 ['seeing-stars','Seeing Stars',"Physical attacks have a 5% chance per copy to stun for 0.5 seconds. Duration increases by 0.1% per ATK and is halved against bosses."],
 ['break-a-leg','Break A Leg',"Physical attacks have a 5% chance per copy to maim the target and enemies within 8 units, slowing them 15% for 3 seconds. Duration increases by 0.1% per ATK and is halved against bosses."],
 ['crushing-skulls','Crushing Skulls','Physical attacks have a 5% chance per copy to cause a crushing blow for 3% maximum HP per second for 3 seconds, plus 10% ATK per half-second tick. Against bosses, each tick instead deals 0.1% maximum HP plus 5% ATK, before damage bonuses'],
 ['plauge','Plauge','Enemies killed by burn or poison have a 2% chance per copy to explode, dealing 100% of your magic attack as magical damage within 10 units'],
 ['pestilence','Pestilence',"On killing an afflicted enemy, each active status has a 5% chance per copy to spread within 10 units for its remaining duration. Freeze, stun and shock spread to bosses at half duration."],
 ['rabbits-foot',"Rabbit's Foot",'+50 Luck per copy'],['soul-wisp','Soul Wisp','+5% magic attack per copy'],
 ['sharp-claws','Sharp Claws','Heal 0.5 HP per melee hit per copy'],['soul-siphon','Soul Siphon','Heal 0.5 HP per ranged hit per copy'],
 ['timeless-hourglass','Timeless Hourglass',"Repeats Hotshot hits, Iron Hammer hits and Radiant Grace waves; doubles Unstable Grace charges, Rough Hide damage, Adaptation and Counterstrike stacks gained, and Deathspark bonuses. Grants an extra chance for status items, Blood Magic, Pestilence, Plauge, Riot and Hunter's Eye to trigger."],
 ['unstable-grace','Unstable Grace',"Each normal projectile impact adds one halo missile per copy. Missiles deal weapon attack damage, can apply statuses and heal on hit, and cannot critically strike or charge the halo. The halo fires at your attack rate at the nearest enemy within ranged attack range; unused charges wait for a target."],
 ['pyrotechnics','Pyrotechnics','Magical attacks have a 5% chance per copy to burn for 3% maximum HP per second for 3 seconds, plus 10% MATK per half-second tick. Against bosses, each tick instead deals 0.1% maximum HP plus 5% MATK, before damage bonuses'],
 ['permafrost','Permafrost',"Magical attacks have a 5% chance per copy to freeze for 0.5 seconds. Duration increases by 0.1% per MATK and is halved against bosses."],
 ['energy-of-the-gods','Energy of the Gods',"Magical attacks have a 5% chance per copy to shock enemies within 8 units of the target, slowing them 15% for 3 seconds. Duration increases by 0.1% per MATK and is halved against bosses."],
 ['ancient-wrappings','Ancient Wrappings','Magical attacks have a 5% chance per copy to poison for 3% maximum HP per second for 3 seconds, plus 10% MATK per half-second tick. Against bosses, each tick instead deals 0.1% maximum HP plus 5% MATK, before damage bonuses'],
 ['fallens-wing',"Fallen's Feather",'Fall 15% slower per copy'],['acrobatics','Acrobatics','Deal 10% more damage per copy while airborne'],
 ['rough-hide','Rough Hide',"When an enemy attack damages you, deal 10% of HP lost per copy to enemies within 15 units. This damage can apply the equipped weapon status effect."],
 ['ravens-feather',"Raven's Feather",'Gain 10% attack speed per copy while airborne'],
 ['wide-stance','Wide Stance','Gain 5% block chance per copy'],['quick-reflexes','Quick Reflexes','Gain 5% evade chance per copy'],
 ['adaptation','Adaptation',"Each block adds a stack granting +1 defense and magic defense per copy, up to 100 stacks. All stacks expire after 3 seconds without a block."],
 ['counterstrike','Counterstrike',"Each evade adds a stack granting +1 ATK per copy, up to 100 stacks. All stacks expire after 3 seconds without an evade."],
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
export function crossStatBonuses(stats,counts){const n=id=>counts[id]||0, hp=stats.maxHp, def=stats.defense, atk=stats.attack;const addedAttack=n('warriors-feast')*hp*.05+n('the-best-offense')*(def+stats.magicDefense)*.1,currentDefense=def+n('well-rested')*hp*.05+n('the-best-defense')*(atk+stats.magicAttack)*.15;return {attack:atk+addedAttack,magicAttack:stats.magicAttack+addedAttack,defense:currentDefense,magicDefense:stats.magicDefense+n('well-rested')*hp*.05,evade:stats.evade+n('supressing-fire')*Math.min(25,Math.max(0,stats.projectiles)*.5),block:stats.block+n('iron-defense')*Math.min(25,Math.max(0,currentDefense+stats.magicDefense+n('well-rested')*hp*.05)*.05)}}
