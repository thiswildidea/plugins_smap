export const jaspi3xUrl = 'base/test/mocks/jsapi3x.js';

export function stubRequire() {
  window.require = function(moduleNames, callback) {
    if (callback) {
      callback.apply(this, moduleNames);
    }
  };
  window.require.on = (name, callback) => {
    return {
      remove() {}
    };
  };
}
export function removeRequire() {
  delete window.require;
}
