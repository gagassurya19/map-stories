import Auth from './utils/auth';

const app = {
  async init() {
    // Initialize authentication
    Auth.updateNavigation();

    // Add logout event listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
        Auth.updateNavigation();
      });
    }

    // ... rest of init code ...
  }
};

export default app; 