import { generateUUID } from './utilities.js';
import {
  renderRecorder,
  renderRecordingControls,
  renderArrows,
} from './components/recorder.js';
import { renderNoiseList } from './components/list.js';
import {
  NEED_PERMISSIONS,
  WAITING,
  RECORDING,
  UPLOADING,
  UPLOADED,
  statuses,
} from './constants.js';

/*
  State
 */

let state = {
  recorder: {
    status: NEED_PERMISSIONS,
    startTime: null,
    elapsed: 0,
    filename: {
      prefix: '',
      sessionID: generateUUID(), // TODO: let server take care of this
      // TODO: use this UUID and put it in local storage
    },
    chunkNumber: 0,
  },
  noiseList: [],
  selectedNoise: -1,
};

/* State management */

function updateFilenamePrefix(prefix) {
  state.recorder.filename.prefix = prefix;
}

function updateNoises(noises) {
  // TODO: rename to initializeNoise?
  state.noiseList = noises.slice();
  state.noiseList = state.noiseList.map(noise =>
    Object.assign({}, noise, {
      status: WAITING, // TODO: this status should technically be different from the recorder status; treat it as such
    }),
  );
}

function selectNoise(index) {
  if (state.selectedNoise !== index) {
    // TODO: or pass actual noise?
    state.selectedNoise = index; // TODO: or assign actual noise?
    const noise = state.noiseList[index];
    state.recorder.status = noise.status === UPLOADED ? UPLOADED : WAITING; // TODO: the latter is a subset of the former
    // TODO: also rerender recorder?
    state.recorder.startTime = null; // TODO: the latter is a subset of the former
    state.recorder.elapsed = 0; // TODO: the latter is a subset of the former

    updateFilenamePrefix(noise.name); // TODO: store in state instead of using global variable
    return true;
  } else {
    return false; // signaling that we did not modify the state
  }
}

function incrementSelectedNoise() {
  if (selectNoise((state.selectedNoise + 1) % state.noiseList.length)) {
    render();
  }
}

function decrementSelectedNoise() {
  if (selectNoise((state.selectedNoise - 1) % state.noiseList.length)) {
    render();
  }
}

/*
  Event handlers
 */

const firstRecordClick = function() {
  console.log(state.recorder.status);
  // TODO: fix this when we separate out recorder status from noise status
  // if (state.recorder.status === NEED_PERMISSIONS) {
    getUserMedia();
  // }
}

function initializeRecord() {
  const recordButton = document.querySelector('[data-id=recordButton]');
  recordButton.addEventListener('click', firstRecordClick);
}

