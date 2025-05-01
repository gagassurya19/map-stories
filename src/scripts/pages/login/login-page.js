import Api from '../../data/api';

export default class LoginPage {
  async render() {
    return `
      <section class="container">
        <div class="row justify-content-center">
          <div class="col-md-6">
            <div class="card mt-5">
              <div class="card-body">
                <h1 class="text-center mb-4">Login</h1>
                <form id="loginForm">
                  <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email" required>
                  </div>
                  <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" required>
                  </div>
                  <button type="submit" class="btn btn-primary w-100">Login</button>
                </form>
                <div class="text-center mt-3">
                  <p>Don't have an account? <a href="#/register">Register here</a></p>
                </div>
              </div>
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
