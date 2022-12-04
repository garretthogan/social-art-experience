import * as THREE from 'three';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { checkIntersection, intersection, mouseHelper, line } from '../utils/intersection';
import { shoot } from '../utils/controls';
import scene from '../utils/scene';
import renderer from '../utils/renderer';
import camera from '../utils/camera';
import stats from '../utils/stats';

let mesh;

const textureLoader = new THREE.TextureLoader();

const decals = [];

const splatterParams = {
	minScale: 10,
	maxScale: 20,
	color: null,
};

export default class DecalsExperience {
	start() {
		scene.add(line);
		scene.add(mouseHelper);
		init();
	}
	update() {
		animate();
	}
}

function init() {
	// camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.z = 120;

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.minDistance = 50;
	controls.maxDistance = 200;

	scene.add(new THREE.AmbientLight(0x443333));

	const dirLight1 = new THREE.DirectionalLight(0xffddcc, 1);
	dirLight1.position.set(1, 0.75, 0.5);
	scene.add(dirLight1);

	const dirLight2 = new THREE.DirectionalLight(0xccccff, 1);
	dirLight2.position.set(-1, 0.75, -0.5);
	scene.add(dirLight2);

	loadLeePerrySmith();

	let moved = false;

	controls.addEventListener('change', function () {
		moved = true;
	});

	window.addEventListener('pointerdown', function () {
		moved = false;
	});

	window.addEventListener('pointerup', function (event) {
		if (moved === false) {
			const x = (event.clientX / window.innerWidth) * 2 - 1;
			const y = -(event.clientY / window.innerHeight) * 2 + 1;
			checkIntersection(x, y, mesh, camera);

			if (intersection.intersects) {
				const { splatterGroup } = shoot(intersection, mouseHelper, mesh, splatterParams);
				scene.add(splatterGroup);
			}
		}
	});

	const gui = new GUI();

	gui.add(splatterParams, 'minScale', 1, 30);
	gui.add(splatterParams, 'maxScale', 1, 30);
	gui.open();
}

function loadLeePerrySmith() {
	const loader = new GLTFLoader();

	loader.load('models/gltf/LeePerrySmith/LeePerrySmith.glb', function (gltf) {
		console.log('gltf', gltf.scene);
		mesh = gltf.scene.children[0];
		mesh.material = new THREE.MeshPhongMaterial({
			specular: 0x111111,
			map: textureLoader.load('models/gltf/LeePerrySmith/Map-COL.jpeg'),
			specularMap: textureLoader.load('models/gltf/LeePerrySmith/Map-SPEC.jpeg'),
			normalMap: textureLoader.load('models/gltf/LeePerrySmith/Infinite-Level_02_Tangent_SmoothUV.jpeg'),
			shininess: 25,
		});

		scene.add(mesh);
		mesh.scale.set(10, 10, 10);
	});
}

function removeDecals() {
	decals.forEach(function (d) {
		scene.remove(d);
	});

	decals.length = 0;
}

function animate() {
	requestAnimationFrame(animate);

	renderer.render(scene, camera);

	stats.update();
}
