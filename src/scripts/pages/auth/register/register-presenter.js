import Api from '../../../data/api';

export default class RegisterPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  async init() {
    this.#view.setupEventListeners();
  }

  async handleRegister(name, email, password) {
    try {
      const responseData = await Api.register(name, email, password);

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