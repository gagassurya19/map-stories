class Auth {
  static isAuthenticated() {
    const user = localStorage.getItem('user');
    if (!user) return false;

    try {
      const userData = JSON.parse(user);
      return !!userData.token;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return false;
    }
  }

  static getUser() {
    const user = localStorage.getItem('user');
    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  static logout() {
    localStorage.removeItem('user');
    window.location.hash = '#/';
  }

  static updateNavigation() {
    const authOnlyElements = document.querySelectorAll('.auth-only');
    const guestOnlyElements = document.querySelectorAll('.guest-only');
    const authRequiredLinks = document.querySelectorAll('.auth-required');

    if (this.isAuthenticated()) {
      // Show auth-only elements
      authOnlyElements.forEach(element => {
        element.classList.remove('hidden');
      });
      // Hide guest-only elements
      guestOnlyElements.forEach(element => element.classList.add('hidden'));
      // Enable auth-required links
      authRequiredLinks.forEach(link => {
        link.classList.remove('disabled');
        link.style.pointerEvents = 'auto';
      });
    } else {
      // Hide auth-only elements
      authOnlyElements.forEach(element => element.classList.add('hidden'));
      // Show guest-only elements
      guestOnlyElements.forEach(element => element.classList.remove('hidden'));
      // Disable auth-required links
      authRequiredLinks.forEach(link => {
        link.classList.add('disabled');
        link.style.pointerEvents = 'none';
      });
    }
  }

  static checkAuth() {
    if (!this.isAuthenticated()) {
      window.location.hash = '#/login';
      return false;
    }
    return true;
  }
}

export default Auth; 