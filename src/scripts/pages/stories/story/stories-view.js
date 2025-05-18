import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import StoriesModel from './stories-model.js';
import StoriesPresenter from './stories-presenter.js';
import Api from '../../../data/api';

/**
 * View class for the stories page
 * Handles rendering and UI interactions for the stories page
 */
export default class StoriesView {
  #presenter;
  #model;
  #map;
  #markers;

  constructor() {
    // Initialize model and presenter
    this.#model = new StoriesModel();
    this.#presenter = new StoriesPresenter({
      model: this.#model,
      view: this,
    });
    this.#map = null;
    this.#markers = [];
  }

  /**
   * Sets the presenter for this view
   * @param {Object} presenter - The presenter instance
   */
  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  /**
   * Merender konten halaman cerita
   * @returns {string} HTML string untuk halaman cerita
   */
  async render() {
    // Memeriksa autentikasi
    if (!this.#model.isAuthenticated()) {
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
            <div id="storiesList" class="space-y-2 pb-12" role="list" tabindex="-1">
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
   */
  async afterRender() {
    // Setup skip-to-content handler
    this.setupSkipToContent();
    
    // Initialize presenter
    if (this.#presenter) {
      await this.#presenter.init();
    }
    
    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Mengatur handler untuk skip-to-content
   */
  setupSkipToContent() {
    const skipLink = document.querySelector('.skip-to-content');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const storyCards = document.getElementsByClassName('story-card');
        if (storyCards && storyCards.length > 0) {
          const firstCard = storyCards[0];
          firstCard.setAttribute('tabindex', '-1');
          firstCard.focus();
          firstCard.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  /**
   * Inisialisasi peta Leaflet
   * Mengatur layer peta dan kontrol
   */
  initMap() {
    // Set default icon path
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/images/leaflet/marker-icon-2x.png',
      iconUrl: '/images/leaflet/marker-icon.png',
      shadowUrl: '/images/leaflet/marker-shadow.png',
    });

    // Inisialisasi peta dengan view Indonesia
    this.#map = L.map('storiesMap').setView([-2.5489, 118.0149], 4);

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
    osmLayer.addTo(this.#map);

    // Menambahkan kontrol layer
    L.control.layers(baseMaps).addTo(this.#map);

    // Menambahkan kontrol skala
    L.control.scale().addTo(this.#map);
  }

  /**
   * Mereset tampilan peta ke view Indonesia
   * Menyesuaikan zoom untuk menampilkan semua marker
   */
  resetMapView() {
    // Get stories in Indonesia from presenter
    const storiesInIndonesia = this.#presenter.getStoriesInIndonesia();
    
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
          this.#map.fitBounds(bounds, { 
            padding: [30, 30],
            maxZoom: 18,
            minZoom: 4
          });
        } else if (storiesInIndonesia.length === 1) {
          // Jika hanya ada satu marker, fokus ke marker tersebut
          const story = storiesInIndonesia[0];
          this.#map.setView([parseFloat(story.lat), parseFloat(story.lon)], 12);
        }
      } catch (error) {
        console.error('Error resetting map view:', error);
        // Fallback ke view Indonesia jika terjadi error
        this.#map.setView([-2.5489, 118.0149], 4);
      }
    } else {
      // Jika tidak ada cerita di Indonesia, tampilkan view Indonesia
      this.#map.setView([-2.5489, 118.0149], 4);
    }
  }

  /**
   * Merender kartu cerita
   * @param {Object} story - Data cerita
   * @returns {string} HTML string untuk kartu cerita
   */
  async renderStoryCard(story) {
    const imageUrl = await Api.getImageUrl(story.photoUrl);
    return `
      <div class="story-card" data-id="${story.id}">
        <img src="${imageUrl}" alt="${story.name}" class="story-image" loading="lazy">
        <div class="story-content">
          <h3>${story.name}</h3>
          <p>${story.description}</p>
          <div class="story-meta">
            <span class="story-date">${new Date(story.createdAt).toLocaleDateString()}</span>
            <button class="view-detail-btn" data-id="${story.id}">View Details</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Merender daftar cerita
   * @param {Array} stories - Array data cerita
   * @returns {string} HTML string untuk daftar cerita
   */
  async renderStories(stories) {
    if (!stories || stories.length === 0) {
      return '<p class="no-stories">No stories found</p>';
    }

    const storyCards = await Promise.all(
      stories.map(story => this.renderStoryCard(story))
    );

    return `
      <div class="stories-container">
        ${storyCards.join('')}
      </div>
    `;
  }

  /**
   * Menampilkan daftar cerita di sidebar
   */
  async displayStories() {
    const storiesList = document.getElementById('storiesList');
    const stories = this.#presenter.getStories();
    
    if (stories.length === 0) {
      storiesList.innerHTML = `
        <div class="text-center py-4" role="status" aria-live="polite">
          <i class="bi bi-inbox text-2xl text-gray-300" aria-hidden="true"></i>
          <p class="mt-1 text-sm text-gray-500">No stories found</p>
        </div>
      `;
      return;
    }

    // Show loading state
    storiesList.innerHTML = `
      <div class="text-center py-3" role="status" aria-live="polite">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Loading stories...</span>
        </div>
        <p class="mt-1 text-sm text-gray-500">Loading stories...</p>
      </div>
    `;
    
    try {
      // Process each story to get cached images
      const storyCards = await Promise.all(stories.map(async (story) => {
        const imageUrl = await Api.getImageUrl(story.photoUrl);
        return `
          <div 
            class="story-card bg-white rounded shadow-sm hover:shadow transition-shadow" 
            role="article"
            tabindex="0"
            aria-label="Story by ${story.name}"
          >
            <div class="relative">
              <img src="${imageUrl}" class="w-full h-32 object-cover rounded-t" alt="Story image by ${story.name}" loading="lazy">
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
        `;
      }));

      // Update the stories list with the processed cards
      storiesList.innerHTML = storyCards.join('');

      // Menambahkan event listener untuk tombol navigasi
      document.querySelectorAll('.navigate-btn').forEach(button => {
        button.addEventListener('click', () => {
          const lat = parseFloat(button.dataset.lat);
          const lon = parseFloat(button.dataset.lon);
          this.navigateToLocation(lat, lon);
        });
      });

      // Add keyboard navigation for story cards
      document.querySelectorAll('.story-card').forEach(card => {
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const detailsLink = card.querySelector('a[href^="#/stories/"]');
            if (detailsLink) {
              detailsLink.click();
            }
          }
        });
      });
    } catch (error) {
      console.error('Error displaying stories:', error);
      storiesList.innerHTML = `
        <div class="text-center py-4" role="status" aria-live="polite">
          <i class="bi bi-exclamation-circle text-2xl text-red-500" aria-hidden="true"></i>
          <p class="mt-1 text-sm text-gray-500">Error loading stories</p>
        </div>
      `;
    }
  }

  /**
   * Navigate to specific location on the map
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   */
  navigateToLocation(lat, lon) {
    if (this.#map) {
      this.#map.setView([lat, lon], 15);
    }
  }

  /**
   * Memperbarui marker di peta
   */
  async updateMap() {
    // Hapus marker lama
    if (this.#markers.length > 0) {
      this.#markers.forEach(marker => marker.remove());
      this.#markers = [];
    }

    // Get stories from presenter
    const stories = this.#presenter.getStories();

    // Process each story to get cached images
    for (const story of stories) {
      if (story.lat && story.lon) {
        const lat = parseFloat(story.lat);
        const lon = parseFloat(story.lon);
        
        if (!isNaN(lat) && !isNaN(lon)) {
          try {
            const imageUrl = await Api.getImageUrl(story.photoUrl);
            const marker = L.marker([lat, lon])
              .bindPopup(`
                <div class="marker-popup">
                  <img src="${imageUrl}" class="w-full h-32 object-cover mb-2 rounded" alt="Story image" loading="lazy">
                  <h3 class="font-medium">${story.name}</h3>
                  <p class="text-sm text-gray-600">${story.description}</p>
                  <a href="#/stories/${story.id}" class="text-xs text-blue-600 hover:text-blue-800">See details</a>
                </div>
              `);
            
            marker.addTo(this.#map);
            this.#markers.push(marker);
          } catch (error) {
            console.error('Error creating marker for story:', error);
          }
        }
      }
    }
  }

  /**
   * Zoom to user's current location
   */
  async zoomToCurrentLocation() {
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        this.#map.setView([latitude, longitude], 15);
      } catch (error) {
        console.error('Error getting location:', error);
        this.showError('Unable to get your current location');
      }
    } else {
      this.showError('Geolocation is not supported by your browser');
    }
  }

  /**
   * Shows an error message to the user
   * @param {string} message - Error message to display
   */
  showError(message) {
    alert(message);
  }

  /**
   * Mengatur event listeners
   */
  setupEventListeners() {
    // Setup load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', async () => {
        if (this.#presenter) {
          await this.#presenter.loadMoreStories();
        }
      });
    }

    // Setup map control buttons
    const currentLocationBtn = document.getElementById('currentLocationBtn');
    const resetMapBtn = document.getElementById('resetMapBtn');

    if (currentLocationBtn) {
      currentLocationBtn.addEventListener('click', () => {
        if (this.#presenter) {
          this.#presenter.zoomToCurrentLocation();
        }
      });
    }

    if (resetMapBtn) {
      resetMapBtn.addEventListener('click', () => {
        if (this.#presenter) {
          this.#presenter.resetMapView();
        }
      });
    }
  }
} 