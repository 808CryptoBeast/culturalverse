// Mycelium network visualization - organic root system for Culturalverse
(function () {
	window.CVMyceliumNetwork = {
		/**
		 * Create a mycelium network (flowing root/branch system)
		 * @param {number} nodeCount - Number of nodes in network
		 * @param {object} config - Configuration object
		 */
		create: function (nodeCount = 8, config = {}) {
			const nodes = [];
			const connections = [];
			const group = new THREE.Group();

			const nodeRadius = config.nodeRadius || 2;
			const nodeColor = config.nodeColor || 0xf0c96a;
			const lineColor = config.lineColor || 0xd98545;
			const connectionLength = config.connectionLength || 30;

			// Create nodes with organic scatter
			for (let i = 0; i < nodeCount; i++) {
				const angle = (i / nodeCount) * Math.PI * 2;
				const radius = 25 + Math.random() * 15;
				const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 8;
				const y = Math.sin(angle) * radius + (Math.random() - 0.5) * 8;
				const z = (Math.random() - 0.5) * 20;

				const sphere = new THREE.Mesh(
					new THREE.IcosahedronGeometry(nodeRadius, 2),
					new THREE.MeshStandardMaterial({
						color: nodeColor,
						emissive: nodeColor,
						emissiveIntensity: 0.5,
						metalness: 0.4,
						roughness: 0.6
					})
				);
				sphere.position.set(x, y, z);
				sphere.userData.originalPos = { x, y, z };
				group.add(sphere);
				nodes.push({
					mesh: sphere,
					position: new THREE.Vector3(x, y, z),
					velocity: new THREE.Vector3(),
					pulseTime: Math.random() * Math.PI * 2
				});
			}

			// Create organic connections (mycelium threads)
			const connectionMaterial = new THREE.LineBasicMaterial({
				color: lineColor,
				linewidth: 2,
				fog: true
			});

			for (let i = 0; i < nodes.length; i++) {
				// Connect to 2-3 nearest neighbors
				const distances = nodes.map((n, idx) => ({
					idx,
					dist: nodes[i].position.distanceTo(n.position)
				}));
				distances.sort((a, b) => a.dist - b.dist);

				const connectTo = Math.floor(2 + Math.random() * 2);
				for (let j = 1; j <= connectTo && j < distances.length; j++) {
					const targetNode = nodes[distances[j].idx];
					const distance = distances[j].dist;

					if (distance < connectionLength) {
						const geometry = new THREE.BufferGeometry();
						const positions = new Float32Array([
							nodes[i].position.x,
							nodes[i].position.y,
							nodes[i].position.z,
							targetNode.position.x,
							targetNode.position.y,
							targetNode.position.z
						]);
						geometry.setAttribute(
							"position",
							new THREE.BufferAttribute(positions, 3)
						);

						const line = new THREE.Line(geometry, connectionMaterial.clone());
						group.add(line);
						connections.push({
							line,
							startNode: i,
							endNode: distances[j].idx,
							geometry
						});
					}
				}
			}

			// Animation state
			group.userData.nodes = nodes;
			group.userData.connections = connections;
			group.userData.time = 0;
			group.userData.pulseIntensity = config.pulseIntensity || 0.015;

			// Custom update function
			group.userData.update = function () {
				this.time += 0.016; // Assume ~60fps
				const time = this.time;

				// Pulse nodes
				this.nodes.forEach((node, idx) => {
					node.pulseTime += 0.02;
					const pulse =
						0.5 +
						0.5 *
							Math.sin(time * 0.5 + node.pulseTime * 0.8 + idx * 0.5);
					const scale = 1 + pulse * 0.3;
					node.mesh.scale.set(scale, scale, scale);
					node.mesh.material.emissiveIntensity =
						0.3 + pulse * 0.7;
				});

				// Flow energy along connections (color shift)
				this.connections.forEach((conn, idx) => {
					const flowTime = (time + idx * 0.2) % 2;
					const color = new THREE.Color();
					if (flowTime < 1) {
						// Earth tone transition
						color.lerpColors(
							new THREE.Color(lineColor),
							new THREE.Color(0x9b7e57),
							flowTime
						);
					} else {
						color.lerpColors(
							new THREE.Color(0x9b7e57),
							new THREE.Color(lineColor),
							flowTime - 1
						);
					}
					conn.line.material.color = color;
				});
			};

			return group;
		},

		/**
		 * Create animated mycelium path between two points
		 */
		createPath: function (startPos, endPos, config = {}) {
			const segments = config.segments || 12;
			const pathGroup = new THREE.Group();

			// Bezier curve path
			const curve = new THREE.CatmullRomCurve3([
				new THREE.Vector3(...startPos),
				new THREE.Vector3(
					(startPos[0] + endPos[0]) / 2 + (Math.random() - 0.5) * 10,
					(startPos[1] + endPos[1]) / 2 + (Math.random() - 0.5) * 10,
					(startPos[2] + endPos[2]) / 2 + (Math.random() - 0.5) * 10
				),
				new THREE.Vector3(...endPos)
			]);

			const points = curve.getPoints(segments);
			const geometry = new THREE.BufferGeometry().setFromPoints(points);

			const material = new THREE.LineBasicMaterial({
				color: config.color || 0xd98545,
				linewidth: 3,
				fog: true
			});

			const line = new THREE.Line(geometry, material);
			pathGroup.add(line);

			// Add flowing particles along path
			const particleGeo = new THREE.SphereGeometry(
				config.particleSize || 0.8,
				4,
				4
			);
			const particleMat = new THREE.MeshStandardMaterial({
				color: config.color || 0xd98545,
				emissive: config.color || 0xd98545,
				emissiveIntensity: 0.8
			});

			for (let i = 0; i < 5; i++) {
				const particle = new THREE.Mesh(particleGeo, particleMat);
				const t = Math.random();
				const pos = curve.getPoint(t);
				particle.position.copy(pos);
				pathGroup.add(particle);

				particle.userData.curve = curve;
				particle.userData.t = t;
				particle.userData.speed = 0.003 + Math.random() * 0.002;
			}

			// Custom update
			pathGroup.userData.update = function () {
				this.children.forEach((child, idx) => {
					if (idx > 0 && child.userData.curve) {
						// Animate particles along curve
						child.userData.t += child.userData.speed;
						if (child.userData.t > 1) {
							child.userData.t = 0;
						}
						const pos = child.userData.curve.getPoint(
							child.userData.t
						);
						child.position.copy(pos);
					}
				});
			};

			return pathGroup;
		}
	};
})();
