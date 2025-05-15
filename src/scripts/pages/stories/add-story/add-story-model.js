import Api from '../../../data/api';
import Auth from '../../../utils/auth';

/**
 * Model class for the add story page
 * Handles data operations and business logic
 */
export default class AddStoryModel {
  /**
   * Checks if the user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  isAuthenticated() {
    return Auth.checkAuth();
  }

  /**
   * Gets the current user data
   * @returns {Object|null} User data or null if not authenticated
   */
  getUserData() {
    return JSON.parse(localStorage.getItem('user'));
  }

  /**
   * Adds a new story
   * @param {FormData} formData - Form data containing story details
   * @returns {Promise<Object>} Response data with success status
   */
  async addStory(formData) {
    const user = this.getUserData();
    
    if (!user || !user.token) {
      throw new Error('User not authenticated');
    }

    try {
      const responseData = await Api.addStory(formData, user.token);

      if (!responseData.error) {
        return {
          success: true,
          message: 'Story added successfully'
        };
      } else {
        return {
          success: false,
          message: responseData.message || 'Failed to add story'
        };
      }
    } catch (error) {
      console.error('Error adding story:', error);
      throw error;
    }
  }

  /**
   * Validates the story input
   * @param {Object} data - Story data to validate
   * @returns {Object} Validation result with success status and message
   */
  validateStoryInput(data) {
    const { description, file, capturedBlob, includeLocation, lat, lon } = data;

    if (!description) {
      return {
        valid: false,
        message: 'Please enter a story description'
      };
    }

    if (!file && !capturedBlob) {
      return {
        valid: false,
        message: 'Please select or capture a photo'
      };
    }

    if (file && file.size > 1024 * 1024) {
      return {
        valid: false,
        message: 'File must be less than 1MB'
      };
    }

    if (includeLocation && (!lat || !lon)) {
      return {
        valid: false,
        message: 'Please select a location on the map or use current location'
      };
    }

    return {
      valid: true
    };
  }
} 