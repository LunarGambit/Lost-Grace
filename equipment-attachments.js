import * as THREE from 'three';
import {loadStaticModel} from './new-model-loader.js';

const grip = (bone, fraction, position, rotation, scale=1) => ({bone, fraction, position, rotation, scale});
const focus = grip('LeftHand',.35,[.08,.18,-.1],[-45,0,165]);
const shield = grip('LeftHand',.35,[-.06,0,0],[20,85,0]);
export const equipment = {
  BattleAxe: {slot:'weapon',twoHanded:true, grip:grip('RightHand',.65,[0,.08,0],[90,60,0]), attackGrip:grip('RightHand',.65,[0,0,-.08],[130,110,-45])},
  Bow: {slot:'weapon',twoHanded:true,ranged:true, grip:grip('LeftHand',.65,[.06,0,0],[105,-65,0])},
  Crossbow: {slot:'weapon',twoHanded:true,ranged:true, grip:grip('RightHand',.4,[-.02,.14,.02],[-20,255,-115])},
  Cudgel: {slot:'weapon',grip:grip('RightHand',.35,[0,.08,.1],[95,0,0])},
  Hammer: {slot:'weapon',twoHanded:true,grip:grip('RightHand',.65,[0,0,-.08],[130,110,-45])},
  HandAxe: {slot:'weapon',grip:grip('RightHand',.35,[-.02,.08,.1],[100,-80,0])},
  Javelin: {slot:'weapon',ranged:true,grip:grip('RightHand',.65,[-.02,.06,0],[55,0,0])},
  Sling: {slot:'weapon',ranged:true,grip:grip('RightHand',.35,[.02,-.16,-.02],[-310,-75,-10])},
  Spear: {slot:'weapon',twoHanded:true,grip:grip('RightHand',.65,[.06,.04,-.2],[120,115,-45],1.5)},
  Staff: {slot:'weapon',twoHanded:true,grip:grip('RightHand',.65,[0,.08,-.1],[130,95,-45])},
  ThrowingKnives: {slot:'weapon',ranged:true,grip:grip('RightHand',.35,[0,.12,0],[0,110,0],.5)},
  WalkingStick: {slot:'weapon',twoHanded:true,grip:grip('RightHand',.65,[0,.04,-.1],[-100,0,-25],1.5)},
  VoodooDoll: {slot:'weapon',ranged:true,grip:grip('RightHand',.35,[-.04,.08,0],[105,-110,0])},
  Wand: {slot:'weapon',grip:grip('RightHand',.35,[-.02,.04,.1],[120,-75,20])},
  SpiritFocus: {slot:'offhand',grip:focus}, WitchesTalisman: {slot:'offhand',grip:focus},
  ShrunkenHead: {slot:'offhand',grip:grip('LeftHand',.35,[.02,.04,-.14],[75,70,0])},
  SoulStone: {slot:'offhand',grip:grip('LeftHand',.35,[.06,.08,0],[-235,-5,0],.33)},
  WoodShield: {slot:'offhand',grip:shield}, StoneShield: {slot:'offhand',grip:shield}, BoneShield: {slot:'offhand',grip:shield},
  Quiver: {slot:'offhand',grip:grip('Hips',.35,[.14,-.06,0],[30,0,15])},
  Pouch: {slot:'offhand',grip:grip('Hips',.35,[.16,-.02,0],[0,100,5],.5)}
};
export function compatibilityMessage(weapon, offhand, magical=false) {
  if (!offhand) return '';
  const w=equipment[weapon];
  const magicOffhand=['SpiritFocus','WitchesTalisman','SoulStone','ShrunkenHead'].includes(offhand);
  const shield=['WoodShield','StoneShield','BoneShield'].includes(offhand);
  if (['Pouch','Quiver'].includes(offhand))
    return w?.ranged ? '' : 'Pouches and quivers require a ranged weapon.';
  if (magicOffhand)
    return (['Wand','VoodooDoll'].includes(weapon)&&magical)||(['Bow','Cudgel','HandAxe','Javelin','ThrowingKnives'].includes(weapon)&&magical)
      ? '' : 'A magic offhand requires an enchanted compatible weapon.';
  if (shield&&['Wand','Sling','Javelin','ThrowingKnives','HandAxe','Cudgel'].includes(weapon)) return '';
  if (shield&&magical) return 'A magic weapon requires a compatible magic offhand.';
  return w?.twoHanded ? 'Shields cannot be equipped with a two-handed weapon.' : '';
}
export function compatible(weapon, offhand, magical=false) { return !compatibilityMessage(weapon,offhand,magical); }

