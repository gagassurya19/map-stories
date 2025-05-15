/**
 * Presenter class for the register page
 * Handles the communication between model and view
 */
export default class RegisterPresenter {
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
    // Any additional initialization can go here
  }

  /**
   * Handles the registration action
   * @param {string} name - User name
   * @param {string} email - User email
   * @param {string} password - User password
   */
  async handleRegister(name, email, password) {
    // Basic validation
    if (!name || !email || !password) {
      this.#view.showError('Please fill in all fields');
      return;
    }
    
    if (password.length < 8) {
      this.#view.showError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      const responseData = await this.#model.register(name, email, password);

      if (responseData.error === false) {
        this.#view.showSuccess('Registration successful! Please login.');
        this.#view.redirectToLogin();
      } else {
        this.#view.showError(responseData.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      this.#view.showError('An error occurred during registration. Please try again.');
    }
  }
} 