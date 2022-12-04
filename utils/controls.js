import { Euler, Group, Mesh, MeshPhongMaterial, TextureLoader, Vector2, Vector3 } from 'three';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';

export const keyStates = {};

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
	opacity: 1,
});

const position = new Vector3();
const orientation = new Euler();
const size = new Vector3(10, 10, 10);

const decals = [];

const params = {
	minScale: 10,
	maxScale: 20,
	rotate: true,
};

export function shoot(intersection, mouseHelper, mesh, splatterParams) {
	position.copy(intersection.point);
	orientation.copy(mouseHelper.rotation);

	const minScale = splatterParams.minScale;
	const maxScale = splatterParams.maxScale;

	if (params.rotate) orientation.z = Math.random() * 2 * Math.PI;

	const scale = minScale + Math.random() * (maxScale - minScale);
	size.set(scale, scale, scale);

	const material = decalMaterial.clone();
	material.color.setHex(splatterParams.color ? `0x${splatterParams.color.split('#')[1]}` : Math.random() * 0xffffff);

	const m = new Mesh(new DecalGeometry(mesh, position, orientation, size), material);
	const group = new Group();
	group.add(m);
	decals.push(m);

	return { splatterGroup: group, position, orientation };
}
