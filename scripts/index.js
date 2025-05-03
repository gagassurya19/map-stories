// Coordinates
const jakartaCoor = [-6.2088, 106.8456];

// Initialize map
const myMap = L.map('map', {
  zoom: 10,
  center: jakartaCoor
});

// Set base map
const rasterTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const baseTile = L.tileLayer(rasterTileUrl, {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
});
baseTile.addTo(myMap);

fetch('/scripts/jakarta.geojson')
  .then((response) => response.json())
  .then((geoJsonData) => {
    const jakartaGeoJson = L.geoJSON(geoJsonData, {
      style: {
        color: '#FF4500', // warna kontur
        weight: 4, // ukuran lebar kontur
        opacity: 0.8, // tingkat transparansi kontur
      },
    
      filter(feature) {
        // Pastikan properti 'status' ada sebelum memfilter
        return feature.properties && feature.properties.status !== 'Sedang dalam perbaikan';
      },
    
      onEachFeature(feature, layer) {
        // Pastikan properti 'popupContent' ada sebelum menambahkan popup
        if (feature.properties && feature.properties.popupContent) {
          layer.bindPopup(feature.properties.popupContent);
        }
      },
    });

    // Tambahkan GeoJSON ke peta
    jakartaGeoJson.addTo(myMap);
  })
  .catch((error) => {
    console.error('Error loading GeoJSON:', error);
  });

  document.getElementById('find-your-location').addEventListener('click', (event) => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation API unsupported');
      return;
    }
  
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
    
      myMap.flyTo([latitude, longitude], 15);
    
      const marker = L.marker([latitude, longitude]);
      marker.addTo(myMap);
      marker.bindPopup('Lokasi Anda')
      marker.openPopup();
    });
  });

// // Marker
// const draggableMarker = L.marker(jakartaCoor, {
//   draggable: false,
// });
// draggableMarker.addTo(myMap);

// // Ensure the popup is always open when the marker is added to the map
// const initialImageUrl = 'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D'; // Replace with a relevant image URL
// const initialPopupContent = `
//   <div style="margin: 0; padding: 0;">
//     <img src="${initialImageUrl}" alt="Location Image" style="width: 100%; height: auto; border-radius: 0;" />
//   </div>
// `;

// // Bind the popup and open it immediately
// draggableMarker.bindPopup(initialPopupContent, { closeButton: false });
// draggableMarker.openPopup();

// // Dealing with events
// const myNewPopup = L.popup();
 
// myMap.on('click', async (event) => {
//   const { lat, lng } = event.latlng;

//   // Add an image to the popup (you can replace the URL with a dynamic one if needed)
//   const imageUrl = 'https://via.placeholder.com/150'; // Replace with a relevant image URL
//   const popupContent = `
//     <div style="margin: 0; padding: 0;">
//       <img src="${imageUrl}" alt="Location Image" style="width: 100%; height: auto; border-radius: 0;" />
//     </div>
//   `;

//   // Display the popup with the image
//   myNewPopup.setLatLng(event.latlng);
//   myNewPopup.setContent(popupContent);
//   myNewPopup.openOn(myMap);
// });

// // Fungsi untuk reverse geocoding menggunakan Nominatim
// async function getAddressFromCoordinates(lat, lng) {
//   const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
//   try {
//     const response = await fetch(url);
//     if (!response.ok) throw new Error('Failed to fetch address');
//     const data = await response.json();
//     return data.display_name; // Alamat lengkap
//   } catch (error) {
//     console.error('Error fetching address:', error);
//     return null;
//   }
// }