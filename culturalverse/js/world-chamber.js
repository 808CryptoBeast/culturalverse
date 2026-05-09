/**
 * world-chamber.js
 * Ambient Three.js atmosphere for immersive world chamber pages.
 * Reads data-world attribute from <html> to select world palette.
 * Kanaka: flowing ocean phosphorescence + star points
 * Kemet:  solar motes + slow geometric drift
 */
(function () {
  'use strict';

  var WORLD_CONFIGS = {
    kanaka: {
      particleColor: 0x1f9fb3,
      particleColorB: 0x3cb371,
      glowColor: 0x076a55,
      count: 1400,
      speedScale: 0.65,
      starColor: 0x4a8aff,
      starCount: 420,
      drift: 'wave'
    },
    kemet: {
      particleColor: 0xf0c96a,
      particleColorB: 0xd98545,
      glowColor: 0x6a3d0a,
      count: 1100,
      speedScale: 0.52,
      starColor: 0xffeab0,
      starCount: 200,
      drift: 'rise'
    }
  };

  function getWorldId() {
    return (document.documentElement.dataset.world || 'kanaka').toLowerCase();
  }

  function initWorldChamberScene(THREE) {
    var worldId = getWorldId();
    var cfg = WORLD_CONFIGS[worldId] || WORLD_CONFIGS.kanaka;

    var container = document.getElementById('world-ambient-canvas');
    if (!container) return;

    /* ── Renderer ─────────────────────────────────────── */
    var renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    /* ── Scene / Camera ───────────────────────────────── */
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400);
    camera.position.set(0, 0, 80);

    /* ── Particle geometry ────────────────────────────── */
    var count = cfg.count;
    var positions = new Float32Array(count * 3);
    var velocities = new Float32Array(count * 3);
    var sizes = new Float32Array(count);
    var colorData = new Float32Array(count * 3);

    var colorA = new THREE.Color(cfg.particleColor);
    var colorB = new THREE.Color(cfg.particleColorB);

    for (var i = 0; i < count; i++) {
      var i3 = i * 3;
      var speed = cfg.speedScale * (0.04 + Math.random() * 0.08);

      if (cfg.drift === 'wave') {
        /* Kanaka: scatter broadly, strong horizontal current */
        positions[i3]     = (Math.random() - 0.5) * 220;
        positions[i3 + 1] = (Math.random() - 0.5) * 180;
        positions[i3 + 2] = (Math.random() - 0.5) * 60;
        velocities[i3]     = (Math.random() < 0.5 ? 1 : -1) * speed * (0.6 + Math.random() * 0.4);
        velocities[i3 + 1] = (Math.random() - 0.5) * speed * 0.15;
        velocities[i3 + 2] = 0;
      } else {
        /* Kemet: concentrate in 5 vertical columns, rise upward */
        var colX = (Math.floor(Math.random() * 5) - 2) * 38 + (Math.random() - 0.5) * 22;
        positions[i3]     = colX;
        positions[i3 + 1] = (Math.random() - 0.5) * 180;
        positions[i3 + 2] = (Math.random() - 0.5) * 50;
        velocities[i3]     = (Math.random() - 0.5) * speed * 0.08;
        velocities[i3 + 1] = speed * (0.7 + Math.random() * 0.5);
        velocities[i3 + 2] = 0;
      }

      sizes[i] = 0.8 + Math.random() * 1.8;

      var t = Math.random();
      colorData[i3]     = colorA.r * (1 - t) + colorB.r * t;
      colorData[i3 + 1] = colorA.g * (1 - t) + colorB.g * t;
      colorData[i3 + 2] = colorA.b * (1 - t) + colorB.b * t;
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colorData, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    /* ── Particle texture ─────────────────────────────── */
    var ptCanvas = document.createElement('canvas');
    ptCanvas.width = 32;
    ptCanvas.height = 32;
    var ptCtx = ptCanvas.getContext('2d');
    var grad = ptCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.6)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ptCtx.fillStyle = grad;
    ptCtx.fillRect(0, 0, 32, 32);
    var ptTex = new THREE.CanvasTexture(ptCanvas);

    var mat = new THREE.PointsMaterial({
      size: 1.5,
      map: ptTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });

    var points = new THREE.Points(geo, mat);
    scene.add(points);

    /* ── Star field (background) ──────────────────────── */
    var starCount = cfg.starCount;
    var starPos = new Float32Array(starCount * 3);
    var starColor = new THREE.Color(cfg.starColor);
    var starColorArr = new Float32Array(starCount * 3);

    for (var s = 0; s < starCount; s++) {
      var s3 = s * 3;
      starPos[s3]     = (Math.random() - 0.5) * 300;
      starPos[s3 + 1] = (Math.random() - 0.5) * 220;
      starPos[s3 + 2] = -30 - Math.random() * 40;
      var brightness = 0.3 + Math.random() * 0.7;
      starColorArr[s3]     = starColor.r * brightness;
      starColorArr[s3 + 1] = starColor.g * brightness;
      starColorArr[s3 + 2] = starColor.b * brightness;
    }

    var starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColorArr, 3));

    var starMat = new THREE.PointsMaterial({
      size: 1.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });

    var stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    /* ── Cultural line formation ─────────────────────── */
    if (worldId === 'kanaka') {
      /* Wayfinding star compass: 8 radial spokes + outer ring */
      var compassGroup = new THREE.Group();
      var spokeMat = new THREE.LineBasicMaterial({
        color: 0x1f9fb3, transparent: true, opacity: 0.10, depthWrite: false
      });
      for (var s = 0; s < 8; s++) {
        var sa = (s / 8) * Math.PI * 2;
        var spokeGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(Math.cos(sa) * 70, Math.sin(sa) * 70, 0)
        ]);
        compassGroup.add(new THREE.Line(spokeGeo, spokeMat));
      }
      /* Concentric guidance rings */
      [28, 48, 68].forEach(function (r) {
        var ringPts = [];
        for (var ri = 0; ri <= 64; ri++) {
          var ra = (ri / 64) * Math.PI * 2;
          ringPts.push(new THREE.Vector3(Math.cos(ra) * r, Math.sin(ra) * r, 0));
        }
        compassGroup.add(new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(ringPts),
          new THREE.LineBasicMaterial({ color: 0x3cb371, transparent: true, opacity: 0.07, depthWrite: false })
        ));
      });
      compassGroup.position.set(0, 0, -20);
      scene.add(compassGroup);
      /* Slowly rotate the compass */
      var compassRef = compassGroup;
    } else if (worldId === 'kemet') {
      /* Temple axis: main cross + outer rectangle */
      var axisMat = new THREE.LineBasicMaterial({
        color: 0xf0c96a, transparent: true, opacity: 0.09, depthWrite: false
      });
      var axisGroup = new THREE.Group();
      /* Horizontal axis */
      axisGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-90, 0, 0), new THREE.Vector3(90, 0, 0)]),
        axisMat
      ));
      /* Vertical axis */
      axisGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -70, 0), new THREE.Vector3(0, 70, 0)]),
        axisMat
      ));
      /* Temple precinct rectangle */
      var rectPts = [
        new THREE.Vector3(-75, -55, 0), new THREE.Vector3(75, -55, 0),
        new THREE.Vector3(75, 55, 0),   new THREE.Vector3(-75, 55, 0),
        new THREE.Vector3(-75, -55, 0)
      ];
      axisGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(rectPts),
        new THREE.LineBasicMaterial({ color: 0xd98545, transparent: true, opacity: 0.06, depthWrite: false })
      ));
      axisGroup.position.set(0, 0, -20);
      scene.add(axisGroup);
    }

    /* ── Slow camera parallax on mouse ───────────────── */
    var targetCamX = 0;
    var targetCamY = 0;
    document.addEventListener('mousemove', function (e) {
      targetCamX = ((e.clientX / window.innerWidth) - 0.5) * 6;
      targetCamY = -((e.clientY / window.innerHeight) - 0.5) * 4;
    }, { passive: true });

    /* ── Resize ───────────────────────────────────────── */
    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    /* ── Animate ──────────────────────────────────────── */
    var clock = new THREE.Clock();
    var pos = geo.attributes.position.array;
    var vel = velocities;
    var halfW = 100;
    var halfH = 90;

    function animate() {
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      /* Drift particles */
      for (var j = 0; j < count; j++) {
        var j3 = j * 3;
        if (cfg.drift === 'wave') {
          /* Kanaka: strong sinusoidal wave sweep */
          pos[j3]     += vel[j3]     + Math.sin(t * 0.38 + j * 0.04) * 0.012;
          pos[j3 + 1] += vel[j3 + 1] + Math.cos(t * 0.22 + pos[j3] * 0.025) * 0.008;
        } else {
          /* Kemet: vertical column rise with gentle heat shimmer */
          pos[j3]     += vel[j3]     + Math.sin(t * 0.18 + j * 0.06) * 0.003;
          pos[j3 + 1] += vel[j3 + 1] + Math.sin(t * 0.24 + j * 0.03) * 0.002;
        }

        /* Wrap bounds */
        if (pos[j3] > halfW)      pos[j3] -= halfW * 2;
        if (pos[j3] < -halfW)     pos[j3] += halfW * 2;
        if (pos[j3 + 1] > halfH)  pos[j3 + 1] -= halfH * 2;
        if (pos[j3 + 1] < -halfH) pos[j3 + 1] += halfH * 2;
      }
      geo.attributes.position.needsUpdate = true;

      /* Slow camera drift + mouse parallax */
      camera.position.x += (targetCamX - camera.position.x) * 0.012;
      camera.position.y += (targetCamY - camera.position.y) * 0.012;
      camera.position.x += Math.sin(t * 0.07) * 0.008;
      camera.position.y += Math.cos(t * 0.05) * 0.006;

      /* Slowly rotate the Kanaka star compass */
      if (typeof compassRef !== 'undefined' && compassRef) {
        compassRef.rotation.z = t * 0.018;
      }

      renderer.render(scene, camera);
    }

    animate();
  }

  /* ── GSAP scroll-reveal for .wc-reveal elements ─────── */
  function initReveal() {
    var els = document.querySelectorAll('.wc-reveal');
    if (!els.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ── Hero fly-in using GSAP ──────────────────────────── */
  function initHeroAnimation() {
    if (typeof gsap === 'undefined') return;

    var heroEls = document.querySelectorAll('.wc-hero .wc-reveal');
    heroEls.forEach(function (el, i) {
      el.classList.add('is-visible');
    });

    gsap.from('.wc-title', {
      duration: 1.4,
      y: 60,
      opacity: 0,
      ease: 'power3.out',
      delay: 0.15
    });

    gsap.from('.wc-region', {
      duration: 1.0,
      y: 30,
      opacity: 0,
      ease: 'power2.out',
      delay: 0.4
    });

    gsap.from('.wc-orientation', {
      duration: 1.0,
      y: 24,
      opacity: 0,
      ease: 'power2.out',
      delay: 0.58
    });

    gsap.from('.wc-identity', {
      duration: 0.9,
      y: 18,
      opacity: 0,
      ease: 'power2.out',
      delay: 0.72
    });

    gsap.from('.wc-symbols', {
      duration: 0.8,
      y: 14,
      opacity: 0,
      ease: 'power2.out',
      delay: 0.88
    });
  }

  /* ── Boot ─────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initReveal();
    initHeroAnimation();
  });

  /* Wait for Three.js via the shared cv:three-ready event */
  window.addEventListener('cv:three-ready', function () {
    if (window.THREE) initWorldChamberScene(window.THREE);
  });

  /* Fallback: if THREE already on window */
  if (window.THREE) {
    initWorldChamberScene(window.THREE);
  }

})();
