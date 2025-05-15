import Api from '../../../data/api';

/**
 * Model class for the login page
 * Handles data operations and business logic for user authentication
 */
export default class LoginModel {
  constructor() {
    // No need to store api as a property, we'll use it directly
  }

  /**
   * Performs login operation
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login response data
   */
  async login(email, password) {
    try {
      const responseData = await Api.login(email, password);
      return responseData;
    } catch (error) {
      console.error('Error in login model:', error);
      throw error;
    }
  }

  /**
   * Saves user data to localStorage after successful login
   * @param {Object} userData - User data to store
   */
  saveUserData(userData) {
    localStorage.setItem('user', JSON.stringify({
      id: userData.userId,
      name: userData.name,
      token: userData.token
    }));
  }
}
