// Reusable protocol modal behavior.
(function () {
	var lastTrigger = null;

	function getFocusableElements(root) {
		if (!root) {
			return [];
		}

		var selectors = [
			"a[href]",
			"button:not([disabled])",
			"textarea:not([disabled])",
			"input:not([disabled])",
			"select:not([disabled])",
			"[tabindex]:not([tabindex='-1'])"
		];

		return Array.prototype.slice.call(root.querySelectorAll(selectors.join(",")));
	}

	function setModalState(modal, open) {
		if (!modal) {
			return;
		}

		if (open) {
			modal.hidden = false;
			modal.inert = false;
			var focusables = getFocusableElements(modal);
			if (focusables.length) {
				focusables[0].focus();
			}
		} else {
			if (modal.contains(document.activeElement)) {
				document.activeElement.blur();
			}
			modal.inert = true;
			modal.hidden = true;
			if (lastTrigger) {
				lastTrigger.focus();
			}
		}
	}

	document.addEventListener("DOMContentLoaded", function () {
		var modal = document.getElementById("protocol-modal");
		var openButtons = document.querySelectorAll("[data-open-protocol]");
		var closeButtons = document.querySelectorAll("[data-close-protocol]");

		openButtons.forEach(function (button) {
			button.addEventListener("click", function () {
				lastTrigger = button;
				setModalState(modal, true);
			});
		});

		closeButtons.forEach(function (button) {
			button.addEventListener("click", function () {
				setModalState(modal, false);
			});
		});

		if (modal) {
			modal.addEventListener("click", function (event) {
				if (event.target === modal) {
					setModalState(modal, false);
				}
			});
		}

		document.addEventListener("keydown", function (event) {
			if (event.key === "Escape") {
				setModalState(modal, false);
			}
		});
	});
})();
