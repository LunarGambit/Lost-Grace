// Baseline difficulty for ordinary enemies; health is fixed at spawn.
export function ordinaryEnemyHealth(seconds){
  const minutes=Math.max(0,seconds)/60;
  return 12*(1+.16*minutes+.012*minutes*minutes);
}

// Keep the existing damage pace, but interpolate between minute marks.
export function enemyDamageMultiplier(seconds){
  return 1+.15*Math.max(0,seconds-300)/60;
}

// A gradual increase with an upper bound, independent of player level.
export function enemySpeedMultiplier(seconds){
  return 1+Math.min(.3,.005*Math.max(0,seconds)/60);
}
