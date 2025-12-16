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
