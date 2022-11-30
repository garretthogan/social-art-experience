import { Euler, Mesh, MeshPhongMaterial, Scene, TextureLoader, Vector2, Vector3 } from 'three';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';

export const scene = new Scene();

const textureLoader = new TextureLoader();
const decalDiffuse = textureLoader.load('textures/decal/decal-diffuse.png');
const decalNormal = textureLoader.load('textures/decal/decal-normal.jpeg');

const decalMaterial = new MeshPhongMaterial({
	specular: 0x444444,
	map: decalDiffuse,
	normalMap: decalNormal,
	normalScale: new Vector2(1, 1),
	shininess: 30,
	transparent: true,
	depthTest: true,
	depthWrite: false,
	polygonOffset: true,
	polygonOffsetFactor: -4,
	wireframe: false,
});

const position = new Vector3();
const orientation = new Euler();
const size = new Vector3(10, 10, 10);

const decals = [];

const params = {
	minScale: 0.5,
	maxScale: 2.5,
	rotate: true,
	clear: function () {
		removeDecals();
	},
};

export function shoot(intersection, mouseHelper, mesh, color) {
	position.copy(intersection.point);
	orientation.copy(mouseHelper.rotation);

	if (params.rotate) orientation.z = Math.random() * 2 * Math.PI;

	const scale = params.minScale + Math.random() * (params.maxScale - params.minScale);
	size.set(scale, scale, scale);

	const material = decalMaterial.clone();
	material.color.setHex(color ? `0x${color.split('#')[1]}` : Math.random() * 0xffffff);

	const m = new Mesh(new DecalGeometry(mesh, position, orientation, size), material);

	decals.push(m);
	scene.add(m);
}

function removeDecals() {
	decals.forEach(function (d) {
		scene.remove(d);
	});

	decals.length = 0;
}
