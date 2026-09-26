import * as THREE from 'three';

function canvasTexture(draw: (ctx: CanvasRenderingContext2D, size: number) => void, size = 256): THREE.CanvasTexture {
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('No 2d context');
	draw(ctx, size);
	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.anisotropy = 8;
	texture.needsUpdate = true;
	return texture;
}

export function woodMap(): THREE.CanvasTexture {
	const texture = canvasTexture((ctx, size) => {
		ctx.fillStyle = '#8a5a33';
		ctx.fillRect(0, 0, size, size);
		for (let i = 0; i < 48; i += 1) {
			const y = (i / 48) * size + Math.sin(i) * 2;
			ctx.strokeStyle = `rgba(42, 22, 10, ${0.05 + (i % 5) * 0.02})`;
			ctx.lineWidth = 1 + (i % 3) * 0.4;
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.bezierCurveTo(size * 0.3, y + 3, size * 0.6, y - 3, size, y + 1);
			ctx.stroke();
		}
	});
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(6, 6);
	return texture;
}

export function plasterMap(): THREE.CanvasTexture {
	const texture = canvasTexture((ctx, size) => {
		ctx.fillStyle = '#efe6d2';
		ctx.fillRect(0, 0, size, size);
		for (let i = 0; i < 900; i += 1) {
			ctx.fillStyle = `rgba(80, 70, 50, ${Math.random() * 0.035})`;
			ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
		}
	});
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(3, 2);
	return texture;
}

export function makeMaterials(): Record<string, THREE.Material> {
	const wood = woodMap();
	const plaster = plasterMap();
	return {
		plaster: new THREE.MeshStandardMaterial({
			color: 0xf2ead8,
			map: plaster,
			roughness: 0.86,
			metalness: 0.02
		}),
		plasterInner: new THREE.MeshStandardMaterial({
			color: 0xf7f1e4,
			roughness: 0.9,
			metalness: 0
		}),
		green: new THREE.MeshStandardMaterial({
			color: 0x2f6845,
			roughness: 0.45,
			metalness: 0.08
		}),
		greenDark: new THREE.MeshStandardMaterial({
			color: 0x1c3f2b,
			roughness: 0.5,
			metalness: 0.06
		}),
		wood: new THREE.MeshStandardMaterial({
			color: 0xc48a55,
			map: wood,
			roughness: 0.72,
			metalness: 0.02
		}),
		walnut: new THREE.MeshStandardMaterial({
			color: 0x4a2e1c,
			roughness: 0.62,
			metalness: 0.04
		}),
		brass: new THREE.MeshStandardMaterial({
			color: 0xc4a35a,
			roughness: 0.28,
			metalness: 0.72
		}),
		ivory: new THREE.MeshStandardMaterial({
			color: 0xf7f1e3,
			roughness: 0.7,
			metalness: 0
		}),
		glass: new THREE.MeshStandardMaterial({
			color: 0xc5d8cc,
			roughness: 0.08,
			metalness: 0.12,
			transparent: true,
			opacity: 0.38,
			side: THREE.DoubleSide,
			depthWrite: false
		}),
		rug: new THREE.MeshStandardMaterial({ color: 0x6b3d32, roughness: 0.92 }),
		rugGreen: new THREE.MeshStandardMaterial({ color: 0x355c43, roughness: 0.92 }),
		upholstery: new THREE.MeshStandardMaterial({ color: 0x3d5c48, roughness: 0.8 }),
		upholsteryWarm: new THREE.MeshStandardMaterial({ color: 0x8a4e3a, roughness: 0.8 }),
		leaf: new THREE.MeshStandardMaterial({ color: 0x3f7a4e, roughness: 0.7 }),
		soil: new THREE.MeshStandardMaterial({ color: 0x5a3a24, roughness: 0.9 }),
		paper: new THREE.MeshStandardMaterial({ color: 0xf4efe4, roughness: 0.85 }),
		ember: new THREE.MeshStandardMaterial({
			color: 0xe8b86d,
			emissive: 0xe8b86d,
			emissiveIntensity: 0.65,
			roughness: 0.4
		}),
		service: new THREE.MeshStandardMaterial({
			color: 0x1a2e22,
			roughness: 0.35,
			metalness: 0.2,
			transparent: true,
			opacity: 0.88
		}),
		trace: new THREE.MeshStandardMaterial({
			color: 0xe8b86d,
			emissive: 0xc4a35a,
			emissiveIntensity: 0.9,
			roughness: 0.3
		}),
		ground: new THREE.MeshStandardMaterial({
			color: 0xe6dcc4,
			roughness: 0.95,
			metalness: 0
		}),
		path: new THREE.MeshStandardMaterial({ color: 0xd9cbb0, roughness: 0.9 })
	};
}

export function shadow(mesh: THREE.Mesh): THREE.Mesh {
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	return mesh;
}
