document.addEventListener('DOMContentLoaded', function () {

    let listenBtn = document.querySelector('.listen-btn');
    let playBtn = document.querySelector('#playButton');
    let downloadBtn = document.querySelector('.download-btn');

    listenBtn.addEventListener('click', function () {
        if (this.innerText == "Start Listening") {
            chrome.runtime.sendMessage({
                message: 'startListening'
            });
        } else {
            chrome.runtime.sendMessage({
                message: 'stopListening'
            });
        }
    });

    playBtn.addEventListener('click', function () {
        chrome.runtime.sendMessage({
            message: 'playAudio'
        });
    });

    downloadBtn.addEventListener('click', function () {
        chrome.runtime.sendMessage({
            message: 'downloadSummary'
        });
    });
    
});