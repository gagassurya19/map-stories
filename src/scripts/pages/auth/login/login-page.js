import Api from '../../../data/api';

export default class LoginPage {
  async render() {
    return `
      <section class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" role="main" aria-label="Login Page">
        <div class="max-w-md w-full space-y-8">
          <div class="bg-white p-8 rounded-lg shadow-sm">
            <div class="text-center">
              <h1 class="text-2xl font-bold text-gray-900 mb-6">Login</h1>
            </div>
            <form id="loginForm" class="space-y-6" aria-label="Login form">
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
              <button 
                type="submit" 
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Login to your account"
              >
                Login
              </button>
            </form>
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

  async afterRender() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const responseData = await Api.login(email, password);

        if (responseData.error === false) {
          // Store user data in localStorage
          localStorage.setItem('user', JSON.stringify({
            id: responseData.loginResult.userId,
            name: responseData.loginResult.name,
            token: responseData.loginResult.token
          }));
          
          alert('Login successful!');
          window.location.hash = '#/stories';
        } else {
          alert(responseData.message || 'Login failed. Please try again.');
        }
      } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred during login. Please try again.');
      }
    });
  }
}
