// SAFE NAVIGATION DATA (NO MODULES)
const navigationItems = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" }
];

// main.js
(function boot() {
  try {
    const header = document.getElementById("app-header");
    const main = document.getElementById("app-main");
    const footer = document.getElementById("app-footer");

    if (!header || !main || !footer) {
      throw new Error("UI shell anchors missing");
    }

    // Minimal safe content (proof of life)
    header.textContent = "ME — Core Online";
    main.textContent = "System stable. Ready.";
    footer.textContent = "© ME";

  } catch (err) {
    document.body.innerHTML =
      "<h1>System survived a failure</h1>";
    console.error(err);
  }
})();

import { navigationItems } from "./ui/navigation.js";

function renderNavigation(items) {
  const header = document.getElementById("app-header");
  if (!header) return;

  const nav = document.createElement("nav");

  items.forEach(item => {
    const btn = document.createElement("button");
    btn.textContent = item.label;
    btn.dataset.page = item.id;
    nav.appendChild(btn);
  });

  header.appendChild(nav);
}
