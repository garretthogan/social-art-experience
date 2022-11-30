import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { checkIntersection, intersection, mouseHelper, line } from './utils/intersection';
import { scene, shoot } from './utils/controls';
scene.add(line);
scene.add(mouseHelper);

const container = document.getElementById('container');

let renderer, camera, stats;
let mesh;

const textureLoader = new THREE.TextureLoader();

const decals = [];

const params = {
	minScale: 10,
	maxScale: 20,
	rotate: true,
	clear: function () {
		removeDecals();
	},
};

init();
animate();

function init() {
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	stats = new Stats();
	container.appendChild(stats.dom);

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
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

	window.addEventListener('resize', onWindowResize);

	let moved = false;

	controls.addEventListener('change', function () {
		moved = true;
	});

	window.addEventListener('pointerdown', function () {
		moved = false;
	});

	window.addEventListener('pointerup', function (event) {
		if (moved === false) {
			checkIntersection(event.clientX, event.clientY, mesh, camera);

			if (intersection.intersects) shoot(intersection, mouseHelper, mesh);
		}
	});

	window.addEventListener('pointermove', onPointerMove);

	function onPointerMove(event) {
		if (event.isPrimary) {
			checkIntersection(event.clientX, event.clientY, mesh, camera);
		}
	}

	const gui = new GUI();

	gui.add(params, 'minScale', 1, 30);
	gui.add(params, 'maxScale', 1, 30);
	gui.add(params, 'rotate');
	gui.add(params, 'clear');
	gui.open();
}

function loadLeePerrySmith() {
	const loader = new GLTFLoader();

	loader.load('models/gltf/LeePerrySmith/LeePerrySmith.glb', function (gltf) {
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

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	requestAnimationFrame(animate);

	renderer.render(scene, camera);

	stats.update();
}
