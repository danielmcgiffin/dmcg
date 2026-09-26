import * as THREE from 'three';
import { makeMaterials, shadow } from './materials';
import { idlePerson, makePerson, type Person } from './people';

const W = 13;
const D = 11;
const WALL = 0.22;
const H1 = 3.4;
const H2 = 3.2;
const SLAB = 0.2;

function box(
	w: number,
	h: number,
	d: number,
	mat: THREE.Material,
	x = 0,
	y = 0,
	z = 0
): THREE.Mesh {
	const mesh = shadow(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat));
	mesh.position.set(x, y, z);
	return mesh;
}

function ease(t: number): number {
	return t * t * (3 - 2 * t);
}

function span(progress: number, a: number, b: number): number {
	return THREE.MathUtils.clamp((progress - a) / (b - a), 0, 1);
}

export type OfficeRig = {
	root: THREE.Group;
	hotspots: { id: 'reception' | 'studio' | 'owner'; object: THREE.Object3D }[];
	setProgress: (progress: number) => void;
	tick: (time: number, reduced: boolean) => void;
	fitSize: (progress: number) => number;
};

export function createOffice(): OfficeRig {
	const mat = makeMaterials();
	const root = new THREE.Group();

	const ground = shadow(new THREE.Mesh(new THREE.CircleGeometry(28, 64), mat.ground));
	ground.rotation.x = -Math.PI / 2;
	ground.position.y = -0.02;
	root.add(ground);
	const path = shadow(new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.04, 8), mat.path));
	path.position.set(0, 0.02, 9.2);
	root.add(path);

	const lowerFloor = new THREE.Group();
	const upperFloor = new THREE.Group();
	const lowerService = new THREE.Group();
	const upperService = new THREE.Group();
	const walls = {
		south: new THREE.Group(),
		north: new THREE.Group(),
		east: new THREE.Group(),
		west: new THREE.Group()
	};
	const roof = {
		solid: new THREE.Group(),
		n: new THREE.Group(),
		s: new THREE.Group(),
		e: new THREE.Group(),
		w: new THREE.Group()
	};

	lowerFloor.position.y = 0;
	upperFloor.position.y = H1;
	lowerService.position.y = -0.18;
	upperService.position.y = H1 - 0.18;

	buildLower(lowerFloor, mat);
	buildUpper(upperFloor, mat);
	buildStair(lowerFloor, mat);
	buildService(lowerService, mat, 0);
	buildService(upperService, mat, 1);
	buildWalls(walls, mat);
	buildRoof(roof, mat);

	const visitor = makePerson(0x4a6748);
	visitor.position.set(0.6, 0, 8.6);
	visitor.rotation.y = Math.PI;
	root.add(visitor);
	const lampA = new THREE.PointLight(0xffe1b0, 2.2, 11, 2);
	lampA.position.set(0, 2.6, 3.2);
	lowerFloor.add(lampA);
	const lampB = new THREE.PointLight(0xffe1b0, 2.2, 11, 2);
	lampB.position.set(3, 2.4, 1.2);
	upperFloor.add(lampB);
	const lampC = new THREE.PointLight(0xffe1b0, 1.8, 10, 2);
	lampC.position.set(-3.2, 2.4, -2.2);
	upperFloor.add(lampC);

	root.add(lowerService, lowerFloor, upperService, upperFloor);
	root.add(walls.south, walls.north, walls.east, walls.west);
	root.add(roof.solid, roof.n, roof.s, roof.e, roof.w);

	const people = collectPeople(root);
	const pulses = collectPulses(root);
	const hotspots: OfficeRig['hotspots'] = [
		{ id: 'reception', object: lowerFloor.getObjectByName('hot-reception') as THREE.Object3D },
		{ id: 'studio', object: upperFloor.getObjectByName('hot-studio') as THREE.Object3D },
		{ id: 'owner', object: upperFloor.getObjectByName('hot-owner') as THREE.Object3D }
	];

	const visitorHome = visitor.position.clone();

	const setProgress = (progress: number): void => {
		const roofLift = ease(span(progress, 0.15, 0.28));
		const roofOpen = ease(span(progress, 0.24, 0.44));
		const wallA = ease(span(progress, 0.3, 0.42));
		const wallB = ease(span(progress, 0.33, 0.45));
		const wallC = ease(span(progress, 0.36, 0.46));
		const wallD = ease(span(progress, 0.39, 0.47));
		const floorLift = ease(span(progress, 0.52, 0.7));
		const service = ease(span(progress, 0.7, 0.88));

		roof.solid.visible = progress < 0.2;
		roof.solid.position.y = H1 + H2 + 0.16 + roofLift * 0.4;
		const petalY = H1 + H2 + 0.16 + roofLift * 1.15;
		placePetal(roof.s, 0, petalY, D / 2, roofOpen, new THREE.Vector3(1, 0, 0), 1);
		placePetal(roof.n, 0, petalY, -D / 2, roofOpen, new THREE.Vector3(1, 0, 0), -1);
		placePetal(roof.e, W / 2, petalY, 0, roofOpen, new THREE.Vector3(0, 0, 1), -1);
		placePetal(roof.w, -W / 2, petalY, 0, roofOpen, new THREE.Vector3(0, 0, 1), 1);

		setWall(walls.south, 0, 0, D / 2, wallA, new THREE.Vector3(1, 0, 0), 1);
		setWall(walls.north, 0, 0, -D / 2, wallB, new THREE.Vector3(1, 0, 0), -1);
		setWall(walls.east, W / 2, 0, 0, wallC, new THREE.Vector3(0, 0, 1), -1);
		setWall(walls.west, -W / 2, 0, 0, wallD, new THREE.Vector3(0, 0, 1), 1);

		upperFloor.position.set(0, H1 + floorLift * 4.6, -floorLift * 1.5);
		upperService.position.set(0, H1 - 0.18 - service * 1.35, -floorLift * 1.5);
		lowerService.position.y = -0.18 - service * 1.15;
		lowerService.visible = progress > 0.68;
		upperService.visible = progress > 0.68;
		const glow = 0.55 + service * 0.8;
		(mat.trace as THREE.MeshStandardMaterial).emissiveIntensity = glow;
	};

	const tick = (time: number, reduced: boolean): void => {
		for (const person of people) idlePerson(person, time, reduced);
		if (!reduced) {
			visitor.position.x = visitorHome.x + Math.sin(time * 0.7) * 0.35;
			visitor.position.z = visitorHome.z + Math.cos(time * 0.35) * 0.15;
		}
		for (const pulse of pulses) {
			const t = (time * 0.22 + pulse.offset) % 1;
			pulse.mesh.position.lerpVectors(pulse.a, pulse.b, t);
			pulse.mesh.visible = lowerService.visible;
		}
	};

	setProgress(0);

	return {
		root,
		hotspots,
		setProgress,
		tick,
		fitSize: (progress) => THREE.MathUtils.lerp(8.6, 18.5, ease(span(progress, 0.12, 0.92)))
	};
}

