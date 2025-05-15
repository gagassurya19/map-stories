/**
 * Presenter class for the stories page
 * Handles the communication between model and view
 */
export default class StoriesPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
    
    // Connect view to presenter
    this.#view.setPresenter(this);
  }

  /**
   * Initializes the presenter
   */
  async init() {
    // Check authentication
    if (!this.#model.isAuthenticated()) {
      window.location.hash = '#/login';
      return;
    }

    // Initialize the map
    this.#view.initMap();
    
    // Load the initial stories
    await this.loadStories();
  }

  /**
   * Loads stories from the model and updates the view
   */
  async loadStories() {
    try {
      const result = await this.#model.loadStories();
      
      if (result.success) {
        this.#view.displayStories();
        this.#view.updateMap();
        this.#view.resetMapView();
      } else {
        this.#view.showError(result.message);
      }
    } catch (error) {
      console.error('Error in loadStories:', error);
      this.#view.showError('An error occurred while loading stories');
    }
  }

  /**
   * Loads the next page of stories
   */
  async loadMoreStories() {
    this.#model.nextPage();
    await this.loadStories();
  }

  /**
   * Gets all stories from the model
   * @returns {Array} Array of story objects
   */
  getStories() {
    return this.#model.getStories();
  }

  /**
   * Gets stories located in Indonesia
   * @returns {Array} Array of story objects in Indonesia
   */
  getStoriesInIndonesia() {
    return this.#model.getStoriesInIndonesia();
  }

  /**
   * Navigates to a specific location on the map
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   */
  navigateToLocation(lat, lon) {
    this.#view.navigateToLocation(lat, lon);
  }

  /**
   * Resets the map view to show all markers
   */
  resetMapView() {
    this.#view.resetMapView();
  }

  /**
   * Zooms to the user's current location
   */
  zoomToCurrentLocation() {
    this.#view.zoomToCurrentLocation();
  }
} 