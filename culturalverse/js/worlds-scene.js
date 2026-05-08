// Worlds page immersive 3D scene with explorable world spheres and path connections
(function () {
	function initWorldsScene() {
		const container = document.getElementById("worlds-three-canvas");
		if (!container) return;

		if (!window.CVThreeManager || !window.CVMyceliumNetwork || !window.CVParticleSystem) {
			console.warn("Three.js managers not ready");
			return;
		}

		const manager = window.CVThreeManager.init("worlds-three-canvas");
		if (!manager) {
			return false;
		}
		const worldsScene = manager.createScene("worlds", {
			ambientIntensity: 0.8,
			warmIntensity: 1.3,
			coolIntensity: 1,
			onUpdate: updateWorldsScene
		});

		manager.setActiveScene("worlds");

		const worlds = window.CV_WORLDS || [];

		// Create rotating world spheres
		const worldSpheres = [];
		const sphereRadius = 15;
		const spacingRadius = 35;

		worlds.forEach((world, idx) => {
			const angle = (idx / worlds.length) * Math.PI * 2;
			const x = Math.cos(angle) * spacingRadius;
			const y = Math.sin(angle) * spacingRadius;
			const z = 0;

			// Create layered sphere for each world
			const sphereGroup = new THREE.Group();

			// Inner core
			const coreGeo = new THREE.IcosahedronGeometry(sphereRadius * 0.6, 4);
			const coreColor = parseInt(world.primary?.replace("#", "0x") || "0xf0c96a");
			const coreMat = new THREE.MeshStandardMaterial({
				color: coreColor,
				emissive: coreColor,
				emissiveIntensity: 0.4,
				metalness: 0.3,
				roughness: 0.7
			});
			const core = new THREE.Mesh(coreGeo, coreMat);
			sphereGroup.add(core);

			// Outer shell with wireframe
			const shellGeo = new THREE.IcosahedronGeometry(sphereRadius, 3);
			const shellMat = new THREE.MeshStandardMaterial({
				color: coreColor,
				emissive: coreColor,
				emissiveIntensity: 0.2,
				metalness: 0.2,
				roughness: 0.8,
				wireframe: false
			});
			const shell = new THREE.Mesh(shellGeo, shellMat);
			sphereGroup.add(shell);

			// Wireframe lines
			const wireGeo = new THREE.IcosahedronGeometry(sphereRadius * 1.05, 2);
			const wireMat = new THREE.LineBasicMaterial({
				color: parseInt(world.secondary?.replace("#", "0x") || "0x1f9fb3"),
				transparent: true,
				opacity: 0.3
			});
			const wireframe = new THREE.LineSegments(
				new THREE.EdgesGeometry(wireGeo),
				wireMat
			);
			sphereGroup.add(wireframe);

			sphereGroup.position.set(x, y, z);
			sphereGroup.userData.world = world;
			sphereGroup.userData.angle = angle;
			sphereGroup.userData.orbitRadius = spacingRadius;
			sphereGroup.userData.pulseTime = Math.random() * Math.PI * 2;

			manager.addToScene("worlds", sphereGroup);
			worldSpheres.push(sphereGroup);
		});

		// Create particles flowing between worlds
		if (window.CVParticleSystem) {
			const flowParticles = window.CVParticleSystem.create({
				count: 100,
				color: 0xd98545,
				size: 0.6,
				speed: 0.2,
				bounds: { x: 100, y: 100, z: 100 }
			});
			manager.registerParticleSystem("worlds", flowParticles);
		}

		// Store for interaction
		manager.worldSpheres = worldSpheres;

		// Gesture handlers
		let rotation = { x: 0, y: 0 };
		let targetRotation = { x: 0, y: 0 };
		let selectedWorldIdx = -1;

		manager.onGestureDrag = function (data) {
			const sensitivity = 0.01;
			targetRotation.y += data.deltaX * sensitivity;
			targetRotation.x += data.deltaY * sensitivity;

			if (targetRotation.x > Math.PI / 3) {
				targetRotation.x = Math.PI / 3;
			}
			if (targetRotation.x < -Math.PI / 3) {
				targetRotation.x = -Math.PI / 3;
			}
		};

		manager.onGestureZoom = function (delta) {
			manager.camera.position.z *= delta;
			manager.camera.position.z = Math.max(50, Math.min(150, manager.camera.position.z));
		};

		// Click detection for world selection
		const raycaster = new window.THREE.Raycaster();
		const mouse = new window.THREE.Vector2();

		container.addEventListener("click", (event) => {
			mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
			mouse.y = -(event.clientY / container.clientHeight) * 2 + 1;

			raycaster.setFromCamera(mouse, manager.camera);

			const intersects = raycaster.intersectObjects(
				worldSpheres,
				true
			);

			if (intersects.length > 0) {
				let clickedSphere = intersects[0].object;
				while (clickedSphere.parent && !clickedSphere.userData.world) {
					clickedSphere = clickedSphere.parent;
				}

				if (clickedSphere.userData.world) {
					selectedWorldIdx = worldSpheres.indexOf(clickedSphere);
					// Highlight selected
					const prevSelected = worldSpheres.find((s, i) => s.userData.selected);
					if (prevSelected) {
						prevSelected.userData.selected = false;
					}
					clickedSphere.userData.selected = true;
				}
			}
		});

		// Animation loop
		function updateWorldsScene(scene) {
			rotation.x += (targetRotation.x - rotation.x) * 0.1;
			rotation.y += (targetRotation.y - rotation.y) * 0.1;

			// Apply rotation to scene or individual objects based on selection
			if (selectedWorldIdx >= 0) {
				// Zoom into selected world
				const selected = worldSpheres[selectedWorldIdx];
				manager.camera.position.z += (80 - manager.camera.position.z) * 0.05;
				selected.rotation.x += 0.003;
				selected.rotation.y += 0.002;
			} else {
				// Orbit view
				manager.camera.position.z += (100 - manager.camera.position.z) * 0.05;
				worldSpheres.forEach((sphere, idx) => {
					sphere.rotation.x = rotation.x;
					sphere.rotation.y = rotation.y;
					sphere.rotation.z += 0.0005;

					// Pulse effect
					sphere.userData.pulseTime += 0.01;
					const pulse = 0.5 + 0.5 * Math.sin(sphere.userData.pulseTime);
					sphere.scale.set(
						0.95 + pulse * 0.1,
						0.95 + pulse * 0.1,
						0.95 + pulse * 0.1
					);
				});
			}
		}

		console.log("✦ Worlds scene initialized with explorable spheres");
		return true;
	}

	document.addEventListener("DOMContentLoaded", function () {
		if (window.THREE) {
			initWorldsScene();
			return;
		}

		window.addEventListener(
			"cv:three-ready",
			function () {
				initWorldsScene();
			},
			{ once: true }
		);
	});
})();
