import * as THREE from 'three';

// The supplied static models have one texture each. Keep the original OBJ UVs.
export async function loadStaticModel(name) {
  const base = `./new-models/${name}/${name}`;
  const [response, texture] = await Promise.all([
    fetch(`${base}${name === 'RuinCircle' ? '-low-414.obj' : name === 'RuinArch' ? '-low-86.obj' : name === 'Tower' ? '-replacement.obj' : '.obj'}`), new THREE.TextureLoader().loadAsync(`${base}${name === 'RuinCircle' ? '-low-414.png' : name === 'RuinArch' ? '-low-86.png' : name === 'Tower' ? '-replacement.png' : '.png'}`)
  ]);
  if (!response.ok) throw new Error(`Could not load ${name}: ${response.status}`);
  const vertices = [], uvs = [], normals = [], positions = [], texcoords = [], outNormals = [];
  for (const line of (await response.text()).split(/\r?\n/)) {
    const parts = line.trim().split(/\s+/);
    if (parts[0] === 'v') vertices.push(parts.slice(1, 4).map(Number));
    else if (parts[0] === 'vt') uvs.push(parts.slice(1, 3).map(Number));
    else if (parts[0] === 'vn') normals.push(parts.slice(1, 4).map(Number));
    else if (parts[0] === 'f') {
      const face = parts.slice(1).map(p => p.split('/').map(Number));
      const get = (items, index, fallback) => items[index > 0 ? index - 1 : items.length + index] || fallback;
      for (let i = 1; i < face.length - 1; i++) for (const point of [face[0], face[i], face[i + 1]]) {
        positions.push(...get(vertices, point[0], [0, 0, 0]));
        texcoords.push(...get(uvs, point[1], [0, 0]));
        outNormals.push(...get(normals, point[2], [0, 1, 0]));
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(texcoords, 2));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(outNormals, 3));
  texture.colorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Group();
  const visible=new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({map: texture, roughness: .8}));
  if(name==='Tower')visible.userData.visualOnlyTower=true;
  scene.add(visible);
  if(name==='Tower'){
    const material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
    const body=new THREE.Mesh(new THREE.BoxGeometry(.84,1.9025,.85),material);
    body.position.set(0,-.00075,-.43);body.visible=false;body.userData.collisionProxy=true;scene.add(body);
    const rampGeometry=new THREE.BufferGeometry();
    rampGeometry.setAttribute('position',new THREE.Float32BufferAttribute([-.36,-.27,0, .36,-.27,0, -.36,-.95,.90, .36,-.27,0, .36,-.95,.90, -.36,-.95,.90],3));
    rampGeometry.computeVertexNormals();
    const ramp=new THREE.Mesh(rampGeometry,material);ramp.visible=false;ramp.userData.collisionProxy=true;scene.add(ramp);
  }
  return {scene, animations: []};
}
