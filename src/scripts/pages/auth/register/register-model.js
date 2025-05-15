import Api from '../../../data/api';

/**
 * Model class for the register page
 * Handles data operations and business logic for user registration
 */
export default class RegisterModel {
  constructor() {
    // No need to store api as a property, we'll use it directly
  }

  /**
   * Performs user registration
   * @param {string} name - User name
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Registration response data
   */
  async register(name, email, password) {
    try {
      const responseData = await Api.register(name, email, password);
      return responseData;
    } catch (error) {
      console.error('Error in register model:', error);
      throw error;
    }
  }
} 