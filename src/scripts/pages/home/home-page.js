import '../../../styles/pages/home.css';
import { initMap } from '../../utils/map.js';

export default class HomePage {
  async render() {
    return `
      <section class="hero">
        <div class="hero-content">
          <h1>MapNotes</h1>
          <p>Capture your memories and locations in one place</p>
          <button class="cta-button">Start Taking Notes</button>
        </div>
      </section>

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

      <section class="map-preview">
        <div class="preview-content">
          <h2>Your Notes on the Map</h2>
          <p>Visualize your memories across locations</p>
          <div id="map-container" class="map-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
      ctaButton.addEventListener('click', () => {
        // Navigate to notes page or open note creation
        window.location.href = '#/stories';
      });
    }

    // Initialize the map
    const map = initMap('map-container');
  }
}
