import * as THREE from 'three';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
// The source tree is 17 separate meshes; merge by material once and share geometry across all copies.
function compactTreeAsset(source){
 const root=source.scene;root.updateMatrixWorld(true);const inverse=new THREE.Matrix4().copy(root.matrixWorld).invert(),groups=new Map();
 root.traverse(mesh=>{if(!mesh.isMesh||Array.isArray(mesh.material))return;let geometry=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();
  for(const key of Object.keys(geometry.attributes))if(!['position','normal','uv'].includes(key))geometry.deleteAttribute(key);
  if(!geometry.attributes.normal)geometry.computeVertexNormals();if(!geometry.attributes.uv)geometry.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count*2),2));
  geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,mesh.matrixWorld));let group=groups.get(mesh.material);if(!group){group=[];groups.set(mesh.material,group)}group.push(geometry)
 });
 const scene=new THREE.Group();for(const [material,geometries] of groups){const geometry=mergeGeometries(geometries);if(!geometry)throw Error('Could not merge tree geometry');scene.add(new THREE.Mesh(geometry,material))}return {...source,scene};
}
export function createGeneratedWorld(scene,assetData){
 assetData={...assetData,tree:compactTreeAsset(assetData.tree)};
const N=15,CELL=40,HALF=300,HEIGHT=10,RUN=HEIGHT/Math.tan(Math.PI/6),RAMPWIDTH=CELL,dirs=[[1,0],[-1,0],[0,1],[0,-1]];
const tex=new THREE.TextureLoader().load('./grass-concept.png');tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
const wallTex=new THREE.TextureLoader().load('./cliff-rock-tile.png');wallTex.colorSpace=THREE.SRGBColorSpace;wallTex.wrapS=wallTex.wrapT=THREE.RepeatWrapping;
const groundMat=new THREE.MeshStandardMaterial({name:'lambert2',map:tex,roughness:1,side:THREE.DoubleSide}),cliffMat=new THREE.MeshStandardMaterial({map:wallTex,roughness:1,side:THREE.DoubleSide});
let mapGroup=new THREE.Group(),layout=[],ramps=[],gridVisible=false,seed=(Math.random()*4294967296)>>>0;scene.add(mapGroup);
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}function at(x,z){return layout[z]?.[x]}function cellCoord(x,z){return [Math.max(0,Math.min(N-1,Math.floor((x+HALF)/CELL))),Math.max(0,Math.min(N-1,Math.floor((z+HALF)/CELL)))]}function cellMin(i){return -HALF+i*CELL}function rampUsesCell(r,x,z){return r.cells?r.cells.some(v=>v[0]===x&&v[1]===z):r.lowX===x&&r.lowZ===z}function rampHeight(r,x,z){const run=r.run||RUN,rise=r.rise||HEIGHT;let t;if(r.dir[0]===1)t=(x-(r.border-run))/run;else if(r.dir[0]===-1)t=((r.border+run)-x)/run;else if(r.dir[1]===1)t=(z-(r.border-run))/run;else t=((r.border+run)-z)/run;return r.baseHeight+rise*THREE.MathUtils.clamp(t,0,1)}function heightAt(x,z){const [cx,cz]=cellCoord(x,z),cell=at(cx,cz);for(const r of ramps)if(rampUsesCell(r,cx,cz)&&x>=r.x0-1e-7&&x<=r.x1+1e-7&&z>=r.z0-1e-7&&z<=r.z1+1e-7)return rampHeight(r,x,z);return cell.level*HEIGHT}
function addQuad(arr,a,b,c,d,uvScale=20){for(const v of [a,b,c,a,c,d]){arr.p.push(...v);arr.uv.push(v[0]/uvScale,v[2]/uvScale)}}function addVertical(arr,a,b,c,d){for(const v of [a,b,c,a,c,d]){arr.p.push(...v);arr.uv.push((Math.abs(b[0]-a[0])>1?v[0]:v[2])/12,v[1]/12)}}function meshFrom(data,mat){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(data.p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(data.uv,2));g.computeVertexNormals();return new THREE.Mesh(g,mat)}
function defineRamp(r){const x0=cellMin(r.lowX),z0=cellMin(r.lowZ);r.baseHeight=at(r.lowX,r.lowZ).level*HEIGHT;if(r.dir[0]===1){r.border=x0+CELL;r.x0=r.border-RUN;r.x1=r.border;r.z0=z0+(CELL-RAMPWIDTH)/2;r.z1=r.z0+RAMPWIDTH}else if(r.dir[0]===-1){r.border=x0;r.x0=x0;r.x1=x0+RUN;r.z0=z0+(CELL-RAMPWIDTH)/2;r.z1=r.z0+RAMPWIDTH}else if(r.dir[1]===1){r.border=z0+CELL;r.z0=r.border-RUN;r.z1=r.border;r.x0=x0+(CELL-RAMPWIDTH)/2;r.x1=r.x0+RAMPWIDTH}else{r.border=z0;r.z0=z0;r.z1=z0+RUN;r.x0=x0+(CELL-RAMPWIDTH)/2;r.x1=r.x0+RAMPWIDTH}ramps.push(r)}
function buildLayout(){
 const variants=[0,0,0,1,1,2,3,4,5],neighbors=i=>{const x=i%3,z=Math.floor(i/3);return dirs.map(d=>[x+d[0],z+d[1]]).filter(([a,b])=>a>=0&&a<3&&b>=0&&b<3).map(([a,b])=>b*3+a)};let blocks=null;
 for(let attempt=0;attempt<50000;attempt++){const v=[...variants];for(let i=v.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[v[i],v[j]]=[v[j],v[i]]}if(v.some((h,i)=>h>0&&!neighbors(i).some(j=>v[j]===h-1)))continue;const seen=new Set([0]),q=[0];while(q.length){const i=q.pop();for(const j of neighbors(i))if(!seen.has(j)&&Math.abs(v[i]-v[j])<=1){seen.add(j);q.push(j)}}if(seen.size===9){blocks=v;break}}
 if(!blocks)throw Error('Could not generate a connected terrain layout');
 layout=Array.from({length:N},(_,z)=>Array.from({length:N},(_,x)=>{const block=Math.floor(z/5)*3+Math.floor(x/5),level=blocks[block];return {x,z,high:level>0,level,cluster:block}}));ramps=[];
 // Connect every neighboring chunk that differs by one elevation step.
 const boundaries=[];for(let bz=0;bz<3;bz++)for(let bx=0;bx<3;bx++)for(const [dx,dz] of [[1,0],[0,1]]){const nx=bx+dx,nz=bz+dz;if(nx>=3||nz>=3)continue;const a=blocks[bz*3+bx],b=blocks[nz*3+nx];if(Math.abs(a-b)!==1)continue;const candidates=[];for(let k=0;k<5;k++){const ax=bx*5+(dx?4:k),az=bz*5+(dz?4:k),xx=ax+dx,zz=az+dz;const low=a<b?{x:ax,z:az}:{x:xx,z:zz},high=a<b?{x:xx,z:zz}:{x:ax,z:az};candidates.push({hx:high.x,hz:high.z,lowX:low.x,lowZ:low.z,dir:[high.x-low.x,high.z-low.z]})}boundaries.push(candidates)}
 boundaries.sort(()=>rand()-.5);for(const options of boundaries){options.sort(()=>rand()-.5);const eligible=options.filter(r=>!ramps.some(v=>rampUsesCell(v,r.lowX,r.lowZ)||rampUsesCell(v,r.hx,r.hz)||(v.hx===r.lowX&&v.hz===r.lowZ)));if(!eligible.length)throw Error('Could not fit a ramp between terrain areas');defineRamp(eligible[0]);if(eligible.length>2&&rand()<.5){const second=eligible.find(r=>Math.abs(r.lowX-eligible[0].lowX)+Math.abs(r.lowZ-eligible[0].lowZ)>=2);if(second&&!ramps.some(v=>rampUsesCell(v,second.lowX,second.lowZ)||rampUsesCell(v,second.hx,second.hz)||(v.hx===second.lowX&&v.hz===second.lowZ)))defineRamp(second)}}
 // Where levels differ by multiple steps, optionally connect them with a single continuous 30-degree ramp.
 const longOptions=[];for(const row of layout)for(const high of row){if(high.level<2||ramps.some(v=>rampUsesCell(v,high.x,high.z)))continue;for(const d of dirs){const low=at(high.x-d[0],high.z-d[1]);if(!low||high.level-low.level<2)continue;const rise=(high.level-low.level)*HEIGHT,run=rise/Math.tan(Math.PI/6),n=Math.ceil((run-1e-7)/CELL),cells=[];let ok=true;for(let k=1;k<=n;k++){const x=high.x-d[0]*k,z=high.z-d[1]*k,cell=at(x,z);if(!cell||cell.level!==low.level||ramps.some(v=>rampUsesCell(v,x,z)||(v.hx===x&&v.hz===z))){ok=false;break}cells.push([x,z])}if(ok)longOptions.push({hx:high.x,hz:high.z,lowX:low.x,lowZ:low.z,dir:d,run,rise,baseHeight:low.level*HEIGHT,cells})}}
 if(longOptions.length){const r=longOptions[Math.floor(rand()*longOptions.length)],x0=cellMin(r.lowX),z0=cellMin(r.lowZ);if(r.dir[0]===1){r.border=x0+CELL;r.x0=r.border-r.run;r.x1=r.border;r.z0=z0;r.z1=z0+CELL}else if(r.dir[0]===-1){r.border=x0;r.x0=x0;r.x1=x0+r.run;r.z0=z0;r.z1=z0+CELL}else if(r.dir[1]===1){r.border=z0+CELL;r.z0=r.border-r.run;r.z1=r.border;r.x0=x0;r.x1=x0+CELL}else{r.border=z0;r.z0=z0;r.z1=z0+r.run;r.x0=x0;r.x1=x0+CELL}ramps.push(r)}
}
function addRampSide(arr,a,b,c){for(const v of [a,b,c]){arr.p.push(...v);arr.uv.push((Math.abs(b[0]-a[0])>1?v[0]:v[2])/12,v[1]/12)}}
function buildGeometry(){
 const ground={p:[],uv:[]},cliffs={p:[],uv:[]};
 const rampAt=(x,z)=>ramps.find(r=>rampUsesCell(r,x,z));
 const surface=(x,z,px,pz)=>{const c=at(x,z);if(!c)return 0;const r=rampAt(x,z);return r&&px>=r.x0-1e-7&&px<=r.x1+1e-7&&pz>=r.z0-1e-7&&pz<=r.z1+1e-7?rampHeight(r,px,pz):c.level*HEIGHT};
 for(let z=0;z<N;z++)for(let x=0;x<N;x++){
  const cell=at(x,z),x0=cellMin(x),z0=cellMin(z),r=rampAt(x,z),xs=r?[x0,THREE.MathUtils.clamp(r.x0,x0,x0+CELL),THREE.MathUtils.clamp(r.x1,x0,x0+CELL),x0+CELL].sort((a,b)=>a-b):[x0,x0+CELL],zs=r?[z0,THREE.MathUtils.clamp(r.z0,z0,z0+CELL),THREE.MathUtils.clamp(r.z1,z0,z0+CELL),z0+CELL].sort((a,b)=>a-b):[z0,z0+CELL];
  for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){const ax=xs[i],bx=xs[i+1],az=zs[j],bz=zs[j+1];if(bx-ax<1e-6||bz-az<1e-6)continue;const isRamp=r&&ax>=r.x0-1e-6&&bx<=r.x1+1e-6&&az>=r.z0-1e-6&&bz<=r.z1+1e-6,f=(px,pz)=>isRamp?rampHeight(r,px,pz):cell.level*HEIGHT;addQuad(ground,[ax,f(ax,az),az],[bx,f(bx,az),az],[bx,f(bx,bz),bz],[ax,f(ax,bz),bz])}
  // Build rock walls only between the actual heights of adjacent surfaces.
  for(const [dx,dz] of [[1,0],[0,1],...(x===0?[[-1,0]]:[]),...(z===0?[[0,-1]]:[])]){
   const nx=x+dx,nz=z+dz,other=at(nx,nz),r2=other&&rampAt(nx,nz),alongX=dz!==0,lo=alongX?x0:z0,hi=lo+CELL,fixed=alongX?z0+(dz>0?CELL:0):x0+(dx>0?CELL:0),cuts=[lo,hi];
   for(const rr of [r,r2])if(rr)for(const v of alongX?[rr.x0,rr.x1]:[rr.z0,rr.z1])if(v>lo+1e-6&&v<hi-1e-6)cuts.push(v);
   cuts.sort((a,b)=>a-b);const point=t=>alongX?[t,fixed]:[fixed,t],diff=t=>{const [px,pz]=point(t);return surface(x,z,px,pz)-surface(nx,nz,px,pz)};const crosses=[];
   for(let i=0;i<cuts.length-1;i++){const a=cuts[i],b=cuts[i+1],da=diff(a),db=diff(b);if(da*db< -1e-10)crosses.push(a+(b-a)*Math.abs(da)/(Math.abs(da)+Math.abs(db)))}cuts.push(...crosses);cuts.sort((a,b)=>a-b);
   for(let i=0;i<cuts.length-1;i++){const a=cuts[i],b=cuts[i+1];if(b-a<1e-6)continue;const [ax,az]=point(a),[bx,bz]=point(b),a1=surface(x,z,ax,az),a2=surface(nx,nz,ax,az),b1=surface(x,z,bx,bz),b2=surface(nx,nz,bx,bz);if(Math.max(Math.abs(a1-a2),Math.abs(b1-b2))<1e-6)continue;addVertical(cliffs,[ax,Math.min(a1,a2),az],[bx,Math.min(b1,b2),bz],[bx,Math.max(b1,b2),bz],[ax,Math.max(a1,a2),az])}
  }
 }
 const groundMesh=meshFrom(ground,groundMat),cliffMesh=meshFrom(cliffs,cliffMat); groundMesh.name='generatedGround'; cliffMesh.name='generatedCliffs'; mapGroup.add(groundMesh,cliffMesh);const gridGeo=new THREE.BufferGeometry(),g=[];for(let i=0;i<=N;i++){const p=-HALF+i*CELL;g.push(p,.05,-HALF,p,.05,HALF,-HALF,.05,p,HALF,.05,p)}gridGeo.setAttribute('position',new THREE.Float32BufferAttribute(g,3));const lines=new THREE.LineSegments(gridGeo,new THREE.LineBasicMaterial({color:0x78d8c6,transparent:true,opacity:.2}));lines.name='grid';lines.visible=false;mapGroup.add(lines)}
