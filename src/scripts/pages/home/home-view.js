import '../../../styles/pages/home.css';
import { initMap } from '../../utils/map.js';

/**
 * Class HomeView
 * Handles rendering and UI interactions for the home page
 */
export default class HomeView {
  #map;
  #presenter;

  constructor() {
    this.#map = null;
    this.#presenter = null;
  }

  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  /**
   * Merender konten halaman utama
   * @returns {string} HTML string untuk halaman utama
   */
  async render() {
    return `
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <h1>MapNotes</h1>
          <p>Capture your memories and locations in one place</p>
          <button class="cta-button" id="ctaButton">Start Taking Notes</button>
        </div>
      </section>

      <!-- Fitur Utama -->
      <section class="features">
        <div class="feature-card">
          <h2>🗺️ Location-Based Notes</h2>
          <p>Pin your notes to specific locations on the map. Never forget where you left your thoughts.</p>
        </div>
        <div class="feature-card">
          <h2>📝 Quick & Easy</h2>
          <p>Create notes instantly with our simple interface. Add photos, text, and locations in seconds.</p>
        </div>
        <div class="feature-card">
          <h2>🔍 Smart Search</h2>
          <p>Find your notes by location, content, or date. Your memories are always just a click away.</p>
        </div>
      </section>

      <!-- Preview Peta -->
      <section class="map-preview">
        <div class="preview-content">
          <h2>Your Notes on the Map</h2>
          <p>Visualize your memories across locations</p>
          <div id="map-container" class="map-container"></div>
        </div>
      </section>
    `;
  }

  /**
   * Menangani interaksi setelah halaman dirender
   * Mengatur event listener dan inisialisasi peta
   */
  async afterRender() {
    // Setup event listeners first
    this.setupEventListeners();
    
    // Then initialize map
    await this.initMap();
    
    // Finally, initialize presenter if exists
    if (this.#presenter) {
      await this.#presenter.init();
    }
  }

  // View methods for handling UI elements
  async initMap() {
    try {
      const mapContainer = document.getElementById('map-container');
      if (!mapContainer) {
        console.error('Map container not found');
        return null;
      }
      
      // Ensure the container is visible and has dimensions
      mapContainer.style.display = 'block';
      mapContainer.style.height = '400px';
      
      // Initialize map
      this.#map = await initMap('map-container');
      return this.#map;
    } catch (error) {
      console.error('Error initializing map:', error);
      return null;
    }
  }

  setupEventListeners() {
    const ctaButton = document.getElementById('ctaButton');
    if (ctaButton) {
      ctaButton.addEventListener('click', () => {
        window.location.href = '#/stories';
      });
    } else {
      console.error('CTA button not found');
    }
  }
}
