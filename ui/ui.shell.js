console.log("UI SHELL LOADED");

const root = document.getElementById("root");

function renderLayout() {
  root.innerHTML = `
    <header class="app-header">
      <h1>ME</h1>
      <nav>
        <a href="#/">Home</a>
        <a href="#/upload">Upload</a>
        <a href="#/history">History</a>
        <a href="#/settings">Settings</a>
      </nav>
    </header>

    <main class="app-main" id="app-main"></main>

    <footer class="app-footer">
      Immortal Core Ready 👑
    </footer>
  `;
}

function renderPage() {
  const main = document.getElementById("app-main");
  const route = location.hash || "#/";

  if (route === "#/upload") {
    main.innerHTML = "<h2>Upload</h2><p>Coming soon…</p>";
  } else if (route === "#/history") {
    main.innerHTML = "<h2>History</h2><p>No data yet.</p>";
  } else if (route === "#/settings") {
    main.innerHTML = "<h2>Settings</h2><p>UI only.</p>";
  } else {
    main.innerHTML = "<h2>Home</h2><p>The UI magician is alive 🎭</p>";
  }
}

if (root) {
  renderLayout();
  window.addEventListener("hashchange", renderPage);
  renderPage();
}
