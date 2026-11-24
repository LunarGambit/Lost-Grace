import * as THREE from 'three';

// The supplied static models have one texture each. Keep the original OBJ UVs.
export async function loadStaticModel(name) {
  const base = `./new-models/${name}/${name}`;
  const [response, texture] = await Promise.all([
    fetch(`${base}.obj`), new THREE.TextureLoader().loadAsync(`${base}.png`)
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
  scene.add(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({map: texture, roughness: .8})));
  return {scene, animations: []};
}
