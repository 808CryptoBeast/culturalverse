// Home page immersive 3D scene with mycelium network connecting worlds
(function () {
	function initHomeScene() {
		const container = document.getElementById("home-three-canvas");
		if (!container) return;

		if (!window.CVThreeManager || !window.CVMyceliumNetwork) {
			console.warn("Three.js managers not ready");
			return;
		}

		// Initialize Three.js
		const manager = window.CVThreeManager.init("home-three-canvas");
		if (!manager) {
			return false;
		}

		// Create home scene
		const homeScene = manager.createScene("home", {
			ambientIntensity: 0.7,
			warmIntensity: 1.2,
			coolIntensity: 0.9,
			onUpdate: updateHomeScene
		});

		manager.setActiveScene("home");

		// Create world nodes with mycelium paths
		const worlds = window.CV_WORLDS || [
			{ id: "kanaka", name: "Kānaka Maoli", primary: "#3cb371", secondary: "#1f9fb3" },
			{ id: "kemet", name: "Kemet", primary: "#f0c96a", secondary: "#d98545" }
		];

		// Add mycelium network core
		const network = window.CVMyceliumNetwork.create(worlds.length + 1, {
			nodeRadius: 3,
			nodeColor: 0xf0c96a,
			lineColor: 0xd98545,
			connectionLength: 40,
			pulseIntensity: 0.02
		});
		manager.addToScene("home", network);

		// Create particle system
		if (window.CVParticleSystem) {
			const particles = window.CVParticleSystem.create({
				count: 150,
				color: 0xf0c96a,
				size: 0.8,
				speed: 0.3,
				bounds: { x: 120, y: 120, z: 120 }
			});
			manager.registerParticleSystem("home", particles);
		}

		// Store reference for interaction
		manager.homeNetwork = network;
		manager.homeWorlds = worlds;

		// Gesture handlers for interactivity
		let rotation = { x: 0, y: 0 };
		let targetRotation = { x: 0, y: 0 };

		manager.onGestureDrag = function (data) {
			const sensitivity = 0.01;
			targetRotation.y += data.deltaX * sensitivity;
			targetRotation.x += data.deltaY * sensitivity;

			// Clamp x rotation
			if (targetRotation.x > Math.PI / 3) {
				targetRotation.x = Math.PI / 3;
			}
			if (targetRotation.x < -Math.PI / 3) {
				targetRotation.x = -Math.PI / 3;
			}
		};

		manager.onGestureZoom = function (delta) {
			manager.camera.position.z *= delta;
			manager.camera.position.z = Math.max(30, Math.min(150, manager.camera.position.z));
		};

		// Smooth rotation animation
		function updateHomeScene(scene) {
			rotation.x += (targetRotation.x - rotation.x) * 0.1;
			rotation.y += (targetRotation.y - rotation.y) * 0.1;

			network.rotation.x = rotation.x;
			network.rotation.y = rotation.y;

			// Update network animation
			if (network.userData.update) {
				network.userData.update();
			}
		}

		// Add click detection for world nodes
		const raycaster = new window.THREE.Raycaster();
		const mouse = new window.THREE.Vector2();

		container.addEventListener("click", (event) => {
			mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
			mouse.y = -(event.clientY / container.clientHeight) * 2 + 1;

			raycaster.setFromCamera(
				mouse,
				manager.camera
			);

			const nodes = network.userData.nodes.map((n) => n.mesh);
			const intersects = raycaster.intersectObjects(nodes);

			if (intersects.length > 0) {
				const clickedNode = intersects[0].object;
				const nodeIndex = nodes.indexOf(clickedNode);

				if (nodeIndex > 0 && nodeIndex <= worlds.length) {
					const world = worlds[nodeIndex - 1];
					window.location.href = "culturalverse/worlds.html";
				}
			}
		});

		console.log("✦ Home scene initialized with mycelium network");
		return true;
	}

	document.addEventListener("DOMContentLoaded", function () {
		if (window.THREE) {
			initHomeScene();
			return;
		}

		window.addEventListener(
			"cv:three-ready",
			function () {
				initHomeScene();
			},
			{ once: true }
		);
	});
})();
