const dataCacheName = 'todoData-v1';
const cacheName = 'todoPWA-1';
const filesToCache = [
	'/html/list.html',
	'/js/list.js',
	'/css/list.css',
	'/images/ic_add_white_24px.svg',
	'/images/ic_refresh_white_24px.svg'
];

//注册服务工作线程后，用户首次访问页面时将会触发安装事件。

/*
 * 通过 caches.open() 打开缓存并提供一个缓存名称。
 * 缓存打开后，调用 cache.addAll()，该方法随即从服务器获取文件，并将响应添加到缓存内。
 * 注意：cache.addAll() 具有原子性，如果任何一个文件失败，整个缓存步骤也将失败！
 */
self.addEventListener('install', function(e) {
	console.log('[ServiceWorker] Install');
	e.waitUntil(
		caches.open(cacheName).then(function(cache) {
			console.log('[ServiceWorker] Caching app shell');
			return cache.addAll(filesToCache);
		})
	);
});

self.addEventListener('activate', function(e) {
	console.log('[ServiceWorker] Activate');
	e.waitUntil(
		caches.keys().then(function(keyList) {
			return Promise.all(keyList.map(function(key) {
				if (key !== cacheName && key !== dataCacheName) {
					console.log('[ServiceWorker] Removing old cache', key);
					return caches.delete(key);
				}
			}));
		})
	);
	return self.clients.claim();
});

/*
 * 服务工作线程提供了拦截 PWA 发出的请求并在服务工作线程内对它们进行处理的能力.
 * caches.match() 会由内而外对触发抓取事件的网络请求进行评估，并检查以确认它是否位于缓存内.
 * 它随即使用已缓存版本作出响应，或者利用 fetch 从网络获取一个副本。response 通过 e.respondWith() 传回至网页。
 */
self.addEventListener('fetch', function(e) {
	console.log('[ServiceWorker] Fetch', e.request.url);
	if (e.request.url.indexOf('api') > -1) {
		/*
		 * 拦截请求，并检查网址是否是请求数据的网址。
		 * 如果是，使用抓取发出请求。返回请求后，代码会打开缓存，克隆响应，将其存储在缓存内，最后将响应返回给原始请求者。
		 */
		e.respondWith(
			caches.open(dataCacheName).then(function(cache) {
				return fetch(e.request).then(function(response) {
					cache.put(e.request.url, response.clone());
					return response;
				});
			})
		);
	} else {
		e.respondWith(
			caches.match(e.request).then(function(response) {
				return response || fetch(e.request);
			})
		);
	}

});