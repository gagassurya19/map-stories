export default class HomePresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  async init() {
    console.log('HomePresenter: Initializing...');
    try {
      // The view methods are now called directly in afterRender
      console.log('HomePresenter: Initialization complete');
    } catch (error) {
      console.error('HomePresenter: Error during initialization:', error);
    }
  }
} 