function placePetal(
	group: THREE.Group,
	x: number,
	y: number,
	z: number,
	open: number,
	axis: THREE.Vector3,
	dir: number
): void {
	group.position.set(x, y, z);
	group.rotation.set(0, 0, 0);
	group.rotateOnAxis(axis, dir * open * 2.42);
}

function setWall(
	group: THREE.Group,
	x: number,
	y: number,
	z: number,
	open: number,
	axis: THREE.Vector3,
	dir: number
): void {
	group.position.set(x, y, z);
	group.rotation.set(0, 0, 0);
	group.rotateOnAxis(axis, dir * open * 1.62);
}

function buildLower(floor: THREE.Group, mat: Record<string, THREE.Material>): void {
	floor.add(box(W - 0.15, SLAB, D - 0.15, mat.wood, 0, SLAB / 2, 0));
	floor.add(box(4.6, 0.05, 3.4, mat.rug, 0, SLAB + 0.03, 3.2));
	receptionDesk(floor, mat);
	workbench(floor, mat, -3.6, 2.2, -2.4);
	plant(floor, mat, 5.2, 3.6);
	plant(floor, mat, -5.4, 3.8);
	coat(floor, mat, 5.6, 4.6);
	shelf(floor, mat, -5.8, -3.2, Math.PI / 2);

	const greeter = makePerson(0x2f6845);
	greeter.position.set(-0.7, SLAB, 3.5);
	greeter.rotation.y = 0.4;
	floor.add(greeter);
	const walker = makePerson(0xc4a07a, 0x3b2416);
	walker.position.set(2.4, SLAB, 1.4);
	walker.rotation.y = -0.8;
	floor.add(walker);
	const maker = makePerson(0x355c43);
	maker.position.set(-3.4, SLAB, -2.2);
	maker.rotation.y = 0.2;
	floor.add(maker);

	floor.add(hotspot('hot-reception', 0, 1.4, 3.6));

	floor.add(box(0.14, 2.6, 3.2, mat.plasterInner, -2.1, 1.4, 1.4));
	floor.add(box(0.14, 2.6, 2.8, mat.plasterInner, 2.4, 1.4, -0.6));
}

