// Protocols page immersive 3D scene showing protocol connections
(function () {
	function initProtocolsScene() {
		const container = document.getElementById("protocols-three-canvas");
		if (!container) return;

		if (!window.CVThreeManager || !window.CVMyceliumNetwork) {
			console.warn("Three.js managers not ready");
			return;
		}

		const manager = window.CVThreeManager.init("protocols-three-canvas");
		if (!manager) {
			return false;
		}
		const protocolsScene = manager.createScene("protocols", {
			ambientIntensity: 0.8,
			warmIntensity: 1.2,
			coolIntensity: 1.1,
			onUpdate: updateProtocolsScene
		});

		manager.setActiveScene("protocols");

		// Protocol nodes and connections
		const protocolNodes = [
			{ label: "Respect", color: 0xf0c96a },
			{ label: "Attribution", color: 0xd98545 },
			{ label: "Context", color: 0x1f9fb3 },
			{ label: "Governance", color: 0x3cb371 },
			{ label: "Sacred Knowledge", color: 0x9b7e57 }
		];

		// Create protocol node network
		const network = window.CVMyceliumNetwork.create(protocolNodes.length, {
			nodeRadius: 2.5,
			nodeColor: 0xf0c96a,
			lineColor: 0xd98545,
			connectionLength: 35,
			pulseIntensity: 0.025
		});

		// Customize node colors per protocol
		network.userData.nodes.forEach((node, idx) => {
			if (idx < protocolNodes.length) {
				const color = protocolNodes[idx].color;
				node.mesh.material.color.setHex(color);
				node.mesh.material.emissive.setHex(color);
				node.mesh.userData.label = protocolNodes[idx].label;
			}
		});

		manager.addToScene("protocols", network);

		// Add energy particles for protocol flow
		if (window.CVParticleSystem) {
			const particles = window.CVParticleSystem.create({
				count: 120,
				color: 0xd98545,
				size: 0.7,
				speed: 0.4,
				bounds: { x: 100, y: 100, z: 100 }
			});
			manager.registerParticleSystem("protocols", particles);
		}

		manager.protocolNetwork = network;

		// Gesture handlers
		let rotation = { x: 0, y: 0 };
		let targetRotation = { x: 0, y: 0 };
		let autoRotate = true;

		manager.onGestureDrag = function (data) {
			autoRotate = false;
			const sensitivity = 0.01;
			targetRotation.y += data.deltaX * sensitivity;
			targetRotation.x += data.deltaY * sensitivity;

			if (targetRotation.x > Math.PI / 2) {
				targetRotation.x = Math.PI / 2;
			}
			if (targetRotation.x < -Math.PI / 2) {
				targetRotation.x = -Math.PI / 2;
			}

			// Resume auto-rotation after 3 seconds of inactivity
			clearTimeout(manager.autoRotateTimeout);
			manager.autoRotateTimeout = setTimeout(() => {
				autoRotate = true;
			}, 3000);
		};

		// Hover detection with raycaster
		const raycaster = new window.THREE.Raycaster();
		const mouse = new window.THREE.Vector2();

		container.addEventListener("mousemove", (event) => {
			mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
			mouse.y = -(event.clientY / container.clientHeight) * 2 + 1;

			raycaster.setFromCamera(mouse, manager.camera);
			const intersects = raycaster.intersectObjects(
				network.userData.nodes.map((n) => n.mesh)
			);

			// Highlight hovered node
			network.userData.nodes.forEach((node, idx) => {
				const isHovered = intersects.some(
					(i) => i.object === node.mesh
				);
				if (isHovered) {
					node.mesh.scale.set(1.5, 1.5, 1.5);
					node.mesh.material.emissiveIntensity = 1;
				} else {
					node.mesh.scale.set(1, 1, 1);
					node.mesh.material.emissiveIntensity = 0.5;
				}
			});
		});

		// Animation loop
		function updateProtocolsScene(scene) {
			if (autoRotate) {
				targetRotation.y += 0.001;
			}

			rotation.x += (targetRotation.x - rotation.x) * 0.1;
			rotation.y += (targetRotation.y - rotation.y) * 0.1;

			network.rotation.x = rotation.x;
			network.rotation.y = rotation.y;

			// Update network animation
			if (network.userData.update) {
				network.userData.update();
			}
		}

		console.log("✦ Protocols scene initialized with protocol node network");
		return true;
	}

	document.addEventListener("DOMContentLoaded", function () {
		if (window.THREE) {
			initProtocolsScene();
			return;
		}

		window.addEventListener(
			"cv:three-ready",
			function () {
				initProtocolsScene();
			},
			{ once: true }
		);
	});
})();
