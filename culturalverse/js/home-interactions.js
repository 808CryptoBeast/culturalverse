// Home page modern interactions: hero parallax and card tilt.
(function () {
	function initHeroParallax() {
		const hero = document.getElementById("hero-shell");
		if (!hero) {
			return;
		}

		const motif = hero.querySelector(".hero-motif");
		const grid = hero.querySelector(".hero-grid-overlay");
		const signalCards = hero.querySelectorAll(".signal-card");

		hero.addEventListener("pointermove", function (event) {
			const rect = hero.getBoundingClientRect();
			const px = (event.clientX - rect.left) / rect.width - 0.5;
			const py = (event.clientY - rect.top) / rect.height - 0.5;

			if (motif) {
				motif.style.transform = "translate3d(" + px * 20 + "px," + py * 16 + "px,0)";
			}

			if (grid) {
				grid.style.transform = "translate3d(" + px * 10 + "px," + py * 10 + "px,0)";
			}

			signalCards.forEach(function (card, index) {
				const depth = index + 1;
				card.style.transform = "translate3d(" + px * (6 + depth) + "px," + py * (5 + depth) + "px,0)";
			});
		});

		hero.addEventListener("pointerleave", function () {
			if (motif) {
				motif.style.transform = "translate3d(0,0,0)";
			}
			if (grid) {
				grid.style.transform = "translate3d(0,0,0)";
			}
			signalCards.forEach(function (card) {
				card.style.transform = "translate3d(0,0,0)";
			});
		});
	}

	function initPortalTilt() {
		const cards = document.querySelectorAll("[data-tilt-card]");
		cards.forEach(function (card) {
			card.addEventListener("pointermove", function (event) {
				const rect = card.getBoundingClientRect();
				const x = (event.clientX - rect.left) / rect.width - 0.5;
				const y = (event.clientY - rect.top) / rect.height - 0.5;
				const rotateX = -y * 8;
				const rotateY = x * 10;
				card.style.transform = "perspective(900px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateY(-4px)";
			});

			card.addEventListener("pointerleave", function () {
				card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
			});
		});
	}

	document.addEventListener("DOMContentLoaded", function () {
		initHeroParallax();
		initPortalTilt();
	});
})();
