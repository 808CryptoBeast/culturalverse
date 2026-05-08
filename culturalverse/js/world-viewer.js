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

		var linkItems = world.links.map(function (link) {
			return "<li><a href=\"" + link.href + "\" target=\"_blank\" rel=\"noreferrer noopener\">" + link.label + "</a></li>";
		}).join("");

		detail.innerHTML = ""
			+ "<h2>" + world.name + "</h2>"
			+ "<p><strong>World Identity:</strong> " + (world.identity || "Living cultural pathways and symbolic memory.") + "</p>"
			+ "<p><strong>Region:</strong> " + world.region + "</p>"
			+ "<p>" + world.summary + "</p>"
			+ "<p><strong>Favorite:</strong> " + (favorites.has(world.id) ? "Yes" : "No") + "</p>"
			+ "<p><strong>Visited:</strong> " + (visited.has(world.id) ? "Yes" : "No") + "</p>"
			+ "<h3>Experience Paths</h3><ul>" + pathItems + "</ul>"
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
			panel.innerHTML = "<h3>" + world.name + "</h3><p>" + world.region + "</p>";
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
			+ "  <button class=\"btn btn-solid\" type=\"button\" data-action=\"view\">Open Path</button>"
			+ "  <button class=\"btn btn-outline\" type=\"button\" data-action=\"favorite\">" + (favorites.has(world.id) ? "Unfavorite" : "Favorite") + "</button>"
			+ "</div>"
			+ "<p class=\"status\">" + (visited.has(world.id) ? "Visited" : "Not visited") + "</p>";

		card.querySelector('[data-action="view"]').addEventListener("click", function () {
			visited.add(world.id);
			writeSet("cv.visited", visited);
			onSelect(world);
		});

		card.querySelector('[data-action="favorite"]').addEventListener("click", function () {
			if (favorites.has(world.id)) {
				favorites.delete(world.id);
			} else {
				favorites.add(world.id);
			}
			writeSet("cv.favorites", favorites);
			onSelect(world);
			card.replaceWith(createWorldCard(world, favorites, visited, onSelect));
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
		var selectedId = window.CV_WORLDS.length ? window.CV_WORLDS[0].id : null;

		function onSelect(world) {
			selectedId = world.id;
			renderWorldDetail(world, favorites, visited);
			cardsContainer.innerHTML = "";
			window.CV_WORLDS.forEach(function (worldItem) {
				cardsContainer.appendChild(createWorldCard(worldItem, favorites, visited, selectedId, onSelect));
			});
		}

		renderMapPanels(window.CV_WORLDS);
		onSelect(window.CV_WORLDS[0]);
	});
})();
