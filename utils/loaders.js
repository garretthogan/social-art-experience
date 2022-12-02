import { Color, DoubleSide, Group, Mesh, MeshBasicMaterial, ShapeGeometry } from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function loadSVG(
	url,
	options = { drawFillShapes: true, drawStrokes: true, fillShapesWireframe: false, strokesWireframe: false }
) {
	const group = new Group();
	const fillStrokes = [];
	const lineStrokes = [];
	return new Promise((resolve, reject) => {
		const loader = new SVGLoader();

		loader.load(url, function (data) {
			const paths = data.paths;

			for (let i = 0; i < paths.length; i++) {
				const path = paths[i];

				const fillColor = path.userData.style.fill;
				if (options.drawFillShapes && fillColor !== undefined && fillColor !== 'none') {
					const material = new MeshBasicMaterial({
						color: new Color().setStyle(fillColor).convertSRGBToLinear(),
						opacity: path.userData.style.fillOpacity,
						transparent: true,
						side: DoubleSide,
						depthWrite: false,
						wireframe: options.fillShapesWireframe,
					});

					const shapes = SVGLoader.createShapes(path);

					for (let j = 0; j < shapes.length; j++) {
						const shape = shapes[j];

						const geometry = new ShapeGeometry(shape);
						const mesh = new Mesh(geometry, material);
						fillStrokes.push(mesh);

						group.add(mesh);
					}
				}

				const strokeColor = path.userData.style.stroke;

				if (options.drawStrokes && strokeColor !== undefined && strokeColor !== 'none') {
					const material = new MeshBasicMaterial({
						color: new Color().setStyle(strokeColor).convertSRGBToLinear(),
						opacity: path.userData.style.strokeOpacity,
						transparent: true,
						side: DoubleSide,
						depthWrite: false,
						wireframe: options.strokesWireframe,
					});

					for (let j = 0, jl = path.subPaths.length; j < jl; j++) {
						const subPath = path.subPaths[j];

						const geometry = SVGLoader.pointsToStroke(subPath.getPoints(), path.userData.style);

						if (geometry) {
							const mesh = new Mesh(geometry, material);

							lineStrokes.push(mesh);
							group.add(mesh);
						}
					}
				}
			}

			resolve({ group, fillStrokes, lineStrokes });
		});
	});
	//
}

export async function loadGLTF(url = 'collision-world.glb') {
	const loader = new GLTFLoader().setPath('./models/gltf/');

	return new Promise((resolve, reject) => {
		loader.load(url, (gltf) => {
			resolve(gltf);
		});
	});
}
