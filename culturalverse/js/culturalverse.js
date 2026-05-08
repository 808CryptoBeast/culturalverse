// Shared interactions for all pages.
(function () {
	function initReveals() {
		var nodes = document.querySelectorAll(".reveal");
		if (!nodes.length) {
			return;
		}

		if (window.gsap) {
			window.gsap.to(nodes, {
				y: 0,
				opacity: 1,
				duration: 0.9,
				stagger: 0.12,
				ease: "power3.out"
			});
			return;
		}

		nodes.forEach(function (node) {
			node.style.opacity = "1";
			node.style.transform = "none";
		});
	}

	function initReflectionForm() {
		var form = document.getElementById("reflection-form");
		if (!form) {
			return;
		}

		var field = document.getElementById("reflection-text");
		var status = document.getElementById("reflection-status");
		var stored = localStorage.getItem("cv.reflection");
		if (stored && field) {
			field.value = stored;
		}

		form.addEventListener("submit", function (event) {
			event.preventDefault();
			localStorage.setItem("cv.reflection", field ? field.value.trim() : "");
			if (status) {
				status.textContent = "Reflection saved locally.";
			}
		});
	}

	function initSoundscapePreference() {
		var select = document.getElementById("soundscape-mode");
		var status = document.getElementById("soundscape-status");
		if (!select) {
			return;
		}

		var stored = localStorage.getItem("cv.soundscape");
		if (stored) {
			select.value = stored;
		}

		function updateStatus(value) {
			if (status) {
				status.textContent = "Soundscape preference: " + value;
			}
		}

		updateStatus(select.value);
		select.addEventListener("change", function () {
			localStorage.setItem("cv.soundscape", select.value);
			updateStatus(select.value);
		});
	}

	function initYear() {
		var yearNode = document.getElementById("year");
		if (yearNode) {
			yearNode.textContent = String(new Date().getFullYear());
		}
	}

	document.addEventListener("DOMContentLoaded", function () {
		if (typeof window.renderEcosystemLinks === "function") {
			window.renderEcosystemLinks("ecosystem-links");
		}

		initReveals();
		initReflectionForm();
		initSoundscapePreference();
		initYear();
	});
})();
