import Api from '../../data/api';

export default class AddGuestStoryPage {
    async render() {
      return `
        <section class="container">
          <div class="row justify-content-center">
            <div class="col-md-8">
              <div class="card mt-4">
                <div class="card-body">
                  <h1 class="text-center mb-4">Add New Story (Guest)</h1>
                  <form id="addGuestStoryForm">
                    <div class="mb-3">
                      <label for="description" class="form-label">Story Description</label>
                      <textarea class="form-control" id="description" rows="4" required></textarea>
                    </div>
                    <div class="mb-3">
                      <label for="photo" class="form-label">Photo</label>
                      <input type="file" class="form-control" id="photo" accept="image/*" required>
                      <div class="form-text">Maximum file size: 1MB</div>
                    </div>
                    <div class="mb-3">
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="includeLocation">
                        <label class="form-check-label" for="includeLocation">
                          Include Location
                        </label>
                      </div>
                    </div>
                    <div id="locationFields" class="mb-3" style="display: none;">
                      <div class="row">
                        <div class="col-md-6">
                          <label for="lat" class="form-label">Latitude</label>
                          <input type="number" class="form-control" id="lat" step="any">
                        </div>
                        <div class="col-md-6">
                          <label for="lon" class="form-label">Longitude</label>
                          <input type="number" class="form-control" id="lon" step="any">
                        </div>
                      </div>
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Add Story</button>
                  </form>
                  <div class="text-center mt-3">
                    <a href="#/stories" class="btn btn-outline-primary">Back to Stories</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;
    }
  
    async afterRender() {
      const addGuestStoryForm = document.getElementById('addGuestStoryForm');
      const includeLocation = document.getElementById('includeLocation');
      const locationFields = document.getElementById('locationFields');
      
      // Toggle location fields visibility
      includeLocation.addEventListener('change', () => {
        locationFields.style.display = includeLocation.checked ? 'block' : 'none';
      });

      addGuestStoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        const description = document.getElementById('description').value;
        const photo = document.getElementById('photo').files[0];
        
        // Validate file size
        if (photo && photo.size > 1024 * 1024) { // 1MB in bytes
          alert('File size must be less than 1MB');
          return;
        }

        formData.append('description', description);
        formData.append('photo', photo);

        if (includeLocation.checked) {
          const lat = document.getElementById('lat').value;
          const lon = document.getElementById('lon').value;
          
          if (lat) formData.append('lat', lat);
          if (lon) formData.append('lon', lon);
        }

        try {
          const responseData = await Api.addGuestStory(formData);

          if (responseData.error === false) {
            alert('Story added successfully!');
            window.location.hash = '#/stories';
          } else {
            alert(responseData.message || 'Failed to add story');
          }
        } catch (error) {
          console.error('Error adding story:', error);
          alert('An error occurred while adding the story');
        }
      });
    }
  }
  