import * as THREE from 'three';
import { createOffice } from './building';

const CAPTIONS: Record<'reception' | 'studio' | 'owner', string> = {
	reception: 'Customers feel the care.',
	studio: 'People can do excellent work.',
	owner: 'You can see what comes next.'
};

export function hasWebGL(): boolean {
	try {
		const canvas = document.createElement('canvas');
		return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
	} catch {
		return false;
	}
}

export function mountOffice(root: HTMLElement): () => void {
	const canvas = root.querySelector<HTMLCanvasElement>('[data-office-canvas]');
	const pin = root.querySelector<HTMLElement>('[data-office-pin]');
	const cue = root.querySelector<HTMLElement>('[data-office-cue]');
	const close = root.querySelector<HTMLElement>('[data-office-close]');
	const caption = root.querySelector<HTMLElement>('[data-office-caption]');
	const hotspotButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-hotspot]'));
	if (!canvas || !pin) return () => undefined;

	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const renderer = new THREE.WebGLRenderer({
		canvas,
		antialias: true,
		alpha: false,
		powerPreference: 'high-performance'
	});
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.setClearColor(0xe9e1cc, 1);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.05;

	const scene = new THREE.Scene();
	scene.fog = new THREE.Fog(0xe9e1cc, 40, 70);

	const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 120);
	const camDistance = 22;
	const elev = Math.tan((35 * Math.PI) / 180) * camDistance * Math.SQRT1_2 * 2;
	camera.position.set(camDistance, elev, camDistance);
	camera.lookAt(1.8, 2.1, 0);
	camera.up.set(0, 1, 0);

	scene.add(new THREE.HemisphereLight(0xf3efe4, 0x8a7a5a, 0.85));
	const sun = new THREE.DirectionalLight(0xfff2d6, 1.35);
	sun.position.set(12, 22, 8);
	sun.castShadow = true;
	sun.shadow.mapSize.set(2048, 2048);
	sun.shadow.camera.left = -22;
	sun.shadow.camera.right = 22;
	sun.shadow.camera.top = 22;
	sun.shadow.camera.bottom = -22;
	sun.shadow.camera.near = 2;
	sun.shadow.camera.far = 50;
	sun.shadow.bias = -0.0008;
	scene.add(sun);
	const fill = new THREE.DirectionalLight(0xc5d8cc, 0.35);
	fill.position.set(-10, 8, -6);
	scene.add(fill);
	const warm = new THREE.PointLight(0xe8b86d, 1.1, 18, 2);
	warm.position.set(0, 5.2, 0);
	scene.add(warm);

	const office = createOffice();
	scene.add(office.root);

	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();
	let progress = reduced ? 1 : 0;

	const applyCaption = (id: keyof typeof CAPTIONS | null): void => {
		if (!caption) return;
		if (!id) {
			caption.hidden = true;
			caption.textContent = '';
			return;
		}
		caption.hidden = false;
		caption.textContent = CAPTIONS[id];
	};

	const setHotspotState = (open: boolean): void => {
		root.dataset.open = open ? 'true' : 'false';
		for (const button of hotspotButtons) button.disabled = !open;
	};

	const readProgress = (): number => {
		if (reduced) return 1;
		const rect = pin.getBoundingClientRect();
		const max = Math.max(1, pin.offsetHeight - window.innerHeight);
		const passed = Math.min(max, Math.max(0, -rect.top));
		return passed / max;
	};

	const frameCamera = (p: number, width: number, height: number): void => {
		const mobile = width < 720;
		const size = office.fitSize(p) * (mobile ? 1.38 : 1);
		const aspect = width / Math.max(1, height);
		camera.left = -size * aspect;
		camera.right = size * aspect;
		camera.top = size;
		camera.bottom = -size;
		camera.position.set(camDistance, elev, camDistance);
		camera.lookAt(mobile ? 0 : 1.8, mobile ? 1.4 : 2.1, mobile ? 1.2 : 0);
		camera.updateProjectionMatrix();
	};

	const resize = (): void => {
		const width = canvas.clientWidth || window.innerWidth;
		const height = canvas.clientHeight || window.innerHeight;
		renderer.setSize(width, height, false);
		frameCamera(progress, width, height);
	};

	const paint = (): void => {
		progress = readProgress();
		office.setProgress(progress);
		frameCamera(progress, canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);
		const open = progress >= 0.48;
		setHotspotState(open);
		if (cue) cue.hidden = progress > 0.12;
		if (close) close.hidden = progress < 0.9;
		if (!open) applyCaption(null);
		renderer.render(scene, camera);
	};

	let raf = 0;
	const started = performance.now();
	const loop = (): void => {
		office.tick((performance.now() - started) / 1000, reduced);
		paint();
		raf = window.requestAnimationFrame(loop);
	};

	const onScroll = (): void => {
		/* loop reads scroll each frame */
	};

	const pick = (clientX: number, clientY: number): void => {
		if (progress < 0.48) return;
		const bounds = canvas.getBoundingClientRect();
		pointer.x = ((clientX - bounds.left) / bounds.width) * 2 - 1;
		pointer.y = -((clientY - bounds.top) / bounds.height) * 2 + 1;
		raycaster.setFromCamera(pointer, camera);
		const objects = office.hotspots.map((item) => item.object);
		const hits = raycaster.intersectObjects(objects, false);
		if (!hits.length) return;
		const found = office.hotspots.find((item) => item.object === hits[0].object);
		if (found) applyCaption(found.id);
	};

	canvas.addEventListener('click', (event) => pick(event.clientX, event.clientY));
	for (const button of hotspotButtons) {
		button.addEventListener('click', () => {
			if (button.disabled) return;
			applyCaption(button.dataset.hotspot as keyof typeof CAPTIONS);
		});
	}

	window.addEventListener('resize', resize);
	window.addEventListener('scroll', onScroll, { passive: true });
	resize();
	paint();
	loop();

	return () => {
		window.cancelAnimationFrame(raf);
		window.removeEventListener('resize', resize);
		window.removeEventListener('scroll', onScroll);
		renderer.dispose();
	};
}
