// Three.js scene manager for immersive 3D experiences across Culturalverse
(function () {
	window.CVThreeManager = {
		scenes: {},
		camera: null,
		renderer: null,
		activeScene: null,
		container: null,

		/**
		 * Initialize Three.js with a container element
		 */
		init: function (containerId) {
			const container = document.getElementById(containerId);
			if (!container) {
				console.warn("CVThreeManager: container not found", containerId);
				return null;
			}

			this.container = container;
			const width = container.clientWidth;
			const height = container.clientHeight;

			// Camera setup
			this.camera = new THREE.PerspectiveCamera(
				60,
				width / height,
				0.1,
				10000
			);
			this.camera.position.z = 50;

			// Renderer setup
			this.renderer = new THREE.WebGLRenderer({
				antialias: true,
				alpha: true,
				powerPreference: "high-performance"
			});
			this.renderer.setSize(width, height);
			this.renderer.setPixelRatio(window.devicePixelRatio);
			this.renderer.setClearColor(0x000000, 0);
			container.appendChild(this.renderer.domElement);

			// Handle resize
			window.addEventListener("resize", () => {
				this.onWindowResize();
			});

			// Touch/gesture support
			this.setupGestureSupport();

			// Start animation loop
			this.animate();

			return this;
		},

		/**
		 * Create and register a new 3D scene
		 */
		createScene: function (name, config = {}) {
			const scene = new THREE.Scene();
			
			// Default fog for depth
			scene.fog = new THREE.Fog(0x000000, 100, 300);
			
			// Ambient light
			const ambientLight = new THREE.AmbientLight(0xffffff, config.ambientIntensity || 0.6);
			scene.add(ambientLight);

			// Point lights with warm/cool tones for Culturalverse
			const warmLight = new THREE.PointLight(0xf0c96a, config.warmIntensity || 1, 200);
			warmLight.position.set(50, 50, 50);
			scene.add(warmLight);

			const coolLight = new THREE.PointLight(0x1f9fb3, config.coolIntensity || 0.8, 200);
			coolLight.position.set(-50, -50, 50);
			scene.add(coolLight);

			this.scenes[name] = {
				scene: scene,
				objects: [],
				particleSystems: [],
				config: config
			};

			return scene;
		},

		/**
		 * Switch to an active scene
		 */
		setActiveScene: function (name) {
			if (this.scenes[name]) {
				this.activeScene = name;
			}
		},

		/**
		 * Get a registered scene
		 */
		getScene: function (name) {
			return this.scenes[name]?.scene || null;
		},

		/**
		 * Add object to scene
		 */
		addToScene: function (name, object) {
			if (this.scenes[name]) {
				this.scenes[name].scene.add(object);
				this.scenes[name].objects.push(object);
			}
		},

		/**
		 * Register particle system with scene
		 */
		registerParticleSystem: function (name, system) {
			if (this.scenes[name]) {
				this.scenes[name].particleSystems.push(system);
				this.scenes[name].scene.add(system.mesh);
			}
		},

		/**
		 * Setup touch/gesture support for interaction
		 */
		setupGestureSupport: function () {
			let touchStartX = 0,
				touchStartY = 0;
			let isDragging = false;

			this.container.addEventListener("touchstart", (e) => {
				if (e.touches.length === 1) {
					touchStartX = e.touches[0].clientX;
					touchStartY = e.touches[0].clientY;
					isDragging = true;
					this.onGestureStart?.();
				}
			});

			this.container.addEventListener("touchmove", (e) => {
				if (isDragging && e.touches.length === 1) {
					const deltaX = e.touches[0].clientX - touchStartX;
					const deltaY = e.touches[0].clientY - touchStartY;
					this.onGestureDrag?.({ deltaX, deltaY, touch: true });
				}
			});

			this.container.addEventListener("touchend", () => {
				isDragging = false;
				this.onGestureEnd?.();
			});

			// Mouse drag support for desktop
			let mouseDown = false;
			let mouseStartX = 0,
				mouseStartY = 0;

			this.container.addEventListener("mousedown", (e) => {
				mouseDown = true;
				mouseStartX = e.clientX;
				mouseStartY = e.clientY;
				this.onGestureStart?.();
			});

			this.container.addEventListener("mousemove", (e) => {
				if (mouseDown) {
					const deltaX = e.clientX - mouseStartX;
					const deltaY = e.clientY - mouseStartY;
					mouseStartX = e.clientX;
					mouseStartY = e.clientY;
					this.onGestureDrag?.({ deltaX, deltaY, touch: false });
				}
			});

			this.container.addEventListener("mouseup", () => {
				mouseDown = false;
				this.onGestureEnd?.();
			});

			// Wheel zoom support
			this.container.addEventListener("wheel", (e) => {
				e.preventDefault();
				const zoomDelta = e.deltaY > 0 ? 1.1 : 0.9;
				this.onGestureZoom?.(zoomDelta);
			});
		},

		/**
		 * Handle window resize
		 */
		onWindowResize: function () {
			if (!this.container) return;
			const width = this.container.clientWidth;
			const height = this.container.clientHeight;

			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(width, height);
		},

		/**
		 * Main animation loop
		 */
		animate: function () {
			requestAnimationFrame(() => this.animate());

			if (this.activeScene && this.scenes[this.activeScene]) {
				const sceneData = this.scenes[this.activeScene];
				
				// Update particle systems
				sceneData.particleSystems.forEach((ps) => {
					if (ps.update) {
						ps.update();
					}
				});

				// Custom scene update
				if (sceneData.config.onUpdate) {
					sceneData.config.onUpdate(sceneData.scene);
				}
			}

			// Render active scene
			if (this.activeScene) {
				this.renderer.render(
					this.scenes[this.activeScene].scene,
					this.camera
				);
			}
		},

		/**
		 * Clear a scene
		 */
		clearScene: function (name) {
			if (this.scenes[name]) {
				const sceneData = this.scenes[name];
				sceneData.objects.forEach((obj) => {
					sceneData.scene.remove(obj);
				});
				sceneData.objects = [];
				sceneData.particleSystems = [];
			}
		},

		/**
		 * Dispose of all resources
		 */
		dispose: function () {
			Object.values(this.scenes).forEach((sceneData) => {
				sceneData.objects.forEach((obj) => {
					if (obj.geometry) obj.geometry.dispose();
					if (obj.material) {
						if (Array.isArray(obj.material)) {
							obj.material.forEach((m) => m.dispose());
						} else {
							obj.material.dispose();
						}
					}
				});
			});
			if (this.renderer) {
				this.renderer.dispose();
			}
		}
	};
})();
