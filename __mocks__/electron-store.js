let values = {};

class Store {
  static __initialize(initialValues) {
    Object.assign(values, initialValues);
  }

  static __reset() {
    values = {};
  }

  constructor({ encryptionKey }) {
    this.encryptionKey = encryptionKey;
  }

  get = (key) => {
    console.log('[electron-store] Using mocked get function');
    return values[key];
  }

  has = (key) => {
    console.log('[electron-store] Using mocked has function');
    return Object.hasOwnProperty.call(values, key);
  }

  set = (key, value) => {
    console.log('[electron-store] Using mocked set function');
    values[key] = value;
  }

  clear = () => Store.__reset();
}

module.exports = Store;
