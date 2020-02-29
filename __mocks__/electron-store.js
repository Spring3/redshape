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
    // eslint-disable-next-line
    console.log('[electron-store] Using mocked get function');
    return values[key];
  }

  has = (key) => {
    // eslint-disable-next-line
    console.log('[electron-store] Using mocked has function');
    return Object.hasOwnProperty.call(values, key);
  }

  set = (key, value) => {
    // eslint-disable-next-line
    console.log('[electron-store] Using mocked set function');
    values[key] = value;
  }

  delete = (key) => delete values[key];

  clear = () => Store.__reset();
}

module.exports = Store;