const handleGetUserMediaFailure = function(error) {
  // TODO: change the UI to indicate that nothing can be recorded
  console.log(error);
};
const handleGetUserMediaSuccess = function(stream) {
  const options = { mimeType: 'audio/webm' };
  let mediaRecorder;

  /* state management */
  state.recorder.status = WAITING;
  renderArrows(
    state.recorder.status,
    state.noiseList,
    state.selectedNoise,
    decrementSelectedNoise,
    incrementSelectedNoise,
  );

  let recordedChunks = [];

  try {
    // TODO: set up audio context instead?
    mediaRecorder = new MediaRecorder(stream, options);
  } catch (err) {
    console.log('ERROR:' + err.name);
    return err.name; /* return the error name */
  }

  /* UI */
  const downloadLink = document.querySelector('[data-id=download]');
  const player = document.querySelector('[data-id=player]');
  const recordButton = document.querySelector('[data-id=recordButton]');
  const recordButtonClone = recordButton.cloneNode(true);

  // get rid of original event handler by replacing button element
  // TODO: look into other ways of doing this, including using the original reference to the handler
  recordButton.parentNode.replaceChild(recordButtonClone, recordButton);

  function recordClickHandler() {
    console.log(state.recorder)
    if (state.recorder.status === WAITING) {
      /* state management */
      state.recorder.recordedChunks = [];

      /* UI */
      player.setAttribute('disabled', 'disabled');
      player.src = null;
      downloadLink.classList.add('DownloadLink--disabled');
      downloadLink.href = null;

      try {
        /* I/O */
        // start recording
        mediaRecorder.start(1000); // NOTE: if an argument is not provided, the "dataavailable" event will not fire until the media recorder is stopped
      } catch (e) {
        console.error(e);
        // TODO: reset UI
      }
    } else if (state.recorder.status === RECORDING) {
      /* I/O */
      // stop recording
      mediaRecorder.stop();
    } // TODO: what do we do if it's starting or stopping? disable the interactions?
  }

  recordClickHandler(); // manually trigger first time we've successfully gotten permissions to the mic since the user already clicked the Record button
  recordButtonClone.addEventListener('click', recordClickHandler);

  mediaRecorder.addEventListener('dataavailable', function(e) {
    if (e.data.size > 0) {
      // add this chunk of data to the recorded chunks
      console.log(`Pushing chunk #${++state.recorder.chunkNumber}`);

      /* state management */
      recordedChunks.push(e.data);
      state.recorder.elapsed = Date.now() - state.recorder.startTime;

      /* UI */
      renderRecordingControls(state.recorder);
      renderArrows(
        state.recorder.status,
        state.noiseList,
        state.selectedNoise,
        decrementSelectedNoise,
        incrementSelectedNoise,
      );
    }
  });

  mediaRecorder.addEventListener('start', function() {
    /* state management */
    state.recorder.startTime = Date.now();
    state.recorder.status = RECORDING;

    /* UI */
    renderRecordingControls(state.recorder);
    renderArrows(
      state.recorder.status,
      state.noiseList,
      state.selectedNoise,
      decrementSelectedNoise,
      incrementSelectedNoise,
    );
    // TODO: also render list (with isDisabled, maybe just a boolean instead of function, returning false)?
  });

  mediaRecorder.addEventListener('stop', function() {
    /* state management */
    state.recorder.elapsed = Date.now() - state.recorder.startTime;
    const filename = `${state.recorder.filename.prefix}.${
      state.recorder.filename.sessionID
    }.webm`;
    state.recorder.status = UPLOADING;

    /* UI */
    renderRecordingControls(state.recorder);
    renderArrows(
      state.recorder.status,
      state.noiseList,
      state.selectedNoise,
      decrementSelectedNoise,
      incrementSelectedNoise,
    );
    // TODO: also render list (with isDisabled, maybe just a boolean instead of function, returning false)?

    /* async I/O */
    let blob = new Blob(recordedChunks);
    let file = new File([blob], filename);
    let data = new FormData();
    data.append('noise', file);
    data.append('user', 'you'); // TODO: names in uploads?

    window
      .fetch('/upload', {
        method: 'POST',
        body: data,
      })
      .then(response => console.log(response.statusText))
      .then(success => {
        state.noiseList[state.selectedNoise].status = UPLOADED; // TODO: how to ensure no async probs?
        state.recorder.status = UPLOADED;
        renderApp();
      })
      .catch(
        error => console.log(error), // Handle the error response object
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

    switch (error.name) {
      case InvalidStateError:
        showNotification(
          "You can't record the audio right " + 'now. Try again later.',
        );
        break;
      case SecurityError:
        showNotification(
          'Recording the specified source ' +
            'is not allowed due to security ' +
            'restrictions.',
        );
        break;
      default:
        showNotification(
          'A problem occurred while trying ' + 'to record the audio.',
        );
        break;
    }
  };
};

/* UI */

function render() {
  renderApp();
}

function renderApp() {
  renderNoiseList(
    state.noiseList,
    selectNoise,
    state.selectedNoise,
    statuses,
    render,
    () =>
      state.recorder.status === RECORDING ||
      state.recorder.status === UPLOADING,
  );
  renderRecorder(
    state.noiseList[state.selectedNoise],
    state.recorder,
    state.noiseList,
    state.selectedNoise,
    decrementSelectedNoise,
    incrementSelectedNoise,
  );
}

function processNoises(noises) {
  /* state management */
  updateNoises(noises);
  selectNoise(0); // TODO: or pass actual noise?

  /* UI */
  render();
}

/* async I/O */
function getNoises() {
  window
    .fetch('noises')
    .then(response => response.json())
    .then(
      noises => processNoises(noises), // Handle the success response object
    )
    .catch(
      error => console.log(error), // Handle the error response object
    );
}

// TODO: fallback: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Using_the_new_API_in_older_browsers, https://github.com/webrtc/adapter
function getUserMedia() {
  /* async I/O */
  return navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then(handleGetUserMediaSuccess)
    .catch(handleGetUserMediaFailure);
}

getNoises()
initializeRecord();
