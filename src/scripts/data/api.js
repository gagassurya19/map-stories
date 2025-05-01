const BASE_URL = 'https://story-api.dicoding.dev/v1';

const ENDPOINTS = {
  LOGIN: `${BASE_URL}/login`,
  REGISTER: `${BASE_URL}/register`,
  STORIES: `${BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${BASE_URL}/stories/${id}`,
  GUEST_STORY: `${BASE_URL}/stories/guest`,
};

class Api {
  static async login(email, password) {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  static async register(name, email, password) {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  }

  static async getStories(page = 1, size = 10, token) {
    const response = await fetch(`${ENDPOINTS.STORIES}?page=${page}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  }

  static async getStoryDetail(id, token) {
    const response = await fetch(ENDPOINTS.STORY_DETAIL(id), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  }

  static async addStory(formData, token) {
    const response = await fetch(ENDPOINTS.STORIES, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return response.json();
  }

  static async addGuestStory(formData) {
    const response = await fetch(ENDPOINTS.GUEST_STORY, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  }
}

export default Api;