import { load } from './modules';
import { getAPIScript, isLoaded, loadAPIScript, setSMIMapOptions } from './script';
import { loadSMIMapCss } from './utils/css';
import utils from './utils/index';
export { getAPIScript, isLoaded, load, loadAPIScript, loadSMIMapCss, setSMIMapOptions, utils };
export { ILoadAPIScriptOptions } from './script';
export default {
  getAPIScript,
  isLoaded,
  load,
  loadAPIScript,
  loadSMIMapCss,
  setSMIMapOptions,
  utils
};