function buildUpper(floor: THREE.Group, mat: Record<string, THREE.Material>): void {
	floor.add(box(W - 0.2, SLAB, D - 0.2, mat.wood, 0, SLAB / 2, 0));
	floor.add(box(3.8, 0.05, 3.2, mat.rugGreen, 3.1, SLAB + 0.03, 1.2));
	floor.add(box(3.4, 0.05, 3, mat.rug, -3.2, SLAB + 0.03, -2.4));
	studioTable(floor, mat, 3.2, 1.3);
	ownerDesk(floor, mat, -3.4, -2.6);
	plant(floor, mat, 5.4, -3.8);
	shelf(floor, mat, 5.8, 2.8, -Math.PI / 2);
	pendant(floor, mat, 3.2, 1.3);
	pendant(floor, mat, -3.2, -2.4);

	const reviewer = makePerson(0x8a4e3a);
	reviewer.position.set(2.5, SLAB, 1.7);
	reviewer.rotation.y = 1.2;
	floor.add(reviewer);
	const colleague = makePerson(0xefe6d2, 0x5a3a24);
	colleague.position.set(3.9, SLAB, 0.7);
	colleague.rotation.y = -0.6;
	floor.add(colleague);
	const owner = makePerson(0x1c3f2b);
	owner.position.set(-3.5, SLAB, -1.8);
	owner.rotation.y = 0.15;
	floor.add(owner);

	floor.add(hotspot('hot-studio', 3.2, 1.5, 1.2));
	floor.add(hotspot('hot-owner', -3.3, 1.5, -2.4));

	floor.add(box(4.4, 2.5, 0.14, mat.plasterInner, 0.2, 1.35, -0.4));
}

function buildStair(floor: THREE.Group, mat: Record<string, THREE.Material>): void {
	const steps = 9;
	for (let i = 0; i < steps; i += 1) {
		const y = SLAB + 0.16 + i * (H1 / steps);
		const z = 0.2 - i * 0.28;
		floor.add(box(1.7, 0.14, 0.42, mat.walnut, 0.15, y, z));
	}
	floor.add(box(0.08, H1 - 0.4, 2.6, mat.brass, -0.78, H1 / 2, -0.6));
}

