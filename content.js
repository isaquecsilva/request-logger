var button = undefined;
var pattern = undefined;
var server = undefined;

if (typeof browser === 'undefined') {
	globalThis.browser = chrome
}

window.onload = () => {
	pattern = document.querySelector('input')
	button = document.querySelector('button')
	server = document.querySelector('#logging-server')

	if (localStorage.getItem('listening') == 'true') {
		button.innerText = 'stop'
		button.classList.add('stop')
		button.classList.remove('start')
	}

	button.onclick = async () => {
		let currentContent = button.innerText.toLowerCase();

		if (currentContent == 'start') {

			// Validating url pattern
			let valid = await validateUrlPattern(pattern.value)
			if (valid instanceof Error) {
				window.alert(`inmid error: ${valid.message}`)
				return
			}

			const response = await browser.runtime.sendMessage({
				state: 'start_listening',
				urlPattern: {
					urls: [pattern.value]
				},
				server: server.value || '',
			})

			if (response.error) {
				window.alert(`inmid error: ${response.errorMessage}`)
				return;
			}

			button.innerText = 'stop'
			button.classList.add('stop')
			button.classList.remove('start')
			localStorage.setItem('listening', 'true')
			return;

		} else if (currentContent == 'stop') {
			const response = await browser.runtime.sendMessage({
				state: 'stop_listening',
			})

			if (response.error) {
				console.log(response.errorMessage);
				window.alert(`inmid error: ${response.errorMessage}`)
				return
			}

			button.innerText = 'start'
			button.classList.add('start')
			button.classList.remove('stop')
			localStorage.setItem('listening', 'false')
		}
	}
}

async function validateUrlPattern(pattern) {
	try {
		new URL(pattern);
	} catch(error) {
		return error
	}
}