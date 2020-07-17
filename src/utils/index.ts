
const isBrowser = typeof window !== 'undefined';
export default {
  Promise: isBrowser ? window['Promise'] : undefined
};