function buildService(group: THREE.Group, mat: Record<string, THREE.Material>, level: number): void {
	group.add(box(W - 0.6, 0.1, D - 0.6, mat.service, 0, 0, 0));
	const traces: [number, number, number, number][] =
		level === 0
			? [
					[-0.2, 3.2, -3.2, -2.2],
					[-3.2, -2.2, 3.1, 1.4],
					[0.2, 3.2, 0.2, -0.4]
				]
			: [
					[3.2, 1.2, -3.2, -2.4],
					[-3.2, -2.4, 0.2, 0.4],
					[3.2, 1.2, 0.4, 0.4]
				];
	for (const [x1, z1, x2, z2] of traces) {
		const dx = x2 - x1;
		const dz = z2 - z1;
		const len = Math.hypot(dx, dz);
		const mesh = box(len, 0.07, 0.16, mat.trace, (x1 + x2) / 2, 0.1, (z1 + z2) / 2);
		mesh.rotation.y = -Math.atan2(dz, dx);
		group.add(mesh);
		const pulse = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), mat.ember));
		pulse.position.set(x1, 0.14, z1);
		pulse.userData.pulse = { a: new THREE.Vector3(x1, 0.14, z1), b: new THREE.Vector3(x2, 0.14, z2), offset: Math.random() };
		group.add(pulse);
	}
}

function buildWalls(
	walls: Record<'south' | 'north' | 'east' | 'west', THREE.Group>,
	mat: Record<string, THREE.Material>
): void {
	const total = H1 + H2;
	southWall(walls.south, mat, total);
	northWall(walls.north, mat, total);
	sideWall(walls.east, mat, total, 1);
	sideWall(walls.west, mat, total, -1);
}

function southWall(group: THREE.Group, mat: Record<string, THREE.Material>, total: number): void {
	group.add(box(W, total, WALL, mat.plaster, 0, total / 2, -WALL / 2));
	group.add(box(W, 0.18, 0.28, mat.green, 0, total - 0.08, 0.02));
	group.add(box(W, 0.16, 0.26, mat.green, 0, 0.1, 0.02));
	windowPair(group, mat, -4.1, 1.7, 0.08);
	windowPair(group, mat, 4.1, 1.7, 0.08);
	windowPair(group, mat, -4.1, H1 + 1.5, 0.08);
	windowPair(group, mat, 4.1, H1 + 1.5, 0.08);
	group.add(box(1.5, 2.4, 0.08, mat.walnut, 0, 1.2, 0.08));
	group.add(box(0.18, 2.4, 0.12, mat.brass, -0.68, 1.2, 0.12));
	group.add(box(0.18, 2.4, 0.12, mat.brass, 0.68, 1.2, 0.12));
}

function northWall(group: THREE.Group, mat: Record<string, THREE.Material>, total: number): void {
	group.add(box(W, total, WALL, mat.plaster, 0, total / 2, WALL / 2));
	group.add(box(W, 0.18, 0.28, mat.green, 0, total - 0.08, -0.02));
	windowPair(group, mat, -3.4, H1 + 1.5, -0.08);
	windowPair(group, mat, 3.4, H1 + 1.5, -0.08);
	windowPair(group, mat, 0, 1.7, -0.08);
}

function sideWall(group: THREE.Group, mat: Record<string, THREE.Material>, total: number, dir: number): void {
	group.add(box(WALL, total, D, mat.plaster, (-dir * WALL) / 2, total / 2, 0));
	group.add(box(0.28, 0.18, D, mat.green, dir * 0.02, total - 0.08, 0));
	windowPair(group, mat, 0, 1.7, dir * 0.08, true);
	windowPair(group, mat, 2.6, H1 + 1.5, dir * 0.08, true);
	windowPair(group, mat, -2.6, H1 + 1.5, dir * 0.08, true);
}

function windowPair(
	group: THREE.Group,
	mat: Record<string, THREE.Material>,
	x: number,
	y: number,
	z: number,
	side = false
): void {
	const g = box(side ? 0.05 : 1.42, 1.55, side ? 1.42 : 0.05, mat.glass, x, y, z);
	const sill = box(side ? 0.16 : 1.7, 0.07, side ? 1.7 : 0.16, mat.walnut, x, y - 0.84, z);
	const head = box(side ? 0.1 : 1.7, 0.08, side ? 1.7 : 0.1, mat.greenDark, x, y + 0.84, z);
	const jam1 = box(side ? 0.1 : 0.08, 1.7, side ? 0.08 : 0.1, mat.greenDark, x + (side ? 0 : -0.78), y, z + (side ? -0.78 : 0));
	const jam2 = box(side ? 0.1 : 0.08, 1.7, side ? 0.08 : 0.1, mat.greenDark, x + (side ? 0 : 0.78), y, z + (side ? 0.78 : 0));
	group.add(g, sill, head, jam1, jam2);
}

