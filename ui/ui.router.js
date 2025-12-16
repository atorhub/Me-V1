import { renderHome } from '../pages/home.js';
import { renderUpload } from '../pages/upload.js';
import { renderHistory } from '../pages/history.js';
import { renderSettings } from '../pages/settings.js';

export function renderPage() {
  const app = document.getElementById('app');
  if (!app) return;

  const route = location.hash.replace('#', '') || '/';

  const routes = {
    '/': renderHome,
    '/upload': renderUpload,
    '/history': renderHistory,
    '/settings': renderSettings
  };

  const render = routes[route] || renderHome;

  try {
    render(app);
  } catch {
    app.innerHTML = `
      <div class="card error">
        UI illusion failed… but the King stands 👑
      </div>
    `;
  }
}
export function renderPage() {
  const main = document.querySelector(".app-main");
  if (!main) return;

  const route = location.hash || "#/";

  if (route === "#/upload") {
    main.innerHTML = "<h2>Upload</h2>";
  } else if (route === "#/history") {
    main.innerHTML = "<h2>History</h2>";
  } else if (route === "#/settings") {
    main.innerHTML = "<h2>Settings</h2>";
  } else {
    main.innerHTML = "<h2>Home</h2>";
  }
}
