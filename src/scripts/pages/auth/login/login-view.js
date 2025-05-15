import '../../../../styles/pages/auth.css';
import LoginModel from './login-model.js';
import LoginPresenter from './login-presenter.js';

/**
 * View class for the login page
 * Handles rendering and UI interactions for the login page
 */
export default class LoginView {
  #presenter;
  #model;

  constructor() {
    // Initialize model and presenter
    this.#model = new LoginModel();
    this.#presenter = new LoginPresenter({
      model: this.#model,
      view: this,
    });
  }

  /**
   * Sets the presenter for this view
   * @param {Object} presenter - The presenter instance
   */
  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  /**
   * Merender konten halaman login
   * @returns {string} HTML string untuk halaman login
   */
  async render() {
    return `
      <!-- Container Utama -->
      <section class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" role="main" aria-label="Login Page">
        <div class="max-w-md w-full space-y-8">
          <!-- Card Login -->
          <div class="bg-white p-8 rounded-lg shadow-sm">
            <div class="text-center">
              <h1 class="text-2xl font-bold text-gray-900 mb-6">Login</h1>
            </div>
            <!-- Form Login -->
            <div id="loginForm" class="space-y-6">
              <!-- Input Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  required 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  aria-required="true"
                  autocomplete="email"
                />
              </div>
              <!-- Input Password -->
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  required 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  aria-required="true"
                  autocomplete="current-password"
                />
              </div>
              <!-- Tombol Submit -->
              <button 
                type="button" 
                id="loginButton"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Login to your account"
              >
                Login
              </button>
            </div>
            <!-- Link Registrasi -->
            <div class="mt-4 text-center">
              <p class="text-sm text-gray-600">
                Don't have an account? 
                <a href="#/register" class="font-medium text-indigo-600 hover:text-indigo-500" aria-label="Go to registration page">
                  Register here
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Menangani interaksi setelah halaman dirender
   * Mengatur event listener untuk form login
   */
  async afterRender() {
    this.setupEventListeners();
  }

  /**
   * Sets up all event listeners for the login form
   */
  setupEventListeners() {
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');
    
    if (!loginForm) {
      console.error('Login form not found!');
      return;
    }

    if (!loginButton) {
      console.error('Login button not found!');
      return;
    }

    // Add click event to button
    loginButton.addEventListener('click', (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      if (this.#presenter) {
        this.#presenter.handleLogin(email, password);
      } else {
        console.error('Presenter not set!');
      }
    });

    // Also keep form submit handler as backup
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      if (this.#presenter) {
        this.#presenter.handleLogin(email, password);
      } else {
        console.error('Presenter not set!');
      }
    });
  }

  /**
   * Shows a success message to the user
   * @param {string} message - Success message to display
   */
  showSuccess(message) {
    alert(message);
  }

  /**
   * Shows an error message to the user
   * @param {string} message - Error message to display
   */
  showError(message) {
    alert(message);
  }

  /**
   * Redirects the user to the stories page
   */
  redirectToStories() {
    window.location.hash = '#/stories';
    window.location.reload();
  }
}
