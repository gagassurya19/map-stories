/**
 * Presenter class for the login page
 * Handles the communication between model and view
 */
export default class LoginPresenter {
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
   * Called after the view is rendered
   */
  async init() {
    // Any additional initialization can go here
  }

  /**
   * Handles the login action
   * @param {string} email - User email
   * @param {string} password - User password
   */
  async handleLogin(email, password) {
    // Basic validation
    if (!email || !password) {
      this.#view.showError('Please enter both email and password');
      return;
    }
    
    try {
      const responseData = await this.#model.login(email, password);

      if (responseData.error === false) {
        // Save user data to localStorage using the model
        this.#model.saveUserData(responseData.loginResult);
        
        // Update the view
        this.#view.showSuccess('Login successful!');
        this.#view.redirectToStories();
      } else {
        this.#view.showError(responseData.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      this.#view.showError('An error occurred during login. Please try again.');
    }
  }
} 