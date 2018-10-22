/**
 * @file mip serviceworker processor
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global self, caches, fetch */
var CACHE_NAME = 'mip-sw-static-cache'

self.MIP_SW_VERSION = '__BUILD_TIME__'
self.MIP_SW_TAG = '__BUILD_TAG__'
self.addEventListener('install', function () {
  self.skipWaiting()
})

// self.addEventListener('activsate', function (event) {
//   event.waitUntil(
//     caches.keys().then(function (keys) {
//       return Promise.all(
//         keys.map(function (key) {
//           if ([CACHE_NAME].includes(key)) {
//             return caches.delete(key)
//           }
//         })
//       )
//     }).then(function () {
//       return self.clients.matchAll()
//         .then(function (clients) {
//           clients && clients.length && clients.forEach(function (client) {
//             client.postMessage('sw.update')
//           })
//         })
//     })
//   )
// })

self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url)
  var netLevel = 0
  var connection = navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection ||
    navigator.msConnection

  var matchReg = /https?:\/\/(c\.mipcdn|mipcache\.bdstatic)\.com\/(static|extensions\/platform)\//
  var jetMatchReg = /https?:\/\/(jet\.bdstatic|c\.mipcdn)\.com\/byurl\?/
  var mipPageReg = /https?:\/\/.*\.mipcdn\.com\/[cir]\/|http:\/\/localhost/

  // @todo：网络策略以及兼容性有待调整
  if (connection) {
    if (connection.effectiveType) {
      netLevel = connection.effectiveType.toUpperCase() === '4G' ? 0 : 1
    } else if (connection.type) {
      netLevel = connection.type.toUpperCase() === 'WIFI' ? 0 : 1
    }
  }

  /**
   * 弱网情况下才引入 service worker fetch 代理
   * 只是缓存 MIP 核心 JS 和 MIP 官方组件以及平台组件以及 JET 静态资源（@todo：策略待调整）
   */
  if (netLevel > 0 && (matchReg.test(url) || jetMatchReg.test(url) || mipPageReg.test(url))) {
    event.respondWith(
      caches.open(CACHE_NAME).then(function (cache) {
        return cache.match(event.request).then(function (response) {
          function getNetworkResponse () {
            return fetch(event.request).then(function (response) {
              cache.put(event.request, response.clone())
              return response
            })
          }
          if (response) {
            setTimeout(getNetworkResponse)
            return response
          }
          return getNetworkResponse()
        })
      })
    )
  }
})
