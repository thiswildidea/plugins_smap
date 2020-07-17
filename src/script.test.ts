/* tslint:disable only-arrow-functions */
import { jaspi3xUrl, removeRequire, stubRequire } from '../test/helpers';
import { isLoaded, loadAPIScript, setSMIMapOptions } from './script';
import * as cssUtils from './utils/css';

declare global {
  /* tslint:disable interface-name */
  interface Window {
    require?: any;
    dojoConfig?: any;
    stubRequire?: any;
  }
  /* tslint:enable interface-name */
}

// allow the mock scripts to emulate that the JSAPI has loaded
window.stubRequire = stubRequire;

// remove script tags added by shsmi
function removeScript() {
  const script = document.querySelector('script[data-shsmi]');
  if (script) {
    script.parentElement.removeChild(script);
  }
}

// don't actually load the script or styles
function fakeLoading() {
  spyOn(document.body, 'appendChild').and.callFake(function(el) {
    // trigger the onload event listeners
    el.dispatchEvent(new Event('load'));
  });
  spyOn(cssUtils, 'loadSMIMapCss').and.stub();
}

describe('isLoaded', function() {
  describe('when has not yet been loaded', function() {
    beforeEach(function() {
      removeRequire();
      removeScript();
    });
    it('isLoaded should be false', function() {
      expect(isLoaded()).toBeFalsy();
    });
  });
});

