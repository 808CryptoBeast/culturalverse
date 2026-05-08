# Architecture

## Current Architecture

- Static multi-page frontend:
	- Root: landing page and web manifest
	- culturalverse/: immersive experience pages
	- docs/: protocol and planning docs
- Styling:
	- shared base identity in `culturalverse.css`
	- page specialization in `worlds.css`
	- viewport adaptation in `responsive.css`
- JavaScript modules:
	- `worlds-data.js`: source of world content
	- `world-viewer.js`: world card rendering and state
	- `protocol-guide.js`: protocol modal behavior
	- `ecosystem-links.js`: shared ecosystem action links
	- `culturalverse.js`: global interactions and persistence

## Initial Stack

- HTML
- CSS
- JavaScript
- Three.js
- GSAP animations
- localStorage

## Planned Expansion

- Supabase profile sync and saved reflections
- Favorites, visited worlds, and world path persistence
- PWA capabilities and offline cultural packs
- Optional WebXR world spaces
- Wayfinder Passport integration
- XRPL-ready learning records through LKP
