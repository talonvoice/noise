/*
  TODOS:
  - [x] load data
  - [ ] allow user to select mic
  - [ ] fallback to <input>
  - [ ] refactor
  - [x] update UI when done recording, and uploading
  - [ ] allow user to review and submit
  - [x] load noise info from data json
*/


/*
  State
 */

const WAITING = 0;
const RECORDING = 1;
const UPLOADING = 2;
const UPLOADED = 3;

let state = {
  status: WAITING,
  noiseList: [],
  selectedNoise: -1,
};

let stopped = false;
let startTime;
let elapsed = 0;
let filenamePrefix = '';
let filenameSessionID = generateUUID(); // TODO: let server take care of this
// TODO: use this UUID and put it in local storage
let chunkNumber = 0;

/*
  UI
 */

let statuses = [
  { description: 'Waiting to record' },
  { description: 'Recording' },
  { description: 'Recorded and uploading' },
  { description: 'Recorded and uploaded' },
]

function renderTime(time) {
  /* UI */
  const recorderTime = document.querySelector('[data-id=recorderTime]');

  const timeInS = time / 1000;
  const minutes = ('' + Math.floor(timeInS / 60)).padStart(2, '0');
  const seconds = ('' + Math.floor(timeInS % 60)).padStart(2, '0');
  recorderTime.innerText = `${minutes}:${seconds}`;
}

function renderStatus(status) {
  /* UI */
  const recorderStatus = document.querySelector('[data-id=recorderStatus]');

  recorderStatus.innerText = `${statuses[status].description}`;
}


/*
  Utilities
 */

 // copypasta from https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function generateUUID() { // Public Domain/MIT
  let d = new Date().getTime();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
    d += performance.now(); //use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}


/*
  Event handlers
 */