describe('when loading the script', function() {
  describe('with library defaults', function() {
    let scriptEl;
    beforeAll(function(done) {
      fakeLoading();
      loadAPIScript()
      .then((script) => {
        // hold onto script element for assertions below
        scriptEl = script;
        done();
      });
    });
    it('should default to latest version', function() {
      expect(scriptEl.src).toEqual('https://js.arcgis.com/4.14/');
    });
    it('should not have set dojoConfig', function() {
      expect(window.dojoConfig).not.toBeDefined();
    });
    it('should not have called loadSMIMapCss', function() {
      expect((cssUtils.loadSMIMapCss as jasmine.Spy).calls.any()).toBeFalsy();
    });
  });
  describe('with default loader options explicitly set', function() {
    const scriptUrl = 'http://server/path/to/esri';
    const cssUrl = `${scriptUrl}/css/main.css`;
    let scriptEl;
    beforeAll(function(done) {
      setSMIMapOptions({
        url: scriptUrl,
        css: cssUrl
      });
      fakeLoading();
      loadAPIScript()
      .then((script) => {
        // hold onto script element for assertions below
        scriptEl = script;
        done();
      });
    });
    it('should load the specified script url', function() {
      expect(scriptEl.src).toEqual(scriptUrl);
    });
    it('should not have set dojoConfig', function() {
      expect(window.dojoConfig).not.toBeDefined();
    });
    it('should have called loadSMIMapCss', function() {
      expect((cssUtils.loadSMIMapCss as jasmine.Spy).calls.any()).toBeTruthy();
    });
    it('should have called loadSMIMapCss with the specified CSS url', function() {
      expect((cssUtils.loadSMIMapCss as jasmine.Spy).calls.argsFor(0)[0]).toEqual(cssUrl);
    });
    afterAll(function() {
      setSMIMapOptions(null);
    });
  });
  describe('with a specific version from the CDN', function() {
    const expected = 'https://js.arcgis.com/3.31/';
    let scriptEl;
    beforeAll(function(done) {
      fakeLoading();
      loadAPIScript({
        version: '3.31'
      })
      .then((script) => {
        // hold onto script element for assertions below
        scriptEl = script;
        done();
      });
    });
    it('should load CDN version', function() {
      expect(scriptEl.src).toEqual(expected);
    });
  });
  describe('with a specific url', function() {
    const url = 'http://server/path/to/esri';
    let scriptEl;
    beforeAll(function(done) {
      fakeLoading();
      loadAPIScript({
        url
      })
      .then((script) => {
        // hold onto script element for assertions below
        scriptEl = script;
        done();
      });
    });
    it('should load url', function() {
      expect(scriptEl.src).toEqual(url);
    });
  });
  describe('with css option', function() {
    describe('from default version', () => {
      beforeAll(function(done) {
        fakeLoading();
        loadAPIScript({
          css: true
        })
        .then((script) => {
          done();
        });
      });
      it('should have called loadSMImapCss with no arguments', function() {
        expect((cssUtils.loadSMIMapCss as jasmine.Spy).calls.argsFor(0)[0]).toBeUndefined();
      });
    });
    describe('with a specific version from the CDN', () => {
      const version = '3.31';
      beforeAll(function(done) {
        fakeLoading();
        loadAPIScript({
          version,
          css: true
        })
        .then((script) => {
          done();
        });
      });
      it('should have called loadSMIMapCss with the version', function() {
        expect((cssUtils.loadSMIMapCss as jasmine.Spy).calls.argsFor(0)[0]).toEqual(version);
      });
    });
    describe('with a specific url', () => {
      const url = 'http://server/path/to/esri';
      const cssUrl = `${url}/css/main.css`;
      beforeAll(function(done) {
        fakeLoading();
        loadAPIScript({
          url,
          css: cssUrl
        })
        .then((script) => {
          done();
        });
      });
      it('should have called loadSMIMapCss with the url', function() {
        expect((cssUtils.loadSMIMapCss as jasmine.Spy).calls.argsFor(0)[0]).toEqual(cssUrl);
      });
    });
  });
  describe('with dojoConfig option', function() {
    const dojoConfig = {
      async: true,
      packages: [
        {
          location: 'path/to/somelib',
          name: 'somelib'
        }
      ]
    };
    beforeAll(function(done) {
      fakeLoading();
      loadAPIScript({
        dojoConfig
      })
      .then((script) => {
        done();
      });
    });
    it('should have set global dojoConfig', function() {
      expect(window.dojoConfig).toEqual(dojoConfig);
    });
    afterAll(function() {
      window.dojoConfig = undefined;
    });
  });
  describe('when already loaded by some other means', function() {
    beforeAll(function() {
      stubRequire();
    });
    it('should reject', function(done) {
      loadAPIScript({
        url: jaspi3xUrl
      })
      .then(() => {
        done.fail('call to loadAPIScript should have failed');
      })
      .catch((err) => {
        expect(err.message).toEqual(`The ArcGIS API for JavaScript is already loaded.`);
        done();
      });
    });
    afterAll(function() {
      // clean up
      removeRequire();
    });
  });
  describe('when loading an invalid url', function() {
    it('should pass an error to the callback', function(done) {
      loadAPIScript({
        url: 'not a valid url'
      })
      .then(() => {
        done.fail('call to loadAPIScript should have failed');
      })
      .catch((err) => {
        expect(err.message.indexOf('There was an error attempting to load')).toEqual(0);
        done();
      });
    });
    afterAll(function() {
      // clean up
      removeScript();
    });
  });
  describe('when called twice', function() {
    describe('when loading the same script', function() {
      it('should resolve the script if it is already loaded', function(done) {
        loadAPIScript({
          url: jaspi3xUrl
        })
        .then(() => {
          // try loading the same script after the first one has already loaded
          loadAPIScript({
            url: jaspi3xUrl
          })
          .then((script) => {
            expect(script.getAttribute('src')).toEqual(jaspi3xUrl);
            done();
          })
          .catch((err) => {
            done.fail('second call to loadAPIScript should not have failed with: ' + err);
          });
        })
        .catch(() => {
          done.fail('first call to loadAPIScript should not have failed');
        });
      });
      it('should resolve an unloaded script once it loads', function(done) {
        loadAPIScript({
          url: jaspi3xUrl
        })
        .catch(() => {
          done.fail('first call to loadAPIScript should not have failed');
        });
        // try loading the same script again
        loadAPIScript({
          url: jaspi3xUrl
        })
        .then((script) => {
          expect(script.getAttribute('src')).toEqual(jaspi3xUrl);
          done();
        })
        .catch((err) => {
          done.fail('second call to loadAPIScript should not have failed with: ' + err);
        });
      });
    });
    describe('when loading different scripts', function() {
      it('should reject', function(done) {
        loadAPIScript({
          url: jaspi3xUrl
        })
        .catch(() => {
          done.fail('first call to loadAPIScript should not have failed');
        });
        // try loading a different script
        loadAPIScript({
          url: 'base/test/mocks/jsapi4x.js'
        })
        .then(() => {
          done.fail('second call to loadAPIScript should have failed');
        })
        .catch((err) => {
          expect(err.message).toEqual(`The ArcGIS API for JavaScript is already loaded (${jaspi3xUrl}).`);
          done();
        });
      });
    });
    afterEach(function() {
      // clean up
      removeRequire();
      removeScript();
    });
  });
});
