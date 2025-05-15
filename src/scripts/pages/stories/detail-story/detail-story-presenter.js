/**
 * Detail Story Presenter class
 * Handles communication between model and view for the detail story page
 */
export default class DetailStoryPresenter {
  #model;
  #view;
  #story;

  /**
   * Constructor for DetailStoryPresenter
   * @param {Object} param0 - Object containing model and view
   * @param {Object} param0.model - The detail story model
   * @param {Object} param0.view - The detail story view
   */
  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
    this.#story = null;
    
    // Connect view to presenter
    this.#view.setPresenter(this);
  }

  /**
   * Initializes the presenter
   * Checks user authentication and loads story details
   * @param {string} storyId - The ID of the story to load
   */
  async init(storyId) {
    if (!this.#model.isAuthenticated()) {
      window.location.hash = '#/login';
      return;
    }

    await this.loadStoryDetail(storyId);
  }

  /**
   * Loads story details from the model and updates the view
   * @param {string} storyId - The ID of the story to load
   */
  async loadStoryDetail(storyId) {
    try {
      const result = await this.#model.loadStoryDetail(storyId);
      
      if (result.success) {
        this.#story = result.data;
        this.#view.displayStoryDetail();
        
        if (this.hasLocation()) {
          this.#view.initMap();
        }
      } else {
        this.#view.showError(result.message || 'Failed to load story details');
      }
    } catch (error) {
      this.#view.showError('An error occurred while loading story details');
    }
  }

  /**
   * Gets the currently loaded story
   * @returns {Object} The story data
   */
  getStory() {
    return this.#story;
  }

  /**
   * Checks if the story has location data
   * @returns {boolean} True if the story has location data
   */
  hasLocation() {
    return this.#story && 
           this.#story.lat && 
           this.#story.lon && 
           !isNaN(parseFloat(this.#story.lat)) && 
           !isNaN(parseFloat(this.#story.lon));
  }

  /**
   * Gets the coordinates of the story location
   * @returns {Object} Object containing lat and lon
   */
  getCoordinates() {
    if (!this.hasLocation()) return null;
    
    return {
      lat: parseFloat(this.#story.lat),
      lon: parseFloat(this.#story.lon)
    };
  }
} 