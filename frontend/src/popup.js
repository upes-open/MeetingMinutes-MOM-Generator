document.addEventListener('DOMContentLoaded', function () {

    let listenBtn = document.querySelector('.listen-btn');
    let downloadBtn = document.querySelector('.download-btn');
    let recording;
    chrome.storage.local.get('recording', (result) => {
        if ('recording' in result) {
            recording = result.recording;
        }
        
        if (recording) {
            listenBtn.innerText = "Stop Listening";
        } else {
            listenBtn.innerText = "Start Listening";
        }
    });

    listenBtn.addEventListener('click', function () {
        if (this.innerText === "Start Listening") {
            chrome.runtime.sendMessage({
                message: 'startListening'
            });
            this.innerText = "Stop Listening";
        } else {
            chrome.runtime.sendMessage({
                message: 'stopListening'
            });
            this.innerText = "Start Listening";
        }
    });

    downloadBtn.addEventListener('click', function () {
        chrome.runtime.sendMessage({
            message: 'downloadSummary'
        });
    });
});