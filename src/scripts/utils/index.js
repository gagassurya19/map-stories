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
