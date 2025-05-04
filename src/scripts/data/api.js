/**
 * URL dasar untuk API Story
 */
const BASE_URL = 'https://story-api.dicoding.dev/v1';

/**
 * Konfigurasi endpoint API
 * Berisi semua endpoint yang digunakan dalam aplikasi
 */
const ENDPOINTS = {
  LOGIN: `${BASE_URL}/login`,
  REGISTER: `${BASE_URL}/register`,
  STORIES: `${BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${BASE_URL}/stories/${id}`,
  GUEST_STORY: `${BASE_URL}/stories/guest`,
};

/**
 * Kelas Api
 * Menangani semua interaksi dengan API Story
 */
class Api {
  /**
   * Melakukan login user
   * @param {string} email - Email user
   * @param {string} password - Password user
   * @returns {Promise<Object>} Response dari API
   */
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

  /**
   * Mendaftarkan user baru
   * @param {string} name - Nama user
   * @param {string} email - Email user
   * @param {string} password - Password user
   * @returns {Promise<Object>} Response dari API
   */
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

  /**
   * Mengambil daftar cerita
   * @param {number} page - Nomor halaman
   * @param {number} size - Jumlah cerita per halaman
   * @param {string} token - Token autentikasi
   * @returns {Promise<Object>} Response dari API
   */
  static async getStories(page = 1, size = 10, token) {
    const response = await fetch(`${ENDPOINTS.STORIES}?page=${page}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  }

  /**
   * Mengambil detail cerita berdasarkan ID
   * @param {string} id - ID cerita
   * @param {string} token - Token autentikasi
   * @returns {Promise<Object>} Response dari API
   */
  static async getStoryDetail(id, token) {
    const response = await fetch(ENDPOINTS.STORY_DETAIL(id), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  }

  /**
   * Menambahkan cerita baru (untuk user yang sudah login)
   * @param {FormData} formData - Data cerita dalam bentuk FormData
   * @param {string} token - Token autentikasi
   * @returns {Promise<Object>} Response dari API
   */
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

  /**
   * Menambahkan cerita baru (untuk tamu)
   * @param {FormData} formData - Data cerita dalam bentuk FormData
   * @returns {Promise<Object>} Response dari API
   */
  static async addGuestStory(formData) {
    const response = await fetch(ENDPOINTS.GUEST_STORY, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  }
}

export default Api;