// Immersive world-layer modal interactions for home portal cards.
(function () {
var lastTrigger = null;

var WORLDS = {
kanaka: {
title: "Kanaka Maoli Immersive Layer",
region: "Hawaii - Pacific Ocean",
summary:
"Enter a living relationship between land, language, and ocean movement where memory travels through chant, cultivation, and genealogy.",
story:
"Trace the movement from mountain rain to loi kalo and into shoreline navigation knowledge, where each place-name carries responsibility.",
paths: [
"Mauka-to-makai place orientation",
"Language and pronunciation in context",
"Voyaging routes and ecological signals"
],
quote:
"Knowledge is not extracted from place. It is practiced in relationship with place.",
themeClass: "world-layer--kanaka",
link: "culturalverse/kanaka-world.html"
},
kemet: {
title: "Kemet Immersive Layer",
region: "Nile Valley - Northeast Africa",
summary:
"Step into story architectures shaped by river cycles, temple alignments, and symbolic memory systems held across generations.",
story:
"Follow Nile-linked cosmology through writing, stone, and ritual pathways where orientation to sky and river forms a living map of meaning.",
paths: [
"River-to-sky symbolic orientation",
"Temple geometry and civic memory",
"Language, image, and ceremonial continuity"
],
quote:
"Story survives where symbol, place, and practice remain in dialogue.",
themeClass: "world-layer--kemet",
link: "culturalverse/kemet-world.html"
}
};

function byId(id) {
return document.getElementById(id);
}

function setModalState(modal, open) {
if (!modal) {
return;
}

if (open) {
modal.hidden = false;
modal.inert = false;
return;
}

if (modal.contains(document.activeElement)) {
document.activeElement.blur();
}
modal.inert = true;
modal.hidden = true;
if (lastTrigger) {
lastTrigger.focus();
}
}

function openWorldLayer(modal, worldId, trigger) {
var world = WORLDS[worldId];
if (!modal || !world) {
return;
}

lastTrigger = trigger || null;

modal.classList.remove("world-layer--kanaka", "world-layer--kemet");
modal.classList.add(world.themeClass);

byId("world-layer-title").textContent = world.title;
byId("world-layer-region").textContent = world.region;
byId("world-layer-summary").textContent = world.summary;
byId("world-layer-story").textContent = world.story;
byId("world-layer-quote").textContent = world.quote;
byId("world-layer-link").setAttribute("href", world.link);

var pathList = byId("world-layer-paths");
pathList.innerHTML = "";
world.paths.forEach(function (path) {
var item = document.createElement("li");
item.textContent = path;
pathList.appendChild(item);
});

setModalState(modal, true);
var closeButton = modal.querySelector("[data-close-world-layer]");
if (closeButton) {
closeButton.focus();
}
}

document.addEventListener("DOMContentLoaded", function () {
var modal = byId("world-layer-modal");
if (!modal) {
return;
}

document.querySelectorAll("[data-open-world-layer]").forEach(function (button) {
button.addEventListener("click", function () {
openWorldLayer(modal, button.getAttribute("data-world-id"), button);
});
});

document.querySelectorAll("[data-world-card]").forEach(function (card) {
card.addEventListener("click", function (event) {
if (event.target.closest("a, button")) {
return;
}
openWorldLayer(modal, card.getAttribute("data-world-id"), card);
});

card.addEventListener("keydown", function (event) {
if (event.key === "Enter" || event.key === " ") {
event.preventDefault();
openWorldLayer(modal, card.getAttribute("data-world-id"), card);
}
});
});

modal.querySelectorAll("[data-close-world-layer]").forEach(function (button) {
button.addEventListener("click", function () {
setModalState(modal, false);
});
});

modal.addEventListener("click", function (event) {
if (event.target === modal) {
setModalState(modal, false);
}
});

document.addEventListener("keydown", function (event) {
if (event.key === "Escape" && !modal.hidden) {
setModalState(modal, false);
}
});
});
})();