function buildRoof(
	roof: { solid: THREE.Group; n: THREE.Group; s: THREE.Group; e: THREE.Group; w: THREE.Group },
	mat: Record<string, THREE.Material>
): void {
	roof.solid.add(box(W + 0.35, 0.28, D + 0.35, mat.greenDark, 0, 0, 0));
	roof.solid.add(box(W - 0.4, 0.08, D - 0.4, mat.green, 0, 0.14, 0));
	const petal = (g: THREE.Group, w: number, d: number, ox: number, oz: number): void => {
		g.add(box(w, 0.26, d, mat.greenDark, ox, 0.13, oz));
		g.add(box(w - 0.2, 0.06, d - 0.2, mat.plasterInner, ox, -0.02, oz));
	};
	petal(roof.s, W + 0.3, D / 2 + 0.2, 0, -(D / 4));
	petal(roof.n, W + 0.3, D / 2 + 0.2, 0, D / 4);
	petal(roof.e, W / 2 + 0.2, D + 0.3, -(W / 4), 0);
	petal(roof.w, W / 2 + 0.2, D + 0.3, W / 4, 0);
}

function receptionDesk(floor: THREE.Group, mat: Record<string, THREE.Material>): void {
	floor.add(box(2.8, 0.92, 0.9, mat.walnut, -0.2, SLAB + 0.46, 3.7));
	floor.add(box(0.7, 0.08, 0.5, mat.paper, 0.4, SLAB + 0.96, 3.7));
	floor.add(box(0.14, 0.08, 0.14, mat.brass, 0.7, SLAB + 1.02, 3.55));
	const cup = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.1, 10), mat.ivory));
	cup.position.set(-0.7, SLAB + 1.0, 3.55);
	floor.add(cup);
}

function workbench(floor: THREE.Group, mat: Record<string, THREE.Material>, x: number, _h: number, z: number): void {
	floor.add(box(3.2, 0.12, 1.4, mat.wood, x, SLAB + 0.78, z));
	floor.add(box(0.12, 0.78, 0.12, mat.walnut, x - 1.4, SLAB + 0.39, z - 0.55));
	floor.add(box(0.12, 0.78, 0.12, mat.walnut, x + 1.4, SLAB + 0.39, z - 0.55));
	floor.add(box(0.12, 0.78, 0.12, mat.walnut, x - 1.4, SLAB + 0.39, z + 0.55));
	floor.add(box(0.12, 0.78, 0.12, mat.walnut, x + 1.4, SLAB + 0.39, z + 0.55));
	floor.add(box(0.7, 0.08, 0.5, mat.ivory, x + 0.4, SLAB + 0.88, z));
	floor.add(box(0.4, 0.22, 0.4, mat.green, x - 0.7, SLAB + 0.98, z + 0.1));
}

function studioTable(floor: THREE.Group, mat: Record<string, THREE.Material>, x: number, z: number): void {
	floor.add(box(2.4, 0.1, 1.3, mat.wood, x, SLAB + 0.72, z));
	floor.add(box(0.1, 0.72, 0.1, mat.walnut, x - 1, SLAB + 0.36, z - 0.5));
	floor.add(box(0.1, 0.72, 0.1, mat.walnut, x + 1, SLAB + 0.36, z + 0.5));
	floor.add(box(0.9, 0.04, 0.6, mat.paper, x - 0.2, SLAB + 0.8, z));
	const chair = box(0.55, 0.45, 0.55, mat.upholstery, x - 0.9, SLAB + 0.35, z + 0.9);
	floor.add(chair);
	floor.add(box(0.55, 0.45, 0.55, mat.upholsteryWarm, x + 0.95, SLAB + 0.35, z - 0.85));
}

