import Api from '../../data/api';

export default class StoriesPage {
  async render() {
    return `
      <section class="container">
        <div class="row">
          <div class="col-12">
            <h1 class="text-center my-4">Stories</h1>
          </div>
        </div>
        <div class="row" id="storiesList">
          <!-- Stories will be loaded here -->
        </div>
        <div class="row mt-4">
          <div class="col-12 text-center">
            <button id="loadMoreBtn" class="btn btn-primary">Load More</button>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.page = 1;
    this.size = 10;
    this.stories = [];
    
    await this.loadStories();
    this.setupLoadMore();
  }

  async loadStories() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      alert('Please login first');
      window.location.hash = '#/login';
      return;
    }

    try {
      const responseData = await Api.getStories(this.page, this.size, user.token);

      if (responseData.error === false) {
        this.stories = [...this.stories, ...responseData.listStory];
        this.displayStories();
      } else {
        alert(responseData.message || 'Failed to load stories');
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      alert('An error occurred while loading stories');
    }
  }

  displayStories() {
    const storiesList = document.getElementById('storiesList');
    storiesList.innerHTML = this.stories.map(story => `
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <img src="${story.photoUrl}" class="card-img-top" alt="${story.name}'s story" style="height: 200px; object-fit: cover;">
          <div class="card-body">
            <h5 class="card-title">${story.name}</h5>
            <p class="card-text">${story.description}</p>
            <p class="card-text"><small class="text-muted">Posted on ${new Date(story.createdAt).toLocaleDateString()}</small></p>
            ${story.lat && story.lon ? `
              <p class="card-text">
                <small class="text-muted">
                  Location: ${story.lat}, ${story.lon}
                </small>
              </p>
            ` : ''}
            <a href="#/stories/${story.id}" class="btn btn-primary mt-2">View Details</a>
          </div>
        </div>
      </div>
    `).join('');
  }

  setupLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.addEventListener('click', async () => {
      this.page++;
      await this.loadStories();
    });
  }
}
