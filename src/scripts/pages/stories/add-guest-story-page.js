import Api from '../../data/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default class AddGuestStoryPage {
    async render() {
      return `
        <section style="max-width: 800px; margin: 40px auto; padding: 20px;">
          <div style="background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); padding: 30px;">
            <h2 style="text-align: center; margin-bottom: 30px; font-size: 28px; color: #333;">Add a New Story (Guest)</h2>
            <form id="addGuestStoryForm">
              <div style="margin-bottom: 20px;">
                <label for="description" style="display: block; margin-bottom: 8px; font-weight: 600;">Story Description</label>
                <textarea id="description" rows="4" required
                  style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px;"></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Upload Photo</label>
                <input type="file" id="photoFile" accept="image/*" style="width: 100%; margin-bottom: 10px;" />

                <button type="button" id="openCameraBtn" style="padding: 8px 12px; background-color: #007bff; color: white; border: none; border-radius: 5px;">Open Camera</button>

                <div id="previewContainer" style="margin-top: 10px; display: none;">
                  <img id="imagePreview" src="" alt="Image preview" style="max-width: 100%; border-radius: 10px;" />
                </div>
              </div>

              <!-- Camera Modal -->
              <div id="cameraModal" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 9999; justify-content: center; align-items: center;">
                <div style="background: white; padding: 20px; border-radius: 10px; position: relative;">
                  <video id="cameraStream" autoplay playsinline style="width: 100%; border-radius: 10px;"></video>
                  <button id="captureBtn" style="margin-top: 10px; padding: 10px 15px; background-color: #28a745; color: white; border: none; border-radius: 5px;">Capture</button>
                  <button id="closeCameraBtn" style="position: absolute; top: 10px; right: 10px; background-color: transparent; border: none; font-size: 20px; color: #333;">&times;</button>
                </div>
              </div>

              <div style="margin-bottom: 20px;">
                <label style="display: flex; align-items: center;">
                  <input type="checkbox" id="includeLocation" style="margin-right: 10px;">
                  Include My Location
                </label>
                <button type="button" id="getCurrentLocation" style="margin-top: 10px; padding: 8px 12px; background-color: #28a745; color: white; border: none; border-radius: 5px; display: none;">
                  Use Current Location
                </button>
              </div>

              <div id="locationFields" style="display: none; margin-bottom: 20px;">
                <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                  <div style="flex: 1;">
                    <label for="lat" style="display: block; margin-bottom: 8px; font-weight: 600;">Latitude</label>
                    <input type="number" id="lat" step="any"
                      style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 6px;">
                  </div>
                  <div style="flex: 1;">
                    <label for="lon" style="display: block; margin-bottom: 8px; font-weight: 600;">Longitude</label>
                    <input type="number" id="lon" step="any"
                      style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 6px;">
                  </div>
                </div>
                <div id="mapContainer" style="height: 300px; margin-top: 10px; border-radius: 6px; overflow: hidden;"></div>
              </div>

              <button type="submit"
                style="width: 100%; background-color: #007bff; color: #fff; border: none; padding: 12px; border-radius: 6px; font-size: 16px; cursor: pointer;">
                Submit Story
              </button>
            </form>
            <div style="text-align: center; margin-top: 20px;">
              <a href="#/stories"
                style="display: inline-block; padding: 10px 20px; border: 1px solid #007bff; border-radius: 6px; color: #007bff; text-decoration: none; font-weight: 500;">
                ← Back to Stories
              </a>
            </div>
          </div>
        </section>
      `;
    }
  
    async afterRender() {
      const addGuestStoryForm = document.getElementById('addGuestStoryForm');
      const includeLocation = document.getElementById('includeLocation');
      const locationFields = document.getElementById('locationFields');
      
      const photoFile = document.getElementById('photoFile');
      const previewContainer = document.getElementById('previewContainer');
      const imagePreview = document.getElementById('imagePreview');
      
      const openCameraBtn = document.getElementById('openCameraBtn');
      const cameraModal = document.getElementById('cameraModal');
      const cameraStream = document.getElementById('cameraStream');
      const captureBtn = document.getElementById('captureBtn');
      const closeCameraBtn = document.getElementById('closeCameraBtn');
      const mapContainer = document.getElementById('mapContainer');
      
      let capturedBlob = null;
      let mediaStream = null;
      let map = null;
      let marker = null;

      includeLocation.addEventListener('change', () => {
        if (includeLocation.checked) {
          locationFields.style.display = 'block';
          document.getElementById('getCurrentLocation').style.display = 'block';
          // Add small delay to ensure container is rendered
          setTimeout(() => {
            if (!map) {
              map = L.map(mapContainer).setView([-6.2088, 106.8456], 13); // Default to Jakarta

              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              }).addTo(map);
            
              map.on('click', (e) => {
                const { lat, lng } = e.latlng;
                document.getElementById('lat').value = lat;
                document.getElementById('lon').value = lng;
              
                if (marker) {
                  map.removeLayer(marker);
                }
              
                marker = L.marker([lat, lng]).addTo(map);
              });
            }
          }, 100);
        } else {
          locationFields.style.display = 'none';
          document.getElementById('getCurrentLocation').style.display = 'none';
          if (map) {
            map.remove();
            map = null;
          }
        }
      });

      // Add current location button handler
      document.getElementById('getCurrentLocation').addEventListener('click', () => {
        if (!navigator.geolocation) {
          alert('Geolocation is not supported by your browser');
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            
            // Update input fields
            document.getElementById('lat').value = latitude;
            document.getElementById('lon').value = longitude;
            
            // Update map
            if (map) {
              map.setView([latitude, longitude], 15);
              
              if (marker) {
                map.removeLayer(marker);
              }
              
              marker = L.marker([latitude, longitude]).addTo(map);
            }
          },
          (error) => {
            alert('Unable to retrieve your location. Please make sure location services are enabled.');
            console.error('Error getting location:', error);
          }
        );
      });

      // Preview image from file
      photoFile.addEventListener('change', () => {
        capturedBlob = null;
        const file = photoFile.files[0];
        if (!file) return;
      
        if (file.size > 1024 * 1024) {
          alert('File must be less than 1MB');
          photoFile.value = '';
          previewContainer.style.display = 'none';
          return;
        }
      
        const reader = new FileReader();
        reader.onload = e => {
          imagePreview.src = e.target.result;
          previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
      });

      // Camera modal logic
      captureBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const canvas = document.createElement('canvas');
        canvas.width = cameraStream.videoWidth;
        canvas.height = cameraStream.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(cameraStream, 0, 0);
      
        canvas.toBlob(blob => {
          if (blob.size > 1024 * 1024) {
            alert('Captured image must be < 1MB');
            return;
          }
        
          capturedBlob = blob;
          const imageUrl = URL.createObjectURL(blob);
          imagePreview.src = imageUrl;
          previewContainer.style.display = 'block';
        
          // Close modal
          if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
          }
          cameraModal.style.display = 'none';
        }, 'image/jpeg', 0.9);
      });

      // Prevent form submission from camera modal
      cameraModal.addEventListener('submit', (e) => {
        e.preventDefault();
      });

      // Prevent form submission from camera buttons
      openCameraBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
          cameraStream.srcObject = mediaStream;
          cameraModal.style.display = 'flex';
        } catch (err) {
          alert('Cannot access camera');
          console.error(err);
        }
      });

      closeCameraBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
          mediaStream = null;
        }
        cameraModal.style.display = 'none';
      });

      // Form submission
      addGuestStoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Only proceed if the submit button was clicked
        if (e.submitter && e.submitter.type === 'submit') {
          try {
            // Get form elements
            const description = document.getElementById('description').value.trim();
            const file = photoFile.files[0];
            const includeLocation = document.getElementById('includeLocation').checked;
            const lat = document.getElementById('lat').value;
            const lon = document.getElementById('lon').value;
          
            // Validate description
            if (!description) {
              alert('Please enter a story description');
              return;
            }
          
            // Validate photo
            if (!file && !capturedBlob) {
              alert('Please select or capture a photo');
              return;
            }
          
            // Validate location if included
            if (includeLocation && (!lat || !lon)) {
              alert('Please select a location on the map or use current location');
              return;
            }
          
            const formData = new FormData();
            formData.append('description', description);
          
            if (file) {
              if (file.size > 1024 * 1024) {
                alert('File must be less than 1MB');
                return;
              }
              formData.append('photo', file);
            } else if (capturedBlob) {
              formData.append('photo', capturedBlob, 'captured.jpg');
            }
          
            if (includeLocation) {
              formData.append('lat', lat);
              formData.append('lon', lon);
            }
          
            // Disable submit button to prevent double submission
            const submitButton = addGuestStoryForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
            
            const responseData = await Api.addGuestStory(formData);

            if (responseData.error === false) {
              alert('Story added successfully!');
              window.location.hash = '#/stories';
            } else {
              alert(responseData.message || 'Failed to add story');
              // Re-enable submit button on error
              submitButton.disabled = false;
              submitButton.textContent = 'Submit Story';
            }
          } catch (error) {
            console.error('Error adding story:', error);
            alert('An error occurred while adding the story');
            // Re-enable submit button on error
            const submitButton = addGuestStoryForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Story';
          }
        }
      });
    }
  }
  