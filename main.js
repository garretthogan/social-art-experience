import { Euler, Matrix4, Quaternion, Vector2, Vector3 } from 'three';
import DecalsExperience from './experiences/decals';
import FPSExperience from './experiences/fps';
import Player from './objects/Player';

import camera from './utils/camera';
import { getDeltaTime } from './utils/clock';
import renderer from './utils/renderer';
import stats from './utils/stats';

export function startExperience(experience) {
	const socket = new WebSocket('ws://localhost:3000');
	socket.onmessage = (message) => {
		const data = JSON.parse(message.data);
		console.log('data:', data);
	};

	const container = document.getElementById('container');
	container.appendChild(renderer.domElement);
	container.appendChild(stats.domElement);
	container.addEventListener('mousedown', () => {
		if (experience.requestPointerLock) {
			document.body.requestPointerLock();
		}
	});

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	window.addEventListener('resize', onWindowResize);

	// maybe move this somewhere
	let x = 0;
	let y = 0;
	let extraX = 0;
	let extraY = 0;
	window.addEventListener('touchstart', (event) => {
		const touches = Array.from(event.touches);
		const touch = touches[0];
		x = touch.clientX;
		y = touch.clientY;

		const extraTouch = touch[1];
		if (extraTouch) {
			extraX = extraTouch.clientX;
			extraY = extraTouch.clientY;
		}
	});

	const user = new Player();
	window.addEventListener('touchmove', (event) => {
		const classList = Array.from(event.target.classList);
		if (!classList.includes('touch-pad')) return;

		const touches = Array.from(event.touches);
		if (touches.length > 0) {
			const touch = touches[0];
			const currentX = touch.clientX;
			const currentY = touch.clientY;

			const diffX = currentX - x;
			const diffY = currentY - y;
			const velocity = new Vector3(diffX, 0, diffY);
			const dt = getDeltaTime();
			user.applyForce(velocity, dt);
		}

		if (touches.length > 1) {
			const extraTouch = touches[1];
			const currentX = extraTouch.clientX;
			const currentY = extraTouch.clientY;

			const diffX = currentX - extraX;
			const diffY = currentY - extraY;
			const angle = Math.atan2(diffY, diffX);
			const mat4 = new Matrix4().makeRotationAxis(new Vector3(0, 1, 0), angle);

			camera.rotation.setFromRotationMatrix(mat4);
			// camera.rotation.y -= (velocity.y / 500) * getDeltaTime();
			// camera.rotation.x -= diffY / 50000;
		}
	});

	experience.start(user);
	experience.update();
}

const fpsExperience = new FPSExperience();
const decalsExperience = new DecalsExperience();
startExperience(fpsExperience);
