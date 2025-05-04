// Import halaman-halaman aplikasi
import HomePage from '../pages/home/home-page';
import LoginPage from '../pages/auth/login/login-page';
import RegisterPage from '../pages/auth/register/register-page';
import StoriesPage from '../pages/stories/stories-page';
import DetailStoryPage from '../pages/stories/detail-story-page';
import AddStoriesPage from '../pages/stories/add-story-page';
import AddGuestStoryPage from '../pages/stories/add-guest-story-page';

/**
 * Konfigurasi rute aplikasi
 * Menentukan halaman yang akan ditampilkan berdasarkan URL
 */
const routes = {
  '/': new HomePage(),                    // Halaman Utama
  '/login': new LoginPage(),              // Halaman Login
  '/register': new RegisterPage(),        // Halaman Registrasi
  '/stories': new StoriesPage(),          // Halaman Daftar Cerita
  '/stories/:id': new DetailStoryPage(),  // Halaman Detail Cerita
  '/add-story': new AddStoriesPage(),     // Halaman Tambah Cerita (User)
  '/add-guest-story': new AddGuestStoryPage(), // Halaman Tambah Cerita (Tamu)
};

export default routes;
