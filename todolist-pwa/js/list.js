(function() {
	const app = {
		isLoading: true,
		visibleCards: {},
		selectedTodos: [],
		spinner: document.querySelector('.loader'),
		cardTemplate: document.querySelector('.cardTemplate'),
		container: document.querySelector('.main')
	};

	document.getElementById('butRefresh').addEventListener('click', function() {
		app.getTodos();
	});

	// document.getElementById('butAdd').addEventListener('click', function() {
	// 	app.toggleAddDialog(true);
	// });

	//用于添加或更新todo卡片
	app.updateTodoCards = data => {
		const dataLastUpdated = new Date(data.created);
		let card = app.visibleCards[data.key];
		if (!card) {
			card = app.cardTemplate.cloneNode(true);
			card.classList.remove('cardTemplate');
			card.querySelector('.todo-title').textContent = data.title;
			card.removeAttribute('hidden');
			app.container.appendChild(card);
			app.visibleCards[data.key] = card;
		}

		const cardLastUpdatedElem = card.querySelector('.todo-last-updated');
		let cardLastUpdated = cardLastUpdatedElem.textContent;
		if (cardLastUpdated) {
			cardLastUpdated = new Date(cardLastUpdated);
			// Bail if the card has more recent data then the data
			if (dataLastUpdated.getTime() < cardLastUpdated.getTime()) {
				return;
			}
		}
		cardLastUpdatedElem.textContent = data.created;

		card.querySelector('.todo-title').textContent = data.title;
		card.querySelector('.todo-created').textContent = dataLastUpdated.toDateString();
		card.querySelector('.todo-content').textContent = data.content;

		if (app.isLoading) {
			app.spinner.setAttribute('hidden', true);
			app.container.removeAttribute('hidden');
			app.isLoading = false;
		}

	};

	//获取所有todo list
	app.getTodos = () => {
		const url = 'http://localhost:8000/todos/api/v1/list';
		const request = new XMLHttpRequest();
		request.onreadystatechange = function() {
			if (request.readyState === XMLHttpRequest.DONE) {
				if (request.status === 200) {
					const response = JSON.parse(request.response);
					app.selectedTodos = [];
					response.length > 0 && response.forEach(data => {
						app.selectedTodos.push(data.key);
						app.updateTodoCards(data);
					});
					app.saveSelectedTodos();
				}
			} else {
				//如果没有数据返回就展示假数据
				app.updateTodoCards(initialData);
			}
		};
		request.open('GET', url);
		request.send();
	};

	//获取某个todo详情
	app.getTodo = key => {
		const url = `http://localhost:8000/todos/api/v1/todo/${key}`;
		if ('caches' in window) {
			caches.match(url).then(function(response) {
				if (response) {
					response.json().then(function updateFromCache(json) {
						app.updateTodoCards(json);
					});
				}
			});
		}

		const request = new XMLHttpRequest();
		request.onreadystatechange = function() {
			if (request.readyState === XMLHttpRequest.DONE) {
				if (request.status === 200) {
					app.updateTodoCards(JSON.parse(request.response));
				}
			}
		};
		request.open('GET', url);
		request.send();
	};

	// 将todo list保存到localStorage.
	app.saveSelectedTodos = function() {
		localStorage.selectedTodos = JSON.stringify(app.selectedTodos);
	};

	const initialData = {
		key: '111',
		title: '待办事项一',
		created: '2018-04-02T08:39:25Z',
		content: '这是待办事项一的内容'
	};

	app.updateTodoCards(initialData);

	/* 
	 * 启动代码会检查本地存储中是否存储了任何todo。
	 * 如果存储了todo，它就会解析本地存储数据，然后为保存的每个todo显示详情卡片。
	 * 如果没有存储todo，启动代码会使用虚假的数据，并将其保存为默认todo。
	 */
	app.selectedTodos = localStorage.selectedTodos;
	if (app.selectedTodos) {
		app.selectedTodos = JSON.parse(app.selectedTodos);
		app.selectedTodos.forEach(key => app.getTodo(key));
	} else {
		app.updateTodoCards(initialData);
		app.selectedTodos = [initialData.key];
		app.saveSelectedTodos();
	}

	//检查浏览器是否支持服务工作线程，如果支持，则注册服务工作线程
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker
			.register('../service-worker.js')
			.then(function() {
				console.log('Service Worker Registered');
			});
	}
})();