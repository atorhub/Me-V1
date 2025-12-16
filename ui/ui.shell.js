console.log("UI SHELL LOADED");

const root = document.getElementById("root");

if (root) {
  root.innerHTML = `
    <header style="padding:16px;background:#111;color:#fff">
      <h1>ME</h1>
    </header>

    <main style="padding:16px">
      <p>The UI magician is alive 🎭</p>
    </main>

    <footer style="padding:16px;background:#111;color:#aaa">
      Immortal Core Ready 👑
    </footer>
  `;
}
