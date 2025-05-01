import Api from '../../data/api';

export default class DetailStoryPage {
  async render() {
    return `
      <section class="container">
        <div class="row justify-content-center">
          <div class="col-md-8">
            <div class="card mt-4">
              <div class="card-body">
                <div id="storyDetail">
                  <!-- Story details will be loaded here -->
                </div>
                <div class="text-center mt-3">
                  <a href="#/stories" class="btn btn-primary">Back to Stories</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const storyId = window.location.hash.split('/')[2];
    await this.loadStoryDetail(storyId);
  }

  async loadStoryDetail(storyId) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      alert('Please login first');
      window.location.hash = '#/login';
      return;
    }

    try {
      const responseData = await Api.getStoryDetail(storyId, user.token);

      if (responseData.error === false) {
        this.displayStoryDetail(responseData.story);
      } else {
        alert(responseData.message || 'Failed to load story details');
      }
    } catch (error) {
      console.error('Error loading story detail:', error);
      alert('An error occurred while loading story details');
    }
  }

  displayStoryDetail(story) {
    const storyDetail = document.getElementById('storyDetail');
    storyDetail.innerHTML = `
      <img src="${story.photoUrl}" class="img-fluid rounded mb-4" alt="${story.name}'s story">
      <h2 class="mb-3">${story.name}</h2>
      <p class="mb-4">${story.description}</p>
      <p class="text-muted mb-3">
        <small>Posted on ${new Date(story.createdAt).toLocaleDateString()}</small>
      </p>
      ${story.lat && story.lon ? `
        <div class="mb-3">
          <h5>Location</h5>
          <p class="mb-0">Latitude: ${story.lat}</p>
          <p class="mb-0">Longitude: ${story.lon}</p>
        </div>
      ` : ''}
    `;
  }
} 