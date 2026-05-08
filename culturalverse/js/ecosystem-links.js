// Shared link hub for all Culturalverse pages.
window.CV_ECOSYSTEM_LINKS = [
	{ label: "The Living Knowledge Platform", action: "Study This Lesson", href: "https://www.pikoverse.xyz/" },
	{ label: "Cosmic Weave", action: "Open in Cosmic Weave", href: "https://www.pikoverse.xyz/" },
	{ label: "IkeStar", action: "Explore the Stars", href: "https://www.pikoverse.xyz/" },
	{ label: "IkeHub", action: "Return to IkeHub", href: "https://www.pikoverse.xyz/" },
	{ label: "Pikoverse", action: "Open Pikoverse", href: "https://www.pikoverse.xyz/" },
	{ label: "Wayfinder Passport", action: "Save Reflection", href: "https://www.pikoverse.xyz/" }
];

window.renderEcosystemLinks = function renderEcosystemLinks(containerId) {
	var container = document.getElementById(containerId || "ecosystem-links");
	if (!container) {
		return;
	}

	container.innerHTML = "";
	window.CV_ECOSYSTEM_LINKS.forEach(function (item) {
		var anchor = document.createElement("a");
		anchor.className = "eco-link";
		anchor.href = item.href;
		anchor.target = "_blank";
		anchor.rel = "noreferrer noopener";
		anchor.innerHTML = "<strong>" + item.label + "</strong><span>" + item.action + "</span>";
		container.appendChild(anchor);
	});
};
