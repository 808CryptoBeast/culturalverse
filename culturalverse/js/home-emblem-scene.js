// Hero emblem three.js scene: animated PNG seal with glow and depth.
(function () {
	function createGlowTexture(three) {
		const canvas = document.createElement("canvas");
		canvas.width = 128;
		canvas.height = 128;
		const context = canvas.getContext("2d");
		const gradient = context.createRadialGradient(64, 64, 8, 64, 64, 64);
		gradient.addColorStop(0, "rgba(255, 240, 200, 1)");
		gradient.addColorStop(0.18, "rgba(240, 201, 106, 0.95)");
		gradient.addColorStop(0.45, "rgba(240, 201, 106, 0.38)");
		gradient.addColorStop(0.7, "rgba(27, 147, 164, 0.12)");
		gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
		context.fillStyle = gradient;
		context.fillRect(0, 0, 128, 128);
		const texture = new three.CanvasTexture(canvas);
		texture.needsUpdate = true;
		return texture;
	}

	function createBirdTexture(three) {
		const canvas = document.createElement("canvas");
		canvas.width = 128;
		canvas.height = 128;
		const context = canvas.getContext("2d");
		context.clearRect(0, 0, 128, 128);
		context.strokeStyle = "rgba(246, 232, 196, 0.95)";
		context.fillStyle = "rgba(246, 232, 196, 0.95)";
		context.lineWidth = 7;
		context.lineCap = "round";
		context.lineJoin = "round";

		context.beginPath();
		context.moveTo(24, 78);
		context.quadraticCurveTo(40, 52, 56, 48);
		context.quadraticCurveTo(64, 46, 70, 58);
		context.quadraticCurveTo(82, 48, 104, 38);
		context.stroke();

		context.beginPath();
		context.moveTo(26, 78);
		context.quadraticCurveTo(44, 66, 56, 60);
		context.quadraticCurveTo(66, 56, 76, 64);
		context.quadraticCurveTo(88, 56, 102, 50);
		context.stroke();

		context.beginPath();
		context.arc(72, 59, 4.8, 0, Math.PI * 2);
		context.fill();

		const texture = new three.CanvasTexture(canvas);
		texture.needsUpdate = true;
		return texture;
	}

	function initHeroEmblemScene() {
		const container = document.getElementById("hero-emblem-canvas");
		if (!container || !window.THREE) {
			return false;
		}

		if (container.dataset.cvInit === "1") {
			return true;
		}
		container.dataset.cvInit = "1";

		const THREE = window.THREE;
		const scene = new THREE.Scene();
		scene.fog = new THREE.Fog(0x05070f, 7, 22);

		const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
		camera.position.set(0, 0, 8.2);

		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			powerPreference: "high-performance"
		});
		renderer.setClearColor(0x000000, 0);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		renderer.setSize(container.clientWidth, container.clientHeight);
		container.innerHTML = "";
		container.appendChild(renderer.domElement);

		const root = new THREE.Group();
		scene.add(root);

		const ambient = new THREE.AmbientLight(0xffffff, 1.25);
		scene.add(ambient);

		const goldLight = new THREE.PointLight(0xf0c96a, 2.3, 60);
		goldLight.position.set(4, 4, 8);
		scene.add(goldLight);

		const tealLight = new THREE.PointLight(0x1f9fb3, 1.25, 55);
		tealLight.position.set(-4, -2, 8);
		scene.add(tealLight);

		const whiteLight = new THREE.PointLight(0xffffff, 0.7, 40);
		whiteLight.position.set(0, 0, 10);
		scene.add(whiteLight);

		const textureLoader = new THREE.TextureLoader();
		const emblemTexture = textureLoader.load(
			"culturalverse/assets/images/culturalverse.png",
			function (texture) {
				if (THREE.SRGBColorSpace) {
					texture.colorSpace = THREE.SRGBColorSpace;
				} else if (THREE.sRGBEncoding) {
					texture.encoding = THREE.sRGBEncoding;
				}
			}
		);

		const backdrop = new THREE.Mesh(
			new THREE.CircleGeometry(3.3, 96),
			new THREE.MeshBasicMaterial({
				color: 0x0b1330,
				transparent: true,
				opacity: 0.84
			})
		);
		root.add(backdrop);

		const glow = new THREE.Mesh(
			new THREE.CircleGeometry(3.05, 96),
			new THREE.MeshBasicMaterial({
				color: 0xf0c96a,
				transparent: true,
				opacity: 0.14,
				blending: THREE.AdditiveBlending,
				depthWrite: false,
				depthTest: false
			})
		);
		glow.scale.set(1.14, 1.14, 1);
		glow.renderOrder = 1;
		root.add(glow);

		const haloTexture = createGlowTexture(THREE);
		const haloGold = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: haloTexture,
				color: 0xf0c96a,
				transparent: true,
				opacity: 0.9,
				blending: THREE.AdditiveBlending,
				depthWrite: false,
				depthTest: false
			})
		);
		haloGold.scale.set(7.5, 7.5, 1);
		haloGold.renderOrder = 0;
		root.add(haloGold);

		const haloTeal = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: haloTexture,
				color: 0x1f9fb3,
				transparent: true,
				opacity: 0.55,
				blending: THREE.AdditiveBlending,
				depthWrite: false,
				depthTest: false
			})
		);
		haloTeal.scale.set(6.2, 6.2, 1);
		haloTeal.position.z = -0.2;
		haloTeal.renderOrder = 0;
		root.add(haloTeal);

		const emblem = new THREE.Mesh(
			new THREE.PlaneGeometry(5.3, 5.3),
			new THREE.MeshBasicMaterial({
				map: emblemTexture,
				transparent: true,
				opacity: 0.98,
				depthWrite: false,
				depthTest: false
			})
		);
		emblem.renderOrder = 5;
		root.add(emblem);

		const ringMaterial = new THREE.MeshBasicMaterial({
			color: 0xf0c96a,
			transparent: true,
			opacity: 0.28,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
			depthTest: false
		});

		const ringA = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.03, 16, 192), ringMaterial.clone());
		const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.65, 0.02, 12, 192), ringMaterial.clone());
		const ringC = new THREE.Mesh(new THREE.TorusGeometry(2.18, 0.018, 12, 192), ringMaterial.clone());
		ringA.rotation.x = Math.PI / 2;
		ringB.rotation.x = Math.PI / 2;
		ringC.rotation.x = Math.PI / 2;
		ringA.renderOrder = 2;
		ringB.renderOrder = 2;
		ringC.renderOrder = 2;
		root.add(ringA, ringB, ringC);

		const rays = new THREE.Group();
		for (let index = 0; index < 16; index++) {
			const ray = new THREE.Mesh(
				new THREE.PlaneGeometry(0.07, 4.8),
				new THREE.MeshBasicMaterial({
					color: index % 2 === 0 ? 0xf0c96a : 0xf7e9c8,
					transparent: true,
					opacity: 0.12,
					blending: THREE.AdditiveBlending,
					depthWrite: false,
					depthTest: false,
					side: THREE.DoubleSide
				})
			);
			ray.position.y = 0.55;
			ray.rotation.z = (index / 16) * Math.PI * 2;
			rays.add(ray);
		}
		rays.position.z = -0.35;
		rays.renderOrder = 3;
		root.add(rays);

		const nodes = [];
		const nodeGeo = new THREE.SphereGeometry(0.05, 12, 12);
		for (let index = 0; index < 14; index++) {
			const theta = (index / 14) * Math.PI * 2;
			const radius = index % 2 === 0 ? 2.05 : 2.45;
			const node = new THREE.Mesh(
				nodeGeo,
				new THREE.MeshStandardMaterial({
					color: 0xf7e7c4,
					emissive: 0xf0c96a,
					emissiveIntensity: 0.95,
					metalness: 0.3,
					roughness: 0.35,
					depthWrite: false,
					depthTest: false
				})
			);
			node.position.set(Math.cos(theta) * radius, Math.sin(theta) * radius, index % 3 === 0 ? 0.18 : -0.12);
			root.add(node);
			nodes.push({ mesh: node, theta, radius, phase: Math.random() * Math.PI * 2 });
		}

		const particles = [];
		const birdTexture = createBirdTexture(THREE);
		for (let index = 0; index < 10; index++) {
			const bird = new THREE.Sprite(
				new THREE.SpriteMaterial({
					map: birdTexture,
					color: index % 2 === 0 ? 0xf7ebd1 : 0xf0c96a,
					transparent: true,
					opacity: 0.88,
					blending: THREE.AdditiveBlending,
					depthWrite: false,
					depthTest: false
				})
			);
			bird.scale.set(0.38, 0.38, 1);
			bird.renderOrder = 4;
			root.add(bird);
			particles.push({
				mesh: bird,
				orbit: 1.7 + Math.random() * 1.45,
				speed: 0.16 + Math.random() * 0.2,
				offset: Math.random() * Math.PI * 2,
				phase: Math.random() * Math.PI * 2,
				tilt: (Math.random() - 0.5) * 0.5
			});
		}

		const lineMaterial = new THREE.LineBasicMaterial({
			color: 0x1f9fb3,
			transparent: true,
			opacity: 0.38,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
			depthTest: false
		});
		const linePoints = [
			[-1.9, 0.8, 0.02],
			[-1.15, 1.15, 0.18],
			[-0.5, 0.42, 0.08],
			[0.42, 0.72, -0.05],
			[1.2, 1.1, 0.14],
			[1.95, 0.78, 0.03]
		];
		const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints.map((point) => new THREE.Vector3(point[0], point[1], point[2])));
		const networkLine = new THREE.Line(lineGeometry, lineMaterial);
		networkLine.renderOrder = 3;
		root.add(networkLine);

		const hero = document.getElementById("hero-shell");
		let targetTiltX = 0;
		let targetTiltY = 0;
		if (hero) {
			hero.addEventListener("pointermove", function (event) {
				const rect = hero.getBoundingClientRect();
				targetTiltY = (event.clientX - rect.left) / rect.width - 0.5;
				targetTiltX = (event.clientY - rect.top) / rect.height - 0.5;
			});
			hero.addEventListener("pointerleave", function () {
				targetTiltX = 0;
				targetTiltY = 0;
			});
		}

		let width = container.clientWidth;
		let height = container.clientHeight;
		function resize() {
			width = container.clientWidth;
			height = container.clientHeight;
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height);
		}

		window.addEventListener("resize", resize);

		const clock = new THREE.Clock();
		function animate() {
			const elapsed = clock.getElapsedTime();
			root.rotation.z = Math.sin(elapsed * 0.12) * 0.03;
			root.rotation.y += 0.0014;
			root.rotation.x += (targetTiltX * 0.22 - root.rotation.x) * 0.04;
			root.rotation.y += (targetTiltY * 0.22 - root.rotation.y) * 0.03;

			emblem.rotation.z = Math.sin(elapsed * 0.18) * 0.01;
			glow.material.opacity = 0.18;
			haloGold.scale.setScalar(7.5);
			haloTeal.scale.setScalar(6.2);
			rays.rotation.z = elapsed * 0.05;
			rays.children.forEach(function (ray) {
				ray.material.opacity = 0.075;
			});
			ringA.rotation.z = elapsed * 0.08;
			ringB.rotation.z = -elapsed * 0.05;
			ringC.rotation.z = elapsed * 0.12;

			nodes.forEach(function (node, index) {
				node.mesh.scale.setScalar(1);
				node.mesh.position.x = Math.cos(node.theta + elapsed * 0.04) * node.radius;
				node.mesh.position.y = Math.sin(node.theta + elapsed * 0.04) * node.radius;
				node.mesh.position.z = index % 3 === 0 ? 0.18 + Math.sin(elapsed + index) * 0.05 : -0.12;
			});

			particles.forEach(function (bird, index) {
				const angle = elapsed * bird.speed + bird.offset;
				bird.mesh.position.x = Math.cos(angle) * bird.orbit;
				bird.mesh.position.y = Math.sin(angle * 1.08 + bird.phase) * bird.orbit * 0.7;
				bird.mesh.position.z = Math.sin(angle * 0.6 + index) * 0.16;
				bird.mesh.scale.setScalar(0.34);
				bird.mesh.material.rotation = angle + bird.tilt;
			});

			goldLight.position.x = 4 + Math.sin(elapsed * 0.6) * 0.5;
			goldLight.position.y = 4 + Math.cos(elapsed * 0.5) * 0.5;
			tealLight.position.x = -4 + Math.cos(elapsed * 0.55) * 0.45;
			tealLight.position.y = -2 + Math.sin(elapsed * 0.65) * 0.45;

			renderer.render(scene, camera);
			requestAnimationFrame(animate);
		}

		resize();
		animate();
		return true;
	}

	document.addEventListener("DOMContentLoaded", function () {
		if (window.THREE) {
			initHeroEmblemScene();
			return;
		}

		window.addEventListener("cv:three-ready", function () {
			initHeroEmblemScene();
		}, { once: true });
	});
})();