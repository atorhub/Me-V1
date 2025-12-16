console.log("UI SHELL LOADED");

const root = document.getElementById("root");

if (root) {
  root.innerHTML = `
    <header class="app-header">
      <h1>ME</h1>
    </header>

    <main class="app-main">
      <p>The UI magician is alive 🎭</p>
    </main>

    <footer class="app-footer">
      Immortal Core Ready 👑
    </footer>
  `;
}