function ownerDesk(floor: THREE.Group, mat: Record<string, THREE.Material>, x: number, z: number): void {
	floor.add(box(2.6, 0.1, 1.15, mat.walnut, x, SLAB + 0.74, z));
	floor.add(box(0.08, 0.74, 0.08, mat.walnut, x - 1.1, SLAB + 0.37, z - 0.45));
	floor.add(box(0.08, 0.74, 0.08, mat.walnut, x + 1.1, SLAB + 0.37, z + 0.45));
	floor.add(box(0.55, 0.04, 0.4, mat.paper, x + 0.4, SLAB + 0.82, z));
	floor.add(box(0.7, 0.45, 0.7, mat.upholstery, x, SLAB + 0.35, z + 1.05));
	const book = box(0.28, 0.05, 0.2, mat.green, x - 0.7, SLAB + 0.82, z + 0.2);
	book.rotation.y = 0.4;
	floor.add(book);
}

function plant(floor: THREE.Group, mat: Record<string, THREE.Material>, x: number, z: number): void {
	floor.add(shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.28, 10), mat.soil)).translateX(x).translateY(SLAB + 0.2).translateZ(z));
	const foliage = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 10), mat.leaf));
	foliage.position.set(x, SLAB + 0.62, z);
	foliage.scale.set(1, 1.15, 1);
	floor.add(foliage);
}

function shelf(floor: THREE.Group, mat: Record<string, THREE.Material>, x: number, z: number, rot: number): void {
	const g = new THREE.Group();
	g.add(box(1.8, 2.1, 0.36, mat.walnut, 0, SLAB + 1.05, 0));
	g.add(box(1.6, 0.06, 0.3, mat.wood, 0, SLAB + 0.7, 0.02));
	g.add(box(1.6, 0.06, 0.3, mat.wood, 0, SLAB + 1.25, 0.02));
	g.position.set(x, 0, z);
	g.rotation.y = rot;
	floor.add(g);
}

function coat(floor: THREE.Group, mat: Record<string, THREE.Material>, x: number, z: number): void {
	floor.add(box(0.06, 1.3, 0.06, mat.brass, x, SLAB + 1.2, z));
	const coatMesh = box(0.34, 0.9, 0.12, mat.greenDark, x + 0.12, SLAB + 0.9, z);
	coatMesh.rotation.z = 0.18;
	floor.add(coatMesh);
}

function pendant(floor: THREE.Group, mat: Record<string, THREE.Material>, x: number, z: number): void {
	floor.add(box(0.03, 0.7, 0.03, mat.brass, x, H2 - 0.5, z));
	const lamp = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), mat.ember));
	lamp.position.set(x, H2 - 0.92, z);
	floor.add(lamp);
}

function hotspot(name: string, x: number, y: number, z: number): THREE.Mesh {
	const mesh = new THREE.Mesh(
		new THREE.SphereGeometry(0.42, 12, 10),
		new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
	);
	mesh.name = name;
	mesh.position.set(x, y, z);
	return mesh;
}

function collectPeople(root: THREE.Group): Person[] {
	const list: Person[] = [];
	root.traverse((obj: THREE.Object3D) => {
		if ((obj as Person).userData && typeof (obj as Person).userData.bob === 'number') list.push(obj as Person);
	});
	return list;
}

function collectPulses(root: THREE.Group): { mesh: THREE.Mesh; a: THREE.Vector3; b: THREE.Vector3; offset: number }[] {
	const list: { mesh: THREE.Mesh; a: THREE.Vector3; b: THREE.Vector3; offset: number }[] = [];
	root.traverse((obj: THREE.Object3D) => {
		if (obj.userData.pulse) {
			list.push({
				mesh: obj as THREE.Mesh,
				a: obj.userData.pulse.a,
				b: obj.userData.pulse.b,
				offset: obj.userData.pulse.offset
			});
		}
	});
	return list;
}
