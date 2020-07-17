import { getCdnCssUrl, parseVersion, parseVersionnew } from './url';
function createStylesheetLink(href: string): HTMLLinkElement {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  return link;
}
function insertLink(link: HTMLLinkElement, before?: string) {
  if (before) {
    const beforeNode = document.querySelector(before);
    beforeNode.parentNode.insertBefore(link, beforeNode);
  } else {
    document.head.appendChild(link);
  }
}
function getCss(url) {
  return document.querySelector(`link[href*="${url}"]`) as HTMLLinkElement;
}

function getCssUrl(urlOrVersion?: string) {
  return !urlOrVersion || parseVersion(urlOrVersion)
    ? getCdnCssUrl(urlOrVersion)
    : urlOrVersion;
}
export function loadSMIMapCss(urlOrVersion?: string, before?: string) {
  const url = getCssUrl(urlOrVersion);
  let link = getCss(url);
  if (!link) {
    link = createStylesheetLink(url);
    insertLink(link, before);
  }
  const parsedVersion = parseVersionnew(urlOrVersion);
  if (parsedVersion.major === 4) {
    const custmomurl = url.substring(0, url.indexOf('esri/themes/')) + "esri/themes/gis/css/gis.css";
    let customlink = getCss(custmomurl);
    if (!customlink) {
      customlink = createStylesheetLink(custmomurl);
      insertLink(customlink, before);
    }
  }
  return link;
}
