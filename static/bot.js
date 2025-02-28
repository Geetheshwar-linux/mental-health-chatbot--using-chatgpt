document.addEventListener('DOMContentLoaded', function() {
	const chatMessages = document.getElementById('chat-messages');
	const chatForm = document.getElementById('chat-form');
	const userInput = document.getElementById('user-input');

	// Initialize clock
	function updateClock() {
		const now = new Date();
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		document.getElementById('clock').textContent = `${hours}:${minutes}`;
	}
	setInterval(updateClock, 1000);
	updateClock();

	// Add initial welcome message
	addMessage("Hi! How can I help you today?", false);

	function removeAsterisks(text) {
		return text.replace(/\*/g, ''); // Remove all asterisks
	}

	function addMessage(message, isUser = false) {
		const messageDiv = document.createElement('div');
		messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
		
		// Add audio button for bot messages first (before content)
		if (!isUser) {
			const audioButton = document.createElement('button');
			audioButton.className = 'audio-btn';
			audioButton.innerHTML = '<i class="fas fa-volume-up"></i>';
			audioButton.onclick = () => generateAudio(message);
			messageDiv.appendChild(audioButton);
		}
		
		const messageContent = document.createElement('div');
		messageContent.className = 'message-content';
		const formattedMessage = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
		messageContent.innerHTML = removeAsterisks(formattedMessage);
		
		messageDiv.appendChild(messageContent);
		chatMessages.appendChild(messageDiv);
		chatMessages.scrollTop = chatMessages.scrollHeight;
	}

	function generateAudio(text) {
		fetch('/generate-audio', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ text: text })
		})
		.then(response => response.blob())
		.then(blob => {
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'message.mp3';
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		})
		.catch(error => {
			console.error("Error generating audio:", error);
			alert("Sorry, there was an error generating the audio.");
		});
	}

	// Handle form submission
	chatForm.addEventListener('submit', function(e) {
		e.preventDefault();
		const message = userInput.value.trim();
		
		if (!message) return;

		// Add user message
		addMessage(message, true);
		
		// Clear input
		userInput.value = '';

		// Send to backend and get response
		fetch('/generate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ text: message })
		})
		.then(response => response.json())
		.then(data => {
			if (data.error) {
				addMessage("Sorry, I encountered an error.", false);
			} else {
				addMessage(data.output, false);
			}
		})
		.catch(error => {
			console.error("Error:", error);
			addMessage("Sorry, I encountered an error.", false);
		});
	});

	// Add error handling for network issues
	window.onerror = function(msg, url, lineNo, columnNo, error) {
		console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
		return false;
	};
});