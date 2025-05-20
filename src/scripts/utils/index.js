/**
 * Memformat tanggal ke format yang lebih mudah dibaca
 * @param {string|Date} date - Tanggal yang akan diformat
 * @param {string} locale - Lokal yang digunakan untuk format (default: 'en-US')
 * @param {Object} options - Opsi tambahan untuk format tanggal
 * @returns {string} Tanggal yang sudah diformat
 */
export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

/**
 * Fungsi untuk menunda eksekusi kode
 * @param {number} time - Waktu penundaan dalam milidetik (default: 1000ms)
 * @returns {Promise} Promise yang akan resolve setelah waktu yang ditentukan
 */
export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function convertBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isServiceWorkerAvailable() {
  return 'serviceWorker' in navigator;
}
 
export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable()) {
    console.log('Service Worker API unsupported');
    return;
  }
 
  try {
    const registration = await navigator.serviceWorker.register('/sw.bundle.js');
    console.log('Service worker telah terpasang dengan cache-first strategy', registration);
  } catch (error) {
    console.log('Failed to install service worker:', error);
  }
}