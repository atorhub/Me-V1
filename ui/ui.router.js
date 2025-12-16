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
