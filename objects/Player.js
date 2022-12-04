import { Group, Vector3 } from 'three';
import { Capsule } from 'three/addons/math/Capsule.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { keyStates, shoot } from '../utils/controls';
import camera from '../utils/camera';
import { checkIntersection, intersection, mouseHelper } from '../utils/intersection';
import scene from '../utils/scene';
import { loadSVG } from '../utils/loaders';

const GRAVITY = 30;

const urlToLoad = 'models/svg/tiger.svg';
const { fillStrokes, lineStrokes } = await loadSVG(urlToLoad);

export default class Player {
	constructor() {
		this.world = null;
		this.splatterParams = {
			minScale: 0.5,
			maxScale: 2.5,
			color: null,
		};

		document.addEventListener('keydown', (event) => {
			keyStates[event.code] = true;
		});

		document.addEventListener('keyup', (event) => {
			keyStates[event.code] = false;
		});

		document.addEventListener('mouseup', (event) => this.splatter());

		document.body.addEventListener('mousemove', (event) => {
			if (document.pointerLockElement === document.body) {
				camera.rotation.y -= event.movementX / 500;
				camera.rotation.x -= event.movementY / 500;
			}
		});

		this.direction = new Vector3();
		this.velocity = new Vector3();
		this.collider = new Capsule(new Vector3(0, 0.35, 0), new Vector3(0, 1, 0), 0.35);
		this.isOnFloor = false;

		const colorFormats = {
			string: '#ffffff',
			int: 0xffffff,
			object: { r: 1, g: 1, b: 1 },
			array: [1, 1, 1],
		};

		this.splatterParams.color = null;

		const gui = new GUI({ width: 200 });
		gui.addColor(colorFormats, 'string').onChange((value) => {
			this.splatterParams.color = value;
		});
	}

	getForwardVector() {
		camera.getWorldDirection(this.direction);
		this.direction.y = 0;
		this.direction.normalize();

		return this.direction;
	}

	getSideVector() {
		camera.getWorldDirection(this.direction);
		this.direction.y = 0;
		this.direction.normalize();
		this.direction.cross(camera.up);

		return this.direction;
	}

	controls(deltaTime) {
		// gives a bit of air control
		const speedDelta = deltaTime * (this.isOnFloor ? 25 : 8);

		if (keyStates['KeyW']) {
			this.velocity.add(this.getForwardVector().multiplyScalar(speedDelta));
		}

		if (keyStates['KeyS']) {
			this.velocity.add(this.getForwardVector().multiplyScalar(-speedDelta));
		}

		if (keyStates['KeyA']) {
			this.velocity.add(this.getSideVector().multiplyScalar(-speedDelta));
		}

		if (keyStates['KeyD']) {
			this.velocity.add(this.getSideVector().multiplyScalar(speedDelta));
		}

		if (this.isOnFloor) {
			if (keyStates['Space']) {
				this.velocity.y = 15;
			}
		}
	}

	applyForce(force, scalar) {
		this.velocity.add(force.multiplyScalar(scalar));
	}

	collision() {
		const result = this.world.octree.capsuleIntersect(this.collider);

		this.isOnFloor = false;

		if (result) {
			this.isOnFloor = result.normal.y > 0;

			if (!this.isOnFloor) {
				this.velocity.addScaledVector(result.normal, -result.normal.dot(this.velocity));
			}

			this.collider.translate(result.normal.multiplyScalar(result.depth));
		}
	}

	update(deltaTime) {
		let damping = Math.exp(-4 * deltaTime) - 1;

		if (!this.isOnFloor) {
			this.velocity.y -= GRAVITY * deltaTime;

			// small air resistance
			damping *= 0.2;
		}

		this.velocity.addScaledVector(this.velocity, damping);

		const deltaPosition = this.velocity.clone().multiplyScalar(deltaTime);
		this.collider.translate(deltaPosition);

		this.collision();

		camera.position.copy(this.collider.end);
	}

	teleportIfOob() {
		if (camera.position.y <= -25) {
			this.collider.start.set(0, 0.35, 0);
			this.collider.end.set(0, 1, 0);
			this.collider.radius = 0.35;
			camera.position.copy(this.collider.end);
			camera.rotation.set(0, 0, 0);
		}
	}

	splatter() {
		if (document.pointerLockElement !== null && this.world.level) {
			checkIntersection(0, 0, this.world.level.children[0], camera);
			// hit data
			const { position, orientation, splatterGroup } = shoot(
				intersection,
				mouseHelper,
				this.world.level.children[0],
				this.splatterParams
			);
			scene.add(splatterGroup);

			const group = new Group();
			group.scale.multiplyScalar(0.0025);
			group.scale.y *= -1;

			// group.rotateX(orientation.x);
			group.rotateY(orientation.y);
			group.position.x = position.x - 1;
			group.position.z = position.z;
			group.position.y = position.y + 1;

			// applies svg to group
			// lineStrokes.map((l) => group.add(l.clone()));
			// fillStrokes.map((f) => group.add(f.clone()));
			// scene.add(group);
		}
	}
}
