let listenBtn = document.querySelector(".listen-btn")

listenBtn.addEventListener('click', function () {
    if (listenBtn.innerText == "Start Listening")
        listenBtn.innerText = "Stop Listening"
    else
        listenBtn.innerText = "Start Listening"
})