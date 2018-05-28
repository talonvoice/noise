/*
  TODOS:
  - load data
  - allow user to select mic
  - fallback to <input>
  - refactor
  - update UI when done recording, and uploading
  - allow user to review and submit
  - load noise info from data json
*/

const WAITING = 0;
const RECORDING = 1;
const UPLOADING = 2;
const UPLOADED = 3;

let status = WAITING;

let statuses = [
  { description: 'Waiting to record' },
  { description: 'Recording' },
  { description: 'Recorded and uploading' },
  { description: 'Recorded and uploaded' },
]

let stopped = false;
let startTime;
let elapsed = 0;
let filenamePrefix = '';
let filenameSessionID = generateUUID(); // TODO: let server take care of this
// TODO: use this UUID and put it in local storage
let chunkNumber = 0;

const downloadLink = document.querySelector('[data-id=download]');
let player = document.querySelector('[data-id=player]');
let recordButton = document.querySelector('[data-id=recordButton]');
let recorderTime = document.querySelector('[data-id=recorderTime');
let recorderStatus = document.querySelector('[data-id=recorderStatus]');

// copypasta from https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function generateUUID() { // Public Domain/MIT
  var d = new Date().getTime();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
      d += performance.now(); //use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function renderTime(time) {
  timeInS = time / 1000;
  minutes = ('' + Math.floor(timeInS / 60)).padStart(2, '0');
  seconds = ('' + Math.floor(timeInS % 60)).padStart(2, '0');
  recorderTime.innerText = `${minutes}:${seconds}`;
}

function renderStatus(status) {
  recorderStatus.innerText = `${statuses[status].description}`;
}

const handleSuccess = function(stream) {
  const options = {mimeType: 'audio/webm'};
  status = WAITING;
  let recordedChunks = [];

  try {
    mediaRecorder = new MediaRecorder(stream, options);
  } catch(err) {
    console.log('ERROR:' + err.name);
    return err.name;     /* return the error name */
  }

  recordButton.addEventListener('click', function() {
    if (status === WAITING) {
      recordedChunks = [];

      player.setAttribute('disabled', 'disabled');
      player.src = null;
      downloadLink.classList.add('DownloadLink--disabled')
      downloadLink.href = null;

      try {
        mediaRecorder.start(1000); // NOTE: if an argument is not provided, the "dataavailable" event will not fire until the media recorder is stopped
      } catch (e) {
        console.error(e);
        // TODO: reset UI
      }
    } else if (status === RECORDING) {
      mediaRecorder.stop();
    } // TODO: what do we do if it's starting or stopping? disable the interactions?
  })

  mediaRecorder.addEventListener('dataavailable', function(e) {
    if (e.data.size > 0) {
      // add this chunk of data to the recorded chunks
      console.log(`Pushing chunk #${++chunkNumber}`);
      elapsed = Date.now() - startTime;
      renderTime(elapsed);
      recordedChunks.push(e.data);
    }
  });

  mediaRecorder.addEventListener('start', function() {
    startTime = Date.now();
    recordButton.classList.add('Recorder-recordButton--recording');
    status = RECORDING;
    renderStatus(status); 
  });
  
  mediaRecorder.addEventListener('stop', function() {
    elapsed = Date.now() - startTime;
    renderTime(elapsed);
    recordButton.classList.remove('Recorder-recordButton--recording');
    filename = `${filenamePrefix}.${filenameSessionID}.webm`;
    status = UPLOADING;
    renderStatus(status);

    let blob = new Blob(recordedChunks);
    let file = new File([blob], filename);
    var data = new FormData(); 
    data.append('noise', file);
    data.append('user', 'you'); // TODO: names in uploads?
    
    window.fetch('/upload', {
      method: 'POST',
      body: data,
    }).then(
      response => console.log(response.statusText)
    ).then(
      success => {
        status = UPLOADED;
        renderStatus(status);
      }).catch(
      error => console.log(error) // Handle the error response object
    );
    
    // hook up download link    
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = filename;
    downloadLink.classList.remove('DownloadLink--disabled');

    // hook up player
    player.src = downloadLink.href;
    player.removeAttribute('disabled');
  });

  mediaRecorder.onerror = function(event) {
    let error = event.error;

    switch(error.name) {
      case InvalidStateError:
        showNotification("You can't record the audio right " +
                         "now. Try again later.");
        break;
      case SecurityError:
        showNotification("Recording the specified source " +
                         "is not allowed due to security " +
                         "restrictions.");
        break;
      default:
        showNotification("A problem occurred while trying " +
                         "to record the audio.");
        break;
    }
  };
};

function renderRecorder(noise) {
  recorderTitle = document.getElementsByClassName('Recorder-title')[0];
  recorderDescription = document.getElementsByClassName('Recorder-description')[0];
  recorderPreview = document.getElementsByClassName('Recorder-preview')[0];

  recorderTitle.innerText = noise.name;
  recorderDescription.innerText = noise.desc;
  recorderPreview.innerHTML = `
    <source src="${noise.preview}" type="audio/mpeg"/>    
  `;
  recorderPreview.style.display = 'block';
}

function updateFilenamePrefix(prefix) {
  filenamePrefix = prefix;
}

function process(noises) {
  firstNoise = noises[0];
  updateFilenamePrefix(firstNoise.name);
  renderRecorder(firstNoise);
  // TODO: wait until the first interaction to do this?
  navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then(handleSuccess);
}

window
  .fetch('noises')
  .then(
    response => response.json()
  ).then(
    noises => process(noises) // Handle the success response object
  ).catch(
    error => console.log(error) // Handle the error response object
  );
