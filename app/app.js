/*
	RMA Compliance AR - scene builder (V3.2: raycaster reach fixed for the large tracking image)

	Builds the AR scene from app/content.js, so course buttons are edited in one place
	instead of hand-placing each plane and text in HTML.
	Every file is requested with ?v=<version> (set by index.html from version.json),
	so phones fetch fresh copies whenever the version number changes.
*/
(function () {
	var v = '?v=' + encodeURIComponent(window.RMA_AR_VERSION);
	var content = window.RMA_AR_CONTENT;

	// Layout, kept identical to the original hand-tuned scene:
	// - buttons are scaled by 0.08 and stacked 0.15 apart vertically,
	// - text starts 0.73 from the centre; the blue plane's inner edge sits at 0.70,
	//   so a plane of width w is centred at 0.70 + w * 0.04 (left side mirrored).
	var SCALE = '0.08 0.08 0.08';
	var ROW_GAP = 0.15;
	var TEXT_X = 0.73;
	var PLANE_EDGE_X = 0.70;
	var HALF_SCALE = 0.04; // half the 0.08 scale: plane width -> distance from its edge to its centre
	var BUTTON_COLOUR = '#12b4dd';

	function el(tag, attrs) {
		var node = document.createElement(tag);
		Object.keys(attrs || {}).forEach(function (name) { node.setAttribute(name, attrs[name]); });
		return node;
	}

	function round(n) { return Math.round(n * 1000) / 1000; }

	function openCourse(url) {
		// Open the link on 'click' only. A-Frame fires 'click' while the finger lifts off (touchend),
		// which browsers treat as a genuine user tap and allow to navigate. Opening on touch-down
		// ('mousedown' / touchstart) is NOT treated as a user tap, and phones silently block it.
		return function () { window.location.href = url; };
	}

	function addButtons(target, buttons, side) {
		// side: 1 = right of the medal (left-aligned text), -1 = left of the medal (right-aligned text)
		var align = side === 1 ? 'left' : 'right';
		buttons.forEach(function (button, i) {
			var y = round(content.topY - i * ROW_GAP);
			var planeX = round(side * (PLANE_EDGE_X + button.width * HALF_SCALE));
			var plane = el('a-plane', {
				'class': 'clickable',
				scale: SCALE,
				position: planeX + ' ' + y + ' 0',
				width: button.width,
				height: 1.5,
				material: 'color: ' + BUTTON_COLOUR + '; shader: flat; opacity: 0.95'
			});
			// The label is NOT clickable and sits just in front of the plane, so every tap on a button
			// hits one object (the plane) rather than flickering between the plane and its text.
			var text = el('a-text', {
				value: button.label,
				scale: SCALE,
				position: round(side * TEXT_X) + ' ' + y + ' 0.01',
				align: align,
				anchor: align,
				color: '#FFFFFF',
				width: 10
			});
			plane.addEventListener('click', openCourse(button.url));
			target.appendChild(plane);
			target.appendChild(text);
		});
	}

	var scene = el('a-scene', {
		'mindar-image': 'imageTargetSrc: assets/ar-target.mind' + v + '; filterMinCF: 0.001; filterBeta: 0.005; warmupTolerance: 5; missTolerance: 8;',
		'color-space': 'sRGB',
		'loading-screen': 'enabled: false',
		renderer: 'alpha: true; colorManagement: true; physicallyCorrectLights: true',
		'vr-mode-ui': 'enabled: false',
		'xr-mode-ui': 'enabled: false',
		'device-orientation-permission-ui': 'enabled: false'
	});

	var assets = el('a-assets');
	assets.appendChild(el('a-asset-item', { id: 'rma-city', src: 'assets/rma-city.glb' + v }));
	assets.appendChild(el('img', { id: 'hover-badge', src: 'assets/hover-badge.png' + v }));
	scene.appendChild(assets);

	scene.appendChild(el('a-camera', {
		position: '0 0 0',
		'look-controls': 'enabled: false',
		cursor: 'fuse: false; rayOrigin: mouse',
		// far must reach the poster. Distances are measured in pixels of the tracking image, and the
		// current image is 14044 px wide, so the buttons sit roughly 20,000-100,000 units away.
		// The old limit of 10000 only worked with the earlier 1000 px tracking image.
		raycaster: 'far: 1000000; objects: .clickable'
	}));

	var target = el('a-entity', { 'mindar-image-target': 'targetIndex: 0' });
	target.appendChild(el('a-image', {
		src: '#hover-badge',
		position: '0 0 0.2',
		width: 0.8,
		height: 0.8,
		material: 'transparent: true; alphaTest: 0.5; shader: flat'
	}));
	target.appendChild(el('a-gltf-model', {
		src: '#rma-city',
		position: '0 0 0',
		rotation: '0 0 0',
		scale: '0.2 0.2 0.2',
		animation: 'property: rotation; to: 0 0 360; dur: 50000; easing: linear; loop: true'
	}));
	addButtons(target, content.right, 1);
	addButtons(target, content.left, -1);
	scene.appendChild(target);

	scene.appendChild(el('a-entity', { light: 'type: ambient; color: #FFF; intensity: 1.2' }));
	scene.appendChild(el('a-entity', { light: 'type: directional; color: #FFF; intensity: 5.0', position: '1 2 1' }));
	scene.appendChild(el('a-entity', { light: 'type: directional; color: #FFF; intensity: 3.5', position: '-1 2 0' }));

	// Hide the loading screen once the scene starts rendering; MindAR then shows its own
	// "starting camera" and "scanning" overlays.
	scene.addEventListener('renderstart', function () {
		document.getElementById('rma-status').className = 'hidden';
	});
	scene.addEventListener('arError', function () {
		window.rmaShowError('We could not start the camera. Please allow camera access, or open this link in Chrome or Safari, then scan the QR code again.');
	});

	document.body.appendChild(scene);
})();