function asset(name,height){const obj=clone(assetData[name].scene),box=new THREE.Box3().setFromObject(obj),dim=box.getSize(new THREE.Vector3()),k=height/Math.max(dim.y,.01);obj.scale.multiplyScalar(k);obj.updateMatrixWorld(true);box.setFromObject(obj);const mid=box.getCenter(new THREE.Vector3());obj.position.sub(new THREE.Vector3(mid.x,box.min.y,mid.z));const anchor=new THREE.Group();anchor.add(obj);return anchor}
function chooseLandmarks(){
 const candidates=[];for(let z=0;z<N;z++)for(let x=0;x<N;x++){if(ramps.some(r=>rampUsesCell(r,x,z)))continue;const px=cellMin(x)+CELL/2,pz=cellMin(z)+CELL/2,region=[Math.floor(x/5),Math.floor(z/5)];candidates.push({x,z,px,pz,region})}candidates.sort(()=>rand()-.5);
 const specs=[['circle',19.5,70],['tower',75,33],['tower',75,33],['ruin',19.5,30],['ruin',19.5,30],['ruin',19.5,30],['ruin',19.5,30]],chosen=[];let attempts=0;
 function fits(c,name,radius){if(Math.abs(c.px)+radius>HALF-20||Math.abs(c.pz)+radius>HALF-20||Math.hypot(c.px-35,c.pz-35)<radius+5)return false;
  if(chosen.some(v=>Math.hypot(c.px-v.px,c.pz-v.pz)<Math.max(50,radius+v.radius+2)))return false;
  if(name==='tower'&&chosen.some(v=>v.name==='tower'&&Math.abs(c.region[0]-v.region[0])<=1&&Math.abs(c.region[1]-v.region[1])<=1))return false;
  if(name==='ruin'&&chosen.some(v=>v.name==='ruin'&&((c.region[0]===v.region[0]&&c.region[1]===v.region[1])||Math.hypot(c.px-v.px,c.pz-v.pz)<100)))return false;
  {const h=at(c.x,c.z).level;for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){const tile=at(c.x+dx,c.z+dz);if(!tile||tile.level!==h)return false;const nearestX=Math.max(0,Math.abs(dx)*CELL-CELL/2),nearestZ=Math.max(0,Math.abs(dz)*CELL-CELL/2);if(Math.hypot(nearestX,nearestZ)<radius&&ramps.some(r=>rampUsesCell(r,c.x+dx,c.z+dz)))return false}}
  return true}
 function search(i){if(i===specs.length)return true;if(++attempts>15000)return false;const [name,height,radius]=specs[i];for(const c of candidates){if(!fits(c,name,radius))continue;chosen.push({...c,name,height,radius});if(search(i+1))return true;chosen.pop()}return false}
 return search(0)?chosen:null
}
function placeAssets(landmarks){
 const placements={landmarks:landmarks.map(v=>({name:v.name,x:v.px,z:v.pz,region:v.region,radius:v.radius})),fruit:[],obelisks:[],piles:[],chests:[],scenery:[]};
 for(const v of landmarks){const obj=asset(v.name,v.height);obj.position.add(new THREE.Vector3(v.px,heightAt(v.px,v.pz),v.pz));obj.rotation.y=rand()*Math.PI*2;obj.name='landmark-'+v.name;mapGroup.add(obj)}
 const available=[];for(let z=0;z<N;z++)for(let x=0;x<N;x++){const px=cellMin(x)+CELL/2,pz=cellMin(z)+CELL/2;if(ramps.some(r=>rampUsesCell(r,x,z))||Math.hypot(px-35,pz-35)<25||landmarks.some(v=>Math.hypot(px-v.px,pz-v.pz)<v.radius+15))continue;available.push({x,z,region:Math.floor(z/5)*3+Math.floor(x/5)})}available.sort(()=>rand()-.5);
 const counts={trees:0,bushes:0,rocks:0,circle:1,ruins:4,towers:2};
 // Use horizontal model footprints plus five clear units, not only center points.
 const radiusCache=new Map();function assetRadius(name,height){const key=name+':'+height;if(!radiusCache.has(key)){const obj=asset(name,height),size=new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());radiusCache.set(key,Math.hypot(size.x,size.z)/2)}return radiusCache.get(key)}
 const used=landmarks.map(v=>[v.px,v.pz,v.radius]);
 function clearOfAssets(x,z,radius){return used.every(v=>Math.hypot(v[0]-x,v[1]-z)>=v[2]+radius+5)}
 for(const [name,count,height,key] of [['tree',90,32,'trees'],['bush',32,7.5,'bushes'],['rock',35,5,'rocks']]){
  const byRegion=Array(9).fill(0),radius=assetRadius(name,height);
  for(let i=0;i<count;i++){
   const order=available.map((c,index)=>({c,index})).sort((a,b)=>byRegion[a.c.region]-byRegion[b.c.region]);let chosen=null;
   for(const entry of order){const c=entry.c;for(let t=0;t<12;t++){const px=cellMin(c.x)+6+rand()*(CELL-12),pz=cellMin(c.z)+6+rand()*(CELL-12);if(clearOfAssets(px,pz,radius)){chosen={c,index:entry.index,px,pz};break}}if(chosen)break}
   if(!chosen)throw Error('Not enough clear scenery cells');const {c,index,px,pz}=chosen;available.splice(index,1);const obj=asset(name,height);obj.position.add(new THREE.Vector3(px,heightAt(px,pz)-(name==='rock'?.5:0),pz));obj.rotation.y=rand()*Math.PI*2;obj.name='scenery-'+name; mapGroup.add(obj);used.push([px,pz,radius]);byRegion[c.region]++;counts[key]++;placements.scenery.push({name,x:px,z:pz,cell:[c.x,c.z],region:c.region,radius})
  }
 }
 function candidate(radius){const x=(rand()*2-1)*280,z=(rand()*2-1)*280,[cx,cz]=cellCoord(x,z);if(ramps.some(r=>rampUsesCell(r,cx,cz))||!clearOfAssets(x,z,radius))return null;return [x,z]}
 function add(name,height,point,kind){const [x,z]=point;used.push([x,z,assetRadius(name,height)]);placements[kind].push({x,z,variant:name})}
 function spaced(name,count,height,kind,minDistance){for(let i=0;i<count;i++){let picked=null;for(let t=0;t<12000;t++){const p=candidate(assetRadius(name,height));if(p&&placements[kind].every(v=>Math.hypot(v.x-p[0],v.z-p[1])>=minDistance)){picked=p;break}}if(!picked)throw Error('Could not place '+kind+' with required spacing');add(name,height,picked,kind)}}
 spaced('fruit',6,30,'fruit',100);spaced('meadowFruit',3,7.5,'fruit',100);spaced('obelisk',2,10,'obelisks',350);spaced('pile',10,2.0141362249851227,'piles',50);
 for(let i=0;i<50;i++){let best=null,bestDistance=-1;for(let t=0;t<120;t++){const p=candidate(assetRadius('chest',1.25));if(!p)continue;const distance=placements.chests.length?Math.min(...placements.chests.map(v=>Math.hypot(v.x-p[0],v.z-p[1]))):Infinity;if(distance>bestDistance){best=p;bestDistance=distance}}if(!best)throw Error('Could not place chest');add('chest',1.25,best,'chests')}
 counts.fruit=placements.fruit.length;counts.obelisks=placements.obelisks.length;counts.piles=placements.piles.length;counts.chests=placements.chests.length;window.mapAssetPlacements=placements;return counts
}