const handleSuccess = function(stream) {
  const options = {mimeType: 'audio/webm'};
  let mediaRecorder;
  
  /* state management */
  state.status = WAITING;
  let recordedChunks = [];

  try {
    mediaRecorder = new MediaRecorder(stream, options);
  } catch(err) {
    console.log('ERROR:' + err.name);
    return err.name;     /* return the error name */
  }

  /* UI */
  const downloadLink = document.querySelector('[data-id=download]');
  const player = document.querySelector('[data-id=player]');
  const recordButton = document.querySelector('[data-id=recordButton]');

  recordButton.addEventListener('click', function() {
    if (state.status === WAITING) {
      /* state management */
      recordedChunks = [];

      /* UI */
      player.setAttribute('disabled', 'disabled');
      player.src = null;
      downloadLink.classList.add('DownloadLink--disabled')
      downloadLink.href = null;

      try {
        /* I/O */
        mediaRecorder.start(1000); // NOTE: if an argument is not provided, the "dataavailable" event will not fire until the media recorder is stopped
      } catch (e) {
        console.error(e);
        // TODO: reset UI
      }
    } else if (state.status === RECORDING) {
      /* I/O */
      mediaRecorder.stop();
    } // TODO: what do we do if it's starting or stopping? disable the interactions?
  })

  mediaRecorder.addEventListener('dataavailable', function(e) {
    if (e.data.size > 0) {
      // add this chunk of data to the recorded chunks
      console.log(`Pushing chunk #${++chunkNumber}`);
      
      /* state management */
      elapsed = Date.now() - startTime;
      /* UI */
      renderTime(elapsed);
      
      /* state management */
      recordedChunks.push(e.data);
    }
  });

  mediaRecorder.addEventListener('start', function() {
    /* state management */
    startTime = Date.now();
    
    /* UI */    
    recordButton.classList.add('Recorder-recordButton--recording');

    /* state management */
    state.status = RECORDING;

    /* UI */    
    renderStatus(state.status); 
  });
  
  mediaRecorder.addEventListener('stop', function() {
    /* state management */
    elapsed = Date.now() - startTime;
    
    /* UI */
    renderTime(elapsed);
    recordButton.classList.remove('Recorder-recordButton--recording');
    
    /* state management */
    const filename = `${filenamePrefix}.${filenameSessionID}.webm`;
    state.status = UPLOADING;
    /* UI */    
    renderStatus(state.status);

    /* async I/O */
    let blob = new Blob(recordedChunks);
    let file = new File([blob], filename);
    let data = new FormData();
    data.append('noise', file);
    data.append('user', 'you'); // TODO: names in uploads?
    
    window.fetch('/upload', {
      method: 'POST',
      body: data,
    }).then(
      response => console.log(response.statusText)
    ).then(
      success => {
        state.status = UPLOADED;
        renderStatus(state.status);
      }).catch(
      error => console.log(error) // Handle the error response object
    );
    
    /* UI */    

    // hook up download link    
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = filename; /* from state */
    downloadLink.classList.remove('DownloadLink--disabled');

    // hook up player
    player.src = downloadLink.href;
    player.removeAttribute('disabled');
  });

  mediaRecorder.onerror = function(event) {
    let error = event.error;

    /* TODO: define showNotification() */
    
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

/* UI */
function renderRecorder(noise) {
  const recorder = document.querySelector('[data-id=recorder]');
  const recorderTitle = recorder.querySelector('[data-id=title]');
  const recorderDescription = recorder.querySelector('[data-id=description');
  const recorderPreview = recorder.querySelector('[data-id=preview');

  recorderTitle.innerText = noise.name;
  recorderDescription.innerText = noise.desc;
  recorderPreview.innerHTML = `
    <source src="${noise.preview}" type="audio/mpeg"/>    
  `;
  recorderPreview.style.display = 'block';
}

/* state management */
function updateFilenamePrefix(prefix) {
  filenamePrefix = prefix;
}

/* state management */
function updateNoises(noises) {
  // TODO: rename to initializeNoise?
  state.noiseList = noises.slice();
  state.noiseList = state.noiseList.map(noise => Object.assign({}, noise, {
    status: WAITING
  }));
}

/* state management */
function selectNoise(index) { // TODO: or pass actual noise?
  state.selectedNoise = index; // TODO: or assign actual noise?
  const noise = state.noiseList[index];
  updateFilenamePrefix(noise.name); // TODO: store in state instead of using global variable
}

/* UI */
const noiseTemplate = ({
  selected,
  number,
  description,
  instructions,
  status,
}) => `
  <li class="RecordingList-item">
    <a class="Recording${selected ? ` Recording--selected` : ``}" data-id="list-item-${number}">
      <ul class="Recording-container">
        <li class="Recording-item Recording-name" data-id="list-item-${number}-name">${name}</li>
        <li class="Recording-item Recording-description" data-id="list-item-${number}-description">${description}</li>
        <li class="Recording-item Recording-instructions" data-id="list-item-${number}-instructions">${instructions}</li>
        <li class="Recording-item Recording-status" data-id="list-item-${number}-status">${status}</li>
      </ul>
    </a>
  </li>
`;

function renderNoiseList(noiseList) {
  // TODO: put our DOM references in a singular location?
  const list = document.querySelector('[data-id=list]');
  const container = document.querySelector('[data-id=list-container]');

  container.innerHTML = '';
  noiseList.forEach((noise, index) => {
    // TODO: add selected value to each noise instead of relying on state.selectedNoise
    const noiseHtml = noiseTemplate({ selected: index === state.selectedNoise, number: index + 1, name: noise.name, description: noise.desc, instructions: '', status: statuses[noise.status].description });
    container.insertAdjacentHTML('beforeend', noiseHtml);
    const item = list.querySelector(`[data-id=list-item-${index + 1}]`);
    item.addEventListener('click', (evt) => {
      selectNoise(index);
      render();
    });
  });
}

/* UI */
function render() {
  renderNoiseList(state.noiseList);
  renderRecorder(state.noiseList[state.selectedNoise]);
}

function processNoises(noises) {
  /* state management */
  updateNoises(noises);
  selectNoise(0); // TODO: or pass actual noise?

  /* UI */
  render();

  // TODO: wait until the first interaction to do this?
  /* async I/O */
  navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then(handleSuccess);
}

/* async I/O */
window
  .fetch('noises')
  .then(
    response => response.json()
  ).then(
    noises => processNoises(noises) // Handle the success response object
  ).catch(
    error => console.log(error) // Handle the error response object
  );
