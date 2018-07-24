import { generateUUID, merge } from './utilities.js';
import {
  renderRecorder,
  renderRecordingControls,
  renderArrows,
} from './components/recorder.js';
import {
  disableSamplePlayer,
  enableSamplePlayer,
  disableDownloadLink,
  enableDownloadLink,
  initializeRecord,
  updateRecordButton,
} from './components/app.js';
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
  UI
*/

function renderRecorderAndArrows() {
  renderRecordingControls(state.recorder);
  renderArrows(
    state.recorder.status,
    state.noiseList,
    state.selectedNoise,
    decrementSelectedNoise,
    incrementSelectedNoise,
  );
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
    chunks: [],
  },
  noiseList: [],
  selectedNoise: -1,
};

/* State management */

function updateState(changes) {
  state = merge(state, changes);
}

function updateFilenamePrefix(prefix) {
  /* state management */
  updateState({
    recorder: {
      ...state.recorder,
      filename: {
        ...state.recorder.filename,
        prefix: prefix,
      },
    },
  });
}

function updateNoises(noises) {
  // TODO: rename to initializeNoise?
  let updatedNoiseList = noises.map(noise => ({
    ...noise,
    status: WAITING, // TODO: this status should technically be different from the recorder status; treat it as such
  }));

  /* state management */
  updateState({
    noiseList: updatedNoiseList,
  });
}

function selectNoise(index) {
  // TODO: or pass actual noise?

  if (state.selectedNoise !== index) {
    const noise = state.noiseList[index];
    /* state management */
    updateState({
      selectedNoise: index, // TODO: or assign actual noise?
      recorder: {
        ...state.recorder,
        status: noise.status === UPLOADED ? UPLOADED : WAITING, // TODO: the latter is a subset of the former
        startTime: null,
        elapsed: 0,
      },
    });

    updateFilenamePrefix(noise.name); // TODO: store in state instead of using global variable

    // TODO: also rerender recorder?
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
};

const handleGetUserMediaFailure = function(error) {
  // TODO: change the UI to indicate that nothing can be recorded
  console.log(error);
};
const handleGetUserMediaSuccess = function(stream) {
  const options = { mimeType: 'audio/webm' };
  let mediaRecorder;

  /* state management */
  updateState({
    recorder: {
      ...state.recorder,
      status: WAITING,
    },
  });

  renderArrows(
    state.recorder.status,
    state.noiseList,
    state.selectedNoise,
    decrementSelectedNoise,
    incrementSelectedNoise,
  );

  try {
    // TODO: set up audio context instead?
    mediaRecorder = new MediaRecorder(stream, options);
  } catch (err) {
    console.log('ERROR:' + err.name);
    return err.name; /* return the error name */
  }

  function recordClickHandler() {
    console.log(state.recorder);
    if (state.recorder.status === WAITING) {
      /* state management */
      updateState({
        recorder: {
          ...state.recorder,
          chunks: [],
        },
      });

      /* UI */
      disableSamplePlayer();
      disableDownloadLink();

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

  /* UI */
  updateRecordButton(recordClickHandler);

  mediaRecorder.addEventListener('dataavailable', function(e) {
    if (e.data.size > 0) {
      // add this chunk of data to the recorded chunks
      console.log(`Pushing chunk #${++state.recorder.chunkNumber}`);

      /* state management */
      updateState({
        recorder: {
          ...state.recorder,
          chunks: [...state.recorder.chunks, e.data],
          elapsed: Date.now() - state.recorder.startTime,
        },
      });

      /* UI */
      renderRecorderAndArrows();
    }
  });

  mediaRecorder.addEventListener('start', function() {
    /* state management */
    updateState({
      recorder: {
        ...state.recorder,
        startTime: Date.now(),
        status: RECORDING,
      },
    });

    /* UI */
    renderRecorderAndArrows();
    // TODO: also render list (with isDisabled, maybe just a boolean instead of function, returning false)?
  });

  mediaRecorder.addEventListener('stop', function() {
    /* state management */
    updateState({
      recorder: {
        ...state.recorder,
        elapsed: Date.now() - state.recorder.startTime,
        status: UPLOADING,
      },
    });

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
    const filename = `${state.recorder.filename.prefix}.${
      state.recorder.filename.sessionID
    }.webm`;
    let blob = new Blob(state.recorder.chunks);
    let file = new File([blob], filename);
    let data = new FormData();
    data.append('noise', file);
    data.append('user', 'you'); // TODO: names in uploads?

    let url = URL.createObjectURL(blob);

    enableDownloadLink({
      url,
      filename /* from state */,
    });

    enableSamplePlayer({
      url,
    });

    window
      .fetch('/upload', {
        method: 'POST',
        body: data,
      })
      .then(response => console.log(response.statusText))
      .then(success => {
        let updatedNoiseList = [...state.noiseList];
        updatedNoiseList[state.selectedNoise].status = UPLOADED; // TODO: how to ensure no async probs?

        updateState({
          noiseList: updatedNoiseList,
          recorder: {
            ...state.recorder,
            status: UPLOADED,
          },
        });

        renderApp();
      })
      .catch(
        error => console.log(error), // Handle the error response object
      );
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

getNoises();
initializeRecord(firstRecordClick);
