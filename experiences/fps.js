import { Clock, Color, Fog } from 'three';

import renderer from '../utils/renderer';
import { hemisphere, sunlight } from '../utils/sunlight';
import camera from '../utils/camera';
import scene from '../utils/scene';

import World from '../World';
import Player from '../Player';
import stats from '../utils/stats';
import { STEPS_PER_FRAME } from '../utils/clock';

const clock = new Clock();

export default class FPSExperience {
	constructor() {
		this.requestPointerLock = true;
	}
	start(user) {
		const userAgent = window.navigator.userAgent;
		const touchPad = document.getElementById('touch-pad');
		const isMobile = userAgent.match(/Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/)?.length > 0;
		touchPad.style = `display:${isMobile ? 'inherit' : 'none'};`;

		scene.background = new Color(0x88ccee);
		scene.fog = new Fog(0x88ccee, 0, 50);

		this.update = this.update.bind(this);

		const world = new World();
		user.world = world;
		this.user = user;

		scene.add(world);
		scene.add(sunlight);
		scene.add(hemisphere);
	}

	update() {
		const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

		for (let i = 0; i < STEPS_PER_FRAME; i++) {
			this.user.controls(deltaTime);

			this.user.update(deltaTime);

			this.user.teleportIfOob();
		}

		renderer.render(scene, camera);

		stats.update();

		requestAnimationFrame(this.update);
	}
}
