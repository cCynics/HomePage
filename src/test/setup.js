import '@testing-library/jest-dom/vitest'

// Polyfill localStorage for jsdom
if (!global.localStorage) {
  const store = {}
  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString() },
    removeItem: (key) => { delete store[key] },
    clear: () => { Object.keys(store).forEach(key => delete store[key]) },
    key: (index) => Object.keys(store)[index] || null,
    get length() { return Object.keys(store).length },
  }
}
