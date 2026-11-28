const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('index.html','utf8');
class V{constructor(x,y,z){Object.assign(this,{x,y,z})}clone(){return new V(this.x,this.y,this.z)}}
let ground={point:{y:0},object:{material:{name:'lambert2'}},face:{materialIndex:0}};
const ctx={THREE:{Vector3:V},generatedWorld:{heightAt:()=>0},boundPosition(){},waterCoversGround:()=>false,nearbyGroundRocks:()=>[],groundHit:()=>ground};vm.createContext(ctx);
vm.runInContext(source.slice(source.indexOf('function lootGroundHit('),source.indexOf('function lootGroundPosition(')),ctx);
const start=source.indexOf('function biomeAt('),end=source.indexOf('\n',start);vm.runInContext(source.slice(start,end),ctx);
assert.equal(ctx.lootGroundHit(0,0).object,ground.object);assert.equal(ctx.biomeAt(0,0),'grass');
ground.object.material=[{name:'lambert2'},{name:'lambert4'}];ground.face.materialIndex=1;assert.equal(ctx.biomeAt(0,0),'sand');
assert.equal(ctx.biomeAt(0,0,{point:{y:0}}),null);ground=null;assert.equal(ctx.biomeAt(0,0),null);
console.log('Collectible terrain metadata and missing-hit regression checks passed.');
