import { PerspectiveCamera } from 'three';

const camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.order = 'YXZ';

export default camera;