export const iconFiles = {
  BattleAxe:'BattleAxe.png', Bow:'Bow.png', Crossbow:'Crossbow.png', Cudgel:'Cudgel.png',
  Hammer:'Hammer.png', HandAxe:'Handaxe.png', Sling:'Sling.png', Spear:'Spear.png',
  Staff:'Staff.png', ThrowingKnives:'ThrowingKnives.png', WalkingStick:'WalkingStick.png',
  VoodooDoll:'VoodooDoll.png', ShrunkenHead:'ShrunkenHead.png', Wand:'Wand.png', BoneShield:'BoneShield.png', StoneShield:'StoneShield.png',
  WoodShield:'WoodShield.png', Pouch:'Pouch.png', Quiver:'Quiver.png', Javelin:'Javelin.png', WitchesTalisman:'WitchFocus.png',
  SoulStone:'SoulStone.png', SpiritFocus:'SpiritFocus.png'
};
export const existingWeaponModels = {
  rangedSling:'Sling', rangedSlingshot:'Sling', meleeClub:'Cudgel', rangedBow:'Bow',
  meleeBattleaxe:'BattleAxe', meleeHandaxe:'HandAxe', meleeHammer:'Hammer', rangedCrossbow:'Crossbow'
};
export const modelForItem = item => item?.equipModel || existingWeaponModels[item?.baseId] || null;
export function iconFor(name) { return iconFiles[name] ? `equipment-icons/${iconFiles[name]}` : null; }

const cache = new Map();
function getAsset(name) {
  if (!cache.has(name)) cache.set(name, loadStaticModel(name).catch(error => {cache.delete(name); throw error}));
  return cache.get(name);
}
export function createEquipmentAttachments(character, bindHeight, onError=console.error) {
  const state = {weapon:{},offhand:{}};
  function clear(slot) { const s=state[slot]; s.token=(s.token||0)+1; if(s.holder)s.holder.removeFromParent(); s.holder=null; s.name=null; }
  async function set(slot,name,phase='idle',options={}) {
    if (!name || !equipment[name] || equipment[name].slot!==slot) {clear(slot); return true;}
    const spec=equipment[name], hipMagic=slot==='offhand'&&['Bow','Javelin'].includes(options.weapon)&&options.magical&&['SpiritFocus','WitchesTalisman','SoulStone','ShrunkenHead'].includes(name), selected=hipMagic?grip('Hips',.35,[.14,-.06,0],[30,0,15],spec.grip.scale):phase==='attack' && spec.attackGrip ? spec.attackGrip : spec.grip;
    const signature=name+':'+(hipMagic?'bowHip':selected===spec.attackGrip?'attack':'default'), s=state[slot];
    if(s.name===signature)return true;
    clear(slot); s.name=signature; const token=s.token;
    try {
      const asset=await getAsset(name); if(s.token!==token)return;
      const bone=character.getObjectByName(selected.bone); if(!bone)throw Error(`${name}: ${selected.bone} bone missing`);
      const object=asset.scene.clone(true), box=new THREE.Box3().setFromObject(object), dims=box.getSize(new THREE.Vector3()), center=box.getCenter(new THREE.Vector3()), longest=Math.max(dims.x,dims.y,dims.z);
      if(!longest || !bindHeight)throw Error(`${name}: invalid model dimensions`);
      const k=bindHeight*selected.fraction/longest;
      object.scale.setScalar(k);object.position.copy(center).multiplyScalar(-k);
      const holder=new THREE.Group();holder.name=`equipment_${slot}_${name}`;holder.add(object);
      holder.position.set(...selected.position.map(v=>v*bindHeight));holder.rotation.set(...selected.rotation.map(THREE.MathUtils.degToRad));holder.scale.setScalar(selected.scale);
      bone.add(holder);s.holder=holder;return true;
    } catch(error) { if(s.token===token){s.name=null;onError(error)} return false; }
  }
  return {set,clear};
}
