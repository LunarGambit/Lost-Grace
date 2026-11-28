const bossHealth=[150, 225, 300, 450, 600, 750, 900, 1050, 1200, 5000, 7500, 9000, 12000, 15000, 18000, 21000, 24000, 27000, 30000, 33000, 45000, 52500, 60000, 67500, 75000, 82500, 90000, 97500, 105000, 112500, 150000, 225000, 300000, 375000, 450000, 525000, 600000, 675000, 750000, 825000, 1500000, 1950000, 2400000, 2850000, 3300000, 3750000, 4500000, 5250000, 6000000, 6750000, 12000000, 13500000, 15000000, 16500000, 18000000, 19500000, 21000000, 22500000, 24000000, 25500000, 30000000, 45000000, 50000000, 65000000, 70000000, 75000000, 80000000, 85000000, 90000000, 95000000];
// Wave rules. Wave 1 uses the original enemy stats; later waves compound.
const quotas=[50,75,100,150,200,250,300,350,400,500,600,700,800,900,1000,1200,1400,1600,1800,2500,3000,4000,5000,6000,7000,8000,9000,10000,11000,15000,17500,20000,22500,25000,27500,30000,32500,35000,37500,50000,75000,100000,125000,150000,175000,200000,225000,250000,275000,500000,650000,800000,950000,1100000,1250000,1500000,1750000,2000000,2250000,4000000,4500000,5000000,5500000,6000000,6500000,7000000,7500000,8000000,8500000,10000000];
const graceRewards=[100, 100, 100, 100, 500, 100, 100, 100, 200, 500, 200, 200, 200, 200, 500, 200, 200, 200, 300, 500, 300, 300, 300, 300, 500, 300, 300, 300, 400, 1000, 400, 400, 400, 400, 1000, 400, 400, 400, 500, 1000, 500, 500, 500, 500, 1000, 500, 500, 500, 600, 600, 1000, 600, 600, 600, 1000, 600, 600, 600, 700, 1000, 700, 700, 700, 700, 1000, 700, 700, 700, 700, 1000];
export const ENEMY_CAP=750;
export const PREPARATION_SECONDS=30;
export const ANVIL_WAVES=[15,22,30,35,40,45,50,55,60,65];
export const BLACKSMITH_WAVES=[18,27,32,37,42,47,52,57,62,67];
export const ECONOMY=Object.freeze({enchant:100,heal:500,healFraction:.4,chest:50,affix:[50,75,100,125,150],upgrade:[25,50,100,200],rerollGrace:[50,75,100,125,150,200,250],rerollScrap:[25,50,75,100,125,150,175],blacksmith:{grace:500,scrap:250,gold:150},discard:[5,10,15,20,25],runeDiscardGrace:75});
export function waveRules(wave){
 if(!Number.isInteger(wave)||wave<1||wave>70)throw new RangeError('Wave must be between 1 and 70');
 const decade=Math.floor((wave-1)/10),milestone=wave%5===0;
 const grace=graceRewards[wave-1];
 const reward=milestone?20*wave:wave<=10?50:50+25*decade;
 const equipment=milestone?(wave<=30?5:wave<=40?8:wave<=50?9:wave<=60?10:12):wave<=10?2:decade+2;
 const minRarity=wave>=56?3:wave>=45?2:wave>=40?1:0,maxRarity=wave>=29?4:wave>=15?3:wave>=6?2:1;
 return {wave,quota:quotas[wave-1],spawnRate:wave*6,cap:ENEMY_CAP,hpMultiplier:1.05**(wave-1),damageMultiplier:1.002**(wave-1),bossDamageMultiplier:1.25**(wave-1),speedMultiplier:1+.0005*(wave-1),bossHp:bossHealth[wave-1],bossType:(wave-1)%4,bossXpMultiplier:wave<=10?25:wave<=25?50:100,grace,scrap:reward,gold:reward,equipment,minRarity,maxRarity,chests:wave<=30?5:0,anvil:ANVIL_WAVES.includes(wave),blacksmith:BLACKSMITH_WAVES.includes(wave)};
}
const diamondThresholds=[150,300,500,750,1250,1750,2500,3000,4500,6000];
export function bloodDiamondBonus(copies,damage){return .05*diamondThresholds.slice(0,Math.max(0,Math.min(5,Math.floor(copies)))*2).filter(n=>damage>=n).length;}
export function waveRewards(wave,{spiritualAlignment=0,centeredSelf=0,graceAffix=0,scrapAffix=0,coinpurse=0,monkeys=0,bloodDiamond=0,damageTaken=0}={}){const r=waveRules(wave),alignment=spiritualAlignment>0?.5:0;return {grace:Math.round(r.grace*(1+alignment+.05*centeredSelf+.01*graceAffix)),scrap:Math.round(r.scrap*(1+alignment+.01*scrapAffix)),gold:Math.round(r.gold*(1+alignment+.05*coinpurse+.05*monkeys+bloodDiamondBonus(bloodDiamond,damageTaken)))};}
export class WaveRun {
 constructor(){this.wave=1;this.phase='combat';this.kills=0;this.combatTime=0;this.waveTime=0;this.spawnCredit=0;this.preparation=30;this.completed=0;this.completedTime=0;this.damageTaken=0;this.cupsSpent=0;}
 tick(dt,{menuOpen=false,population=0}={}){if(!Number.isFinite(dt)||dt<0)throw new RangeError('Invalid delta');if(menuOpen||this.phase==='rewards'||this.phase==='ended')return 0;if(this.phase==='preparation'){this.preparation=Math.max(0,this.preparation-dt);return 0;}this.combatTime+=dt;this.waveTime+=dt;if(population>=750){this.spawnCredit=0;return 0;}this.spawnCredit+=dt*waveRules(this.wave).spawnRate;const count=Math.min(Math.floor(this.spawnCredit),750-population);this.spawnCredit=population+count>=ENEMY_CAP?0:this.spawnCredit-count;return count;}
 kill({support=false,event=false,boss=false}={}){if(boss&&this.phase==='boss'){this.completed=this.wave;this.completedTime=this.combatTime;this.phase='rewards';return 'complete';}if(this.phase!=='combat'||support||event)return null;this.kills++;if(this.kills>=waveRules(this.wave).quota){this.phase='boss';this.spawnCredit=0;return 'boss';}return null;}
 closeRewards(){if(this.phase!=='rewards')return false;this.phase='preparation';this.preparation=30;return true;}
 nextWave(){if(this.phase!=='preparation')return false;if(this.wave===70){this.phase='ended';return false;}this.wave++;this.phase='combat';this.kills=0;this.waveTime=0;this.damageTaken=0;this.spawnCredit=0;return true;}
 retry(){if(!['combat','boss'].includes(this.phase))return false;this.cupsSpent++;this.phase='combat';this.kills=0;this.damageTaken=0;this.spawnCredit=0;return true;}
}
export function holyLuckMultiplier(luck){const x=Math.max(0,Math.min(1500,luck))/1000;return 1+x/3+2*x*x/3;}
export function waveRarityWeights(wave,luck=0){const r=waveRules(wave),weights=[40,25,20,10,5].map((v,i)=>i>=r.minRarity&&i<=r.maxRarity?v:0),sum=weights.reduce((a,b)=>a+b,0);const normalized=weights.map(v=>v/sum);if(!normalized[4])return normalized;const holy=Math.min(1,normalized[4]*holyLuckMultiplier(luck)),factor=(1-holy)/(1-normalized[4]);return normalized.map((v,i)=>i===4?holy:v*factor);}
export function rollWaveRarity(wave,luck=0,random=Math.random){const weights=waveRarityWeights(wave,luck),names=['common','uncommon','rare','mythic','holy'];let n=random();for(let i=0;i<weights.length;i++){n-=weights[i];if(n<0)return names[i];}return names[waveRules(wave).maxRarity];}
