export default class AddGuestStoryPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  async init() {
    this.#view.setupEventListeners();
  }

  async handleSubmit(formData) {
    try {
      await this.#model.addGuestStory(formData);
      this.#view.showSuccess('Guest story added successfully!');
      this.#view.redirectToStories();
    } catch (error) {
      this.#view.showError(error.message);
    }
  }

  async handleImageUpload(file) {
    try {
      const imageUrl = await this.#model.uploadImage(file);
      this.#view.updateImagePreview(imageUrl);
    } catch (error) {
      this.#view.showError(error.message);
    }
  }
} 