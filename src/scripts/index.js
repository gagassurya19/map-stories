// Import CSS
import '../styles/styles.css';
import 'leaflet/dist/leaflet.css';

// Import Modul Utama
import App from './pages/app';
import { registerServiceWorker } from './utils';
import Auth from './utils/auth';

/**
 * Inisialisasi aplikasi saat DOM sudah siap
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Inisialisasi autentikasi dan navigasi
  Auth.updateNavigation();
  
  // Inisialisasi aplikasi utama
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  
  // Menambahkan event listener untuk tombol logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.logout();
      Auth.updateNavigation();
    });
  }

  // Render halaman awal
  await app.renderPage();

  // Tambahkan animasi fadeIn pada load pertama
  const mainContent = document.querySelector('#main-content');
  if (mainContent) {
    mainContent.style.opacity = 0;
    mainContent.style.transition = 'opacity 0.4s ease-out';
    setTimeout(() => {
      mainContent.style.opacity = 1;
    }, 10);
  }

  await registerServiceWorker();

  // Menangani perubahan hash URL untuk navigasi
  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
