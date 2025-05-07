var current_cache = "pwa-assets";
let filesToCache = [
    "/",
    "/manifest.json",
    "/icon.png",
    "/old.html",
    "/cursortrail.png",
    "/cursor.png",
    "/bgm.mp3",
    "/system.woff",
    "/localforage.min.js",
    "/empty_channel.png",
    "/installer_channel.png",
    "/jszip.min.js"
];
caches.open("pwa-assets")
.then(cache => {
  cache.addAll(filesToCache)
});

self.addEventListener("install", (event) => {
  // The promise that skipWaiting() returns can be safely ignored.
  self.skipWaiting();

  // Perform any other actions required for your
  // service worker to install, potentially inside
  // of event.waitUntil();
});

addEventListener("message", (event) => {
  // event is an ExtendableMessageEvent object
  if (event.data instanceof File) {
    let response = new Response(event.data)
    caches.open(cache_name).then((cache) => {
      cache
        .put(event.data.name,response)
        .then(() => console.log("Data added to cache."))
        .catch((error) => console.error("Error adding data to cache:", error));
    });
  } else if (event.data instanceof Object) {
    if (event.data.type === "cachechange") {
      current_cache = event.data.cachename
      if (current_cache !== "pwa-assets") {
        event.source.postMessage("reload the damn page");
      }
    }
  }
});

/*self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open(current_cache).then(function(cache) {
      cache.match(event.request).then((response) => {
        // caches.match() always resolves
        // but in case of success response will have value
        if (response !== undefined) {
          return response;
        } else {
          return fetch(event.request);
        }
      })
    })
  );
});*/

self.addEventListener('fetch', function(event) {
  let returnValue
  event.respondWith(
    caches.open(current_cache).then(function(cache) {
      return cache.match(event.request, {'ignoreSearch': true}).then(function (response) {
        if (response !== undefined) {
          return response
        } else {
          return caches.match(event.request, {'ignoreSearch': true}).then((response) => {
            // caches.match() always resolves
            // but in case of success response will have value
            if (response !== undefined) {
              return response
            } else {
              fetch(event.request).then(response =>{
                // add headers to response if it no worky (this fixes webleste)
                return addHeaders(response)
              })
            }
          })
        }
      });
    })
  );
});

function addHeaders(response) {
  let newHeaders = new Headers(response.headers);
  newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
  newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");

  let moddedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });

  return moddedResponse;
}
