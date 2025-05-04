import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
      // Update aria-expanded attribute
      const isExpanded = this.#navigationDrawer.classList.contains('open');
      this.#drawerButton.setAttribute('aria-expanded', isExpanded);
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
        this.#drawerButton.setAttribute('aria-expanded', 'false');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
          this.#drawerButton.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    // Create animation for page transition
    const animation = this.#content.animate([
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(20px)' }
    ], {
      duration: 200,
      easing: 'ease-out'
    });

    // Wait for the fade out animation
    await animation.finished;

    // Render the page content
    this.#content.innerHTML = await page.render();
    
    // Create animation for new content
    const newContent = this.#content.firstElementChild;
    if (newContent) {
      const enterAnimation = newContent.animate([
        { opacity: 0, transform: 'translateY(20px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], {
        duration: 300,
        easing: 'ease-out'
      });
      await enterAnimation.finished;
    }

    await page.afterRender();
  }
}

export default App;
