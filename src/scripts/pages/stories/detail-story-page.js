import Api from '../../data/api';
import Auth from '../../utils/auth';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Kelas DetailStoryPage
 * Menangani tampilan dan interaksi halaman detail cerita
 */
export default class DetailStoryPage {
  /**
   * Merender konten halaman detail cerita
   * @returns {string} HTML string untuk halaman detail cerita
   */
  async render() {
    // Memeriksa autentikasi
    if (!Auth.checkAuth()) {
      return '';
    }
    return `
      <!-- Container Utama -->
      <section class="max-w-4xl mx-auto px-4 py-8">
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="p-6">
            <!-- Konten Detail Cerita -->
            <div id="storyDetail">
              <!-- Detail cerita akan dimuat di sini -->
            </div>
            <!-- Tombol Kembali -->
            <div class="mt-8 text-center">
              <a href="#/stories" class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md">
                <i class="bi bi-arrow-left mr-2" aria-hidden="true"></i>
                Kembali ke Daftar Cerita
              </a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Menangani interaksi setelah halaman dirender
   * Memuat detail cerita berdasarkan ID
   */
  async afterRender() {
    const storyId = window.location.hash.split('/')[2];
    await this.loadStoryDetail(storyId);
  }

  /**
   * Memuat detail cerita dari API
   * @param {string} storyId - ID cerita yang akan dimuat
   */
  async loadStoryDetail(storyId) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      alert('Silakan login terlebih dahulu');
      window.location.hash = '#/login';
      return;
    }

    try {
      const responseData = await Api.getStoryDetail(storyId, user.token);

      if (responseData.error === false) {
        this.displayStoryDetail(responseData.story);
        if (responseData.story.lat && responseData.story.lon) {
          this.initMap(responseData.story);
        }
      } else {
        alert(responseData.message || 'Gagal memuat detail cerita');
      }
    } catch (error) {
      console.error('Error loading story detail:', error);
      alert('Terjadi kesalahan saat memuat detail cerita');
    }
  }

  /**
   * Menampilkan detail cerita di halaman
   * @param {Object} story - Data cerita yang akan ditampilkan
   */
  displayStoryDetail(story) {
    const storyDetail = document.getElementById('storyDetail');
    storyDetail.innerHTML = `
      <div class="space-y-6">
        <!-- Gambar dan Header Cerita -->
        <div class="relative">
          <img 
            src="${story.photoUrl}" 
            class="w-full h-[400px] object-cover rounded-lg shadow-md" 
            alt="Cerita dari ${story.name}"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg"></div>
          <div class="absolute bottom-0 left-0 right-0 p-6">
            <h2 class="text-3xl font-bold text-white mb-2">${story.name}</h2>
            <p class="text-gray-200 flex items-center">
              <i class="bi bi-calendar3 mr-2" aria-hidden="true"></i>
              Diposting pada ${new Date(story.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <!-- Konten Cerita -->
        <div class="bg-gray-50 rounded-lg p-6 shadow-sm">
          <p class="text-lg text-gray-700 leading-relaxed">${story.description}</p>
        </div>

        ${story.lat && story.lon ? `
          <!-- Bagian Lokasi -->
          <div class="mb-4">
            <h5 class="mb-3 flex items-center">
              <i class="bi bi-geo-alt-fill text-blue-600 mr-2" aria-hidden="true"></i>
              Lokasi
            </h5>
            <div id="storyMap" style="height: 300px; border-radius: 8px; overflow: hidden;" class="shadow-sm" role="application" aria-label="Peta lokasi cerita"></div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Inisialisasi peta untuk menampilkan lokasi cerita
   * @param {Object} story - Data cerita yang berisi informasi lokasi
   */
  initMap(story) {
    const mapContainer = document.getElementById('storyMap');
    if (!mapContainer) return;

    const lat = parseFloat(story.lat);
    const lon = parseFloat(story.lon);

    if (isNaN(lat) || isNaN(lon)) return;

    // Inisialisasi peta
    const map = L.map('storyMap').setView([lat, lon], 15);

    // Menambahkan layer peta
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Membuat ikon marker kustom
    const storyIcon = L.divIcon({
      className: 'story-marker',
      html: `
        <div style="background-color: #2b6cb0; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    // Menambahkan marker dan popup
    L.marker([lat, lon], { icon: storyIcon })
      .addTo(map)
      .bindPopup(`
        <div class="text-center">
          <img src="${story.photoUrl}" class="img-fluid rounded mb-2" style="max-height: 100px; width: auto;" alt="${story.name}">
          <h6>${story.name}</h6>
          <p class="small text-muted mb-2">${story.description.substring(0, 60)}${story.description.length > 60 ? '...' : ''}</p>
        </div>
      `)
      .openPopup();
  }
} 