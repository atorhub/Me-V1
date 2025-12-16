console.log("UI SHELL LOADED");

const root = document.getElementById("root");

if (root) {
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

    <main class="app-main">
      <p>The UI magician is alive 🎭</p>
    </main>

    <footer class="app-footer">
      Immortal Core Ready 👑
    </footer>
  `;
}
import { renderPage } from "./ui.router.js";

const root = document.getElementById("root");

if (root) {
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

    <main class="app-main"></main>

    <footer class="app-footer">
      Immortal Core Ready 👑
    </footer>
  `;

  window.addEventListener("hashchange", renderPage);
  renderPage();
}
