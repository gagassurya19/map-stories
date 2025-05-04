import Api from '../../data/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Auth from '../../utils/auth';

export default class StoriesPage {
  async render() {
    // Check authentication
    if (!Auth.checkAuth()) {
      return '';
    }

    return `
      <section style="display: grid; grid-template-columns: 300px 1fr; height: 100vh;" aria-label="Stories and Map View">
        <!-- Stories sidebar -->
        <div style="border-right: 1px solid #dee2e6; overflow: hidden; position: relative;" role="complementary" aria-label="Stories List">
          <div class="p-2 overflow-y-auto h-full">
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
            <div id="storiesList" class="space-y-2 pb-12" role="list">
              <!-- Loading indicator -->
              <div class="text-center py-3" role="status" aria-live="polite">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                  <span class="visually-hidden">Loading stories...</span>
                </div>
                <p class="mt-1 text-sm text-gray-500">Loading...</p>
              </div>
            </div>
          </div>
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
        
        <!-- Map section -->
        <div style="position: relative;" role="complementary" aria-label="Map View">
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
          <div id="storiesMap" style="height: 100%; width: 100%;" role="application" aria-label="Interactive map showing story locations"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.page = 1;
    this.size = 10;
    this.stories = [];
    this.markers = [];
    this.map = null;
    
    // Initialize the map
    this.initMap();
    
    await this.loadStories();
    this.setupLoadMore();
  }

  initMap() {
    // Initialize the map
    this.map = L.map('storiesMap').setView([-2.5489, 118.0149], 4);

    // Define different tile layers
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri'
    });

    const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenTopoMap'
    });

    // Add layer control
    const baseMaps = {
      "Street": osmLayer,
      "Satellite": satelliteLayer,
      "Terrain": terrainLayer
    };

    // Add default layer
    osmLayer.addTo(this.map);

    // Add layer control to map
    L.control.layers(baseMaps).addTo(this.map);

    // Add scale control
    L.control.scale().addTo(this.map);

    // Add current location and reset view buttons
    const currentLocationBtn = document.getElementById('currentLocationBtn');
    const resetMapBtn = document.getElementById('resetMapBtn');

    if (currentLocationBtn) {
      currentLocationBtn.addEventListener('click', () => this.zoomToCurrentLocation());
    }

    if (resetMapBtn) {
      resetMapBtn.addEventListener('click', () => this.resetMapView());
    }
  }

  resetMapView() {
    // Filter stories that are in Indonesia (roughly between 6°N to 11°S and 95°E to 141°E)
    const storiesInIndonesia = this.stories.filter(story => {
      const lat = parseFloat(story.lat);
      const lon = parseFloat(story.lon);
      return !isNaN(lat) && !isNaN(lon) && 
             lat >= -11 && lat <= 6 && 
             lon >= 95 && lon <= 141;
    });
    
    if (storiesInIndonesia.length > 0) {
      try {
        // Create bounds to fit all markers
        const bounds = L.latLngBounds();
        
        // Add all story locations to bounds
        storiesInIndonesia.forEach(story => {
          const lat = parseFloat(story.lat);
          const lon = parseFloat(story.lon);
          bounds.extend([lat, lon]);
        });
        
        // Fit the map to show all markers
        if (storiesInIndonesia.length > 1) {
          this.map.fitBounds(bounds, { 
            padding: [30, 30],
            maxZoom: 18,
            minZoom: 4
          });
        } else if (storiesInIndonesia.length === 1) {
          // If there's only one marker, center on it with a good zoom level
          const story = storiesInIndonesia[0];
          this.map.setView([parseFloat(story.lat), parseFloat(story.lon)], 12);
        }
      } catch (error) {
        console.error('Error resetting map view:', error);
        // Fallback to Indonesia view if there's an error
        this.map.setView([-2.5489, 118.0149], 4);
      }
    } else {
      // If no stories have location in Indonesia, set Indonesia view
      this.map.setView([-2.5489, 118.0149], 4);
    }
  }

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
        // Reset map view after loading stories
        this.resetMapView();
      } else {
        alert(responseData.message || 'Failed to load stories');
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      alert('An error occurred while loading stories');
    }
  }

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
                <i class="bi bi-map mr-1" aria-hidden="true"></i> View on map
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');

    // Add event listeners for location navigation
    document.querySelectorAll('.navigate-btn').forEach(button => {
      button.addEventListener('click', () => {
        const lat = parseFloat(button.dataset.lat);
        const lon = parseFloat(button.dataset.lon);
        if (!isNaN(lat) && !isNaN(lon)) {
          // Find the corresponding story
          const story = this.stories.find(s => 
            parseFloat(s.lat) === lat && parseFloat(s.lon) === lon
          );
          
          if (story) {
            // Find the marker for this story
            const marker = this.markers.find(m => 
              m.getLatLng().lat === lat && m.getLatLng().lng === lon
            );
            
            if (marker) {
              // Center map on the location
              this.map.setView([lat, lon], 15);
              // Open the popup
              marker.openPopup();
            }
          }
        }
      });
    });
  }

  updateMap() {
    // Check if map is initialized
    if (!this.map) {
      console.warn('Map not initialized yet, cannot update markers');
      return;
    }

    // Clear existing markers
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];

    // Filter stories that are in Indonesia
    const storiesInIndonesia = this.stories.filter(story => {
      const lat = parseFloat(story.lat);
      const lon = parseFloat(story.lon);
      return !isNaN(lat) && !isNaN(lon) && 
             lat >= -11 && lat <= 6 && 
             lon >= 95 && lon <= 141;
    });
    
    if (storiesInIndonesia.length > 0) {
      try {
        // Create bounds to fit all markers
        const bounds = L.latLngBounds();
        
        // Add markers for each story
        storiesInIndonesia.forEach(story => {
          // Convert lat and lon to numbers if they're strings
          const lat = parseFloat(story.lat);
          const lon = parseFloat(story.lon);
          
          if (!isNaN(lat) && !isNaN(lon)) {
            // Create a custom marker icon
            const storyIcon = L.divIcon({
              className: 'story-marker',
              html: `
                <div style="background-color: #2b6cb0; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
              `,
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });
            
            const marker = L.marker([lat, lon], { icon: storyIcon })
              .addTo(this.map)
              .bindPopup(`
                <div class="text-center">
                  <img src="${story.photoUrl}" class="img-fluid rounded mb-2" style="max-height: 100px; width: auto;" alt="${story.name}">
                  <h6>${story.name}</h6>
                  <p class="small text-muted mb-2">${story.description.substring(0, 60)}${story.description.length > 60 ? '...' : ''}</p>
                  <a href="#/stories/${story.id}" class="btn btn-sm btn-primary d-block">View Details</a>
                </div>
              `);
            
            this.markers.push(marker);
            bounds.extend([lat, lon]);
          }
        });
        
        // Fit the map to show all markers
        if (this.markers.length > 1) {
          this.map.fitBounds(bounds, { padding: [30, 30] });
        } else if (this.markers.length === 1) {
          // If there's only one marker, center on it with a good zoom level
          const story = storiesInIndonesia[0];
          this.map.setView([parseFloat(story.lat), parseFloat(story.lon)], 12);
        }
      } catch (error) {
        console.error('Error updating map:', error);
      }
    } else {
      // If no stories have location in Indonesia, set Indonesia view
      this.map.setView([-2.5489, 118.0149], 4);
    }
  }

  setupLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.addEventListener('click', async () => {
      this.page++;
      await this.loadStories();
    });
  }

  async zoomToCurrentLocation() {
    try {
      // Show loading state
      const currentLocationBtn = document.getElementById('currentLocationBtn');
      if (currentLocationBtn) {
        currentLocationBtn.disabled = true;
        currentLocationBtn.innerHTML = `
          <div class="spinner-border spinner-border-sm text-gray-700" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <span class="text-sm">Getting location...</span>
        `;
      }

      // Get current position
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;

      // Check if location is in Indonesia
      if (latitude >= -11 && latitude <= 6 && longitude >= 95 && longitude <= 141) {
        // Add a marker for current location
        const currentLocationIcon = L.divIcon({
          className: 'current-location-marker',
          html: `
            <div style="background-color: #dc2626; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        // Remove existing current location marker if any
        if (this.currentLocationMarker) {
          this.map.removeLayer(this.currentLocationMarker);
        }

        // Add new marker
        this.currentLocationMarker = L.marker([latitude, longitude], { icon: currentLocationIcon })
          .addTo(this.map)
          .bindPopup('Your current location');

        // Zoom to current location
        this.map.setView([latitude, longitude], 15);
      } else {
        alert('Your location is outside of Indonesia. The map will stay focused on Indonesia.');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to get your location. Please make sure location services are enabled.');
    } finally {
      // Reset button state
      const currentLocationBtn = document.getElementById('currentLocationBtn');
      if (currentLocationBtn) {
        currentLocationBtn.disabled = false;
        currentLocationBtn.innerHTML = `
          <i class="bi bi-geo-alt"></i>
          <span class="text-sm">My Location</span>
        `;
      }
    }
  }
}
