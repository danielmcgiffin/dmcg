import * as THREE from 'three';
import { shadow } from './materials';

export type Person = THREE.Group & { userData: { phase: number; bob: number; baseY?: number } };

export function makePerson(shirt: number, hair = 0x2a2018): Person {
	const group = new THREE.Group() as Person;
	const skin = new THREE.MeshLambertMaterial({ color: 0xe8c4a8 });
	const cloth = new THREE.MeshLambertMaterial({ color: shirt });
	const dark = new THREE.MeshLambertMaterial({ color: hair });
	const head = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 12), skin));
	head.position.y = 1.36;
	const hairCap = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.175, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.45), dark));
	hairCap.position.set(0, 1.42, -0.01);
	const torso = shadow(new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.48, 5, 10), cloth));
	torso.position.y = 0.82;
	const hips = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.17, 0.28, 10), new THREE.MeshLambertMaterial({ color: 0x3a2a20 })));
	hips.position.y = 0.42;
	const legG = new THREE.CylinderGeometry(0.07, 0.08, 0.38, 8);
	const left = shadow(new THREE.Mesh(legG, dark));
	const right = shadow(new THREE.Mesh(legG, dark));
	left.position.set(-0.08, 0.19, 0);
	right.position.set(0.08, 0.19, 0);
	const armG = new THREE.CapsuleGeometry(0.055, 0.32, 4, 8);
	const lArm = shadow(new THREE.Mesh(armG, cloth));
	const rArm = shadow(new THREE.Mesh(armG, cloth));
	lArm.position.set(-0.24, 0.92, 0);
	rArm.position.set(0.24, 0.92, 0);
	lArm.rotation.z = 0.18;
	rArm.rotation.z = -0.18;
	group.add(head, hairCap, torso, hips, left, right, lArm, rArm);
	group.userData.phase = Math.random() * Math.PI * 2;
	group.userData.bob = 0.012 + Math.random() * 0.01;
	return group;
}

export function idlePerson(person: Person, time: number, reduced: boolean): void {
	if (person.userData.baseY === undefined) person.userData.baseY = person.position.y;
	if (reduced) {
		person.position.y = person.userData.baseY;
		return;
	}
	const t = time * 1.4 + person.userData.phase;
	person.position.y = person.userData.baseY + Math.sin(t) * person.userData.bob;
	person.rotation.y += Math.sin(t * 0.35) * 0.0015;
}
