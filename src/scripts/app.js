import Auth from './utils/auth';
import 'leaflet';

/**
 * Kelas utama aplikasi yang menangani inisialisasi dan navigasi
 */
const app = {
  /**
   * Inisialisasi aplikasi
   * Menangani setup awal dan event listener
   */
  async init() {
    // Inisialisasi autentikasi dan navigasi
    Auth.updateNavigation();

    // Menambahkan event listener untuk tombol logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
        Auth.updateNavigation();
      });
    }

    // ... rest of init code ...
  }
};

export default app; 