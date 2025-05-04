/**
 * Mengekstrak segmen dari path URL
 * @param {string} path - Path URL yang akan diproses
 * @returns {Object} Objek yang berisi resource dan id
 */
function extractPathnameSegments(path) {
  const splitUrl = path.split('/');

  return {
    resource: splitUrl[1] || null,
    id: splitUrl[2] || null,
  };
}

/**
 * Membangun rute dari segmen path
 * @param {Object} pathSegments - Segmen path yang akan diproses
 * @returns {string} Rute yang sudah dibangun
 */
function constructRouteFromSegments(pathSegments) {
  let pathname = '';

  if (pathSegments.resource) {
    pathname = pathname.concat(`/${pathSegments.resource}`);
  }

  if (pathSegments.id) {
    pathname = pathname.concat('/:id');
  }

  return pathname || '/';
}

/**
 * Mendapatkan pathname aktif dari hash URL
 * @returns {string} Pathname aktif
 */
export function getActivePathname() {
  return location.hash.replace('#', '') || '/';
}

/**
 * Mendapatkan rute aktif berdasarkan hash URL
 * @returns {string} Rute aktif
 */
export function getActiveRoute() {
  const pathname = getActivePathname();
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

/**
 * Memparse pathname aktif menjadi segmen
 * @returns {Object} Segmen pathname aktif
 */
export function parseActivePathname() {
  const pathname = getActivePathname();
  return extractPathnameSegments(pathname);
}

/**
 * Mendapatkan rute dari pathname
 * @param {string} pathname - Pathname yang akan diproses
 * @returns {string} Rute yang sesuai
 */
export function getRoute(pathname) {
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

/**
 * Memparse pathname menjadi segmen
 * @param {string} pathname - Pathname yang akan diproses
 * @returns {Object} Segmen pathname
 */
export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}
