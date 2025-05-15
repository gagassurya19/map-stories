/**
 * Presenter class for the add story page
 * Handles communication between model and view
 */
export default class AddStoryPresenter {
  #model;
  #view;

  /**
   * Constructor for AddStoryPresenter
   * @param {Object} param0 - Object containing model and view
   * @param {Object} param0.model - The add story model
   * @param {Object} param0.view - The add story view
   */
  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
    
    // Connect view to presenter
    this.#view.setPresenter(this);
  }

  /**
   * Initializes the presenter
   * Checks if user is authenticated
   */
  init() {
    if (!this.#model.isAuthenticated()) {
      window.location.hash = '#/login';
      return false;
    }
    return true;
  }

  /**
   * Handles the form submission
   * @param {Object} formData - Form data containing story details
   */
  async submitForm(formData) {
    // Validate form data
    const validationResult = this.#model.validateStoryInput(formData);
    
    if (!validationResult.valid) {
      this.#view.showError(validationResult.message);
      return;
    }

    // Show loading state
    this.#view.showLoading(true);

    try {
      // Create FormData object
      const data = new FormData();
      data.append('description', formData.description);
      
      if (formData.file) {
        data.append('photo', formData.file);
      } else if (formData.capturedBlob) {
        data.append('photo', formData.capturedBlob, 'captured.jpg');
      }
      
      if (formData.includeLocation) {
        data.append('lat', formData.lat);
        data.append('lon', formData.lon);
      }

      // Add story via model
      const result = await this.#model.addStory(data);
      
      // Handle result
      if (result.success) {
        this.#view.showSuccess('Story added successfully');
        window.location.hash = '#/stories';
      } else {
        this.#view.showError(result.message);
        this.#view.showLoading(false);
      }
    } catch (error) {
      this.#view.showError('An error occurred while adding the story');
      this.#view.showLoading(false);
    }
  }

  /**
   * Gets the user's current location
   * @returns {Promise<Object>} Location coordinates or null if unable to get location
   */
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
} 