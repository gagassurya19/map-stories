import { saveData, getAllData, getDataById, deleteData, saveImage, getImage } from '../idb';

/**
 * URL dasar untuk API Story
 */
const BASE_URL = 'https://story-api.dicoding.dev/v1';

/**
 * VAPID public key untuk push notification
 */
const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

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
  SUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
};

/**
 * Mengambil token akses dari localStorage
 * @returns {string|null} Token akses atau null jika tidak ada
 */
function getAccessToken() {
  const user = localStorage.getItem('user');
  if (!user) return null;

  try {
    const userData = JSON.parse(user);
    return userData.token;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

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
   * Mengambil dan menyimpan gambar ke IndexedDB
   * @param {string} url - URL gambar
   * @returns {Promise<Blob>} Blob gambar
   */
  static async fetchAndCacheImage(url) {
    try {
      // Cek apakah gambar sudah ada di cache
      const cachedBlob = await getImage(url);
      if (cachedBlob) {
        return cachedBlob;
      }

      // Jika tidak ada di cache, ambil dari server
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }

      const blob = await response.blob();
      await saveImage(url, blob);
      return blob;
    } catch (error) {
      console.error('Error fetching and caching image:', error);
      return null;
    }
  }

  /**
   * Mengambil gambar dari cache atau dari server
   * @param {string} url - URL gambar
   * @returns {Promise<string>} URL gambar (blob URL jika dari cache)
   */
  static async getImageUrl(url) {
    try {
      // Coba ambil dari cache dulu
      const cachedBlob = await getImage(url);
      if (cachedBlob) {
        return URL.createObjectURL(cachedBlob);
      }

      // Jika tidak ada di cache, ambil dari server
      const blob = await this.fetchAndCacheImage(url);
      if (blob) {
        return URL.createObjectURL(blob);
      }

      return url; // Fallback ke URL asli
    } catch (error) {
      console.error('Error getting image URL:', error);
      return url;
    }
  }

  /**
   * Mengambil daftar cerita
   * @param {number} page - Nomor halaman
   * @param {number} size - Jumlah cerita per halaman
   * @param {string} token - Token autentikasi
   * @returns {Promise<Object>} Response dari API
   */
  static async getStories(page = 1, size = 10, token) {
    try {
      const response = await fetch(`${ENDPOINTS.STORIES}?page=${page}&size=${size}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      // Save stories to IndexedDB in stories store
      const stories = responseJson.listStory;
      for (const story of stories) {
        await saveData(story, 'stories');
        if (story.photoUrl) {
          await this.fetchAndCacheImage(story.photoUrl);
        }
      }
      
      return responseJson;
    } catch (error) {
      if (!navigator.onLine) {
        // Get cached stories from IndexedDB
        const cachedStories = await getAllData('stories');
        return {
          error: false,
          message: 'Success',
          listStory: cachedStories,
        };
      }
      throw error;
    }
  }

  /**
   * Mengambil detail cerita berdasarkan ID
   * @param {string} id - ID cerita
   * @param {string} token - Token autentikasi
   * @returns {Promise<Object>} Response dari API
   */
  static async getStoryDetail(id, token) {
    try {
      const response = await fetch(ENDPOINTS.STORY_DETAIL(id), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const responseJson = await response.json();
      
      // Cache the story detail and its image in IndexedDB
      if (responseJson.story) {
        await saveData(responseJson.story);
        if (responseJson.story.photoUrl) {
          await this.fetchAndCacheImage(responseJson.story.photoUrl);
        }
      }
      
      return responseJson;
    } catch (error) {
      console.error('Error fetching story detail:', error);
      // If offline, try to get data from IndexedDB
      const cachedStory = await getDataById(id);
      if (cachedStory) {
        return {
          error: false,
          message: 'Success',
          story: cachedStory,
        };
      }
      return {
        error: true,
        message: 'Story not found',
      };
    }
  }

  /**
   * Menambahkan cerita baru (untuk user yang sudah login)
   * @param {FormData} formData - Data cerita dalam bentuk FormData
   * @param {string} token - Token autentikasi
   * @returns {Promise<Object>} Response dari API
   */
  static async addStory(formData, token) {
    try {
      console.log('Sending story to API:', {
        description: formData.get('description'),
        hasPhoto: formData.has('photo'),
        hasLocation: formData.has('lat') && formData.has('lon')
      });

      const response = await fetch(ENDPOINTS.STORIES, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseJson = await response.json();
      console.log('API response:', responseJson);
      
      // Cache the new story in IndexedDB
      if (responseJson.story) {
        await saveData(responseJson.story);
      }
      
      return responseJson;
    } catch (error) {
      console.error('Error adding story:', error);
      return {
        error: true,
        message: error.message || 'Failed to add story',
      };
    }
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

  static async subscribePushNotification({ endpoint, keys: { p256dh, auth } }) {
    const accessToken = getAccessToken();
    if (!accessToken) {
      return {
        error: true,
        message: 'User not authenticated',
      };
    }

    const data = JSON.stringify({
      endpoint,
      keys: {
        p256dh,
        auth,
      },
    });
   
    try {
      const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: data,
      });
      const json = await fetchResponse.json();
     
      return json;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return {
        error: true,
        message: 'Failed to subscribe to push notifications',
      };
    }
  }
   
  static async unsubscribePushNotification({ endpoint }) {
    const accessToken = getAccessToken();
    if (!accessToken) {
      return {
        error: true,
        message: 'User not authenticated',
      };
    }

    const data = JSON.stringify({ endpoint });
   
    try {
      const fetchResponse = await fetch(ENDPOINTS.UNSUBSCRIBE, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: data,
      });
      const json = await fetchResponse.json();
     
      return json;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return {
        error: true,
        message: 'Failed to unsubscribe from push notifications',
      };
    }
  }
}

export default Api;