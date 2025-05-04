import Api from '../../data/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default class StoriesPage {
  async render() {
    return `
      <section class="container">
        <div class="row">
          <div class="col-12">
            <h1 class="text-center my-4">Stories</h1>
            <p class="text-center text-muted mb-4">Discover stories from around the world and explore their locations on the map</p>
          </div>
        </div>
        <div class="row">
          <!-- Stories list on the left -->
          <div class="col-md-8">
            <div class="d-flex justify-content-end mb-6">
              <a href="#/add-story" class="btn btn-success d-flex align-items-center gap-2 shadow-sm px-3 py-2" style="border-radius: 8px; background-color: #28a745; color: white;">
                <i class="bi bi-plus-circle-fill"></i>
                <span class="fw-semibold">Add New Story</span>
              </a>
            </div>
            <div class="card shadow-sm mb-4">
              <div class="card-header bg-white">
                <h5 class="mb-0">
                  <i class="bi bi-book"></i> Story Collection
                </h5>
              </div>
              <div class="card-body">
                <div class="row" id="storiesList">
                  <!-- Loading indicator -->
                  <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading stories...</p>
                  </div>
                </div>
              </div>
              <div class="w-full text-center">
                <button
                  id="loadMoreBtn"
                  class="btn btn-light border border-primary text-primary fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm mx-auto"
                  style="width: 100%; border-radius: 12px; padding: 12px; transition: all 0.3s ease; background-color: #007bff; color: white;"
                >
                  <i class="bi bi-arrow-down-circle-fill"></i> Load More Stories
                </button>
              </div>
            </div>
          </div>
          
          <!-- Map on the right -->
          <div class="col-md-4">
            <div class="card shadow-sm">
              <div class="card-header bg-white">
                <h5 class="mb-0">
                  <i class="bi bi-geo-alt"></i> Story Map
                </h5>
              </div>
              <div class="card-body p-0">
                <div id="storiesMap" style="height: 500px; width: 100%;"></div>
              </div>
              <div class="card-footer bg-white p-3">
                <div class="mb-2">
                  <span class="badge bg-info text-white">
                    <i class="bi bi-info-circle"></i> Click anywhere on the map to place a marker
                  </span>
                </div>
                <div class="row g-2">
                  <div class="col-6">
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light">Lat</span>
                      <input type="text" id="selectedLat" class="form-control bg-light" placeholder="--" readonly>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light">Long</span>
                      <input type="text" id="selectedLon" class="form-control bg-light" placeholder="--" readonly>
                    </div>
                  </div>
                </div>
                <div class="d-flex gap-2 mt-3">
                  <button id="copyCoordinates" class="btn btn-sm btn-primary flex-grow-1">
                    <i class="bi bi-clipboard"></i> Copy Coordinates
                  </button>
                  <button id="clearSelection" class="btn btn-sm btn-outline-secondary">
                    <i class="bi bi-x-circle"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Map Legend -->
            <div class="card shadow-sm mt-3">
              <div class="card-body p-3">
                <h6 class="fw-bold mb-2">Map Legend</h6>
                <div class="d-flex align-items-center mb-2">
                  <div style="width: 12px; height: 12px; background-color: #2b6cb0; border-radius: 50%; margin-right: 8px;"></div>
                  <span>Story Location</span>
                </div>
                <div class="d-flex align-items-center">
                  <div style="width: 12px; height: 12px; background-color: #ff3b30; border-radius: 50%; border: 2px solid white; margin-right: 8px;"></div>
                  <span>Selected Location</span>
                </div>
              </div>
            </div>
          </div>
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
    this.selectedMarker = null;
    
    // Initialize the map
    this.initMap();
    
    await this.loadStories();
    this.setupLoadMore();
  }

  initMap() {
    // Make sure the map container exists
    const mapContainer = document.getElementById('storiesMap');
    if (!mapContainer) {
      console.error('Map container not found');
      return;
    }

    // Initialize the map with a default center
    this.map = L.map('storiesMap').setView([0, 0], 2);

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    
    // Fix map container issue that can occur with dynamically created maps
    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);
    
    // Add click event to map for adding new pinpoints
    this.selectedMarker = null;
    this.map.on('click', this.handleMapClick.bind(this));
    
    // Setup buttons for coordinate actions
    this.setupCoordinateButtons();
  }
  
  handleMapClick(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    
    // Update input fields
    document.getElementById('selectedLat').value = lat.toFixed(6);
    document.getElementById('selectedLon').value = lng.toFixed(6);
    
    // Remove previous selected marker if exists
    if (this.selectedMarker) {
      this.map.removeLayer(this.selectedMarker);
    }
    
    // Add new marker at clicked position with a pulse animation effect
    const pulseIcon = L.divIcon({
      className: 'selected-marker-container',
      html: `
        <div class="marker-pulse-ring"></div>
        <div class="marker-dot"></div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    
    // Add styles for the pulse effect directly
    const style = document.createElement('style');
    style.textContent = `
      .marker-pulse-ring {
        background-color: rgba(255, 59, 48, 0.3);
        border-radius: 50%;
        height: 30px;
        width: 30px;
        position: absolute;
        animation: pulse 1.5s infinite;
      }
      
      .marker-dot {
        background-color: rgb(255, 59, 48);
        border: 2px solid white;
        border-radius: 50%;
        height: 14px;
        width: 14px;
        position: absolute;
        top: 8px;
        left: 8px;
      }
      
      @keyframes pulse {
        0% {
          transform: scale(0.5);
          opacity: 1;
        }
        100% {
          transform: scale(1.5);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    this.selectedMarker = L.marker([lat, lng], {
      icon: pulseIcon
    }).addTo(this.map);
    
    // Add popup with coordinates
    this.selectedMarker.bindPopup(`
      <div class="text-center">
        <strong>Selected Location</strong><br>
        <span class="badge bg-light text-dark mt-1">Lat: ${lat.toFixed(6)}</span><br>
        <span class="badge bg-light text-dark mt-1">Lng: ${lng.toFixed(6)}</span>
      </div>
    `).openPopup();
    
    // Highlight the coordinate input fields to show they've been updated
    const highlightInput = (elementId) => {
      const element = document.getElementById(elementId);
      element.classList.add('border-primary');
      setTimeout(() => {
        element.classList.remove('border-primary');
      }, 1000);
    };
    
    highlightInput('selectedLat');
    highlightInput('selectedLon');
  }
  
  setupCoordinateButtons() {
    // Setup the copy coordinates button
    document.getElementById('copyCoordinates').addEventListener('click', () => {
      const lat = document.getElementById('selectedLat').value;
      const lon = document.getElementById('selectedLon').value;
      
      if (lat && lon) {
        const coordText = `${lat}, ${lon}`;
        navigator.clipboard.writeText(coordText)
          .then(() => {
            alert('Coordinates copied to clipboard!');
          })
          .catch(err => {
            console.error('Failed to copy coordinates: ', err);
            // Fallback for browsers that don't support clipboard API
            const tempInput = document.createElement('input');
            tempInput.value = coordText;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            alert('Coordinates copied to clipboard!');
          });
      } else {
        alert('No coordinates selected yet. Click on the map first.');
      }
    });
    
    // Setup the clear selection button
    document.getElementById('clearSelection').addEventListener('click', () => {
      if (this.selectedMarker) {
        this.map.removeLayer(this.selectedMarker);
        this.selectedMarker = null;
      }
      document.getElementById('selectedLat').value = '';
      document.getElementById('selectedLon').value = '';
    });
  }

  async loadStories() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      alert('Please login first');
      window.location.hash = '#/login';
      return;
    }

    try {
      const responseData = await Api.getStories(this.page, this.size, user.token);

      if (responseData.error === false) {
        this.stories = [...this.stories, ...responseData.listStory];
        this.displayStories();
        this.updateMap();
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
        <div class="col-12 text-center py-5">
          <i class="bi bi-inbox display-4 text-muted"></i>
          <p class="mt-3">No stories found. Stories you create will appear here.</p>
        </div>
      `;
      return;
    }
    
    storiesList.innerHTML = this.stories.map(story => `
      <div class="col-md-6 mb-4">
        <div class="card h-100 border-1 shadow-sm story-card p-4" style="border-radius: 10px;">
          <div class="position-relative">
            <img src="${story.photoUrl}" class="card-img-top" alt="${story.name}'s story" style="height: 200px; object-fit: cover;">
            ${story.lat && story.lon ? `
              <div class="position-absolute bottom-0 end-0 m-2">
                <span class="badge bg-primary">
                  <i class="bi bi-geo-alt-fill"></i> Lat: ${story.lat}, Lng: ${story.lon}
                </span>
              </div>
            ` : 'Doesnt have location'}
          </div>
          <div class="card-body">
            <h5 class="card-title">${story.name}</h5>
            <p class="card-text text-muted small mb-2">
              <i class="bi bi-calendar3"></i> ${new Date(story.createdAt).toLocaleDateString()}
            </p>
            <p class="card-text">${story.description.length > 120 ? story.description.substring(0, 120) + '...' : story.description}</p>
          </div>
          <div class="card-footer bg-white border-0">
            <a href="#/stories/${story.id}" class="btn btn-sm btn-outline-primary">
              <i class="bi bi-book-half"></i> Read Full Story
            </a>
          </div>
        </div>
      </div>
    `).join('');
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

    // Add markers for stories with location data
    const storiesWithLocation = this.stories.filter(story => story.lat && story.lon);
    
    if (storiesWithLocation.length > 0) {
      try {
        // Create bounds to fit all markers
        const bounds = L.latLngBounds();
        
        // Add markers for each story
        storiesWithLocation.forEach(story => {
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
          const story = storiesWithLocation[0];
          this.map.setView([parseFloat(story.lat), parseFloat(story.lon)], 12);
        }
      } catch (error) {
        console.error('Error updating map:', error);
      }
    } else {
      // If no stories have location, set default view
      this.map.setView([0, 0], 2);
    }
  }

  setupLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.addEventListener('click', async () => {
      this.page++;
      await this.loadStories();
    });
  }
}
