const dbName = 'mapnotes-db';
const dbVersion = 1;
const objectStoreName = 'notes';
const imageStoreName = 'images';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = (event) => {
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(objectStoreName)) {
        db.createObjectStore(objectStoreName, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(imageStoreName)) {
        db.createObjectStore(imageStoreName, { keyPath: 'url' });
      }
    };
  });
};

const saveData = async (data) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(objectStoreName, 'readwrite');
    const store = transaction.objectStore(objectStoreName);
    const request = store.put(data);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Error saving data');
  });
};

const saveImage = async (url, imageBlob) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(imageStoreName, 'readwrite');
    const store = transaction.objectStore(imageStoreName);
    const request = store.put({ url, blob: imageBlob });

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Error saving image');
  });
};

const getImage = async (url) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(imageStoreName, 'readonly');
    const store = transaction.objectStore(imageStoreName);
    const request = store.get(url);

    request.onsuccess = () => resolve(request.result?.blob);
    request.onerror = () => reject('Error getting image');
  });
};

const getAllData = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(objectStoreName, 'readonly');
    const store = transaction.objectStore(objectStoreName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Error getting data');
  });
};

const getDataById = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(objectStoreName, 'readonly');
    const store = transaction.objectStore(objectStoreName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Error getting data');
  });
};

const deleteData = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(objectStoreName, 'readwrite');
    const store = transaction.objectStore(objectStoreName);
    const request = store.delete(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Error deleting data');
  });
};

export { saveData, getAllData, getDataById, deleteData, saveImage, getImage }; 