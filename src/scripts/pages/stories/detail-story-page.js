import Api from '../../data/api';
import Auth from '../../utils/auth';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default class DetailStoryPage {
  async render() {
    // Check authentication
    if (!Auth.checkAuth()) {
      return '';
    }
    return `
      <section class="max-w-4xl mx-auto px-4 py-8">
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="p-6">
            <div id="storyDetail">
              <!-- Story details will be loaded here -->
            </div>
            <div class="mt-8 text-center">
              <a href="#/stories" class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md">
                <i class="bi bi-arrow-left mr-2"></i>
                Back to Stories
              </a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const storyId = window.location.hash.split('/')[2];
    await this.loadStoryDetail(storyId);
  }

  async loadStoryDetail(storyId) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      alert('Please login first');
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
        alert(responseData.message || 'Failed to load story details');
      }
    } catch (error) {
      console.error('Error loading story detail:', error);
      alert('An error occurred while loading story details');
    }
  }

  displayStoryDetail(story) {
    const storyDetail = document.getElementById('storyDetail');
    storyDetail.innerHTML = `
      <div class="space-y-6">
        <!-- Story Image and Header -->
        <div class="relative">
          <img 
            src="${story.photoUrl}" 
            class="w-full h-[400px] object-cover rounded-lg shadow-md" 
            alt="${story.name}'s story"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg"></div>
          <div class="absolute bottom-0 left-0 right-0 p-6">
            <h2 class="text-3xl font-bold text-white mb-2">${story.name}</h2>
            <p class="text-gray-200 flex items-center">
              <i class="bi bi-calendar3 mr-2"></i>
              Posted on ${new Date(story.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <!-- Story Content -->
        <div class="bg-gray-50 rounded-lg p-6 shadow-sm">
          <p class="text-lg text-gray-700 leading-relaxed">${story.description}</p>
        </div>

        ${story.lat && story.lon ? `
          <!-- Location Section -->
          <div class="mb-4">
            <h5 class="mb-3 flex items-center">
              <i class="bi bi-geo-alt-fill text-blue-600 mr-2"></i>
              Location
            </h5>
            <div id="storyMap" style="height: 300px; border-radius: 8px; overflow: hidden;" class="shadow-sm"></div>
          </div>
        ` : ''}
      </div>
    `;
  }

  initMap(story) {
    const mapContainer = document.getElementById('storyMap');
    if (!mapContainer) return;

    const lat = parseFloat(story.lat);
    const lon = parseFloat(story.lon);

    if (isNaN(lat) || isNaN(lon)) return;

    const map = L.map('storyMap').setView([lat, lon], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Create a custom marker icon
    const storyIcon = L.divIcon({
      className: 'story-marker',
      html: `
        <div style="background-color: #2b6cb0; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

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