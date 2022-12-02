import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { loadGLTF, loadSVG } from './utils/loaders';
import { Group } from 'three';

let renderer, scene, camera, gui, guiData;

guiData = {
	currentURL: 'models/svg/tiger.svg',
	drawFillShapes: true,
	drawStrokes: true,
	fillShapesWireframe: false,
	strokesWireframe: false,
};

const container = document.getElementById('container');

//

camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(0, 0, 200);

//

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener('change', render);
controls.screenSpacePanning = true;

//

window.addEventListener('resize', onWindowResize);

scene = new THREE.Scene();
scene.background = new THREE.Color(0xb0b0b0);

//

const helper = new THREE.GridHelper(160, 10);
helper.rotation.x = Math.PI / 2;
scene.add(helper);

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
	renderer.render(scene, camera);
}

const urlToLoad = 'models/svg/tiger.svg';
const { fillStrokes, lineStrokes } = await loadSVG(urlToLoad);
const group = new Group();
group.scale.multiplyScalar(0.0025);
// group.position.x = -7.5;
// group.position.y = 7.5;
group.scale.y *= -1;

lineStrokes.map((l) => group.add(l));
fillStrokes.map((f) => group.add(f));

scene.add(group);
const gltf = await loadGLTF();
scene.add(gltf.scene);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(-5, 25, -1);
directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 0.01;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.right = 30;
directionalLight.shadow.camera.left = -30;
directionalLight.shadow.camera.top = 30;
directionalLight.shadow.camera.bottom = -30;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.radius = 4;
directionalLight.shadow.bias = -0.00006;
scene.add(directionalLight);
render();
