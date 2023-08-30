let attendeesInterval;
let allUser = [];
let summary = "";
let userRecorder;
let userData = [];

chrome.runtime.onMessage.addListener(async (request) => {
    switch (request.message) {

        case 'getSummary':
            allUser = getAttendees();
            summary = getSummary();
            let int = setInterval(function () {
                clearInterval(int);
                createTxtFile(allUser, summary);
            }, 2000);
            break;

        case 'getUserAudio':
            startUserRecording();
            chrome.storage.local.set({ userRecording: true });
            break;

        case 'stopUserAudio':
            stopUserRecording();
            chrome.storage.local.set({ userRecording: false });
            break;

        default:
            throw new Error('Unrecognized message:', message.type);
    }
});

async function startUserRecording() {
    if (userRecorder && userRecorder.state === 'recording') {
        throw new Error('User audio recording is already in progress.');
    }

    const userMedia = await navigator.mediaDevices.getUserMedia({ audio: true });

    userRecorder = new MediaRecorder(userMedia, { mimeType: 'audio/webm' });
    userRecorder.ondataavailable = function (event) {
        userData.push(event.data);
        console.log(event.data);
    }
    userRecorder.onstop = () => {
        const blob = new Blob(userData, { type: 'video/webm' });
        window.open(URL.createObjectURL(blob), '_blank');

        userData = [];
    };

    userRecorder.start();
}

async function stopUserRecording() {
    if (userRecorder) {
        userRecorder.stop();
        userRecorder = null;
    }
}

function getAttendees() {
    let users = [];
    if (document.getElementsByClassName("zWGUib").length == 0) {
        clickShowAll();
        attendeesInterval = setInterval(function () {
            users = getUsers();
            clearInterval(attendeesInterval);
            return users;
        }, 1000);
    } else {
        users = getUsers();
        return users;
    }
}

function clickShowAll() {
    let ui_buttons = document.getElementsByClassName("VfPpkd-kBDsod NtU4hc");
    ui_buttons[1].click();
}

function getUsers() {
    selectAllUser = document.getElementsByClassName("zWGUib");
    const divsArr = Array.from(selectAllUser);
    allUser = [];

    divsArr.forEach((el) => {
        let participantName = el.innerText.trim();
        allUser.push(participantName);
    });
    return allUser;
}

function getSummary() {
    //edit this after generating summary
    return "add summary here...";
}

function createTxtFile(allUser, summary) {
    const users = `USERS:\n${allUser.join('\n')}\n`;
    const sum = `SUMMARY:\n${summary}`
    const fileContent = users + sum;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'summary.txt';
    link.textContent = 'Download MOM';

    link.click();

    URL.revokeObjectURL(url);
}
