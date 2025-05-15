import Api from '../../../data/api';

/**
 * Model class for the add guest story page
 * Handles data operations and business logic
 */
export default class AddGuestStoryModel {
  /**
   * Adds a new guest story
   * @param {FormData} formData - Form data containing story details
   * @returns {Promise<Object>} Response data with success status
   */
  async addGuestStory(formData) {
    try {
      const responseData = await Api.addGuestStory(formData);

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
      console.error('Error adding guest story:', error);
      throw error;
    }
  }

  /**
   * Validates the guest story input
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