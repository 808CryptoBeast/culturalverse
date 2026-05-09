// Worlds page rendering with lightweight local state.
(function () {
	function readSet(key) {
		try {
			var raw = localStorage.getItem(key);
			return new Set(raw ? JSON.parse(raw) : []);
		} catch (error) {
			return new Set();
		}
	}

	function writeSet(key, values) {
		localStorage.setItem(key, JSON.stringify(Array.from(values)));
	}

	function getThemeClass(world) {
		return world && world.theme ? world.theme : "theme-default";
	}

	function renderWorldDetail(world, favorites, visited) {
		var detail = document.getElementById("world-detail");
		if (!detail || !world) {
			return;
		}

		detail.className = "card world-detail " + getThemeClass(world);

		var pathItems = world.experiencePaths.map(function (path) {
			return "<li>" + path + "</li>";
		}).join("");

		var symbolItems = (world.symbols || []).map(function (symbol) {
			return "<span>" + symbol + "</span>";
		}).join("");

		var linkItems = world.links.map(function (link) {
			return "<li><a href=\"" + link.href + "\" target=\"_blank\" rel=\"noreferrer noopener\">" + link.label + "</a></li>";
		}).join("");

		var chamberItems = (world.immersionChambers || []).map(function (chamber) {
			return "<article class=\"detail-chamber\"><strong>" + chamber.title + "</strong><p>" + chamber.focus + "</p></article>";
		}).join("");

		var loopItems = (world.practiceLoop || []).map(function (step) {
			return "<li>" + step + "</li>";
		}).join("");

		var protocolItems = (world.protocols || []).map(function (item) {
			return "<li>" + item + "</li>";
		}).join("");

		var threadItems = (world.knowledgeThreads || []).map(function (item) {
			return "<li>" + item + "</li>";
		}).join("");

		detail.innerHTML = ""
			+ "<h2>" + world.name + "</h2>"
			+ "<p class=\"detail-callout\">" + (world.identity || "Living cultural pathways and symbolic memory.") + "</p>"
			+ "<p><strong>World Identity:</strong> " + (world.identity || "Living cultural pathways and symbolic memory.") + "</p>"
			+ "<p><strong>Region:</strong> " + world.region + "</p>"
			+ "<p><strong>Orientation:</strong> " + (world.orientation || "Cyclical place intelligence and relational learning pathways.") + "</p>"
			+ "<p>" + world.summary + "</p>"
			+ "<p><strong>Favorite:</strong> " + (favorites.has(world.id) ? "Yes" : "No") + "</p>"
			+ "<p><strong>Visited:</strong> " + (visited.has(world.id) ? "Yes" : "No") + "</p>"
			+ "<div class=\"detail-symbols\">" + symbolItems + "</div>"
			+ "<div class=\"actions-row\"><a class=\"btn btn-solid\" href=\"" + (world.entryHref || ("worlds.html?world=" + world.id)) + "\">" + (world.entryLabel || "Enter Immersive World") + "</a><a class=\"btn btn-outline\" href=\"protocols.html\">Open Protocol Context</a></div>"
			+ "<h3>Immersion Chambers</h3><div class=\"detail-chambers-grid\">" + chamberItems + "</div>"
			+ "<h3>Practice Loop</h3><ol>" + loopItems + "</ol>"
			+ "<h3>Experience Paths</h3><ul>" + pathItems + "</ul>"
			+ "<h3>Knowledge Threads</h3><ul>" + threadItems + "</ul>"
			+ "<h3>Protocol Anchors</h3><ul>" + protocolItems + "</ul>"
			+ "<h3>Cross-links</h3><ul>" + linkItems + "</ul>";
	}

	function renderMapPanels(worlds) {
		var mapContainer = document.getElementById("world-map-panels");
		if (!mapContainer) {
			return;
		}

		mapContainer.innerHTML = "";
		worlds.forEach(function (world) {
			var panel = document.createElement("article");
			panel.className = "map-panel " + getThemeClass(world);
			panel.innerHTML = "<h3>" + world.name + "</h3><p>" + world.region + "</p><p>" + (world.orientation || "") + "</p>";
			mapContainer.appendChild(panel);
		});
	}

	function createWorldCard(world, favorites, visited, selectedId, onSelect) {
		var card = document.createElement("article");
		card.className = "card world-card " + getThemeClass(world);
		if (selectedId === world.id) {
			card.className += " is-selected";
		}

		var tags = world.symbols.map(function (symbol) {
			return "<span>" + symbol + "</span>";
		}).join("");

		card.innerHTML = ""
			+ "<header><h3>" + world.name + "</h3><small>" + world.region + "</small></header>"
			+ "<p>" + world.summary + "</p>"
			+ "<div class=\"tags\">" + tags + "</div>"
			+ "<div class=\"card-actions\">"
			+ "  <button class=\"btn btn-solid\" type=\"button\" data-action=\"view\">Enter Immersive World</button>"
			+ "  <button class=\"btn btn-outline\" type=\"button\" data-action=\"favorite\">" + (favorites.has(world.id) ? "Unfavorite" : "Favorite") + "</button>"
			+ "</div>"
			+ "<p class=\"status\">" + (visited.has(world.id) ? "Visited" : "Not visited") + "</p>";

		card.querySelector('[data-action="view"]').addEventListener("click", function () {
			visited.add(world.id);
			writeSet("cv.visited", visited);
			window.location.href = world.entryHref || ("worlds.html?world=" + world.id);
		});

		card.querySelector('[data-action="favorite"]').addEventListener("click", function () {
			if (favorites.has(world.id)) {
				favorites.delete(world.id);
			} else {
				favorites.add(world.id);
			}
			writeSet("cv.favorites", favorites);
			onSelect(world);
			card.replaceWith(createWorldCard(world, favorites, visited, selectedId, onSelect));
		});

		return card;
	}

	document.addEventListener("DOMContentLoaded", function () {
		var cardsContainer = document.getElementById("world-cards");
		if (!cardsContainer || !Array.isArray(window.CV_WORLDS)) {
			return;
		}

		var favorites = readSet("cv.favorites");
		var visited = readSet("cv.visited");
		var params = new URLSearchParams(window.location.search);
		var requestedWorldId = params.get("world");
		var requestedWorld = window.CV_WORLDS.find(function (worldItem) {
			return worldItem.id === requestedWorldId;
		});
		var selectedId = requestedWorld ? requestedWorld.id : (window.CV_WORLDS.length ? window.CV_WORLDS[0].id : null);

		function onSelect(world, shouldBroadcast) {
			selectedId = world.id;
			renderWorldDetail(world, favorites, visited);
			cardsContainer.innerHTML = "";
			window.CV_WORLDS.forEach(function (worldItem) {
				cardsContainer.appendChild(createWorldCard(worldItem, favorites, visited, selectedId, onSelect));
			});

			if (shouldBroadcast !== false) {
				window.dispatchEvent(new CustomEvent("cv:world-selected", {
					detail: { worldId: world.id, source: "panel" }
				}));
			}
		}

		window.addEventListener("cv:world-selected", function (event) {
			if (!event.detail || event.detail.source === "panel") {
				return;
			}
			var chosen = window.CV_WORLDS.find(function (worldItem) {
				return worldItem.id === event.detail.worldId;
			});
			if (chosen) {
				if (chosen.id === selectedId) {
					return;
				}
				visited.add(chosen.id);
				writeSet("cv.visited", visited);
				onSelect(chosen, false);
			}
		});

		renderMapPanels(window.CV_WORLDS);
		onSelect(requestedWorld || window.CV_WORLDS[0]);
	});
})();
