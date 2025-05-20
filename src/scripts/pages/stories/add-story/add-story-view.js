import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AddStoryModel from './add-story-model.js';
import AddStoryPresenter from './add-story-presenter.js';
import { saveData, getAllData, deleteData } from '../../../idb';

/**
 * View class for the add story page
 * Handles rendering and UI interactions
 */
export default class AddStoryView {
  #presenter;
  #model;
  #map;
  #marker;
  #mediaStream;
  #capturedBlob;

  constructor() {
    // Initialize model and presenter
    this.#model = new AddStoryModel();
    this.#presenter = new AddStoryPresenter({
      model: this.#model,
      view: this,
    });
    
    // Initialize instance variables
    this.#map = null;
    this.#marker = null;
    this.#mediaStream = null;
    this.#capturedBlob = null;
  }

  /**
   * Sets the presenter for this view
   * @param {Object} presenter - The presenter instance
   */
  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  /**
   * Renders the add story page content
   * @returns {string} HTML string for the add story page
   */
  async render() {
    // Check if user is authenticated
    if (!this.#model.isAuthenticated()) {
      return '';
    }

    return `
      <!-- Container Utama -->
      <section style="max-width: 800px; margin: 40px auto; padding: 20px;" role="main" aria-label="Tambah Cerita Baru">
        <div style="background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); padding: 30px;">
          <h2 style="text-align: center; margin-bottom: 30px; font-size: 28px; color: #333;">Tambah Cerita Baru</h2>
          <!-- Form Tambah Cerita -->
          <form id="addStoryForm" aria-label="Form pengiriman cerita">
            <!-- Deskripsi Cerita -->
            <div style="margin-bottom: 20px;">
              <label for="description" style="display: block; margin-bottom: 8px; font-weight: 600;">Deskripsi Cerita</label>
              <textarea 
                id="description" 
                name="description"
                rows="4" 
                required
                style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px;"
                aria-required="true"
              ></textarea>
            </div>

            <!-- Upload Foto -->
            <div class="mb-3">
              <label class="form-label">Unggah Foto</label>
              <input 
                type="file" 
                id="photoFile" 
                name="photo"
                accept="image/*" 
                style="width: 100%; margin-bottom: 10px;"
                aria-required="true"
              />

              <button 
                type="button" 
                id="openCameraBtn" 
                style="padding: 8px 12px; background-color: #007bff; color: white; border: none; border-radius: 5px;"
                aria-label="Buka kamera untuk mengambil foto"
              >
                Buka Kamera
              </button>

              <!-- Preview Gambar -->
              <div id="previewContainer" style="margin-top: 10px; display: none;">
                <img id="imagePreview" src="" alt="Preview foto" style="max-width: 100%; border-radius: 10px;" />
              </div>
            </div>

            <!-- Modal Kamera -->
            <div id="cameraModal" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 9999; justify-content: center; align-items: center;" role="dialog" aria-label="Modal pengambilan foto">
              <div style="background: white; padding: 20px; border-radius: 10px; position: relative; width: 400px; max-width: 90%;">
                <video 
                  id="cameraStream" 
                  autoplay 
                  playsinline 
                  style="width: 100%; border-radius: 10px;"
                  aria-label="Preview kamera"
                ></video>
                <button 
                  id="captureBtn" 
                  style="margin-top: 10px; padding: 10px 15px; background-color: #28a745; color: white; border: none; border-radius: 5px;"
                  aria-label="Ambil foto"
                >
                  Ambil Foto
                </button>
                <button 
                  id="closeCameraBtn" 
                  style="position: absolute; top: 10px; right: 10px; background-color: transparent; border: none; font-size: 20px; color: #333;"
                  aria-label="Tutup kamera"
                >
                  &times;
                </button>
              </div>
            </div>

            <!-- Opsi Lokasi -->
            <div style="margin-bottom: 20px;">
              <label style="display: flex; align-items: center;">
                <input 
                  type="checkbox" 
                  id="includeLocation" 
                  name="includeLocation"
                  style="margin-right: 10px;"
                >
                Sertakan Lokasi Saya
              </label>
              <button 
                type="button" 
                id="getCurrentLocation" 
                style="margin-top: 10px; padding: 8px 12px; background-color: #28a745; color: white; border: none; border-radius: 5px; display: none;"
                aria-label="Gunakan lokasi saat ini"
              >
                Gunakan Lokasi Saat Ini
              </button>
            </div>

            <!-- Form Lokasi -->
            <div id="locationFields" style="display: none; margin-bottom: 20px;">
              <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <div style="flex: 1;">
                  <label for="latitude" style="display: block; margin-bottom: 8px; font-weight: 600;">Latitude</label>
                  <input 
                    type="number" 
                    id="latitude" 
                    name="lat"
                    step="any"
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 6px;"
                    readonly
                  >
                </div>
                <div style="flex: 1;">
                  <label for="longitude" style="display: block; margin-bottom: 8px; font-weight: 600;">Longitude</label>
                  <input 
                    type="number" 
                    id="longitude" 
                    name="lon"
                    step="any"
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 6px;"
                    readonly
                  >
                </div>
              </div>
              <!-- Container Peta -->
              <div id="mapContainer" style="height: 300px; margin-top: 10px; border-radius: 6px; overflow: hidden;" role="application" aria-label="Peta untuk memilih lokasi cerita"></div>
            </div>

            <!-- Tombol Submit -->
            <button 
              type="submit"
              style="width: 100%; background-color: #007bff; color: #fff; border: none; padding: 12px; border-radius: 6px; font-size: 16px; cursor: pointer;"
              aria-label="Kirim cerita"
            >
              Kirim Cerita
            </button>
          </form>
          <!-- Tombol Kembali -->
          <div style="text-align: center; margin-top: 20px;">
            <a 
              href="#/stories"
              style="display: inline-block; padding: 10px 20px; border: 1px solid #007bff; border-radius: 6px; color: #007bff; text-decoration: none; font-weight: 500;"
              aria-label="Kembali ke daftar cerita"
            >
              ← Kembali ke Daftar Cerita
            </a>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Sets up event listeners and initializes the page
   */
  async afterRender() {
    // Initialize presenter
    this.#presenter.init();
    
    // Set up event listeners
    this.#setupLocationEvents();
    this.#setupPhotoEvents();
    this.#setupFormSubmission();
    this.#setupOnlineSync();

    // Check if we're online and have offline stories to submit
    if (navigator.onLine) {
      await this.#syncOfflineStories();
    }
  }

  /**
   * Sets up location-related event listeners
   */
  #setupLocationEvents() {
    const includeLocation = document.getElementById('includeLocation');
    const locationFields = document.getElementById('locationFields');
    const mapContainer = document.getElementById('mapContainer');
    const getCurrentLocationBtn = document.getElementById('getCurrentLocation');
    
    // Event listener for location checkbox
    includeLocation.addEventListener('change', () => {
      if (includeLocation.checked) {
        locationFields.style.display = 'block';
        getCurrentLocationBtn.style.display = 'block';
        
        // Initialize map with a slight delay
        setTimeout(() => {
          if (!this.#map) {
            this.#initMap();
          }
        }, 100);
      } else {
        locationFields.style.display = 'none';
        getCurrentLocationBtn.style.display = 'none';
        
        // Clean up map
        if (this.#map) {
          this.#map.remove();
          this.#map = null;
          this.#marker = null;
        }
      }
    });
    
    // Event listener for current location button
    getCurrentLocationBtn.addEventListener('click', async () => {
      try {
        const location = await this.#presenter.getCurrentLocation();
        this.#updateLocationFields(location.latitude, location.longitude);
      } catch (error) {
        this.showError('Could not get your location. Make sure location services are enabled.');
      }
    });
  }

  /**
   * Initializes the map
   */
  #initMap() {
    const mapContainer = document.getElementById('mapContainer');
    
    // Create map centered on Jakarta by default
    this.#map = L.map(mapContainer).setView([-6.2088, 106.8456], 13);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    
    // Add click event to map
    this.#map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      this.#updateLocationFields(lat, lng);
    });
  }

  /**
   * Updates location fields and marker
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   */
  #updateLocationFields(lat, lng) {
    // Update input fields
    document.getElementById('latitude').value = lat;
    document.getElementById('longitude').value = lng;
    
    // Update marker on map
    if (this.#map) {
      // Remove existing marker if any
      if (this.#marker) {
        this.#map.removeLayer(this.#marker);
      }
      
      // Add new marker
      this.#marker = L.marker([lat, lng]).addTo(this.#map);
      
      // Center map on new location
      this.#map.setView([lat, lng], 15);
    }
  }

  /**
   * Sets up photo-related event listeners
   */
  #setupPhotoEvents() {
    const photoFile = document.getElementById('photoFile');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const openCameraBtn = document.getElementById('openCameraBtn');
    const cameraModal = document.getElementById('cameraModal');
    const cameraStream = document.getElementById('cameraStream');
    const captureBtn = document.getElementById('captureBtn');
    const closeCameraBtn = document.getElementById('closeCameraBtn');
    
    // File upload preview
    photoFile.addEventListener('change', () => {
      this.#capturedBlob = null;
      const file = photoFile.files[0];
      if (!file) return;
      
      if (file.size > 1024 * 1024) {
        this.showError('File must be less than 1MB');
        photoFile.value = '';
        previewContainer.style.display = 'none';
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
        previewContainer.style.display = 'block';
      };
      reader.readAsDataURL(file);
    });
    
    // Open camera button
    openCameraBtn.addEventListener('click', async () => {
      try {
        this.#mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraStream.srcObject = this.#mediaStream;
        cameraModal.style.display = 'flex';
      } catch (error) {
        this.showError('Could not access camera');
      }
    });
    
    // Capture photo button
    captureBtn.addEventListener('click', () => {
      const canvas = document.createElement('canvas');
      canvas.width = cameraStream.videoWidth;
      canvas.height = cameraStream.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(cameraStream, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob.size > 1024 * 1024) {
          this.showError('Captured photo must be less than 1MB');
          return;
        }
        
        this.#capturedBlob = blob;
        const imageUrl = URL.createObjectURL(blob);
        imagePreview.src = imageUrl;
        previewContainer.style.display = 'block';
        
        // Close camera modal
        this.#closeCamera();
      }, 'image/jpeg', 0.9);
    });
    
    // Close camera button
    closeCameraBtn.addEventListener('click', () => {
      this.#closeCamera();
    });
    
    // Prevent form submission from modal
    cameraModal.addEventListener('submit', (e) => {
      e.preventDefault();
    });
  }

  /**
   * Closes the camera and stops all tracks
   */
  #closeCamera() {
    const cameraModal = document.getElementById('cameraModal');
    
    if (this.#mediaStream) {
      this.#mediaStream.getTracks().forEach(track => track.stop());
      this.#mediaStream = null;
    }
    
    cameraModal.style.display = 'none';
  }

  /**
   * Sets up form submission
   */
  #setupFormSubmission() {
    const addStoryForm = document.getElementById('addStoryForm');
    
    addStoryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Get and validate description
      const description = document.getElementById('description').value.trim();
      if (!description) {
        this.showError('Please enter a story description');
        return;
      }
      
      // Get and validate photo
      const photoFile = document.getElementById('photoFile').files[0];
      if (!photoFile && !this.#capturedBlob) {
        this.showError('Please add a photo to your story');
        return;
      }

      // Validate photo size
      const fileData = photoFile || this.#capturedBlob;
      if (fileData.size > 1024 * 1024) { // 1MB in bytes
        this.showError('Photo size must be less than 1MB');
        return;
      }
      
      // Create FormData object
      const formData = new FormData();
      formData.append('description', description);
      
      // Add photo to FormData
      if (photoFile) {
        formData.append('photo', photoFile);
      } else if (this.#capturedBlob) {
        formData.append('photo', this.#capturedBlob, 'photo.jpg');
      }
      
      // Add location if included
      const includeLocation = document.getElementById('includeLocation').checked;
      if (includeLocation) {
        const lat = document.getElementById('latitude').value;
        const lon = document.getElementById('longitude').value;
        if (lat && lon) {
          formData.append('lat', lat);
          formData.append('lon', lon);
        }
      }
      
      // Check if online
      if (navigator.onLine) {
        // Submit form via presenter if online
        await this.#presenter.submitForm(formData);
      } else {
        // Save to IndexedDB if offline
        try {
          // Generate unique ID for offline story
          const offlineId = `offline_${Date.now()}`;
          
          // Convert file/blob to base64 for storage
          const base64Data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(fileData);
          });
          
          const offlineData = {
            id: offlineId,
            description: description,
            photoUrl: base64Data,
            createdAt: new Date().toISOString(),
            isOffline: true
          };

          // Add location data if included
          if (includeLocation) {
            const lat = document.getElementById('latitude').value;
            const lon = document.getElementById('longitude').value;
            if (lat && lon) {
              offlineData.lat = lat;
              offlineData.lon = lon;
            }
          }

          console.log('Saving offline story:', offlineData);
          await saveData(offlineData);
          this.showSuccess('Story saved offline. Will be submitted when online.');
          
          // Reset form
          addStoryForm.reset();
          document.getElementById('previewContainer').style.display = 'none';
          this.#capturedBlob = null;
        } catch (error) {
          console.error('Error saving story offline:', error);
          this.showError('Failed to save story offline. Please try again.');
        }
      }
    });
  }

  /**
   * Shows or hides loading state
   * @param {boolean} isLoading - Whether to show or hide loading state
   */
  showLoading(isLoading) {
    const submitButton = document.querySelector('button[type="submit"]');
    
    // If we're not on the add story page, just return
    if (!submitButton) {
      return;
    }
    
    if (isLoading) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    } else {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit Story';
    }
  }

  /**
   * Shows an error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    console.error('Error:', message);
    alert(message);
  }

  /**
   * Shows a success message
   * @param {string} message - Success message to display
   */
  showSuccess(message) {
    console.log('Success:', message);
    alert(message);
  }

  /**
   * Converts base64 data to Blob
   * @param {string} base64 - Base64 data URL
   * @param {string} mimeType - MIME type of the data
   * @returns {Blob} Blob object
   */
  #base64ToBlob(base64, mimeType) {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeType });
  }

  /**
   * Syncs offline stories with the server
   */
  async #syncOfflineStories() {
    try {
      const stories = await getAllData();
      console.log('Checking for offline stories:', stories);
      
      // Filter only offline stories
      const offlineStories = stories.filter(story => story.isOffline);
      
      if (offlineStories.length > 0) {
        console.log('Found offline stories to submit:', offlineStories);
        
        for (const story of offlineStories) {
          try {
            // Create FormData for submission
            const formData = new FormData();
            formData.append('description', story.description);
            
            // Convert base64 to Blob if needed
            if (story.photoUrl && story.photoUrl.startsWith('data:')) {
              const mime = story.photoUrl.match(/^data:(.*);base64,/)[1];
              const blob = this.#base64ToBlob(story.photoUrl, mime);
              formData.append('photo', blob, 'photo.jpg');
            }
            
            // Add location if available
            if (story.lat && story.lon) {
              formData.append('lat', story.lat);
              formData.append('lon', story.lon);
            }
            
            console.log('Submitting offline story:', story.id);
            await this.#presenter.submitForm(formData);
            
            // Delete from IndexedDB only after successful submission
            console.log('Deleting story from IndexedDB:', story.id);
            await deleteData(story.id);
            console.log('Successfully deleted story from IndexedDB:', story.id);
          } catch (error) {
            console.error('Error submitting offline story:', story.id, error);
            // Don't delete the story if submission failed
            this.showError(`Failed to submit story. Will try again later.`);
          }
        }
        
        this.showSuccess('Offline stories submitted successfully.');
      }
    } catch (error) {
      console.error('Error in syncOfflineStories:', error);
      this.showError('Failed to sync offline stories.');
    }
  }

  #setupOnlineSync() {
    window.addEventListener('online', async () => {
      console.log('Connection restored, checking for offline stories...');
      await this.#syncOfflineStories();
    });
  }
}