// A safe, robust, try-catch protected storage utility that falls back
// to in-memory storage if localStorage is disabled, blocked, or throws SecurityError
// in Chromium-based browsers like Chrome/Edge.

const isLocalStorageAvailable = () => {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    const retrieved = window.localStorage.getItem(testKey);
    window.localStorage.removeItem(testKey);
    return retrieved === testKey;
  } catch (e) {
    return false;
  }
};

// In-memory memory-store fallback
const memoryStore = {};

export const safeStorage = {
  getItem: (key) => {
    try {
      if (isLocalStorageAvailable()) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn(`safeStorage.getItem failed for key "${key}", falling back to in-memory:`, e);
    }
    return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null;
  },

  setItem: (key, value) => {
    try {
      if (isLocalStorageAvailable()) {
        window.localStorage.setItem(key, String(value));
        return;
      }
    } catch (e) {
      console.warn(`safeStorage.setItem failed for key "${key}", falling back to in-memory:`, e);
    }
    memoryStore[key] = String(value);
  },

  removeItem: (key) => {
    try {
      if (isLocalStorageAvailable()) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      console.warn(`safeStorage.removeItem failed for key "${key}", falling back to in-memory:`, e);
    }
    delete memoryStore[key];
  },

  clear: () => {
    try {
      if (isLocalStorageAvailable()) {
        window.localStorage.clear();
        return;
      }
    } catch (e) {
      console.warn("safeStorage.clear failed, clearing in-memory:", e);
    }
    for (const key in memoryStore) {
      if (Object.prototype.hasOwnProperty.call(memoryStore, key)) {
        delete memoryStore[key];
      }
    }
  }
};

export default safeStorage;
