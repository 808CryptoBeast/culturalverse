/**
 * worlds-scene.js
 * Immersive 3D world spheres for worlds.html
 * Each world gets: glowing core, orbit rings, particle halo, canvas label sprite, glow billboard.
 * Click to select world + dispatch cv:world-selected.
 */
(function () {
  'use strict';

  var CULTURAL_MARKERS = {
    kanaka: [
      {
        id: 'star-compass',
        title: 'Star Compass',
        type: 'orientation',
        short: 'Wayfinding',
        copy: 'Navigator memory held in star lines, swell reading, and directional relationship between sky, canoe, and current.'
      },
      {
        id: 'loi-kalo',
        title: 'Loi Kalo',
        type: 'place',
        short: 'Aina',
        copy: 'Terraced kalo systems connect rain, stream, soil, and kinship into a living practice of stewardship.'
      },
      {
        id: 'trade-winds',
        title: 'Trade Wind Field',
        type: 'climate',
        short: 'Winds',
        copy: 'Cloud bands, pressure shifts, and wind lanes shape movement on the water and help situate the waa within a living weather map.'
      },
      {
        id: 'voyaging',
        title: 'Voyaging Chamber',
        type: 'chamber',
        short: 'Voyage',
        copy: 'Learning happens through routes, stars, winds, and reciprocal awareness rather than a fixed map alone.'
      }
    ],
    kemet: [
      {
        id: 'temple-axis',
        title: 'Temple Axis',
        type: 'orientation',
        short: 'Axis',
        copy: 'Built space encodes solar rhythm, cardinal orientation, and ceremonial procession into the structure itself.'
      },
      {
        id: 'river-memory',
        title: 'River Memory',
        type: 'place',
        short: 'Nile',
        copy: 'The Nile is not background scenery; it organizes time, agriculture, ritual movement, and civic continuity.'
      },
      {
        id: 'sesh-archive',
        title: 'Sesh Archive',
        type: 'archive',
        short: 'Archive',
        copy: 'Script, image, and disciplined repetition preserve lineage memory across generations.'
      },
      {
        id: 'maat',
        title: 'Maat Balance',
        type: 'ethic',
        short: 'Maat',
        copy: 'Ethical balance binds language, rule, ceremony, and cosmic order into one lived framework.'
      }
    ]
  };

  var HAWAIIAN_STAR_COMPASS_HOUSES = [
    { name: 'AKAU', deg: 0, dir: 'North' },
    { name: 'NA LEO', deg: 11.25 },
    { name: 'NALANI', deg: 22.5 },
    { name: 'MANU', deg: 45 },
    { name: 'NOIO', deg: 56.25 },
    { name: "'AINA", deg: 67.5 },
    { name: 'LA', deg: 78.75 },
    { name: 'HIKINA', deg: 90, dir: 'East' },
    { name: 'LA', deg: 101.25 },
    { name: "'AINA", deg: 112.5 },
    { name: 'NOIO', deg: 123.75 },
    { name: 'MANU', deg: 135 },
    { name: 'NALANI', deg: 146.25 },
    { name: 'NA LEO', deg: 157.5 },
    { name: 'HAKA', deg: 168.75 },
    { name: 'HEMA', deg: 180, dir: 'South' },
    { name: 'HAKA', deg: 191.25 },
    { name: 'NA LEO', deg: 202.5 },
    { name: 'NALANI', deg: 213.75 },
    { name: 'MANU', deg: 225 },
    { name: 'NOIO', deg: 236.25 },
    { name: "'AINA", deg: 247.5 },
    { name: 'LA', deg: 258.75 },
    { name: 'KOMOHANA', deg: 270, dir: 'West' },
    { name: 'LA', deg: 281.25 },
    { name: "'AINA", deg: 292.5 },
    { name: 'NOIO', deg: 303.75 },
    { name: 'MANU', deg: 315 },
    { name: 'NALANI', deg: 326.25 },
    { name: 'NA LEO', deg: 337.5 },
    { name: 'HAKA', deg: 348.75 }
  ];

  /* ── Label sprite builder ───────────────────────────── */
  function makeLabelSprite(THREE, text, subtext, primaryColor) {
    var w = 512, h = 128;
    var cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    var ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    ctx.font = 'bold 54px "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = primaryColor || '#f0c96a';
    ctx.shadowColor = primaryColor || '#f0c96a';
    ctx.shadowBlur = 18;
    ctx.fillText(text, w / 2, h * 0.4);
    ctx.font = '500 28px "DM Sans", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(220,205,178,0.72)';
    ctx.shadowBlur = 0;
    ctx.fillText(subtext, w / 2, h * 0.76);
    var tex = new THREE.CanvasTexture(cv);
    var mat = new THREE.SpriteMaterial({
      map: tex, transparent: true, opacity: 0.92,
      depthWrite: false, depthTest: false
    });
    var sprite = new THREE.Sprite(mat);
    sprite.scale.set(30, 7.5, 1);
    sprite.renderOrder = 10;
    return sprite;
  }

  function makeMarkerLabelSprite(THREE, text, color) {
    var w = 256, h = 72;
    var cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    var ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    ctx.font = '600 24px "DM Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
    ctx.fillText(text, w / 2, h / 2);
    var tex = new THREE.CanvasTexture(cv);
    var mat = new THREE.SpriteMaterial({
      map: tex, transparent: true, opacity: 0.88, depthWrite: false, depthTest: false
    });
    var sprite = new THREE.Sprite(mat);
    sprite.scale.set(14, 4, 1);
    sprite.renderOrder = 12;
    return sprite;
  }

  function makeCompassLabelSprite(THREE, lineA, lineB, color, isCardinal) {
    var w = isCardinal ? 520 : 360;
    var h = isCardinal ? 150 : 118;
    var cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    var ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, w, h);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = isCardinal ? 18 : 12;

    ctx.font = isCardinal ? '700 42px "Cormorant Garamond", serif' : '700 30px "DM Sans", sans-serif';
    ctx.fillText(lineA, w / 2, h * 0.42);

    if (lineB) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(226, 232, 238, 0.95)';
      ctx.font = isCardinal ? '600 24px "DM Sans", sans-serif' : '500 20px "DM Sans", sans-serif';
      ctx.fillText(lineB, w / 2, h * 0.72);
    }

    var tex = new THREE.CanvasTexture(cv);
    var mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      opacity: isCardinal ? 0.98 : 0.9,
      depthWrite: false,
      depthTest: false
    });
    var sprite = new THREE.Sprite(mat);
    sprite.scale.set(isCardinal ? 18 : 10.8, isCardinal ? 5.1 : 3.4, 1);
    sprite.renderOrder = 14;
    return sprite;
  }

  function makeIwaBirdMesh(THREE) {
    var shape = new THREE.Shape();
    shape.moveTo(-6.8, 0);
    shape.bezierCurveTo(-5.4, 1.3, -3.3, 2.0, -1.4, 0.95);
    shape.bezierCurveTo(-0.5, 0.52, 0.22, 0.3, 0.65, 0.05);
    shape.bezierCurveTo(1.4, 0.45, 2.25, 0.8, 3.2, 0.95);
    shape.bezierCurveTo(4.9, 1.2, 6.0, 0.55, 7.0, -0.1);
    shape.bezierCurveTo(6.2, -0.9, 4.8, -1.45, 3.4, -1.2);
    shape.bezierCurveTo(2.1, -1.02, 1.25, -0.62, 0.62, -0.2);
    shape.bezierCurveTo(-0.2, -0.65, -1.0, -1.12, -2.2, -1.28);
    shape.bezierCurveTo(-3.9, -1.42, -5.5, -0.88, -6.8, 0);
    shape.closePath();

    var geo = new THREE.ShapeGeometry(shape);
    var mat = new THREE.MeshStandardMaterial({
      color: 0xb3bfcb,
      emissive: 0x5b748f,
      emissiveIntensity: 0.34,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
      roughness: 0.48,
      metalness: 0.08
    });
    var bird = new THREE.Mesh(geo, mat);
    bird.scale.set(0.9, 0.9, 0.9);
    bird.rotation.x = -Math.PI / 2;
    return bird;
  }

  /* ── Glow billboard builder ─────────────────────────── */
  function makeGlowSprite(THREE, color, radius) {
    var size = 128;
    var cv = document.createElement('canvas');
    cv.width = size; cv.height = size;
    var ctx = cv.getContext('2d');
    var grad = ctx.createRadialGradient(size/2,size/2,0, size/2,size/2,size/2);
    var c = new THREE.Color(color);
    var r = Math.round(c.r * 255), g = Math.round(c.g * 255), b = Math.round(c.b * 255);
    grad.addColorStop(0,   'rgba('+r+','+g+','+b+',0.7)');
    grad.addColorStop(0.4, 'rgba('+r+','+g+','+b+',0.25)');
    grad.addColorStop(1,   'rgba('+r+','+g+','+b+',0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    var tex = new THREE.CanvasTexture(cv);
    var mat = new THREE.SpriteMaterial({
      map: tex, transparent: true, opacity: 0.40,
      depthWrite: false, blending: THREE.AdditiveBlending
    });
    var sprite = new THREE.Sprite(mat);
    var s = radius * 4.8;
    sprite.scale.set(s, s, 1);
    sprite.renderOrder = 2;
    return sprite;
  }

  /* ── Orbit ring builder ─────────────────────────────── */
  function makeOrbitRing(THREE, radius, color, tilt) {
    var segments = 128;
    var pts = [];
    for (var i = 0; i <= segments; i++) {
      var a = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    var geo = new THREE.BufferGeometry().setFromPoints(pts);
    var mat = new THREE.LineBasicMaterial({
      color: color, transparent: true, opacity: 0.30, depthWrite: false
    });
    var ring = new THREE.Line(geo, mat);
    ring.rotation.x = tilt || Math.PI / 3;
    ring.renderOrder = 1;
    return ring;
  }

  /* ── Particle halo around sphere ────────────────────── */
  function makeParticleHalo(THREE, radius, color, count) {
    var positions = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      var phi   = Math.acos(2 * Math.random() - 1);
      var theta = Math.random() * Math.PI * 2;
      var r     = radius * (1.18 + Math.random() * 0.50);
      positions[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i*3+2] = r * Math.cos(phi);
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var cv = document.createElement('canvas');
    cv.width = 16; cv.height = 16;
    var ctx = cv.getContext('2d');
    var g = ctx.createRadialGradient(8,8,0, 8,8,8);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 16, 16);
    var mat = new THREE.PointsMaterial({
      size: 0.7, map: new THREE.CanvasTexture(cv), color: color,
      transparent: true, opacity: 0.50,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
    });
    var halo = new THREE.Points(geo, mat);
    halo.renderOrder = 3;
    return halo;
  }

  function getWorldMarkers(world) {
    return CULTURAL_MARKERS[world.id] || [];
  }

  function getMarkerPalette(world) {
    return world.id === 'kanaka'
      ? { primary: '#3cb371', secondary: '#1f9fb3' }
      : { primary: '#f0c96a', secondary: '#d98545' };
  }

  function getDefaultFocusMarker(world) {
    var markers = getWorldMarkers(world);
    var preferred = world.id === 'kanaka' ? 'voyaging' : 'temple-axis';
    for (var i = 0; i < markers.length; i++) {
      if (markers[i].id === preferred) return markers[i];
    }
    return markers[0] || null;
  }

  function getFocusFacts(world, marker) {
    var id = marker ? marker.id : '';
    if (world.id === 'kanaka') {
      if (id === 'voyaging') {
        return {
          atmosphere: 'Moonlit open-ocean sky, cloud drift, phosphorescent water',
          motion: 'Rolling swells, waa pitch, wind lines, slow star rotation',
          anchors: 'Waa hull, outrigger beams, sail, star compass canopy'
        };
      }
      if (id === 'star-compass') {
        return {
          atmosphere: 'Night navigation chamber with horizon houses and cardinal gateways',
          motion: 'Slowly rotating compass deck, floating labels, and orbital sky drift',
          anchors: 'AKAU, HIKINA, HEMA, KOMOHANA with house names and 11.25 degree intervals'
        };
      }
      if (id === 'loi-kalo') {
        return {
          atmosphere: 'Wet valley air, watershed terraces, green mountain light',
          motion: 'Water shimmer, mist drift, subtle terrace breathing',
          anchors: 'Loi walls, kalo leaves, stream-fed basins'
        };
      }
      return {
        atmosphere: 'Trade-wind sky chamber with cloud lanes over ocean',
        motion: 'Wind ribbons, cloud migration, rotating weather field',
        anchors: 'Wind corridors, ocean disc, cloud shelf'
      };
    }

    if (id === 'temple-axis') {
      return {
        atmosphere: 'Solar desert chamber with dust haze and long shadows',
        motion: 'Heat shimmer, drifting dust, slow solar wheel rotation',
        anchors: 'Processional axis, columns, sun disc, raised court'
      };
    }
    if (id === 'river-memory') {
      return {
        atmosphere: 'River valley glow with floodplain shimmer and reeds',
        motion: 'Water glint, reed sway, reflected light pulse',
        anchors: 'Nile channel, banks, cultivated edge, solar horizon'
      };
    }
    if (id === 'sesh-archive') {
      return {
        atmosphere: 'Interior archive chamber with lamplit stone warmth',
        motion: 'Dust motes, subtle scroll drift, gentle axial turn',
        anchors: 'Stone slabs, papyrus rolls, archival wall rhythm'
      };
    }
    return {
      atmosphere: 'Sacred judgment chamber lit by gold and desert dusk',
      motion: 'Balanced oscillation, floating particles, ceremonial suspension',
      anchors: 'Scale beam, plates, luminous symmetry field'
    };
  }

  function addMoteField(THREE, scene, options) {
    var count = options.count || 200;
    var positions = new Float32Array(count * 3);
    var speeds = new Float32Array(count);
    for (var i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * (options.width || 80);
      positions[i * 3 + 1] = (Math.random() - 0.5) * (options.height || 40) + (options.y || 0);
      positions[i * 3 + 2] = (Math.random() - 0.5) * (options.depth || 60);
      speeds[i] = 0.2 + Math.random() * 0.8;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var mat = new THREE.PointsMaterial({
      size: options.size || 0.35,
      color: options.color || 0xffffff,
      transparent: true,
      opacity: options.opacity || 0.35,
      depthWrite: false,
      blending: options.additive ? THREE.AdditiveBlending : THREE.NormalBlending
    });
    var points = new THREE.Points(geo, mat);
    scene.add(points);
    return function update(t) {
      var arr = geo.attributes.position.array;
      for (var j = 0; j < count; j++) {
        arr[j * 3 + 1] += Math.sin(t * 0.3 + j) * 0.002 * speeds[j];
        arr[j * 3] += Math.cos(t * 0.2 + j) * 0.0015 * speeds[j];
      }
      geo.attributes.position.needsUpdate = true;
    };
  }

  function addGlowDisc(THREE, scene, color, radius, position, opacity) {
    var canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    var ctx = canvas.getContext('2d');
    var grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    var c = new THREE.Color(color);
    var r = Math.round(c.r * 255), g = Math.round(c.g * 255), b = Math.round(c.b * 255);
    grad.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',0.95)');
    grad.addColorStop(0.35, 'rgba(' + r + ',' + g + ',' + b + ',0.35)');
    grad.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    var sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, opacity: opacity || 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
    sprite.scale.set(radius, radius, 1);
    sprite.position.copy(position);
    scene.add(sprite);
    return sprite;
  }

  function addReedCluster(THREE, scene, x, z, count) {
    var group = new THREE.Group();
    for (var i = 0; i < count; i++) {
      var reed = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 2.6 + Math.random(), 5), new THREE.MeshStandardMaterial({ color: 0x8f9a3e, roughness: 0.95 }));
      reed.position.set(x + (Math.random() - 0.5) * 2.4, 1.2 + Math.random() * 0.3, z + (Math.random() - 0.5) * 1.6);
      reed.rotation.z = (Math.random() - 0.5) * 0.18;
      group.add(reed);
    }
    scene.add(group);
    return group;
  }

  function renderSceneDock(world, marker) {
    var dock = document.getElementById('world-scene-dock');
    if (!dock || !world) return;

    var palette = getMarkerPalette(world);
    var markers = getWorldMarkers(world);
    var activeMarker = marker || markers[0] || null;

    dock.className = 'world-scene-dock ' + (world.theme || '');
    dock.innerHTML = ''
      + '<div class="world-scene-focus">'
      + '  <div class="world-scene-focus__header">'
      + '    <h3>' + world.name + ' Scene Focus</h3>'
      + '    <p class="world-scene-focus__summary">' + (world.identity || world.summary) + '</p>'
      + '  </div>'
      + '  <div class="world-scene-focus__crest">'
      + '    <span>' + world.region + '</span>'
      + '    <span>' + (world.orientation || 'Living orientation') + '</span>'
      + '  </div>'
      + '  <div class="world-scene-focus__markers">'
      + markers.map(function (item) {
          var active = activeMarker && activeMarker.id === item.id ? ' is-active' : '';
          return '<button class="world-scene-chip' + active + '" type="button" data-scene-marker="' + item.id + '" style="--scene-accent:' + palette.primary + ';">'
            + '<strong>' + item.title + '</strong>'
            + '<span>' + item.short + ' · ' + item.type + '</span>'
            + '</button>';
        }).join('')
      + '  </div>'
      + (activeMarker ? ''
      + '  <div class="world-scene-focus__marker">'
      + '    <div class="world-scene-focus__marker-meta">' + activeMarker.type + '</div>'
      + '    <strong>' + activeMarker.title + '</strong>'
      + '    <p class="world-scene-focus__marker-copy">' + activeMarker.copy + '</p>'
      + '  </div>' : '')
      + '  <div class="world-scene-focus__actions">'
      + '    <button class="btn btn-solid" type="button" data-open-scene-focus="' + (activeMarker ? activeMarker.id : '') + '" data-world-id="' + world.id + '">Open 3D Focus</button>'
      + '    <a class="btn btn-solid" href="' + (world.entryHref || ('worlds.html?world=' + world.id)) + '">' + (world.entryLabel || 'Enter Immersive World') + '</a>'
      + '    <a class="btn btn-outline" href="protocols.html">Open Protocol Context</a>'
      + '  </div>'
      + '</div>';
  }

  var focusRuntime = null;

  function ensureFocusRefs() {
    return {
      overlay: document.getElementById('world-focus-overlay'),
      canvas: document.getElementById('world-focus-canvas'),
      kicker: document.getElementById('world-focus-kicker'),
      title: document.getElementById('world-focus-title'),
      summary: document.getElementById('world-focus-summary'),
      context: document.getElementById('world-focus-context'),
      atmosphere: document.getElementById('world-focus-atmosphere'),
      motion: document.getElementById('world-focus-motion'),
      anchors: document.getElementById('world-focus-anchors'),
      link: document.getElementById('world-focus-link')
    };
  }

  function disposeFocusRuntime() {
    if (!focusRuntime) return;
    focusRuntime.active = false;
    if (focusRuntime.frameId) cancelAnimationFrame(focusRuntime.frameId);
    if (focusRuntime.renderer) {
      focusRuntime.renderer.dispose();
      if (focusRuntime.renderer.domElement && focusRuntime.renderer.domElement.parentNode) {
        focusRuntime.renderer.domElement.parentNode.removeChild(focusRuntime.renderer.domElement);
      }
    }
    focusRuntime = null;
  }

  function closeFocusOverlay() {
    var refs = ensureFocusRefs();
    disposeFocusRuntime();
    if (refs.overlay) refs.overlay.hidden = true;
  }

  function addSkyShell(THREE, scene, topColor, bottomColor) {
    var skyGeo = new THREE.SphereGeometry(180, 32, 18);
    var skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor: { value: new THREE.Color(topColor) },
        bottomColor: { value: new THREE.Color(bottomColor) }
      },
      vertexShader: 'varying vec3 vWorldPosition; void main() { vec4 worldPosition = modelMatrix * vec4(position, 1.0); vWorldPosition = worldPosition.xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 topColor; uniform vec3 bottomColor; varying vec3 vWorldPosition; void main() { float h = normalize(vWorldPosition + vec3(0.0, 40.0, 0.0)).y; gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), 1.4), 0.0)), 1.0); }'
    });
    scene.add(new THREE.Mesh(skyGeo, skyMat));
  }

  function addStarField(THREE, scene, color, density, radius) {
    var starCount = density || 220;
    var pos = new Float32Array(starCount * 3);
    for (var i = 0; i < starCount; i++) {
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos(2 * Math.random() - 1);
      var r = radius || 120;
      pos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.abs(Math.cos(phi)) * r * 0.8 + 10;
      pos[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var mat = new THREE.PointsMaterial({ size: 1.2, color: color, transparent: true, opacity: 0.9, depthWrite: false });
    var stars = new THREE.Points(geo, mat);
    scene.add(stars);
    return stars;
  }

  function makeLineLoop(THREE, radius, segments, color, opacity) {
    var pts = [];
    for (var i = 0; i <= segments; i++) {
      var a = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity || 0.3, depthWrite: false })
    );
  }

  function buildVoyagingFocus(THREE, scene, camera, runtime) {
    scene.fog = new THREE.FogExp2(0x07131e, 0.018);
    addSkyShell(THREE, scene, 0x0f3854, 0x041018);
    var stars = addStarField(THREE, scene, 0xb8e6ff, 180, 120);
    var ambient = new THREE.AmbientLight(0x91bed0, 1.2);
    var moon = new THREE.DirectionalLight(0xbfe8ff, 1.6);
    moon.position.set(18, 24, 12);
    scene.add(ambient);
    scene.add(moon);
    addGlowDisc(THREE, scene, 0xdaf2ff, 18, new THREE.Vector3(-24, 24, -34), 0.42);

    var oceanGeo = new THREE.PlaneGeometry(160, 160, 80, 80);
    oceanGeo.rotateX(-Math.PI / 2);
    var oceanMat = new THREE.MeshPhongMaterial({ color: 0x0d6074, emissive: 0x063845, transparent: true, opacity: 0.96, shininess: 90, side: THREE.DoubleSide });
    var ocean = new THREE.Mesh(oceanGeo, oceanMat);
    scene.add(ocean);
    var oceanPos = ocean.geometry.attributes.position;
    var oceanBase = new Float32Array(oceanPos.array);
    var sparkleUpdate = addMoteField(THREE, scene, {
      count: 180, width: 96, height: 2.4, depth: 72, y: 0.9,
      color: 0x87f3ff, size: 0.24, opacity: 0.28, additive: true
    });

    var horizon = new THREE.Group();
    [-36, -10, 18].forEach(function (x, idx) {
      var island = new THREE.Mesh(new THREE.ConeGeometry(8 + idx * 2, 10 + idx * 3, 5), new THREE.MeshBasicMaterial({ color: 0x0c1a22, transparent: true, opacity: 0.85 }));
      island.position.set(x, 4 + idx, -42 + idx * 4);
      island.scale.z = 1.8;
      horizon.add(island);
    });
    scene.add(horizon);

    var canoe = new THREE.Group();
    var hull = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.6, 16, 14, 1), new THREE.MeshStandardMaterial({ color: 0x6d4322, roughness: 0.65 }));
    hull.rotation.z = Math.PI / 2;
    hull.scale.set(1, 0.55, 0.9);
    canoe.add(hull);
    var outrigger = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 12, 10), new THREE.MeshStandardMaterial({ color: 0x8b5a30, roughness: 0.72 }));
    outrigger.rotation.z = Math.PI / 2;
    outrigger.position.set(0.6, 0.1, -3.2);
    canoe.add(outrigger);
    [-3.6, 3.6].forEach(function (x) {
      var beam = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.3, 8), new THREE.MeshStandardMaterial({ color: 0x9f7245 }));
      beam.rotation.x = Math.PI / 2;
      beam.position.set(x, 0.22, -1.45);
      canoe.add(beam);
    });
    var mast = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 5.6, 10), new THREE.MeshStandardMaterial({ color: 0xd5c7a5 }));
    mast.position.set(-0.4, 2.7, 0.1);
    canoe.add(mast);
    var sail = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: 0xe7dcc1, side: THREE.DoubleSide, transparent: true, opacity: 0.92 }));
    var sailVerts = new Float32Array([
      -0.35, 2.4, 0,
      3.7, 3.2, 0.15,
      2.5, 0.5, -0.1,
      -0.35, 2.4, 0,
      2.5, 0.5, -0.1,
      0.2, 0.35, 0
    ]);
    sail.geometry.setAttribute('position', new THREE.BufferAttribute(sailVerts, 3));
    sail.geometry.computeVertexNormals();
    canoe.add(sail);
    canoe.position.set(0, 1.1, 4);
    scene.add(canoe);

    var compass = new THREE.Group();
    var ring = makeLineLoop(THREE, 18, 96, 0x72d7ff, 0.35);
    ring.rotation.x = Math.PI / 2;
    compass.add(ring);
    for (var i = 0; i < 8; i++) {
      var a = (i / 8) * Math.PI * 2;
      compass.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * 16, 0, Math.sin(a) * 16)]),
        new THREE.LineBasicMaterial({ color: 0xb8f4ff, transparent: true, opacity: 0.28 })
      ));
    }
    compass.position.set(0, 14, 0);
    scene.add(compass);

    var cloudGroup = new THREE.Group();
    for (var c = 0; c < 6; c++) {
      var cloud = new THREE.Group();
      for (var p = 0; p < 4; p++) {
        var puff = new THREE.Mesh(new THREE.SphereGeometry(1.6 + Math.random() * 1.4, 14, 14), new THREE.MeshBasicMaterial({ color: 0xdbefff, transparent: true, opacity: 0.16 }));
        puff.position.set((p - 1.5) * 1.8, Math.random() * 0.7, (Math.random() - 0.5) * 1.2);
        cloud.add(puff);
      }
      cloud.position.set(-24 + c * 10, 18 + Math.random() * 5, -16 + Math.random() * 8);
      cloudGroup.add(cloud);
    }
    scene.add(cloudGroup);

    var windGroup = new THREE.Group();
    for (var w = 0; w < 9; w++) {
      var pts = [];
      for (var s = 0; s <= 32; s++) {
        var x = -34 + s * 2.2;
        var y = 10 + Math.sin(s * 0.35 + w) * 0.8 + w * 0.9;
        var z = -14 + Math.cos(s * 0.18 + w) * 1.2;
        pts.push(new THREE.Vector3(x, y, z));
      }
      var wind = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0xcff4ff, transparent: true, opacity: 0.14 })
      );
      windGroup.add(wind);
    }
    scene.add(windGroup);

    camera.position.set(0, 8, 24);
    camera.lookAt(0, 3, 0);
    runtime.updaters.push(function (t) {
      for (var i = 0; i < oceanPos.count; i++) {
        var ox = oceanBase[i * 3];
        var oz = oceanBase[i * 3 + 2];
        oceanPos.array[i * 3 + 1] = Math.sin(ox * 0.11 + t * 1.3) * 0.55 + Math.cos(oz * 0.08 + t * 1.1) * 0.35;
      }
      oceanPos.needsUpdate = true;
      canoe.position.y = 1.1 + Math.sin(t * 1.3) * 0.35;
      canoe.rotation.z = Math.sin(t * 0.8) * 0.06;
      canoe.rotation.x = Math.cos(t * 0.9) * 0.04;
      sail.rotation.y = Math.sin(t * 1.1) * 0.08;
      cloudGroup.position.x = Math.sin(t * 0.12) * 3;
      compass.rotation.y = t * 0.18;
      stars.rotation.y = t * 0.02;
      camera.position.x = Math.sin(t * 0.14) * 1.6;
      camera.position.y = 8 + Math.cos(t * 0.12) * 0.45;
      camera.lookAt(0, 3 + Math.sin(t * 0.22) * 0.25, 0);
      sparkleUpdate(t);
    });
  }

  function buildStarCompassFocus(THREE, scene, camera, runtime) {
    scene.fog = new THREE.FogExp2(0x06111b, 0.012);
    addSkyShell(THREE, scene, 0x123f66, 0x030912);
    var stars = addStarField(THREE, scene, 0xd8f6ff, 260, 130);
    scene.add(new THREE.AmbientLight(0x86b9d0, 1.0));
    addGlowDisc(THREE, scene, 0x72d7ff, 34, new THREE.Vector3(0, 2, 0), 0.2);

    var compass = new THREE.Group();
    var labelSprites = [];

    /* Open core plate instead of a solid center disc */
    var outerPlate = new THREE.Mesh(
      new THREE.RingGeometry(11.4, 34.2, 160),
      new THREE.MeshStandardMaterial({
        color: 0x11273a,
        emissive: 0x071927,
        roughness: 0.82,
        metalness: 0.18,
        side: THREE.DoubleSide
      })
    );
    outerPlate.rotation.x = -Math.PI / 2;
    outerPlate.position.y = 0.12;
    compass.add(outerPlate);

    var centerHalo = new THREE.Mesh(
      new THREE.RingGeometry(5.2, 10.8, 120),
      new THREE.MeshBasicMaterial({
        color: 0x79d8ff,
        transparent: true,
        opacity: 0.24,
        side: THREE.DoubleSide
      })
    );
    centerHalo.rotation.x = -Math.PI / 2;
    centerHalo.position.y = 0.22;
    compass.add(centerHalo);

    var coreGlass = new THREE.Mesh(
      new THREE.CircleGeometry(4.9, 84),
      new THREE.MeshPhysicalMaterial({
        color: 0x5fc8ef,
        transparent: true,
        opacity: 0.16,
        roughness: 0.12,
        metalness: 0,
        transmission: 0.75,
        thickness: 0.6,
        side: THREE.DoubleSide
      })
    );
    coreGlass.rotation.x = -Math.PI / 2;
    coreGlass.position.y = 0.24;
    compass.add(coreGlass);

    [12, 20, 28, 33].forEach(function (radius, idx) {
      var ring = makeLineLoop(THREE, radius, 160, idx >= 2 ? 0x8ad8ff : 0x4ea9c2, 0.34 - idx * 0.05);
      ring.rotation.x = Math.PI / 2;
      compass.add(ring);
    });

    /* Sun / moon trajectories on crossed axes */
    var sunTrack = makeLineLoop(THREE, 24.3, 220, 0xffcf73, 0.36);
    sunTrack.rotation.x = Math.PI / 2.32;
    sunTrack.rotation.z = 0.18;
    sunTrack.position.y = 0.9;
    compass.add(sunTrack);

    var moonTrack = makeLineLoop(THREE, 26.9, 220, 0xb9dbff, 0.32);
    moonTrack.rotation.x = Math.PI / 1.86;
    moonTrack.rotation.z = -0.26;
    moonTrack.position.y = 1.32;
    compass.add(moonTrack);

    var sunOrbit = new THREE.Group();
    sunOrbit.rotation.x = sunTrack.rotation.x;
    sunOrbit.rotation.z = sunTrack.rotation.z;
    sunOrbit.position.y = sunTrack.position.y;
    compass.add(sunOrbit);

    var moonOrbit = new THREE.Group();
    moonOrbit.rotation.z = Math.PI / 2;
    moonOrbit.rotation.y = -0.34;
    moonOrbit.rotation.x = moonTrack.rotation.x;
    moonOrbit.position.y = moonTrack.position.y;
    compass.add(moonOrbit);

    var sunBody = new THREE.Mesh(
      new THREE.SphereGeometry(1.15, 22, 22),
      new THREE.MeshStandardMaterial({
        color: 0xffd48d,
        emissive: 0xffb84f,
        emissiveIntensity: 1.25,
        roughness: 0.36,
        metalness: 0.05
      })
    );
    sunBody.position.set(24.3, 0, 0);
    sunOrbit.add(sunBody);

    var moonBody = new THREE.Group();
    var moonLit = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 20, 20),
      new THREE.MeshStandardMaterial({
        color: 0xe6ecff,
        emissive: 0x6b86c5,
        emissiveIntensity: 0.3,
        roughness: 0.78,
        metalness: 0.06
      })
    );
    moonBody.add(moonLit);
    var moonShadow = new THREE.Mesh(
      new THREE.SphereGeometry(0.93, 20, 20),
      new THREE.MeshBasicMaterial({
        color: 0x04070e,
        transparent: true,
        opacity: 0.88
      })
    );
    moonShadow.position.y = 0.22;
    moonBody.add(moonShadow);
    moonBody.position.set(26.9, 0, 0);
    moonOrbit.add(moonBody);

    var iwaBird = makeIwaBirdMesh(THREE);
    iwaBird.position.set(0, 0.52, 0);
    compass.add(iwaBird);

    /* 32-house tick lattice with emphasized cardinal marks */
    for (var i = 0; i < 32; i++) {
      var deg = i * 11.25;
      var a = THREE.MathUtils.degToRad(deg);
      var innerR = (i % 8 === 0) ? 29.2 : 30.8;
      var outerR = (i % 8 === 0) ? 34.7 : 33.4;
      var tick = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(Math.sin(a) * innerR, 0.34, -Math.cos(a) * innerR),
          new THREE.Vector3(Math.sin(a) * outerR, 0.34, -Math.cos(a) * outerR)
        ]),
        new THREE.LineBasicMaterial({
          color: (i % 8 === 0) ? 0xe2f8ff : 0x7ec3de,
          transparent: true,
          opacity: (i % 8 === 0) ? 0.78 : 0.38
        })
      );
      compass.add(tick);
    }

    /* Radial house guides */
    for (var j = 0; j < 32; j++) {
      var a32 = THREE.MathUtils.degToRad(j * 11.25);
      compass.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(Math.sin(a32) * 13.5, 0.24, -Math.cos(a32) * 13.5),
          new THREE.Vector3(Math.sin(a32) * 28.6, 0.24, -Math.cos(a32) * 28.6)
        ]),
        new THREE.LineBasicMaterial({ color: 0x5da8c8, transparent: true, opacity: 0.15 })
      ));
    }

    HAWAIIAN_STAR_COMPASS_HOUSES.forEach(function (house) {
      var ha = THREE.MathUtils.degToRad(house.deg);
      var name = house.name;
      var detail = house.deg + '\u00b0' + (house.dir ? ' ' + house.dir : '');
      var isCardinal = !!house.dir;

      if (isCardinal) {
        var marker = new THREE.Mesh(
          new THREE.CylinderGeometry(0.56, 0.84, 1.45, 12),
          new THREE.MeshStandardMaterial({ color: 0x95a8b6, emissive: 0x354451, roughness: 0.56, metalness: 0.3 })
        );
        marker.position.set(Math.sin(ha) * 33.25, 0.94, -Math.cos(ha) * 33.25);
        compass.add(marker);
      }

      var labelRadius = isCardinal ? 41.2 : 38.2;
      var labelY = isCardinal ? 2.75 : 2.05;
      var label = makeCompassLabelSprite(THREE, name, detail, isCardinal ? '#e9f8ff' : '#bfeeff', isCardinal);
      label.position.set(Math.sin(ha) * labelRadius, labelY, -Math.cos(ha) * labelRadius);
      label.userData.baseY = labelY;
      label.userData.phase = house.deg * 0.035;
      label.userData.cardinal = isCardinal;
      compass.add(label);
      labelSprites.push(label);
    });

    compass.position.y = 1.1;
    scene.add(compass);
    camera.position.set(0, 20, 58);
    camera.lookAt(0, 1.4, 0);
    runtime.updaters.push(function (t) {
      compass.rotation.y = t * 0.082;
      stars.rotation.y = t * 0.02;
      camera.position.x = Math.sin(t * 0.13) * 1.8;
      camera.position.y = 20 + Math.cos(t * 0.1) * 0.85;
      camera.lookAt(0, 1.6, 0);

      /* Cross-axis orbital trajectories + moon phase cycle */
      sunOrbit.rotation.y = t * 0.42;
      sunOrbit.rotation.x = sunTrack.rotation.x + Math.sin(t * 0.2) * 0.03;

      moonOrbit.rotation.x = moonTrack.rotation.x + t * 0.27;
      moonOrbit.rotation.y = -0.34 + Math.sin(t * 0.16) * 0.05;

      var lunarPhase = (Math.sin(t * 0.34) + 1) * 0.5;
      moonShadow.position.y = (lunarPhase - 0.5) * 1.45;
      moonLit.material.emissiveIntensity = 0.18 + lunarPhase * 0.52;
      moonBody.lookAt(camera.position);

      centerHalo.material.opacity = 0.2 + Math.sin(t * 0.8) * 0.05;
      iwaBird.rotation.z = Math.sin(t * 0.58) * 0.05;
      iwaBird.position.y = 0.52 + Math.sin(t * 0.74) * 0.06;

      for (var li = 0; li < labelSprites.length; li++) {
        var spr = labelSprites[li];
        spr.position.y = spr.userData.baseY + Math.sin(t * 0.45 + spr.userData.phase) * (spr.userData.cardinal ? 0.08 : 0.05);
        spr.lookAt(camera.position);
      }
    });
  }

  function buildLoiKaloFocus(THREE, scene, camera, runtime) {
    scene.fog = new THREE.FogExp2(0x10201a, 0.016);
    addSkyShell(THREE, scene, 0x3a6c66, 0x0e1715);
    scene.add(new THREE.AmbientLight(0xb8d7af, 1.0));
    var sun = new THREE.DirectionalLight(0xfff1c2, 1.5);
    sun.position.set(18, 22, 8);
    scene.add(sun);
    addGlowDisc(THREE, scene, 0xcff9b0, 14, new THREE.Vector3(18, 18, -10), 0.25);
    var ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ color: 0x2b3f23 }));
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    var terraces = new THREE.Group();
    for (var i = 0; i < 4; i++) {
      var bed = new THREE.Mesh(new THREE.BoxGeometry(28 - i * 3, 1.2, 14), new THREE.MeshStandardMaterial({ color: 0x5f472a, roughness: 0.92 }));
      bed.position.set(-8 + i * 3.4, i * 1.4, i * -4.6);
      terraces.add(bed);
      var water = new THREE.Mesh(new THREE.BoxGeometry(24 - i * 3, 0.18, 10.5), new THREE.MeshStandardMaterial({ color: 0x62bcc5, emissive: 0x12454d, transparent: true, opacity: 0.82 }));
      water.position.set(-8 + i * 3.4, i * 1.4 + 0.72, i * -4.6);
      terraces.add(water);
    }
    scene.add(terraces);
    var mistUpdate = addMoteField(THREE, scene, {
      count: 140, width: 60, height: 18, depth: 36, y: 4,
      color: 0xdfffe6, size: 0.28, opacity: 0.18
    });
    var ridge = new THREE.Group();
    [-26, -8, 10, 28].forEach(function (x, idx) {
      var mountain = new THREE.Mesh(new THREE.ConeGeometry(10 + idx, 14 + idx * 2, 6), new THREE.MeshBasicMaterial({ color: 0x173027, transparent: true, opacity: 0.7 }));
      mountain.position.set(x, 7 + idx, -26 - idx * 3);
      mountain.scale.z = 1.4;
      ridge.add(mountain);
    });
    scene.add(ridge);
    for (var k = 0; k < 16; k++) {
      var leaf = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.8, 4), new THREE.MeshStandardMaterial({ color: 0x46a85f, roughness: 0.9 }));
      leaf.position.set(-16 + (k % 4) * 7.5, 2 + Math.floor(k / 4) * 1.4, -4 - Math.floor(k / 4) * 4.3);
      leaf.rotation.z = Math.PI / 2;
      leaf.rotation.y = (k % 3) * 0.7;
      scene.add(leaf);
    }
    camera.position.set(20, 14, 28);
    camera.lookAt(-4, 3, -6);
    runtime.updaters.push(function (t) {
      terraces.rotation.y = Math.sin(t * 0.12) * 0.05;
      camera.position.x = 20 + Math.sin(t * 0.12) * 1.4;
      camera.position.y = 14 + Math.cos(t * 0.14) * 0.4;
      mistUpdate(t);
    });
  }

  function buildTradeWindsFocus(THREE, scene, camera, runtime) {
    scene.fog = new THREE.FogExp2(0x0a141f, 0.014);
    addSkyShell(THREE, scene, 0x467ab0, 0x08111d);
    scene.add(new THREE.AmbientLight(0xb9d8ef, 1.0));
    addGlowDisc(THREE, scene, 0xe8f8ff, 20, new THREE.Vector3(16, 20, -24), 0.26);
    var windGroup = new THREE.Group();
    for (var w = 0; w < 12; w++) {
      var pts = [];
      for (var s = 0; s <= 24; s++) {
        pts.push(new THREE.Vector3(-28 + s * 2.3, 2 + w * 1.1 + Math.sin(s * 0.35 + w) * 0.8, Math.cos(s * 0.28 + w) * 2));
      }
      windGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0xd8f8ff, transparent: true, opacity: 0.16 })
      ));
    }
    scene.add(windGroup);
    var cloudBand = new THREE.Group();
    for (var c = 0; c < 10; c++) {
      var puff = new THREE.Mesh(new THREE.SphereGeometry(1.4 + Math.random(), 12, 12), new THREE.MeshBasicMaterial({ color: 0xf1f7ff, transparent: true, opacity: 0.14 }));
      puff.position.set(-24 + c * 5.4, 10 + Math.random() * 6, -10 + Math.random() * 6);
      cloudBand.add(puff);
    }
    scene.add(cloudBand);
    var ocean = new THREE.Mesh(new THREE.CircleGeometry(18, 60), new THREE.MeshStandardMaterial({ color: 0x135667, emissive: 0x092c37, transparent: true, opacity: 0.9 }));
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -1;
    scene.add(ocean);
    var weatherUpdate = addMoteField(THREE, scene, {
      count: 180, width: 80, height: 24, depth: 40, y: 8,
      color: 0xe8fbff, size: 0.22, opacity: 0.16, additive: true
    });
    camera.position.set(0, 10, 28);
    camera.lookAt(0, 6, 0);
    runtime.updaters.push(function (t) {
      windGroup.rotation.y = Math.sin(t * 0.18) * 0.1;
      cloudBand.position.x = Math.sin(t * 0.14) * 4;
      ocean.rotation.z = t * 0.03;
      camera.position.z = 28 + Math.sin(t * 0.16) * 1.2;
      weatherUpdate(t);
    });
  }

  function buildTempleAxisFocus(THREE, scene, camera, runtime) {
    scene.fog = new THREE.FogExp2(0x241408, 0.012);
    addSkyShell(THREE, scene, 0x6d4c18, 0x140a02);
    scene.add(new THREE.AmbientLight(0xe7c98d, 1.0));
    var sun = new THREE.DirectionalLight(0xffe1a0, 1.9);
    sun.position.set(26, 32, 8);
    scene.add(sun);
    addGlowDisc(THREE, scene, 0xffd77c, 24, new THREE.Vector3(22, 22, -26), 0.28);
    var ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ color: 0x8d6738, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    var temple = new THREE.Group();
    var walkway = new THREE.Mesh(new THREE.BoxGeometry(14, 1, 42), new THREE.MeshStandardMaterial({ color: 0xb88b4e }));
    walkway.position.y = 0.5;
    temple.add(walkway);
    var step = new THREE.Mesh(new THREE.BoxGeometry(20, 0.8, 50), new THREE.MeshStandardMaterial({ color: 0x9b743f, roughness: 0.95 }));
    step.position.y = 0.05;
    temple.add(step);
    for (var i = 0; i < 8; i++) {
      [-5, 5].forEach(function (x) {
        var column = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.05, 8, 16), new THREE.MeshStandardMaterial({ color: 0xd0a864, roughness: 0.75 }));
        column.position.set(x, 4.5, -14 + i * 4);
        temple.add(column);
      });
    }
    var sunDisc = new THREE.Mesh(new THREE.TorusGeometry(6.5, 0.14, 8, 60), new THREE.MeshBasicMaterial({ color: 0xffd270, transparent: true, opacity: 0.9 }));
    sunDisc.rotation.x = Math.PI / 2;
    sunDisc.position.set(0, 12, -12);
    temple.add(sunDisc);
    scene.add(temple);
    var dustUpdate = addMoteField(THREE, scene, {
      count: 180, width: 80, height: 24, depth: 60, y: 8,
      color: 0xffd99c, size: 0.24, opacity: 0.14, additive: true
    });
    camera.position.set(22, 12, 30);
    camera.lookAt(0, 5, 0);
    runtime.updaters.push(function (t) {
      temple.rotation.y = Math.sin(t * 0.12) * 0.05;
      sunDisc.rotation.z = t * 0.25;
      camera.position.x = 22 + Math.sin(t * 0.14) * 1.2;
      dustUpdate(t);
    });
  }

  function buildRiverMemoryFocus(THREE, scene, camera, runtime) {
    scene.fog = new THREE.FogExp2(0x2d1807, 0.012);
    addSkyShell(THREE, scene, 0xb88a4a, 0x1a1205);
    scene.add(new THREE.AmbientLight(0xe7d2a9, 1.0));
    var sun = new THREE.DirectionalLight(0xfff2c6, 1.4);
    sun.position.set(18, 24, 12);
    scene.add(sun);
    var ground = new THREE.Mesh(new THREE.PlaneGeometry(110, 110), new THREE.MeshStandardMaterial({ color: 0x7d5b2e, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    var riverShape = new THREE.Shape();
    riverShape.moveTo(-8, -28);
    riverShape.bezierCurveTo(-16, -10, 12, -2, 4, 18);
    riverShape.bezierCurveTo(-2, 28, 10, 38, 6, 48);
    riverShape.lineTo(16, 48);
    riverShape.bezierCurveTo(20, 34, 6, 24, 14, 10);
    riverShape.bezierCurveTo(22, -2, -4, -10, 2, -28);
    riverShape.closePath();
    var river = new THREE.Mesh(new THREE.ShapeGeometry(riverShape), new THREE.MeshStandardMaterial({ color: 0x2d7d8c, emissive: 0x10333b, side: THREE.DoubleSide }));
    river.rotation.x = -Math.PI / 2;
    river.position.y = 0.05;
    scene.add(river);
    addReedCluster(THREE, scene, -6, -2, 18);
    addReedCluster(THREE, scene, 12, 8, 18);
    var shimmerUpdate = addMoteField(THREE, scene, {
      count: 120, width: 36, height: 2, depth: 70, y: 0.35,
      color: 0xffefbc, size: 0.18, opacity: 0.18, additive: true
    });
    camera.position.set(18, 18, 26);
    camera.lookAt(4, 0, 10);
    runtime.updaters.push(function (t) {
      river.material.emissiveIntensity = 0.35 + Math.sin(t * 1.3) * 0.08;
      camera.position.y = 18 + Math.sin(t * 0.12) * 0.6;
      shimmerUpdate(t);
    });
  }

  function buildSeshArchiveFocus(THREE, scene, camera, runtime) {
    scene.fog = new THREE.FogExp2(0x170d05, 0.015);
    addSkyShell(THREE, scene, 0x5d3a18, 0x0f0702);
    scene.add(new THREE.AmbientLight(0xe0c18a, 1.0));
    addGlowDisc(THREE, scene, 0xffd08a, 16, new THREE.Vector3(0, 14, -18), 0.2);
    var archive = new THREE.Group();
    for (var i = 0; i < 5; i++) {
      var slab = new THREE.Mesh(new THREE.BoxGeometry(3.8, 7.5, 0.8), new THREE.MeshStandardMaterial({ color: 0xc9a76a, roughness: 0.92 }));
      slab.position.set(-12 + i * 6, 4.2, 0);
      archive.add(slab);
      var roll = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 4.8, 16), new THREE.MeshStandardMaterial({ color: 0xe3d6b3, roughness: 0.85 }));
      roll.rotation.z = Math.PI / 2;
      roll.position.set(-12 + i * 6, 1.4, -3.2);
      archive.add(roll);
    }
    scene.add(archive);
    var archiveDust = addMoteField(THREE, scene, {
      count: 140, width: 40, height: 24, depth: 28, y: 8,
      color: 0xffdf9e, size: 0.2, opacity: 0.14
    });
    camera.position.set(0, 10, 26);
    camera.lookAt(0, 4, 0);
    runtime.updaters.push(function (t) {
      archive.rotation.y = Math.sin(t * 0.16) * 0.08;
      archiveDust(t);
    });
  }

  function buildMaatFocus(THREE, scene, camera, runtime) {
    scene.fog = new THREE.FogExp2(0x160b03, 0.012);
    addSkyShell(THREE, scene, 0x714b16, 0x130902);
    scene.add(new THREE.AmbientLight(0xe0c796, 1.0));
    addGlowDisc(THREE, scene, 0xffd775, 18, new THREE.Vector3(0, 15, -18), 0.22);
    var scale = new THREE.Group();
    var mast = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 10, 12), new THREE.MeshStandardMaterial({ color: 0xd7b16c }));
    mast.position.y = 5;
    scale.add(mast);
    var beam = new THREE.Mesh(new THREE.BoxGeometry(12, 0.28, 0.28), new THREE.MeshStandardMaterial({ color: 0xd7b16c }));
    beam.position.y = 9.4;
    scale.add(beam);
    [-5, 5].forEach(function (x) {
      var chain = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 9.2, 0), new THREE.Vector3(x, 5.8, 0)]),
        new THREE.LineBasicMaterial({ color: 0xf0d28a, transparent: true, opacity: 0.5 })
      );
      scale.add(chain);
      var plate = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.08, 8, 40), new THREE.MeshBasicMaterial({ color: 0xf0d28a }));
      plate.rotation.x = Math.PI / 2;
      plate.position.set(x, 5.5, 0);
      scale.add(plate);
    });
    scene.add(scale);
    var particleUpdate = addMoteField(THREE, scene, {
      count: 120, width: 34, height: 24, depth: 22, y: 8,
      color: 0xffe0a0, size: 0.2, opacity: 0.12, additive: true
    });
    camera.position.set(0, 11, 24);
    camera.lookAt(0, 6, 0);
    runtime.updaters.push(function (t) {
      scale.rotation.z = Math.sin(t * 0.8) * 0.12;
      particleUpdate(t);
    });
  }

  function populateFocusOverlay(world, marker) {
    var refs = ensureFocusRefs();
    if (!refs.overlay) return;
    var facts = getFocusFacts(world, marker);
    refs.kicker.textContent = world.name + ' · 3D Focus';
    refs.title.textContent = marker ? marker.title : world.name;
    refs.summary.textContent = marker ? marker.copy : (world.identity || world.summary);
    refs.context.textContent = world.id === 'kanaka'
      ? 'This focus view leans into ocean motion, weather reading, and star-based orientation so the world feels inhabited rather than decorative.'
      : 'This focus view leans into axis, river, archive, and ceremonial alignment so the world reads as a built knowledge system.';
    if (refs.atmosphere) refs.atmosphere.textContent = facts.atmosphere;
    if (refs.motion) refs.motion.textContent = facts.motion;
    if (refs.anchors) refs.anchors.textContent = facts.anchors;
    refs.link.href = world.entryHref || ('worlds.html?world=' + world.id);
    refs.link.textContent = world.entryLabel || 'Enter World';
  }

  function buildFocusScene(THREE, world, marker, runtime) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(52, 1, 0.1, 400);
    runtime.scene = scene;
    runtime.camera = camera;
    var targetId = marker ? marker.id : (getDefaultFocusMarker(world) && getDefaultFocusMarker(world).id);
    if (world.id === 'kanaka') {
      if (targetId === 'voyaging') buildVoyagingFocus(THREE, scene, camera, runtime);
      else if (targetId === 'star-compass') buildStarCompassFocus(THREE, scene, camera, runtime);
      else if (targetId === 'loi-kalo') buildLoiKaloFocus(THREE, scene, camera, runtime);
      else buildTradeWindsFocus(THREE, scene, camera, runtime);
    } else {
      if (targetId === 'temple-axis') buildTempleAxisFocus(THREE, scene, camera, runtime);
      else if (targetId === 'river-memory') buildRiverMemoryFocus(THREE, scene, camera, runtime);
      else if (targetId === 'sesh-archive') buildSeshArchiveFocus(THREE, scene, camera, runtime);
      else buildMaatFocus(THREE, scene, camera, runtime);
    }
  }

  function resizeFocusRuntime() {
    if (!focusRuntime || !focusRuntime.canvas || !focusRuntime.camera || !focusRuntime.renderer) return;
    var width = focusRuntime.canvas.clientWidth || 800;
    var height = focusRuntime.canvas.clientHeight || 600;
    focusRuntime.camera.aspect = width / height;
    focusRuntime.camera.updateProjectionMatrix();
    focusRuntime.renderer.setSize(width, height);
  }

  function openFocusOverlay(THREE, world, marker) {
    var refs = ensureFocusRefs();
    if (!refs.overlay || !refs.canvas || !world) return;
    var chosenMarker = marker || getDefaultFocusMarker(world);
    disposeFocusRuntime();
    refs.overlay.hidden = false;
    refs.canvas.innerHTML = '';
    populateFocusOverlay(world, chosenMarker);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    refs.canvas.appendChild(renderer.domElement);

    focusRuntime = {
      active: true,
      renderer: renderer,
      canvas: refs.canvas,
      updaters: [],
      clock: new THREE.Clock(),
      frameId: 0
    };

    buildFocusScene(THREE, world, chosenMarker, focusRuntime);
    resizeFocusRuntime();

    function frame() {
      if (!focusRuntime || !focusRuntime.active) return;
      var t = focusRuntime.clock.getElapsedTime();
      for (var i = 0; i < focusRuntime.updaters.length; i++) {
        focusRuntime.updaters[i](t);
      }
      focusRuntime.renderer.render(focusRuntime.scene, focusRuntime.camera);
      focusRuntime.frameId = requestAnimationFrame(frame);
    }
    frame();
  }

  /* ── Cultural sphere texture ────────────────────────── */
  function makeWorldTexture(THREE, worldId) {
    var size = 512;
    var cv = document.createElement('canvas');
    cv.width = size; cv.height = size;
    var ctx = cv.getContext('2d');
    var cx = size / 2, cy = size / 2;

    if (worldId === 'kanaka') {
      /* Deep ocean background */
      var bgK = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.55);
      bgK.addColorStop(0, '#0c2535');
      bgK.addColorStop(0.6, '#071520');
      bgK.addColorStop(1, '#010d18');
      ctx.fillStyle = bgK; ctx.fillRect(0, 0, size, size);

      /* 8-point Polynesian star compass – radial guide lines */
      ctx.strokeStyle = 'rgba(31,159,179,0.30)'; ctx.lineWidth = 1.5;
      for (var i8 = 0; i8 < 8; i8++) {
        var a8 = (i8 / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a8) * size * 0.09, cy + Math.sin(a8) * size * 0.09);
        ctx.lineTo(cx + Math.cos(a8) * size * 0.44, cy + Math.sin(a8) * size * 0.44);
        ctx.stroke();
      }

      /* Concentric ocean current rings */
      ctx.strokeStyle = 'rgba(60,179,113,0.22)'; ctx.lineWidth = 1;
      [0.10, 0.20, 0.32, 0.43].forEach(function (f) {
        ctx.beginPath(); ctx.arc(cx, cy, size * f, 0, Math.PI * 2); ctx.stroke();
      });

      /* Undulating wave bands – 3 horizontal sine sweeps */
      ctx.strokeStyle = 'rgba(31,159,179,0.32)'; ctx.lineWidth = 2;
      [-0.14, 0, 0.14].forEach(function (off) {
        ctx.beginPath();
        for (var wx = 0; wx <= size; wx += 3) {
          var wy = cy + off * size + Math.sin((wx / size) * Math.PI * 4.5) * 20;
          if (wx === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      });

      /* Cardinal navigator points */
      ctx.fillStyle = 'rgba(31,159,179,0.88)';
      [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].forEach(function (a) {
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * size * 0.38, cy + Math.sin(a) * size * 0.38, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      /* Phosphorescent scatter – bioluminescent ocean motes */
      ctx.fillStyle = 'rgba(31,159,179,0.50)';
      for (var dK = 0; dK < 90; dK++) {
        var prK = Math.random() * size * 0.45;
        var paK = Math.random() * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(paK) * prK, cy + Math.sin(paK) * prK, 0.8 + Math.random() * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      /* Central glow */
      var cgK = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.22);
      cgK.addColorStop(0, 'rgba(31,159,179,0.50)'); cgK.addColorStop(1, 'rgba(31,159,179,0)');
      ctx.fillStyle = cgK; ctx.fillRect(0, 0, size, size);

    } else if (worldId === 'kemet') {
      /* Desert night background */
      var bgE = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.55);
      bgE.addColorStop(0, '#1c1000');
      bgE.addColorStop(0.6, '#120900');
      bgE.addColorStop(1, '#080300');
      ctx.fillStyle = bgE; ctx.fillRect(0, 0, size, size);

      /* Temple column grid – vertical guides */
      ctx.strokeStyle = 'rgba(240,201,106,0.07)'; ctx.lineWidth = 1;
      for (var col = 1; col < 8; col++) {
        var gx = (col / 8) * size;
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, size); ctx.stroke();
      }

      /* Horizontal strata – papyrus / pyramid layers */
      [[0.22, 0.18], [0.40, 0.14], [0.58, 0.10], [0.76, 0.07]].forEach(function (pair) {
        ctx.strokeStyle = 'rgba(240,201,106,' + pair[1] + ')'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(0, size * pair[0]); ctx.lineTo(size, size * pair[0]); ctx.stroke();
      });

      /* Pyramid outline – central monument */
      ctx.strokeStyle = 'rgba(240,201,106,0.40)'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - size * 0.27);
      ctx.lineTo(cx + size * 0.30, cy + size * 0.18);
      ctx.lineTo(cx - size * 0.30, cy + size * 0.18);
      ctx.closePath(); ctx.stroke();

      /* Simplified Eye of Ra – ellipse with kohl extension */
      var eyeY = cy - size * 0.06;
      ctx.strokeStyle = 'rgba(240,201,106,0.62)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(cx, eyeY, size * 0.11, size * 0.065, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(240,201,106,0.78)';
      ctx.beginPath(); ctx.arc(cx, eyeY, size * 0.022, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(240,201,106,0.42)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx + size * 0.11, eyeY); ctx.lineTo(cx + size * 0.22, eyeY + size * 0.025); ctx.stroke();

      /* Hieroglyphic-style tick marks on left column */
      ctx.fillStyle = 'rgba(240,201,106,0.42)';
      for (var t = 0; t < 6; t++) {
        ctx.fillRect(size * 0.08, size * (0.24 + t * 0.09) - 2, size * 0.045, 3);
      }

      /* Seal / cartouche scatter dots */
      ctx.fillStyle = 'rgba(240,201,106,0.55)';
      for (var ddE = 0; ddE < 55; ddE++) {
        var prE = Math.random() * size * 0.42;
        var paE = Math.random() * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(paE) * prE, cy + Math.sin(paE) * prE, 1 + Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      /* Central solar glow */
      var cgE = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.26);
      cgE.addColorStop(0, 'rgba(240,201,106,0.45)'); cgE.addColorStop(1, 'rgba(240,201,106,0)');
      ctx.fillStyle = cgE; ctx.fillRect(0, 0, size, size);
    }

    return new THREE.CanvasTexture(cv);
  }

  /* ── Main init ──────────────────────────────────────── */
  function initWorldsScene(THREE) {
    var container = document.getElementById('worlds-three-canvas');
    if (!container) return;

    var isNarrow = window.innerWidth < 720;
    var W = container.clientWidth  || 900;
    var H = container.clientHeight || (isNarrow ? 360 : 500);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    var scene  = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(isNarrow ? 62 : 55, W / H, 0.1, 600);
    camera.position.set(0, isNarrow ? 8 : 6, isNarrow ? 138 : 110);

    /* Lighting */
    scene.add(new THREE.AmbientLight(0x403020, 1.2));
    var warmLight = new THREE.PointLight(0xf0c96a, 2.2, 200);
    warmLight.position.set(0, 30, 40);
    scene.add(warmLight);
    var coolLight = new THREE.PointLight(0x1f9fb3, 1.8, 200);
    coolLight.position.set(-60, -20, 20);
    scene.add(coolLight);

    /* Background starfield */
    (function () {
      var count = 600;
      var pos = new Float32Array(count * 3);
      for (var i = 0; i < count; i++) {
        pos[i*3]   = (Math.random() - 0.5) * 400;
        pos[i*3+1] = (Math.random() - 0.5) * 300;
        pos[i*3+2] = -60 - Math.random() * 80;
      }
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
        size: 0.8, color: 0xffeab0,
        transparent: true, opacity: 0.35, depthWrite: false, sizeAttenuation: true
      })));
    }());

    /* World spheres */
    var worlds = window.CV_WORLDS || [];
    if (!worlds.length) return;

    var SPHERE_R = isNarrow ? 11.5 : 13;
    var GAP      = isNarrow ? 40 : 50;
    var totalW   = (worlds.length - 1) * GAP;
    var sphereGroups = [];
    var activeMarkerId = null;

    worlds.forEach(function (world, idx) {
      var x       = -totalW / 2 + idx * GAP;
      var primHex = parseInt((world.primary   || '#f0c96a').replace('#', ''), 16);
      var secHex  = parseInt((world.secondary || '#1f9fb3').replace('#', ''), 16);

      var group = new THREE.Group();
      group.position.set(x, 0, 0);
      group.userData.world    = world;
      group.userData.baseX    = x;
      group.userData.selected = false;
      group.userData.pulseOff = idx * 1.4;
      group.userData.markers  = [];

      /* Core – cultural texture applied */
      var worldTex = makeWorldTexture(THREE, world.id);
      var coreMat = new THREE.MeshStandardMaterial({
        map: worldTex,
        emissiveMap: worldTex,
        color: primHex,
        emissive: new THREE.Color(primHex),
        emissiveIntensity: 0.42,
        metalness: 0.25,
        roughness: 0.60
      });
      group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(SPHERE_R * 0.65, 5), coreMat));

      /* Outer shell */
      var shellMat = new THREE.MeshStandardMaterial({
        color: primHex, emissive: primHex, emissiveIntensity: 0.12,
        metalness: 0.1, roughness: 0.85,
        transparent: true, opacity: 0.20, depthWrite: false
      });
      var shell = new THREE.Mesh(new THREE.IcosahedronGeometry(SPHERE_R, 4), shellMat);
      shell.renderOrder = 1;
      group.add(shell);

      /* Wireframe */
      var wireMat = new THREE.LineBasicMaterial({
        color: secHex, transparent: true, opacity: 0.22, depthWrite: false
      });
      var wf = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(SPHERE_R * 1.04, 2)), wireMat
      );
      wf.renderOrder = 2;
      group.add(wf);

      /* Glow */
      group.add(makeGlowSprite(THREE, primHex, SPHERE_R));

      /* Orbit rings – world-specific axis angles */
      var tilt1 = world.id === 'kanaka' ? Math.PI / 4.2 : Math.PI / 2.05;
      var tilt2 = world.id === 'kanaka' ? Math.PI / 6.5  : 0.15;
      var ring1 = makeOrbitRing(THREE, SPHERE_R * 1.38, secHex,  tilt1);
      var ring2 = makeOrbitRing(THREE, SPHERE_R * 1.60, primHex, tilt2);
      group.add(ring1);
      group.add(ring2);
      group.userData.ring1 = ring1;
      group.userData.ring2 = ring2;

      /* Particle halo */
      /* Particle halo \u2013 world-specific colour for cultural tint */
      var haloColor = world.id === 'kanaka' ? 0x1f9fb3 : 0xf0c96a;
      var halo = makeParticleHalo(THREE, SPHERE_R, haloColor, world.id === 'kanaka' ? 320 : 260);
      group.add(halo);
      group.userData.halo = halo;

      /* Third thin accent ring – cultural-identity emphasis */
      var ring3 = makeOrbitRing(THREE, SPHERE_R * 1.82,
        world.id === 'kanaka' ? 0x3cb371 : 0xd98545,
        world.id === 'kanaka' ? Math.PI / 8 : Math.PI / 1.1);
      ring3.material.opacity = 0.16;
      group.add(ring3);
      group.userData.ring3 = ring3;

      /* Label */
      var label = makeLabelSprite(THREE, world.name, world.region, world.primary || '#f0c96a');
      label.position.set(0, SPHERE_R + 11, 0);
      group.add(label);
      group.userData.label = label;

      /* Cultural satellites – marker nodes around each world */
      getWorldMarkers(world).forEach(function (marker, markerIdx) {
        var node = new THREE.Group();
        var angle = (markerIdx / 4) * Math.PI * 2 + (world.id === 'kanaka' ? 0.3 : 0.8);
        var orbitRadius = SPHERE_R * (marker.type === 'chamber' ? 2.5 : 2.15);
        var yLift = marker.type === 'orientation' ? 7 : marker.type === 'ethic' ? -5 : 2;
        node.userData.marker = marker;
        node.userData.baseAngle = angle;
        node.userData.orbitRadius = orbitRadius;
        node.userData.yLift = yLift;

        var markerColor = marker.type === 'place' ? secHex : primHex;
        var sphere = new THREE.Mesh(
          new THREE.SphereGeometry(marker.type === 'chamber' ? 1.8 : 1.45, 18, 18),
          new THREE.MeshBasicMaterial({ color: markerColor, transparent: true, opacity: 0.92 })
        );
        sphere.userData.marker = marker;
        node.add(sphere);

        var tag = makeMarkerLabelSprite(THREE, marker.short, world.primary || '#f0c96a');
        tag.position.set(0, 3.4, 0);
        tag.userData.marker = marker;
        node.add(tag);

        var tetherGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(Math.cos(angle) * orbitRadius, yLift, Math.sin(angle) * orbitRadius * 0.34)
        ]);
        var tether = new THREE.Line(
          tetherGeo,
          new THREE.LineBasicMaterial({ color: markerColor, transparent: true, opacity: 0.18, depthWrite: false })
        );
        tether.userData.marker = marker;
        tether.renderOrder = 2;
        group.add(tether);
        node.userData.tether = tether;

        node.position.set(Math.cos(angle) * orbitRadius, yLift, Math.sin(angle) * orbitRadius * 0.34);
        group.add(node);
        group.userData.markers.push(node);
      });

      scene.add(group);
      sphereGroups.push(group);
    });

    function markerFromObj(obj) {
      var current = obj;
      while (current) {
        if (current.userData && current.userData.marker) return current.userData.marker;
        current = current.parent;
      }
      return null;
    }

    function selectWorld(grp, markerId, shouldBroadcast) {
      if (!grp) return;
      sphereGroups.forEach(function (g) { g.userData.selected = false; });
      grp.userData.selected = true;
      activeMarkerId = markerId || (grp.userData.markers[0] && grp.userData.markers[0].userData.marker.id) || null;
      var selectedMarker = null;
      grp.userData.markers.forEach(function (node) {
        var isActive = !!activeMarkerId && node.userData.marker.id === activeMarkerId;
        if (isActive) selectedMarker = node.userData.marker;
      });
      renderSceneDock(grp.userData.world, selectedMarker);
      if (shouldBroadcast !== false) {
        window.dispatchEvent(new CustomEvent('cv:world-selected', {
          detail: { worldId: grp.userData.world.id, source: 'scene' }
        }));
      }
    }

    /* Connection curves */
    for (var ci = 0; ci < sphereGroups.length - 1; ci++) {
      var a = sphereGroups[ci].position.clone();
      var b = sphereGroups[ci + 1].position.clone();
      var mid = new THREE.Vector3((a.x + b.x) / 2, 24, 0);
      var curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      var curvePts = curve.getPoints(64);
      var cGeo = new THREE.BufferGeometry().setFromPoints(curvePts);
      var cMat = new THREE.LineBasicMaterial({
        color: 0xf0c96a, transparent: true, opacity: 0.16, depthWrite: false
      });
      scene.add(new THREE.Line(cGeo, cMat));
    }

    /* Ambient flow particles */
    var flowGeo, flowVel, flowCount = 180;
    (function () {
      var pos = new Float32Array(flowCount * 3);
      flowVel = new Float32Array(flowCount * 3);
      for (var i = 0; i < flowCount; i++) {
        pos[i*3]   = (Math.random() - 0.5) * 160;
        pos[i*3+1] = (Math.random() - 0.5) * 80;
        pos[i*3+2] = (Math.random() - 0.5) * 40;
        flowVel[i*3]   = (Math.random() - 0.5) * 0.055;
        flowVel[i*3+1] = (Math.random() - 0.5) * 0.035;
        flowVel[i*3+2] = 0;
      }
      flowGeo = new THREE.BufferGeometry();
      flowGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      scene.add(new THREE.Points(flowGeo, new THREE.PointsMaterial({
        size: 0.9, color: 0xd98545,
        transparent: true, opacity: 0.35,
        depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
      })));
    }());

    /* Interaction */
    var raycaster = new THREE.Raycaster();
    var mouse     = new THREE.Vector2();
    var hoverIdx  = -1;

    function groupFromObj(obj) {
      var o = obj;
      while (o && !o.userData.world) { o = o.parent; }
      return (o && o.userData.world) ? o : null;
    }

    renderer.domElement.addEventListener('mousemove', function (e) {
      var rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width)  *  2 - 1;
      mouse.y = ((e.clientY - rect.top)  / rect.height) * -2 + 1;
      raycaster.setFromCamera(mouse, camera);
      var hits = raycaster.intersectObjects(sphereGroups, true);
      var ni = hits.length ? sphereGroups.indexOf(groupFromObj(hits[0].object)) : -1;
      if (ni !== hoverIdx) {
        hoverIdx = ni;
        renderer.domElement.style.cursor = hoverIdx >= 0 ? 'pointer' : '';
      }
    });

    renderer.domElement.addEventListener('click', function (e) {
      var rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width)  *  2 - 1;
      mouse.y = ((e.clientY - rect.top)  / rect.height) * -2 + 1;
      raycaster.setFromCamera(mouse, camera);
      var hits = raycaster.intersectObjects(sphereGroups, true);
      if (!hits.length) return;
      var grp = groupFromObj(hits[0].object);
      if (!grp) return;
      var marker = markerFromObj(hits[0].object);
      selectWorld(grp, marker && marker.id, true);
      openFocusOverlay(THREE, grp.userData.world, marker || getDefaultFocusMarker(grp.userData.world));
    });

    var dock = document.getElementById('world-scene-dock');
    if (dock) {
      dock.addEventListener('click', function (event) {
        var openButton = event.target.closest('[data-open-scene-focus]');
        if (openButton) {
          var worldId = openButton.getAttribute('data-world-id');
          var markerId = openButton.getAttribute('data-open-scene-focus');
          var targetGroup = null;
          var targetMarker = null;
          sphereGroups.forEach(function (g) {
            if (g.userData.world.id === worldId) {
              targetGroup = g;
              g.userData.markers.forEach(function (node) {
                if (node.userData.marker.id === markerId) targetMarker = node.userData.marker;
              });
            }
          });
          if (targetGroup) {
            selectWorld(targetGroup, markerId, false);
            openFocusOverlay(THREE, targetGroup.userData.world, targetMarker || getDefaultFocusMarker(targetGroup.userData.world));
          }
          return;
        }
        var button = event.target.closest('[data-scene-marker]');
        if (!button) return;
        var markerId = button.getAttribute('data-scene-marker');
        var selectedGroup = null;
        sphereGroups.forEach(function (g) {
          if (g.userData.selected) selectedGroup = g;
        });
        if (!selectedGroup && sphereGroups[0]) selectedGroup = sphereGroups[0];
        selectWorld(selectedGroup, markerId, false);
      });
    }

    document.querySelectorAll('[data-close-world-focus]').forEach(function (button) {
      button.addEventListener('click', function () {
        closeFocusOverlay();
      });
    });

    document.addEventListener('keydown', function (event) {
      var refs = ensureFocusRefs();
      if (event.key === 'Escape' && refs.overlay && !refs.overlay.hidden) {
        closeFocusOverlay();
      }
    });

    window.addEventListener('cv:world-selected', function (event) {
      if (!event.detail || event.detail.source === 'scene') return;
      var target = null;
      sphereGroups.forEach(function (g) {
        if (g.userData.world.id === event.detail.worldId) target = g;
      });
      if (target) selectWorld(target, null, false);
    });

    /* Camera parallax */
    var camTarget = { x: 0, y: 6 };
    document.addEventListener('mousemove', function (e) {
      camTarget.x = ((e.clientX / window.innerWidth)  - 0.5) *  8;
      camTarget.y = ((e.clientY / window.innerHeight) - 0.5) * -4 + 6;
    }, { passive: true });

    window.addEventListener('resize', function () {
      var nW = container.clientWidth  || 900;
      var nH = container.clientHeight || 500;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
      resizeFocusRuntime();
    });

    /* Animation */
    var clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      sphereGroups.forEach(function (grp, idx) {
        var sel    = grp.userData.selected;
        var hov    = idx === hoverIdx;
        var pulse  = 0.5 + 0.5 * Math.sin(t * 1.2 + grp.userData.pulseOff);
        var tScale = sel ? 1.22 : hov ? 1.10 : 1.0;
        grp.scale.lerp(new THREE.Vector3(tScale, tScale, tScale), 0.07);

        grp.rotation.y += sel ? 0.007 : 0.0025;
        grp.rotation.x  = Math.sin(t * 0.18 + grp.userData.pulseOff) * 0.04;
        grp.position.y  = Math.sin(t * 0.45 + idx * 1.6) * 2.2;

        if (grp.userData.halo) {
          grp.userData.halo.material.opacity = (sel ? 0.72 : 0.38) + pulse * 0.15;
        }

        grp.userData.markers.forEach(function (node, markerIdx) {
          var isActive = sel && activeMarkerId === node.userData.marker.id;
          var angle = t * (worlds[idx].id === 'kanaka' ? 0.24 : -0.18) + node.userData.baseAngle;
          var yWave = node.userData.yLift + Math.sin(t * 0.9 + markerIdx) * 0.7;
          node.position.set(
            Math.cos(angle) * node.userData.orbitRadius,
            yWave,
            Math.sin(angle) * node.userData.orbitRadius * 0.34
          );
          node.scale.lerp(new THREE.Vector3(isActive ? 1.18 : 1, isActive ? 1.18 : 1, 1), 0.08);
          if (node.children[0] && node.children[0].material) {
            node.children[0].material.opacity = isActive ? 1 : sel ? 0.92 : 0.74;
          }
          if (node.userData.tether) {
            node.userData.tether.geometry.setFromPoints([
              new THREE.Vector3(0, 0, 0),
              node.position.clone()
            ]);
            node.userData.tether.material.opacity = isActive ? 0.46 : sel ? 0.22 : 0.12;
          }
        });

        if (grp.userData.ring1) grp.userData.ring1.rotation.z += 0.0012;
        if (grp.userData.ring2) grp.userData.ring2.rotation.z -= 0.0008;
        if (grp.userData.ring3) grp.userData.ring3.rotation.z += 0.0005;
      });

      /* Flow particles */
      if (flowGeo) {
        var pa = flowGeo.attributes.position.array;
        for (var i = 0; i < flowCount; i++) {
          pa[i*3]   += flowVel[i*3]   + Math.sin(t * 0.3 + i * 0.07) * 0.008;
          pa[i*3+1] += flowVel[i*3+1] + Math.cos(t * 0.25 + i * 0.05) * 0.006;
          if (pa[i*3]   >  80) pa[i*3]   = -80;
          if (pa[i*3]   < -80) pa[i*3]   =  80;
          if (pa[i*3+1] >  40) pa[i*3+1] = -40;
          if (pa[i*3+1] < -40) pa[i*3+1] =  40;
        }
        flowGeo.attributes.position.needsUpdate = true;
      }

      camera.position.x += (camTarget.x - camera.position.x) * 0.025;
      camera.position.y += (camTarget.y - camera.position.y) * 0.025;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }

    animate();
    selectWorld(sphereGroups[0], null, false);
    console.log('✦ Worlds scene: ' + worlds.length + ' immersive spheres initialized');
  }

  /* ── Boot ──────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    if (window.THREE) {
      initWorldsScene(window.THREE);
      return;
    }
    window.addEventListener('cv:three-ready', function () {
      if (window.THREE) initWorldsScene(window.THREE);
    }, { once: true });
  });

})();

