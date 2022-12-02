import {
	BoxGeometry,
	BufferGeometry,
	Line,
	LineBasicMaterial,
	Mesh,
	MeshNormalMaterial,
	Vector2,
	Vector3,
} from 'three';
import raycaster from './raycaster';

export const intersection = {
	intersects: false,
	point: new Vector3(),
	normal: new Vector3(),
};

export const mouseHelper = new Mesh(new BoxGeometry(1, 1, 10), new MeshNormalMaterial());
mouseHelper.visible = false;

const lineGeometry = new BufferGeometry();
lineGeometry.setFromPoints([new Vector3(), new Vector3()]);
export const line = new Line(lineGeometry, new LineBasicMaterial());

export function checkIntersection(x, y, mesh, camera) {
	const mouse = new Vector2();
	const intersects = [];
	if (mesh === undefined) return;

	mouse.x = x; // mouse to sceen space: (x / window.innerWidth) * 2 - 1;
	mouse.y = y; // mouse to screen space: -(y / window.innerHeight) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);
	raycaster.intersectObject(mesh, false, intersects);

	if (intersects.length > 0) {
		const p = intersects[0].point;
		mouseHelper.position.copy(p);
		intersection.point.copy(p);

		const n = intersects[0].face.normal.clone();
		n.transformDirection(mesh.matrixWorld);
		n.multiplyScalar(10);
		n.add(intersects[0].point);

		intersection.normal.copy(intersects[0].face.normal);
		mouseHelper.lookAt(n);

		const positions = line.geometry.attributes.position;
		positions.setXYZ(0, p.x, p.y, p.z);
		positions.setXYZ(1, n.x, n.y, n.z);
		positions.needsUpdate = true;

		intersection.intersects = true;

		intersects.length = 0;
	} else {
		intersection.intersects = false;
	}
}

// eventually we will have complex worlds with many meshes to check
export function checkIntersectionsForAllMeshes(x, y, meshes, camera) {
	return meshes.map((m) => checkIntersection(x, y, m, camera));
}
