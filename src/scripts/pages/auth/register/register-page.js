import '../../../../styles/pages/auth.css';
import Api from '../../../data/api';
import RegisterPresenter from './register-presenter';

/**
 * Kelas RegisterPage
 * Menangani tampilan dan interaksi halaman registrasi
 */
export default class RegisterPage {
  #presenter;

  constructor() {
    this.#presenter = new RegisterPresenter({ model: Api, view: this });
  }

  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  /**
   * Merender konten halaman registrasi
   * @returns {string} HTML string untuk halaman registrasi
   */
  async render() {
    return `
      <!-- Container Utama -->
      <section class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" role="main" aria-label="Registration Page">
        <div class="max-w-md w-full space-y-8">
          <!-- Card Registrasi -->
          <div class="bg-white p-8 rounded-lg shadow-sm">
            <div class="text-center">
              <h1 class="text-2xl font-bold text-gray-900 mb-6">Register</h1>
            </div>
            <!-- Form Registrasi -->
            <form id="registerForm" class="space-y-6" aria-label="Registration form" onsubmit="return false;">
              <!-- Input Nama -->
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  required 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  aria-required="true"
                  autocomplete="name"
                />
              </div>
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
                  minlength="8" 
                  required 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  aria-required="true"
                  autocomplete="new-password"
                />
                <p class="mt-1 text-sm text-gray-500" id="passwordHelp">Password must be at least 8 characters long.</p>
              </div>
              <!-- Tombol Submit -->
              <button 
                type="submit" 
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Create new account"
              >
                Register
              </button>
            </form>
            <!-- Link Login -->
            <div class="mt-4 text-center">
              <p class="text-sm text-gray-600">
                Already have an account? 
                <a href="#/login" class="font-medium text-indigo-600 hover:text-indigo-500" aria-label="Go to login page">
                  Login here
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
   * Mengatur event listener untuk form registrasi
   */
  async afterRender() {
    if (this.#presenter) {
      await this.#presenter.init();
    }
  }

  // View methods that can be called by the presenter
  setupEventListeners() {
    const registerForm = document.getElementById('registerForm');
    
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Prevent form submission
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      if (this.#presenter) {
        await this.#presenter.handleRegister(name, email, password);
      }
    });
  }

  showSuccess(message) {
    alert(message);
  }

  showError(message) {
    alert(message);
  }

  redirectToLogin() {
    window.location.hash = '#/login';
    window.location.reload();
  }
}