import { renderPage } from './ui.router.js';

export function initUIShell() {
  const root = document.getElementById('root');
  if (!root) return;

  root.innerHTML = `
    <header class="app-header">
      <div class="logo">ME</div>
      <nav>
        <a href="#/">Home</a>
        <a href="#/upload">Upload</a>
        <a href="#/history">History</a>
        <a href="#/settings">Settings</a>
      </nav>
    </header>

    <main id="app"></main>

    <footer class="footer">
      Powered by an Immortal Core 👑
    </footer>
  `;

  window.addEventListener('hashchange', renderPage);
  renderPage();
}

initUIShell();
