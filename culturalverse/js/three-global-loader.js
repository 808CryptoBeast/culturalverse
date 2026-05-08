// Loads local Three.js module and exposes it as window.THREE for existing scripts.
(function () {
	if (window.THREE) {
		window.dispatchEvent(new Event("cv:three-ready"));
		return;
	}

	import("../vendor/three.module.js")
		.then(function (threeModule) {
			window.THREE = threeModule;
			window.dispatchEvent(new Event("cv:three-ready"));
		})
		.catch(function (error) {
			console.error("CVThreeLoader: Failed to load local Three.js module", error);
		});
})();
