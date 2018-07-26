import { generateUUID, merge, showNotification } from './utilities.js';
import {
  updateSamplePlayer,
  updateDownloadLink,
  updateRecordButton,
  renderNoiseList,
  renderRecorder,
  renderRecordingControls,
  renderArrows,
} from './components/app.js';
import {
  NEED_PERMISSIONS,
  WAITING,
  RECORDING,
  UPLOADING,
  UPLOADED,
  statuses,
} from './constants.js';
import { initializeRecorder } from './record/record.js';

/*
  UI
*/

// TODO: simplify and merge the below code
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
  async I/O (recorder)
*/

// TODO: fallback: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Using_the_new_API_in_older_browsers, https://github.com/webrtc/adapter
function requestMediaPermissions(onSuccess, onFailure) {
  /* async I/O dispatch */
  return navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then(onSuccess)
    .catch(onFailure);
}

/*
  async I/O (network request)
*/

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

function upload(file) {
  let data = new FormData();
  data.append('noise', file);
  data.append('user', 'you'); // TODO: names in uploads?

  return window.fetch('/upload', {
    method: 'POST',
    body: data,
  });
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

function updateState(changes) {
  state = merge(state, changes);
}

function updateFilenamePrefix(prefix) {
  /* state management dispatch */
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

  /* state management dispatch */
  updateState({
    noiseList: updatedNoiseList,
  });
}

function selectNoise(index) {
  // TODO: or pass actual noise?

  if (state.selectedNoise !== index) {
    const noise = state.noiseList[index];
    /* state management dispatch */
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

const onFirstRecordClick = function() {
  // TODO: fix this when we separate out recorder status from noise status
  // if (state.recorder.status === NEED_PERMISSIONS) {
  requestMediaPermissions(
    handleRequestMediaPermissionsSuccess,
    handleRequestMediaPermissionsFailure,
  );
  // }
};

const handleRequestMediaPermissionsFailure = function(error) {
  // TODO: change the UI to indicate that nothing can be recorded
  console.log(error);
};

const handleRequestMediaPermissionsSuccess = function(stream) {
  /* state management dispatch */
  updateState({
    recorder: {
      ...state.recorder,
      status: WAITING,
    },
  });

  /* UI dispatch */
  renderRecorderAndArrows();

  // TODO: set up audio context instead?
  let { startRecorder, stopRecorder } = initializeRecorder({
    stream,
    onRecordStart,
    onDataAvailable,
    onRecordStop,
    onRecordError,
  });

  onRecordClick(); // manually trigger first time we've successfully gotten permissions to the mic since the user already clicked the Record button

  /* UI dispatch */
  // TODO: move into UI component?
  updateRecordButton(onRecordClick);

  function onRecordClick() {
    if (state.recorder.status === WAITING) {
      /* state management dispatch */
      updateState({
        recorder: {
          ...state.recorder,
          chunks: [],
        },
      });

      /* UI dispatch */
      // TODO: move into UI component?
      updateSamplePlayer({ disabled: true });
      updateDownloadLink({ disabled: true });

      /* I/O dispatch */
      startRecorder();
    } else if (state.recorder.status === RECORDING) {
      stopRecorder();
    } // TODO: what do we do if it's starting or stopping? disable the interactions?
  }

  function onRecordStart() {
    console.log(`Recording started...`);

    /* state management dispatch */
    updateState({
      recorder: {
        ...state.recorder,
        startTime: Date.now(),
        status: RECORDING,
      },
    });

    /* UI dispatch */
    // TODO: move into UI component?
    renderRecorderAndArrows();
    // TODO: also render list (with isDisabled, maybe just a boolean instead of function, returning false)?
  }

  function onDataAvailable(e) {
    if (e.data.size > 0) {
      // add this chunk of data to the recorded chunks
      console.log(`Pushing chunk #${++state.recorder.chunkNumber}`);

      /* state management dispatch */
      updateState({
        recorder: {
          ...state.recorder,
          chunks: [...state.recorder.chunks, e.data],
          elapsed: Date.now() - state.recorder.startTime,
        },
      });

      /* UI dispatch */
      // TODO: move into UI component?
      renderRecorderAndArrows();
    }
  }

  function onRecordStop() {
    console.log(`Recording stopped...`);

    /* state management dispatch */
    updateState({
      recorder: {
        ...state.recorder,
        elapsed: Date.now() - state.recorder.startTime,
        status: UPLOADING,
      },
    });

    /* UI dispatch */
    // TODO: move into UI component?
    renderRecorderAndArrows();
    // TODO: also render list (with isDisabled, maybe just a boolean instead of function, returning false)?

    // generate filename from session ID and create blob out of chunks for:
    // 1) display download link on screen (currently hidden functionality)
    // 2) uploading to server
    const filename = `${state.recorder.filename.prefix}.${
      state.recorder.filename.sessionID
    }.webm`;
    let blob = new Blob(state.recorder.chunks);

    /* UI dispatch */
    let url = URL.createObjectURL(blob);

    updateDownloadLink({
      url,
      filename, // from state
    });

    updateSamplePlayer({
      url,
    });

    /*
     async I/O (network request)
    */

    let file = new File([blob], filename);

    upload(file)
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

        // TODO: move into UI component?
        renderApp();
      })
      .catch(
        error => console.log(error), // Handle the error response object
      );
  }

  function onRecordError(event) {
    console.log(`Recorder encountered error...`);

    let error = event.error;

    // TODO: move into UI component?
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
  }
};

function render() {
  renderApp();
}

function processNoises(noises) {
  /* state management dispatch */
  updateNoises(noises);
  selectNoise(0); // TODO: or pass actual noise?

  /* UI dispatch */
  render();
}

getNoises();
updateRecordButton(onFirstRecordClick);
