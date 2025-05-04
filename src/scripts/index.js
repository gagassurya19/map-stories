// CSS imports
import '../styles/styles.css';

import App from './pages/app';
import Auth from './utils/auth';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize authentication
  Auth.updateNavigation();
  
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  
  // Add logout event listener
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.logout();
      Auth.updateNavigation();
    });
  }

  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
