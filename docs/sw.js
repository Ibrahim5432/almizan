/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "a78ff9825085bb52cde9a8dac382ec84"
  }, {
    "url": "index.html",
    "revision": "ba90b31da5d4658036a6ae9ea046ef2d"
  }, {
    "url": "icon.svg",
    "revision": "bdc95f5cf2f0ac9b446f131607204ae1"
  }, {
    "url": "assets/index-UULMmzpO.js",
    "revision": null
  }, {
    "url": "assets/index-RXwD3tCh.css",
    "revision": null
  }, {
    "url": "assets/aistudio/image_efe878ac.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_cb1d5976.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_c94e8d51.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_450e8fc5.png",
    "revision": null
  }, {
    "url": "icon.svg",
    "revision": "bdc95f5cf2f0ac9b446f131607204ae1"
  }, {
    "url": "manifest.webmanifest",
    "revision": "b3bd55a73e460622fdd5c9740ccae959"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html"), {
    denylist: [/^\/api\//, /^\/sitemap/, /^\/news-sitemap/, /^\/rss/, /^\/ads\.txt/, /^\/robots\.txt/]
  }));

}));
