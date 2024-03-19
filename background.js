if (typeof browser === "undefined") {
	globalThis.browser = chrome;
};

var serverPath = ''

chrome.runtime.onMessage.addListener(async function({ state, urlPattern, server }, sender, sendResponse) {
	if (state == 'start_listening' && urlPattern) {
		if (server == '') {
			sendResponse({
				error: true,
				errorMessage: 'missing server',
			})
			return
		}

		serverPath = server

		let result = startListening(logging, urlPattern);

		console.log(result)

		if (result instanceof String) {
			sendResponse({
				error: true,
				errorMessage: result,
			})

			return
		}

		sendResponse({
			error: false,
		})

		return result
	} else if (state == 'stop_listening') {
		
		var result = stopListening(logging)

		if (result instanceof String) {
			sendResponse({
				error: true,
				errorMessage: result,
			})

			return
		}

		sendResponse({
			error: false,
		})

		return result
	}
})

function startListening(callback, pattern = {}) {
	if (!browser.webRequest) {
		return "no support for webRequest"
	}

	browser.webRequest.onBeforeRequest.addListener(callback, pattern)
	
	if (!browser.webRequest.onBeforeRequest.hasListener(callback)) {
		return browser.runtime.lastError;
	}

	return true
}

function stopListening(listener) {
	if (!browser.webRequest.onBeforeRequest.hasListener(listener)) {
		return 'not listening'
	}

	browser.webRequest.onBeforeRequest.removeListener(listener)

	if (browser.webRequest.onBeforeRequest.hasListener(listener)) {
		return browser.runtime.lastError;
	}

	return true
}

async function logging({ url }) {
	console.log(url)
	var encoded = encodeURIComponent(url)
	fetch(`${serverPath}${encoded}`).catch(error => {})
}