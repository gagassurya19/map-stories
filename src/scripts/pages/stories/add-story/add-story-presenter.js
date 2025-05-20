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
   * @param {FormData} formData - Form data containing story details
   */
  async submitForm(formData) {
    console.log('Submitting form with data:', {
      description: formData.get('description'),
      hasPhoto: formData.has('photo'),
      hasLocation: formData.has('lat') && formData.has('lon')
    });

    try {
      // Add story via model
      const result = await this.#model.addStory(formData);
      
      // Handle result
      if (result.success) {
        this.#view.showSuccess('Story added successfully');
        // Only redirect if we're on the add story page
        if (window.location.hash === '#/add-story') {
          window.location.hash = '#/stories';
        }
      } else {
        this.#view.showError(result.message);
      }
    } catch (error) {
      console.error('Error submitting story:', error);
      this.#view.showError('An error occurred while adding the story');
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