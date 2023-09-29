document.addEventListener('DOMContentLoaded', function () {

    let listenBtn = document.querySelector('.listen-btn');
    let downloadBtn = document.querySelector('.download-btn');
    let userBtn = document.querySelector('.user-btn');
    let rectime = document.querySelector('.rectime');
    let recording;
    let userRecording;
    let minutes, seconds;
    let starttime, startStr;
    let update;

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

    function update_recttime() {
        let now = new Date();
        let timeDiff = now - starttime;
        timeDiff /= 1000;
        minutes = Math.floor(timeDiff / 60);
        seconds = Math.floor(timeDiff - minutes * 60);
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        rectime.innerText = minutes + ":" + seconds;
    }

    chrome.storage.local.get('starttime', (result) => {
        if ('starttime' in result) {
            starttime = new Date(result.starttime);
            
            if (recording) {
                update_recttime();
                update = setInterval(update_recttime, 1000);
            }
        }
    });

    chrome.storage.local.get('userRecording', (result) => {
        if ('userRecording' in result) {
            userRecording = result.userRecording;
        }
        else {
            userRecording = false;
        }
        if (userRecording) {
            userBtn.innerText = "Stop Recording User";
        } else {
            userBtn.innerText = "Start Recording User";
        }
    });

    listenBtn.addEventListener('click', function () {
        if (!recording) {
            recording = true;
            chrome.runtime.sendMessage({
                message: 'startListeningTab'
            });
            this.innerText = "Stop Listening";

            starttime = new Date();
            startStr = starttime.toISOString();
            chrome.storage.local.set({ 'starttime': startStr });

            update_recttime();
            update = setInterval(update_recttime, 1000);

            userBtn.removeAttribute('disabled');
        }
        else {
            recording = false;
            chrome.runtime.sendMessage({
                message: 'stopListeningTab'
            });
            this.innerText = "Start Listening";

            clearInterval(update);
            chrome.storage.local.remove('starttime');
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