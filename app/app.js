/*
	RMA Compliance AR - scene builder (V3.1: more reliable button taps)

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

	var lastOpen = 0;
	function openCourse(url) {
		// Same-tab navigation is the most reliable option on mobile browsers.
		// Fired on 'mousedown' (finger touches the button) as well as 'click', because A-Frame only
		// emits 'click' if the finger lifts over the same object it went down on, and AR tracking
		// jitter often moves the button out from under the finger before it lifts.
		// The time check stops both events opening the link twice, and still lets the button work
		// again if the person comes back with the browser's Back button.
		return function () {
			var now = Date.now();
			if (now - lastOpen < 1500) return;
			lastOpen = now;
			if (window.rmaLog) window.rmaLog('OPENING LINK in 2s: ' + url);
			setTimeout(function () { window.location.href = url; }, 2000);
		};
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
			var open = openCourse(button.url);
			plane.addEventListener('mousedown', open);
			plane.addEventListener('click', open);
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

	/* ===== DEBUG PANEL (test build only) ===== */
	(function () {
		var panel = document.createElement('div');
		panel.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:10002;pointer-events:none;background:rgba(0,0,0,0.75);color:#7CFC00;font:11px/1.35 monospace;padding:6px;white-space:pre-wrap;max-height:45%;overflow:hidden';
		document.body.appendChild(panel);
		var lines = [];
		function log(s) {
			var d = new Date();
			lines.unshift(d.toTimeString().slice(0, 8) + ' ' + s);
			lines = lines.slice(0, 14);
			panel.textContent = 'DEBUG v' + window.RMA_AR_VERSION + '  screen ' + innerWidth + 'x' + innerHeight + '\n' + lines.join('\n');
		}
		window.rmaLog = log;
		log('debug panel ready');
		window.addEventListener('error', function (e) { log('JS ERROR: ' + e.message); });
	
		var scene = document.querySelector('a-scene');
		var camEl = document.querySelector('a-camera');
		var target = document.querySelector('[mindar-image-target]');
		target.addEventListener('targetFound', function () { log('poster FOUND'); });
		target.addEventListener('targetLost', function () { log('poster LOST'); });
	
		function label(el) {
			if (!el) return 'none';
			return el.tagName.toLowerCase() + (el.getAttribute('value') ? '"' + el.getAttribute('value') + '"' : (el.dataset && el.dataset.label ? '"' + el.dataset.label + '"' : ''));
		}
		document.querySelectorAll('a-plane.clickable').forEach(function (p, i) {
			var t = p.nextElementSibling;
			if (t && t.getAttribute('value')) p.dataset.label = t.getAttribute('value');
			p.addEventListener('mousedown', function () { log('A-Frame mousedown on ' + label(p)); });
			p.addEventListener('click', function () { log('A-Frame click on ' + label(p)); });
		});
	
		function report(kind, x, y) {
			var top = document.elementFromPoint(x, y);
			var info = kind + ' at ' + Math.round(x) + ',' + Math.round(y) + ' top element: ' + (top ? top.tagName + (top.id ? '#' + top.id : '') + (top.className && top.className.baseVal === undefined ? '.' + top.className : '') : 'none');
			setTimeout(function () {
				try {
					var rc = camEl.components.raycaster, cur = camEl.components.cursor;
					var cam = camEl.getObject3D('camera');
					var p = new AFRAME.THREE.Vector3();
					target.object3D.updateMatrixWorld(true);
					target.object3D.getWorldPosition(p);
					var b = cur && cur.canvasBounds;
					log(info + '\n   ray hits: ' + (rc.intersectedEls.map(label).join(' | ') || 'NOTHING') +
						'\n   poster visible=' + target.object3D.visible + ' dist=' + Math.round(p.length()) +
						' rayFar=' + rc.data.far + ' camFar=' + Math.round(cam.far) +
						'\n   canvas ' + (b ? Math.round(b.width) + 'x' + Math.round(b.height) + ' @' + Math.round(b.left) + ',' + Math.round(b.top) : '?'));
				} catch (err) { log(info + ' (report failed: ' + err.message + ')'); }
			}, 60);
		}
		document.addEventListener('touchstart', function (e) { var t = e.touches[0]; report('TOUCH', t.clientX, t.clientY); }, { capture: true, passive: true });
		document.addEventListener('mousedown', function (e) { if (e.isTrusted && !e.detail.intersection) report('MOUSE', e.clientX, e.clientY); }, true);
	})();
	
})();
