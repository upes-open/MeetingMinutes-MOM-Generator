chrome.runtime.onMessage.addListener(
    function (request) {
        if (request.message === 'playAudio') {
            sendMessageToContentScript('playAudio');
        }

        if (request.message === 'reqAttendees') {
            sendMessageToContentScript({message: 'getAttendees'});
        }

        if (request.message === 'downloadSummary') {
            sendMessageToContentScript({message: 'getSummary'});
        }
    }
);

function sendMessageToContentScript(message, value) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab) {
            chrome.tabs.sendMessage(activeTab.id, message, value)
                .then(console.log('Sent to content.js:', message))
                .catch((error) => console.error('Error message to content.js:', error));
        } else {
            console.error('No active tab found.');
        }
    });
}