import { Clock } from 'three';

const clock = new Clock();

export const STEPS_PER_FRAME = 5;

export function getDeltaTime() {
	return Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;
}
