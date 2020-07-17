import Mapcofig from '../config/Mapcofig';
const DEFAULT_VERSION = Mapcofig.jsapiversion4X;
const NEXT = 'next';

export function parseVersion(version) {
  if (version === null) {
    version = DEFAULT_VERSION;
  }
  if (version.toString().toLowerCase() === NEXT) {
    return NEXT;
  }

  const match = version && version.match(/^(\d)\.(\d+)/);
  return match && {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10)
  };
}

export function parseVersionnew(version) {
  if (version === null) {
    version = DEFAULT_VERSION;
  }
  const match = version && version.match(/^(\d)\.(\d+)/);
  return match && {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10)
  };
}

export function getCdnUrl(version = DEFAULT_VERSION) {
  return Mapcofig.jsapi + `/${version}/init.js`;
}

export function getCdnCssUrl(version = DEFAULT_VERSION) {
  if (version === null) { version = DEFAULT_VERSION; }
  const url = getCdnUrl(version);
  const baseUrl = url.substring(0, url.indexOf('init.js'));
  const parsedVersion = parseVersion(version);
  if (parsedVersion !== NEXT && parsedVersion.major === 3) {
    const path = parsedVersion.minor <= 10 ? 'js/' : '';
    return `${baseUrl}${path}esri/css/esri.css`;
  } else {
    return `${baseUrl}esri/themes/light/main.css`;
  }
}
