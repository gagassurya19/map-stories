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
        await this.#view.displayStories();
        await this.#view.updateMap();
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
    try {
      this.#model.nextPage();
      await this.loadStories();
    } catch (error) {
      console.error('Error in loadMoreStories:', error);
      this.#view.showError('An error occurred while loading more stories');
    }
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
  async resetMapView() {
    try {
      this.#view.resetMapView();
      await this.#view.updateMap();
    } catch (error) {
      console.error('Error in resetMapView:', error);
      this.#view.showError('An error occurred while resetting map view');
    }
  }

  /**
   * Zooms to the user's current location
   */
  async zoomToCurrentLocation() {
    try {
      await this.#view.zoomToCurrentLocation();
      await this.#view.updateMap();
    } catch (error) {
      console.error('Error in zoomToCurrentLocation:', error);
      this.#view.showError('An error occurred while zooming to current location');
    }
  }
} 