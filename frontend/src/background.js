let recording;
chrome.storage.local.get('recording', (result) => {
    if ('recording' in result) {
        recording = result.recording;
    }
    else recording = false;
});

chrome.runtime.onMessage.addListener(
    function (request) {
        if (request.message === 'startListening') {
            if (!recording) {
                sendMessageToContentScript({ message: 'getUserAudio' });
                startRecording();
            } else {
                console.log("Recording is already active.");
            }
        }

        if (request.message === 'stopListening') {
            if (recording) {
                sendMessageToContentScript({ message: 'stopUserAudio' });
                stopRecording();
            }
            else {
                console.log("Recording is not active.");
            }
        }

        if (request.message === 'downloadSummary') {
            sendMessageToContentScript({ message: 'getSummary' });
        }

        if (request.type === 'log') {
            console.log(request.message);
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

function startRecording() {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const tab = tabs[0];
        if (tab) {
            const existingContexts = await chrome.runtime.getContexts({});
            const offscreenDocument = existingContexts.find(
                (c) => c.contextType === 'OFFSCREEN_DOCUMENT'
            );

            if (!offscreenDocument) {
                await chrome.offscreen.createDocument({
                    url: 'frontend/src/offscreen.html',
                    reasons: ['USER_MEDIA'],
                    justification: 'Recording from chrome.tabCapture API'
                });
            }

            const streamId = await chrome.tabCapture.getMediaStreamId({
                targetTabId: tab.id
            });

            chrome.runtime.sendMessage({
                type: 'start-recording',
                target: 'offscreen',
                data: streamId
            });
            recording = true;
            chrome.storage.local.set({ recording: true });
        } else {
            console.error('No active tab found.');
        }
    });
}

function stopRecording() {
    if (recording) {
        chrome.runtime.sendMessage({
            type: 'stop-recording',
            target: 'offscreen'
        });
        recording = false;
        chrome.storage.local.set({ recording: false });
    } else {
        console.log("Recording is not active.");
    }
}