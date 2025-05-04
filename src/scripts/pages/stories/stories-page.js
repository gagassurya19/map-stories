import Api from '../../data/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Auth from '../../utils/auth';

/**
 * Kelas StoriesPage
 * Menangani tampilan dan interaksi halaman daftar cerita
 */
export default class StoriesPage {
  /**
   * Merender konten halaman cerita
   * @returns {string} HTML string untuk halaman cerita
   */
  async render() {
    // Memeriksa autentikasi
    if (!Auth.checkAuth()) {
      return '';
    }

    return `
      <!-- Container Utama -->
      <section style="display: grid; grid-template-columns: 300px 1fr; height: 100vh;" aria-label="Stories and Map View">
        <!-- Sidebar Daftar Cerita -->
        <div style="border-right: 1px solid #dee2e6; overflow: hidden; position: relative;" role="complementary" aria-label="Stories List">
          <div class="p-2 overflow-y-auto h-full">
            <!-- Header dan Tombol Tambah -->
            <div class="flex items-center justify-between mb-2">
              <h1 class="text-lg font-medium">Stories</h1>
              <div class="flex items-center gap-2">
                <a href="#/add-guest-story" class="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700" aria-label="Add new story as guest">
                  <i class="bi bi-plus-lg" aria-hidden="true"></i>
                  <span>New as Guest</span>
                </a>
                <a href="#/add-story" class="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700" aria-label="Add new story">
                  <i class="bi bi-plus-lg" aria-hidden="true"></i>
                  <span>New</span>
                </a>
              </div>
            </div>
            <!-- Daftar Cerita -->
            <div id="storiesList" class="space-y-2 pb-12" role="list">
              <!-- Indikator Loading -->
              <div class="text-center py-3" role="status" aria-live="polite">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                  <span class="visually-hidden">Loading stories...</span>
                </div>
                <p class="mt-1 text-sm text-gray-500">Loading...</p>
              </div>
            </div>
          </div>
          <!-- Tombol Load More -->
          <div class="fixed bottom-4 left-4 right-4 max-w-[272px]">
            <button
              id="loadMoreBtn"
              class="w-full py-2 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] transition-all"
              aria-label="Load more stories"
            >
              <i class="bi bi-arrow-down-circle-fill mr-1" aria-hidden="true"></i> Load More
            </button>
          </div>
        </div>
        
        <!-- Bagian Peta -->
        <div style="position: relative;" role="complementary" aria-label="Map View">
          <!-- Tombol Kontrol Peta -->
          <div class="absolute top-4 right-24 z-[1000] flex gap-2">
            <button
              id="currentLocationBtn"
              class="inline-flex items-center gap-1 px-3 py-2 bg-white text-gray-700 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] transition-all hover:bg-gray-50"
              aria-label="Go to my current location"
            >
              <i class="bi bi-geo-alt" aria-hidden="true"></i>
              <span class="text-sm">My Location</span>
            </button>
            <button
              id="resetMapBtn"
              class="inline-flex items-center gap-1 px-3 py-2 bg-white text-gray-700 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] transition-all hover:bg-gray-50"
              aria-label="Reset map view"
            >
              <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
              <span class="text-sm">Reset View</span>
            </button>
          </div>
          <!-- Container Peta -->
          <div id="storiesMap" style="height: 100%; width: 100%;" role="application" aria-label="Interactive map showing story locations"></div>
        </div>
      </section>
    `;
  }

  /**
   * Menangani interaksi setelah halaman dirender
   * Mengatur inisialisasi peta dan loading cerita
   */
  async afterRender() {
    // Inisialisasi variabel
    this.page = 1;
    this.size = 10;
    this.stories = [];
    this.markers = [];
    this.map = null;
    
    // Inisialisasi peta
    this.initMap();
    
    // Load cerita dan setup tombol load more
    await this.loadStories();
    this.setupLoadMore();
  }

