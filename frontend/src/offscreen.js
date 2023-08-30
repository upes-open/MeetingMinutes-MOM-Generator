let recorder;
let data = [];
let userData;

chrome.runtime.onMessage.addListener(async (message) => {
    if (message.target === 'offscreen') {
        switch (message.type) {
            
            case 'start-recording':
                startRecording(message.data);
                break;

            case 'stop-recording':
                stopRecording();
                break;

            case 'userAudio':
                userData = message.data;
                break;

            default:
                throw new Error('Unrecognized message:', message.type);
        }
    }
});

async function startRecording(streamId) {
    if (recorder?.state === 'recording') {
        throw new Error('Called startRecording while recording is in progress.');
    }

    const media = await navigator.mediaDevices.getUserMedia({
        audio: {
            mandatory: {
                chromeMediaSource: 'tab',
                chromeMediaSourceId: streamId
            }
        }
    });

    const output = new AudioContext();
    const source = output.createMediaStreamSource(media);
    source.connect(output.destination);

    recorder = new MediaRecorder(media, { mimeType: 'audio/webm' });
    recorder.ondataavailable = (event) => data.push(event.data);
    recorder.onstop = () => {
        
        const blob = new Blob(data, { type: 'audio/webm' });

        // this is the URL of the audio that can be sent to an external service for further use
        const objectUrl = URL.createObjectURL(blob);

        //keep the line below if you want the audio to play in a new tab
        window.open(URL.createObjectURL(blob), '_blank');

        //keep the code below if you want to download the audio file directly
        /*
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = 'recorded_audio.webm';
        anchor.click();
        */

        // Revoke the Object URL to release resources
        URL.revokeObjectURL(objectUrl);

        recorder = undefined;
        data = [];
        userData = [];
    };
    recorder.start();

    window.location.hash = 'recording';
}

async function stopRecording() {
    recorder.stop();

    recorder.stream.getTracks().forEach((t) => t.stop());

    window.location.hash = '';
}