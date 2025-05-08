import Api from '../../../data/api';

export default class LoginPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    console.log('LoginPresenter constructor called');
    this.#model = model;
    this.#view = view;
  }

  async init() {
    console.log('LoginPresenter init called');
    this.#view.setupEventListeners();
  }

  async handleLogin(email, password) {
    console.log('handleLogin called with:', { email });
    try {
      const responseData = await Api.login(email, password);
      console.log('Login response:', responseData);

      if (responseData.error === false) {
        // Menyimpan data user ke localStorage
        localStorage.setItem('user', JSON.stringify({
          id: responseData.loginResult.userId,
          name: responseData.loginResult.name,
          token: responseData.loginResult.token
        }));
        
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