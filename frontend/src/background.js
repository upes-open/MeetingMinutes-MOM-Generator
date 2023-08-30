let recording;
chrome.storage.local.get('recording', (result) => {
    if ('recording' in result) {
        recording = result.recording;
    }
    else recording = false;
});

chrome.runtime.onMessage.addListener(async (request) => {
    switch (request.message) {

        case 'startListeningTab':
            if (!recording) {
                startRecording();
            } else {
                console.log("Recording is already active.");
            }
            break;

        case 'stopListeningTab':
            if (recording) {
                sendMessageToContentScript({ message: 'stopUserAudio' });
                stopRecording();
            }
            else {
                console.log("Recording is not active.");
            }
            break;

        case 'startListeningUser':
            sendMessageToContentScript({ message: 'getUserAudio' });
            break;

        case 'stopListeningUser':
            sendMessageToContentScript({ message: 'stopUserAudio' });
            break;

        case 'downloadSummary':
            sendMessageToContentScript({ message: 'getSummary' });
            break;

        case 'log':
            console.log(request.message);
            break;

        default:
            throw new Error('Unrecognized message:', message.type);
    }
});

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