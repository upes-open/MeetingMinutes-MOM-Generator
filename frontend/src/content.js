let attendeesInterval;
let allUser = [];
let summary = "";

chrome.runtime.onMessage.addListener(
    function (request) {
        if (request.message === 'getSummary') {
            allUser = getAttendees();
            summary = getSummary();
            let int = setInterval(function () {
                clearInterval(int);
                createTxtFile(allUser, summary);
            }, 2000);
        }
    }
);

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
