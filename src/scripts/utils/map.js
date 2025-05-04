import L from 'leaflet';

// Sample GeoJSON data for dummy markers in Bandung
const sampleMarkers = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        title: 'Gedung Sate',
        description: 'Iconic government building with unique architecture',
        date: '2024-03-20'
      },
      geometry: {
        type: 'Point',
        coordinates: [107.6186, -6.9024] // Gedung Sate
      }
    },
    {
      type: 'Feature',
      properties: {
        title: 'Tangkuban Perahu',
        description: 'Active volcano with amazing crater views',
        date: '2024-03-19'
      },
      geometry: {
        type: 'Point',
        coordinates: [107.6000, -6.7700] // Tangkuban Perahu
      }
    },
    {
      type: 'Feature',
      properties: {
        title: 'Braga Street',
        description: 'Historic street with colonial architecture',
        date: '2024-03-18'
      },
      geometry: {
        type: 'Point',
        coordinates: [107.6089, -6.9177] // Braga Street
      }
    },
    {
      type: 'Feature',
      properties: {
        title: 'Kawah Putih',
        description: 'Beautiful white crater lake',
        date: '2024-03-17'
      },
      geometry: {
        type: 'Point',
        coordinates: [107.4000, -7.1667] // Kawah Putih
      }
    },
    {
      type: 'Feature',
      properties: {
        title: 'Trans Studio Bandung',
        description: 'Indoor theme park and entertainment center',
        date: '2024-03-16'
      },
      geometry: {
        type: 'Point',
        coordinates: [107.6333, -6.9167] // Trans Studio Bandung
      }
    }
  ]
};

export const initMap = (containerId) => {
  // Initialize the map centered on Bandung
  const map = L.map(containerId).setView([-6.9175, 107.6191], 10);

  // Add the tile layer (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Add markers from GeoJSON
  L.geoJSON(sampleMarkers, {
    pointToLayer: (feature, latlng) => {
      return L.marker(latlng)
        .bindPopup(`
          <div class="marker-popup">
            <h3>${feature.properties.title}</h3>
            <p>${feature.properties.description}</p>
            <small>${feature.properties.date}</small>
          </div>
        `);
    }
  }).addTo(map);

  return map;
}; 