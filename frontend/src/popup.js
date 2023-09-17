document.addEventListener('DOMContentLoaded', function () {

    let listenBtn = document.querySelector('.listen-btn');
    let downloadBtn = document.querySelector('.download-btn');
    let userBtn = document.querySelector('.user-btn');
    let recording;
    let userRecording;

    chrome.storage.local.get('recording', (result) => {
        if ('recording' in result) {
            recording = result.recording;
        }
        else {
            recording = false;
        }
        if (recording) {
            listenBtn.innerText = "Stop Listening";
            userBtn.removeAttribute('disabled');
        } else {
            listenBtn.innerText = "Start Listening";
            userBtn.setAttribute('disabled', true);
        }
    });

    chrome.storage.local.get('userRecording', (result) => {
        if ('userRecording' in result) {
            userRecording = result.userRecording;
        }
        else {
            userRecording = false;
        }
    });

    listenBtn.addEventListener('click', function () {
        if (!recording) {
            recording = true;
            chrome.runtime.sendMessage({
                message: 'startListeningTab'
            });
            this.innerText = "Stop Listening";
            userBtn.removeAttribute('disabled');
        } else {
            recording = false;
            chrome.runtime.sendMessage({
                message: 'stopListeningTab'
            });
            this.innerText = "Start Listening";
            userBtn.setAttribute('disabled', true);
        }
    });

    userBtn.addEventListener('click', function () {
        if (!userRecording) {
            chrome.runtime.sendMessage({
                message: 'startListeningUser'
            });
            this.innerText = "Stop Recording User";
            userRecording = true;
        }
        else {
            chrome.runtime.sendMessage({
                message: 'stopListeningUser'
            });
            this.innerText = "Start Recording User";
            if (!recording) {
                userBtn.setAttribute('disabled', true);
            }
            userRecording = false;
        }
    });

    downloadBtn.addEventListener('click', function () {
        chrome.runtime.sendMessage({
            message: 'downloadSummary'
        });
    });
});