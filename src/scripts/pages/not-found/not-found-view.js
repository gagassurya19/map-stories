import '../../../styles/pages/not-found.css';

/**
 * Class NotFoundView
 * Handles rendering and UI interactions for the 404 page
 */
export default class NotFoundView {
  /**
   * Renders the 404 page content
   * @returns {string} HTML string for the 404 page
   */
  async render() {
    return `
      <div class="not-found-container">
        <div class="not-found-content">
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>The page you are looking for doesn't exist or has been moved.</p>
          <a href="#/" class="back-home-btn">Back to Home</a>
        </div>
      </div>
    `;
  }

  /**
   * Lifecycle method called after the page is rendered
   */
  async afterRender() {
    // No additional setup needed for this page
  }
} 