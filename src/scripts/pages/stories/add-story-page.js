import Api from '../../data/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Auth from '../../utils/auth';

/**
 * Kelas AddStoriesPage
 * Menangani tampilan dan interaksi halaman tambah cerita baru
 */
export default class AddStoriesPage {
  /**
   * Merender konten halaman tambah cerita
   * @returns {string} HTML string untuk halaman tambah cerita
   */
  async render() {
    // Memeriksa autentikasi
    if (!Auth.checkAuth()) {
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
              <div style="background: white; padding: 20px; border-radius: 10px; position: relative;">
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
   * Menangani interaksi setelah halaman dirender
   * Mengatur event listener dan inisialisasi komponen
   */
  async afterRender() {
    // Inisialisasi elemen form
    const addStoryForm = document.getElementById('addStoryForm');
    const includeLocation = document.getElementById('includeLocation');
    const locationFields = document.getElementById('locationFields');
    
    // Inisialisasi elemen foto
    const photoFile = document.getElementById('photoFile');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    
    // Inisialisasi elemen kamera
    const openCameraBtn = document.getElementById('openCameraBtn');
    const cameraModal = document.getElementById('cameraModal');
    const cameraStream = document.getElementById('cameraStream');
    const captureBtn = document.getElementById('captureBtn');
    const closeCameraBtn = document.getElementById('closeCameraBtn');
    const mapContainer = document.getElementById('mapContainer');
    
    // Variabel untuk menyimpan data
    let capturedBlob = null;
    let mediaStream = null;
    let map = null;
    let marker = null;

    // Event listener untuk checkbox lokasi
    includeLocation.addEventListener('change', () => {
      if (includeLocation.checked) {
        locationFields.style.display = 'block';
        document.getElementById('getCurrentLocation').style.display = 'block';
        // Menambahkan delay kecil untuk memastikan container sudah dirender
        setTimeout(() => {
          if (!map) {
            map = L.map(mapContainer).setView([-6.2088, 106.8456], 13); // Default ke Jakarta

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);
          
            map.on('click', (e) => {
              const { lat, lng } = e.latlng;
              document.getElementById('latitude').value = lat;
              document.getElementById('longitude').value = lng;
            
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

    // Event listener untuk tombol lokasi saat ini
    document.getElementById('getCurrentLocation').addEventListener('click', () => {
      if (!navigator.geolocation) {
        alert('Geolokasi tidak didukung oleh browser Anda');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Memperbarui input fields
          document.getElementById('latitude').value = latitude;
          document.getElementById('longitude').value = longitude;
          
          // Memperbarui peta
          if (map) {
            map.setView([latitude, longitude], 15);
            
            if (marker) {
              map.removeLayer(marker);
            }
            
            marker = L.marker([latitude, longitude]).addTo(map);
          }
        },
        (error) => {
          alert('Tidak dapat mengambil lokasi Anda. Pastikan layanan lokasi diaktifkan.');
          console.error('Error getting location:', error);
        }
      );
    });

    // Event listener untuk preview foto dari file
    photoFile.addEventListener('change', () => {
      capturedBlob = null;
      const file = photoFile.files[0];
      if (!file) return;
    
      if (file.size > 1024 * 1024) {
        alert('File harus kurang dari 1MB');
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

    // Event listener untuk modal kamera
    captureBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const canvas = document.createElement('canvas');
      canvas.width = cameraStream.videoWidth;
      canvas.height = cameraStream.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(cameraStream, 0, 0);
    
      canvas.toBlob(blob => {
        if (blob.size > 1024 * 1024) {
          alert('Foto yang diambil harus < 1MB');
          return;
        }
      
        capturedBlob = blob;
        const imageUrl = URL.createObjectURL(blob);
        imagePreview.src = imageUrl;
        previewContainer.style.display = 'block';
      
        // Menutup modal
        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
          mediaStream = null;
        }
        cameraModal.style.display = 'none';
      }, 'image/jpeg', 0.9);
    });

    // Mencegah submit form dari modal kamera
    cameraModal.addEventListener('submit', (e) => {
      e.preventDefault();
    });

    // Event listener untuk tombol kamera
    openCameraBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraStream.srcObject = mediaStream;
        cameraModal.style.display = 'flex';
      } catch (err) {
        alert('Tidak dapat mengakses kamera');
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

    // Event listener untuk submit form
    addStoryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Hanya lanjutkan jika tombol submit diklik
      if (e.submitter && e.submitter.type === 'submit') {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) {
          alert('Silakan login terlebih dahulu');
          window.location.hash = '#/login';
          return;
        }

        try {
          // Mengambil elemen form
          const description = document.getElementById('description').value.trim();
          const file = photoFile.files[0];
          const includeLocation = document.getElementById('includeLocation').checked;
          const lat = document.getElementById('latitude').value;
          const lon = document.getElementById('longitude').value;
        
          // Validasi deskripsi
          if (!description) {
            alert('Silakan masukkan deskripsi cerita');
            return;
          }
        
          // Validasi foto
          if (!file && !capturedBlob) {
            alert('Silakan pilih atau ambil foto');
            return;
          }
        
          // Validasi lokasi jika disertakan
          if (includeLocation && (!lat || !lon)) {
            alert('Silakan pilih lokasi di peta atau gunakan lokasi saat ini');
            return;
          }
        
          const formData = new FormData();
          formData.append('description', description);
        
          if (file) {
            if (file.size > 1024 * 1024) {
              alert('File harus kurang dari 1MB');
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
        
          // Menonaktifkan tombol submit untuk mencegah pengiriman ganda
          const submitButton = addStoryForm.querySelector('button[type="submit"]');
          submitButton.disabled = true;
          submitButton.textContent = 'Mengirim...';
          
          const responseData = await Api.addStory(formData, user.token);

          if (responseData.error === false) {
            alert('Cerita berhasil ditambahkan!');
            window.location.hash = '#/stories';
          } else {
            alert(responseData.message || 'Gagal menambahkan cerita');
            // Mengaktifkan kembali tombol submit jika terjadi error
            submitButton.disabled = false;
            submitButton.textContent = 'Kirim Cerita';
          }
        } catch (error) {
          console.error('Error adding story:', error);
          alert('Terjadi kesalahan saat menambahkan cerita');
          // Mengaktifkan kembali tombol submit jika terjadi error
          const submitButton = addStoryForm.querySelector('button[type="submit"]');
          submitButton.disabled = false;
          submitButton.textContent = 'Kirim Cerita';
        }
      }
    });
  }
}
