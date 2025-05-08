export default class DetailStoryPresenter {
  #storyId;
  #model;
  #view;

  constructor(storyId, { model, view }) {
    this.#storyId = storyId;
    this.#model = model;
    this.#view = view;
  }

  async init() {
    try {
      const story = await this.#model.getStoryById(this.#storyId);
      this.#view.showStory(story);
      this.#view.setupEventListeners();
    } catch (error) {
      this.#view.showError(error.message);
    }
  }

  async handleLike() {
    try {
      await this.#model.likeStory(this.#storyId);
      const updatedStory = await this.#model.getStoryById(this.#storyId);
      this.#view.updateLikeButton(updatedStory);
    } catch (error) {
      this.#view.showError(error.message);
    }
  }
} 