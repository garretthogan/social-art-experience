import { Object3D } from 'three';
import { Octree } from 'three/addons/math/Octree.js';
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';

import { loadGLTF } from './utils/loaders';

export default class World extends Object3D {
	constructor() {
		super();
		this.octree = new Octree();
		this.preload();
	}

	async preload() {
		const gltf = await loadGLTF('collision-world.glb');
		this.add(gltf.scene);
		this.level = gltf.scene;

		this.octree.fromGraphNode(gltf.scene);

		gltf.scene.traverse((child) => {
			if (child.isMesh) {
				child.castShadow = true;
				child.receiveShadow = true;

				if (child.material.map) {
					child.material.map.anisotropy = 4;
				}
			}
		});

		this.helper = new OctreeHelper(this.octree);
		this.helper.visible = false;
		this.add(this.helper);
	}
}
