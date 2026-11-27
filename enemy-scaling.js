// Baseline difficulty for ordinary enemies; health is fixed at spawn.
export function ordinaryEnemyHealth(seconds){
  const minutes=Math.max(0,seconds)/60;
  const baseline=12*(1+.16*minutes+.012*minutes*minutes),atTen=12*(1+.16*10+.012*100);
  const atFortyFive=12*(1+.16*45+.012*45*45);
  const health=baseline+Math.max(0,baseline-atTen)+2*Math.max(0,baseline-atFortyFive);
  const lateMultiplier=1+9*Math.min(1,Math.max(0,(minutes-30)/15));
  return health*lateMultiplier;
}

// Keep the existing damage pace, but interpolate between minute marks.
export function enemyDamageMultiplier(seconds){
  return 1+.15*Math.max(0,seconds-300)/60;
}

// Existing speed growth through 90 minutes, then +5% of the 90-minute speed per minute.
export function enemySpeedMultiplier(seconds){
  return (1+Math.min(.3,.005*Math.max(0,seconds)/60))*(1+.05*Math.max(0,seconds-5400)/60);
}

// From ten minutes onward ordinary enemy damage grows at twice its earlier rate.
export function ordinaryEnemyDamageMultiplier(seconds){return enemyDamageMultiplier(seconds)+.15*Math.max(0,seconds-600)/60+.30*Math.max(0,seconds-2700)/60}
export function ordinarySpawnScale(seconds){return seconds>=600?.5:1}
