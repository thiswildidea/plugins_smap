import { getAPIScript, ILoadAPIScriptOptions, isLoaded, loadAPIScript } from './script';
import utils from './utils/index';

function requireModules<T extends any[] = any[]>(modules: string[]): Promise<T> {
  return new utils.Promise((resolve, reject) => {
    const errorHandler = window['require'].on('error', reject);
    window['require'](modules, (...args) => {
      errorHandler.remove();
      resolve(args as T);
    });
  });
}

export function load<T extends any[] = any[]>(modules: string[], loadAPIScriptOptions:
ILoadAPIScriptOptions = {}):
Promise<T> {
  if (!isLoaded()) {
    const script = getAPIScript();
    const src = script && script.getAttribute('src');
    if (!loadAPIScriptOptions.url && src) {
      loadAPIScriptOptions.url = src;
    }
    return loadAPIScript(loadAPIScriptOptions).then(() => requireModules<T>(modules));
  } else {
    return requireModules(modules);
  }
}
