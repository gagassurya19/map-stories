export default class StoriesPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  async init() {
    try {
      const stories = await this.#model.getStories();
      this.#view.showStories(stories);
      this.#view.setupEventListeners();
    } catch (error) {
      this.#view.showError(error.message);
    }
  }

  async handleSearch(query) {
    try {
      const stories = await this.#model.searchStories(query);
      this.#view.showStories(stories);
    } catch (error) {
      this.#view.showError(error.message);
    }
  }
} 