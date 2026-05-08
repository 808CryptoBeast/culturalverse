// Particle system for flowing energy across Culturalverse
(function () {
	window.CVParticleSystem = {
		/**
		 * Create an energy particle system
		 */
		create: function (config = {}) {
			const particleCount = config.count || 200;
			const color = config.color || 0xf0c96a;
			const size = config.size || 1;
			const speed = config.speed || 0.5;

			const geometry = new THREE.BufferGeometry();
			const positions = new Float32Array(particleCount * 3);
			const velocities = new Float32Array(particleCount * 3);
			const ages = new Float32Array(particleCount);
			const lifespans = new Float32Array(particleCount);

			const bounds = config.bounds || { x: 100, y: 100, z: 100 };

			// Initialize particles
			for (let i = 0; i < particleCount; i++) {
				positions[i * 3] =
					(Math.random() - 0.5) * bounds.x;
				positions[i * 3 + 1] =
					(Math.random() - 0.5) * bounds.y;
				positions[i * 3 + 2] =
					(Math.random() - 0.5) * bounds.z;

				velocities[i * 3] =
					(Math.random() - 0.5) * speed;
				velocities[i * 3 + 1] =
					(Math.random() - 0.5) * speed;
				velocities[i * 3 + 2] =
					(Math.random() - 0.5) * speed;

				ages[i] = Math.random() * 1000;
				lifespans[i] = 1000 + Math.random() * 500;
			}

			geometry.setAttribute(
				"position",
				new THREE.BufferAttribute(positions, 3)
			);
			geometry.setAttribute(
				"age",
				new THREE.BufferAttribute(ages, 1)
			);
			geometry.setAttribute(
				"lifespan",
				new THREE.BufferAttribute(lifespans, 1)
			);

			const material = new THREE.PointsMaterial({
				color,
				size,
				sizeAttenuation: true,
				fog: true,
				transparent: true,
				depthWrite: false
			});

			const mesh = new THREE.Points(geometry, material);

			return {
				mesh,
				config,
				geometry,
				positions,
				velocities,
				ages,
				lifespans,
				bounds,
				particleCount,
				update: function () {
					const posAttr = this.geometry.getAttribute("position");
					const ageAttr = this.geometry.getAttribute("age");
					const positions = posAttr.array;
					const ages = ageAttr.array;

					for (let i = 0; i < this.particleCount; i++) {
						// Age particle
						ages[i] += 1;

						// Reset if dead
						if (ages[i] > this.lifespans[i]) {
							ages[i] = 0;
							positions[i * 3] =
								(Math.random() - 0.5) * this.bounds.x;
							positions[i * 3 + 1] =
								(Math.random() - 0.5) * this.bounds.y;
							positions[i * 3 + 2] =
								(Math.random() - 0.5) * this.bounds.z;
							continue;
						}

						// Update position
						positions[i * 3] +=
							this.velocities[i * 3];
						positions[i * 3 + 1] +=
							this.velocities[i * 3 + 1];
						positions[i * 3 + 2] +=
							this.velocities[i * 3 + 2];

						// Wrap around bounds
						if (
							positions[i * 3] >
							this.bounds.x / 2
						) {
							positions[i * 3] = -this.bounds.x / 2;
						}
						if (
							positions[i * 3] <
							-this.bounds.x / 2
						) {
							positions[i * 3] = this.bounds.x / 2;
						}
						if (
							positions[i * 3 + 1] >
							this.bounds.y / 2
						) {
							positions[i * 3 + 1] =
								-this.bounds.y / 2;
						}
						if (
							positions[i * 3 + 1] <
							-this.bounds.y / 2
						) {
							positions[i * 3 + 1] =
								this.bounds.y / 2;
						}

						// Fade based on age
						const alpha =
							1 -
							ages[i] / this.lifespans[i];
						if (i === 0) {
							this.mesh.material.opacity =
								alpha;
						}
					}

					posAttr.needsUpdate = true;
					ageAttr.needsUpdate = true;
				}
			};
		},

		/**
		 * Create flowing particles toward a target
		 */
		createFlow: function (
			fromPos,
			toPos,
			config = {}
		) {
			const particleCount = config.count || 50;
			const color = config.color || 0x1f9fb3;

			const geometry = new THREE.BufferGeometry();
			const positions = new Float32Array(
				particleCount * 3
			);
			const velocities = new Float32Array(
				particleCount * 3
			);

			const direction = new THREE.Vector3()
				.subVectors(toPos, fromPos)
				.normalize();
			const speed = config.speed || 0.3;

			for (let i = 0; i < particleCount; i++) {
				positions[i * 3] = fromPos.x;
				positions[i * 3 + 1] = fromPos.y;
				positions[i * 3 + 2] = fromPos.z;

				velocities[i * 3] = direction.x * speed;
				velocities[i * 3 + 1] = direction.y * speed;
				velocities[i * 3 + 2] = direction.z * speed;
			}

			geometry.setAttribute(
				"position",
				new THREE.BufferAttribute(positions, 3)
			);

			const material = new THREE.PointsMaterial({
				color,
				size: config.size || 1.5,
				transparent: true,
				sizeAttenuation: true,
				fog: true
			});

			const mesh = new THREE.Points(geometry, material);
			const distance = fromPos.distanceTo(toPos);

			return {
				mesh,
				config,
				positions,
				velocities,
				geometry,
				particleCount,
				distance,
				fromPos,
				toPos,
				traveled: 0,
				update: function () {
					this.traveled += 0.05;
					const posAttr = this.geometry.getAttribute(
						"position"
					);
					const positions = posAttr.array;

					for (let i = 0; i < this.particleCount; i++) {
						positions[i * 3] +=
							this.velocities[i * 3];
						positions[i * 3 + 1] +=
							this.velocities[i * 3 + 1];
						positions[i * 3 + 2] +=
							this.velocities[i * 3 + 2];
					}

					posAttr.needsUpdate = true;
				}
			};
		}
	};
})();