// Batch static, non-interactive scenery by region and material while preserving
// the original invisible roots for per-object collision and placement records.
function batchSmallScenery(){
 const batches=new Map();mapGroup.updateMatrixWorld(true);
 for(const root of mapGroup.children){if(root.name!=='scenery-bush'&&root.name!=='scenery-rock')continue;
  const regionX=Math.max(0,Math.min(2,Math.floor((root.position.x+HALF)/200))),regionZ=Math.max(0,Math.min(2,Math.floor((root.position.z+HALF)/200)));
  root.traverse(mesh=>{if(!mesh.isMesh||Array.isArray(mesh.material)||mesh.isSkinnedMesh)return;
   const key=[regionX,regionZ,mesh.geometry.uuid,mesh.material.uuid].join(':');let group=batches.get(key);if(!group){group={geometry:mesh.geometry,material:mesh.material,matrices:[]};batches.set(key,group)}group.matrices.push(mesh.matrixWorld.clone());mesh.visible=false
  });
 }
 const inverse=new THREE.Matrix4().copy(mapGroup.matrixWorld).invert();for(const group of batches.values()){
  const instanced=new THREE.InstancedMesh(group.geometry,group.material,group.matrices.length);instanced.name='batched-scenery';for(let i=0;i<group.matrices.length;i++)instanced.setMatrixAt(i,new THREE.Matrix4().multiplyMatrices(inverse,group.matrices[i]));instanced.instanceMatrix.needsUpdate=true;instanced.computeBoundingSphere();mapGroup.add(instanced)
 }
}
let landmarks=null;for(let attempt=0;attempt<100&&!landmarks;attempt++){buildLayout();landmarks=chooseLandmarks()}if(!landmarks)throw Error('Could not generate valid landmark locations');buildGeometry();const counts=placeAssets(landmarks);batchSmallScenery();mapGroup.updateMatrixWorld(true);return {group:mapGroup,ground:mapGroup.getObjectByName('generatedGround'),cliffs:mapGroup.getObjectByName('generatedCliffs'),placements:window.mapAssetPlacements,heightAt,counts};
}
