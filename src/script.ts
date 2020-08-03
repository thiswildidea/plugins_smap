
import Mapcofig from './config/Mapcofig';
import { loadSMIMapCss } from './utils/css';
import utils from './utils/index';
import { getCdnUrl, parseVersionnew } from './utils/url';

let defaultOptions: ILoadAPIScriptOptions = {};

function createScript(url) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  script.setAttribute('data-shsmi', 'loading');
  return script;
}

function handleScriptLoad(script, callback, errback?) {
  let onScriptError;
  if (errback) {
    onScriptError = handleScriptError(script, errback);
  }
  const onScriptLoad = () => {
    callback(script);
    script.removeEventListener('load', onScriptLoad, false);
    if (onScriptError) {
      script.removeEventListener('error', onScriptError, false);
    }
  };
  script.addEventListener('load', onScriptLoad, false);
}

function handleScriptError(script, callback) {
  const onScriptError = (e) => {
    callback(e.error || new Error(`There was an error attempting to load ${script.src}`));
    script.removeEventListener('error', onScriptError, false);
  };
  script.addEventListener('error', onScriptError, false);
  return onScriptError;
}

export interface ILoadAPIScriptOptions {
  version?: string;
  url?: string;
  css?: string | boolean;
  dojoConfig?: { [propName: string]: any };
  insertCssBefore?: string;
}

export function setSMIMapOptions(options: ILoadAPIScriptOptions = {}): void {
  defaultOptions = options;
}

export function getAPIScript() {
  return document.querySelector('script[data-shsmi]') as HTMLScriptElement;
}

export function isLoaded() {
  const globalRequire = window['require'];
  return globalRequire && globalRequire.on;
}

export function loadAPIScript(options: ILoadAPIScriptOptions = {}): Promise<HTMLScriptElement> {
  const opts: ILoadAPIScriptOptions = {};
  [defaultOptions, options].forEach((obj) => {
    for (const prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        opts[prop] = obj[prop];
      }
    }
  });
  const version = opts.version;
  const url = opts.url || getCdnUrl(version);
  return new utils.Promise((resolve, reject) => {
    let script = getAPIScript();
    if (script) {
      const src = script.getAttribute('src');
      if (src !== url) {
        reject(new Error(`The ArcGIS API for JavaScript is already loaded (${src}).`));
      } else {
        if (isLoaded()) {
          resolve(script);
        } else {
          handleScriptLoad(script, resolve, reject);
        }
      }
    } else {
      if (isLoaded()) {
        reject(new Error(`The ArcGIS API for JavaScript is already loaded.`));
      } else {
        const css = opts.css;
        if (css) {
          const useVersion = css === true;
          loadSMIMapCss(useVersion ? version : (css as string), opts.insertCssBefore);
        } else {
          loadSMIMapCss(null, opts.insertCssBefore);
        }
        if (opts.dojoConfig) {
          window['dojoConfig'] = opts.dojoConfig;
        } else {
           const dojoConfig = {
              async: true,
              packages: [{
                location: Mapcofig.jsapi + '/extensions',
                name: 'smiapi'
              }, {
                  location: Mapcofig.jsapi + '/extensions/geolocation',
                  name: 'geolocate',
                  main: "geolocate"
                }, {
                  location: Mapcofig.jsapi + '/extensions/heatmaputils',
                  name: 'heatmap',
                  main: "heatmap"
                }],
              deps: ['@dojo/framework/shim/main'],
              has: {
                'esri-promise-compatibility': 1,
                'esri-featurelayer-webgl': 1
              }
            };
           window['dojoConfig'] = dojoConfig;
        }
        script = createScript(url);
        handleScriptLoad(script, () => {
          script.setAttribute('data-shsmi', 'loaded');
          resolve(script);
        }, reject);
        document.head.appendChild(script);
      }
    }
  });
}