  /**
   * Inisialisasi peta Leaflet
   * Mengatur layer peta dan kontrol
   */
  initMap() {
    // Inisialisasi peta dengan view Indonesia
    this.map = L.map('storiesMap').setView([-2.5489, 118.0149], 4);

    // Definisi layer peta
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri'
    });

    const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenTopoMap'
    });

    // Konfigurasi layer dasar
    const baseMaps = {
      "Street": osmLayer,
      "Satellite": satelliteLayer,
      "Terrain": terrainLayer
    };

    // Menambahkan layer default
    osmLayer.addTo(this.map);

    // Menambahkan kontrol layer
    L.control.layers(baseMaps).addTo(this.map);

    // Menambahkan kontrol skala
    L.control.scale().addTo(this.map);

    // Menambahkan event listener untuk tombol kontrol
    const currentLocationBtn = document.getElementById('currentLocationBtn');
    const resetMapBtn = document.getElementById('resetMapBtn');

    if (currentLocationBtn) {
      currentLocationBtn.addEventListener('click', () => this.zoomToCurrentLocation());
    }

    if (resetMapBtn) {
      resetMapBtn.addEventListener('click', () => this.resetMapView());
    }
  }

  /**
   * Mereset tampilan peta ke view Indonesia
   * Menyesuaikan zoom untuk menampilkan semua marker
   */
  resetMapView() {
    // Filter cerita yang berada di Indonesia
    const storiesInIndonesia = this.stories.filter(story => {
      const lat = parseFloat(story.lat);
      const lon = parseFloat(story.lon);
      return !isNaN(lat) && !isNaN(lon) && 
             lat >= -11 && lat <= 6 && 
             lon >= 95 && lon <= 141;
    });
    
    if (storiesInIndonesia.length > 0) {
      try {
        // Membuat bounds untuk semua marker
        const bounds = L.latLngBounds();
        
        // Menambahkan semua lokasi ke bounds
        storiesInIndonesia.forEach(story => {
          const lat = parseFloat(story.lat);
          const lon = parseFloat(story.lon);
          bounds.extend([lat, lon]);
        });
        
        // Menyesuaikan tampilan peta
        if (storiesInIndonesia.length > 1) {
          this.map.fitBounds(bounds, { 
            padding: [30, 30],
            maxZoom: 18,
            minZoom: 4
          });
        } else if (storiesInIndonesia.length === 1) {
          // Jika hanya ada satu marker, fokus ke marker tersebut
          const story = storiesInIndonesia[0];
          this.map.setView([parseFloat(story.lat), parseFloat(story.lon)], 12);
        }
      } catch (error) {
        console.error('Error resetting map view:', error);
        // Fallback ke view Indonesia jika terjadi error
        this.map.setView([-2.5489, 118.0149], 4);
      }
    } else {
      // Jika tidak ada cerita di Indonesia, tampilkan view Indonesia
      this.map.setView([-2.5489, 118.0149], 4);
    }
  }

  /**
   * Memuat cerita dari API
   * Menampilkan cerita dan memperbarui peta
   */
  async loadStories() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      window.location.hash = '#/login';
      return;
    }

    try {
      const responseData = await Api.getStories(this.page, this.size, user.token);

      if (responseData.error === false) {
        this.stories = [...this.stories, ...responseData.listStory];
        this.displayStories();
        this.updateMap();
        // Reset tampilan peta setelah memuat cerita
        this.resetMapView();
      } else {
        alert(responseData.message || 'Failed to load stories');
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      alert('An error occurred while loading stories');
    }
  }

  /**
   * Menampilkan daftar cerita di sidebar
   */
  displayStories() {
    const storiesList = document.getElementById('storiesList');
    
    if (this.stories.length === 0) {
      storiesList.innerHTML = `
        <div class="text-center py-4" role="status" aria-live="polite">
          <i class="bi bi-inbox text-2xl text-gray-300" aria-hidden="true"></i>
          <p class="mt-1 text-sm text-gray-500">No stories found</p>
        </div>
      `;
      return;
    }
    
    storiesList.innerHTML = this.stories.map(story => `
      <div class="story-card bg-white rounded shadow-sm hover:shadow transition-shadow" role="article">
        <div class="relative">
          <img src="${story.photoUrl}" class="w-full h-32 object-cover rounded-t" alt="Story image by ${story.name}">
          ${story.lat && story.lon ? `
            <div class="absolute bottom-1 right-1">
              <span class="inline-flex items-center px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                <i class="bi bi-geo-alt-fill mr-0.5" aria-hidden="true"></i> ${story.lat}, ${story.lon}
              </span>
            </div>
          ` : ''}
        </div>
        <div class="p-2">
          <div class="flex items-center justify-between">
            <h3 class="font-medium text-sm text-gray-800">${story.name}</h3>
            <span class="text-xs text-gray-500">
              <i class="bi bi-calendar3" aria-hidden="true"></i> ${new Date(story.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p class="text-xs text-gray-600 mt-1 line-clamp-2">${story.description}</p>
          <div class="flex items-center justify-between gap-2 mt-1">
            <a href="#/stories/${story.id}" class="inline-block text-xs text-blue-600 hover:text-blue-800" aria-label="View story details">
              See details <i class="bi bi-arrow-right" aria-hidden="true"></i>
            </a>
            ${story.lat && story.lon ? `
              <button 
                class="navigate-btn inline-flex items-center text-xs text-green-600 hover:text-green-800"
                data-lat="${story.lat}"
                data-lon="${story.lon}"
                aria-label="View this story on map"
              >
                <i class="bi bi-geo-alt" aria-hidden="true"></i> View on map
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');

    // Menambahkan event listener untuk tombol navigasi
    document.querySelectorAll('.navigate-btn').forEach(button => {
      button.addEventListener('click', () => {
        const lat = parseFloat(button.dataset.lat);
        const lon = parseFloat(button.dataset.lon);
        this.map.setView([lat, lon], 15);
      });
    });
  }

  /**
   * Memperbarui marker di peta
   */
  updateMap() {
    // Hapus marker lama
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    // Tambahkan marker baru
    this.stories.forEach(story => {
      if (story.lat && story.lon) {
        const lat = parseFloat(story.lat);
        const lon = parseFloat(story.lon);
        
        if (!isNaN(lat) && !isNaN(lon)) {
          const marker = L.marker([lat, lon])
            .bindPopup(`
              <div class="marker-popup">
                <img src="${story.photoUrl}" class="w-full h-32 object-cover mb-2 rounded" alt="Story image">
                <h3 class="font-medium">${story.name}</h3>
                <p class="text-sm text-gray-600">${story.description}</p>
                <a href="#/stories/${story.id}" class="text-xs text-blue-600 hover:text-blue-800">See details</a>
              </div>
            `);
          
          marker.addTo(this.map);
          this.markers.push(marker);
        }
      }
    });
  }

  /**
   * Mengatur tombol load more
   */
  setupLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', async () => {
        this.page += 1;
        await this.loadStories();
      });
    }
  }

  /**
   * Zoom ke lokasi pengguna saat ini
   */
  async zoomToCurrentLocation() {
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        this.map.setView([latitude, longitude], 15);
      } catch (error) {
        console.error('Error getting location:', error);
        alert('Unable to get your current location');
      }
    } else {
      alert('Geolocation is not supported by your browser');
    }
  }
}
