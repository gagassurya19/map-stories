import Api from '../../../data/api';
import Auth from '../../../utils/auth';
import { getAllData, deleteData, saveData } from '../../../idb';

/**
 * Model class for the add story page
 * Handles data operations and business logic
 */
export default class AddStoryModel {
  constructor() {
    this._offlineStories = [];
  }

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
      console.log('Sending story to API with token:', user.token);
      const responseData = await Api.addStory(formData, user.token);
      console.log('API response:', responseData);

      if (!responseData.error) {
        // If this was an offline story, delete it from IndexedDB
        const description = formData.get('description');
        const stories = await getAllData('offline-stories');
        const offlineStory = stories.find(story => 
          story.isOffline && story.description === description
        );
        
        if (offlineStory) {
          console.log('Deleting offline story from IndexedDB:', offlineStory.id);
          await deleteData(offlineStory.id, 'offline-stories');
          console.log('Successfully deleted offline story from IndexedDB');
        }

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

  async syncOfflineStories() {
    try {
      // Get all offline stories
      const offlineStories = await getAllData('offline-stories');
      
      for (const story of offlineStories) {
        try {
          // Create FormData from offline story
          const formData = new FormData();
          formData.append('description', story.description);
          
          // Convert base64 to Blob if needed
          if (story.photoUrl && story.photoUrl.startsWith('data:')) {
            const response = await fetch(story.photoUrl);
            const blob = await response.blob();
            formData.append('photo', blob, 'photo.jpg');
          }
          
          // Add location if available
          if (story.lat && story.lon) {
            formData.append('lat', story.lat);
            formData.append('lon', story.lon);
          }

          // Try to submit the story
          const user = this.getUserData();
          if (user && user.token) {
            await Api.addStory(formData, user.token);
            // If successful, delete from IndexedDB
            await deleteData(story.id, 'offline-stories');
          }
        } catch (error) {
          console.error('Error syncing story:', error);
          // Continue with next story even if one fails
          continue;
        }
      }
    } catch (error) {
      console.error('Error in syncOfflineStories:', error);
      throw error;
    }
  }
} 