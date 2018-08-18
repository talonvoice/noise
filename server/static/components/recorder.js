function renderRecorder({
  noise,
  recorderState, // TODO: divorce state shape of recorder
  recording,
  disabled,
  arrowsDisabled,
  noiseList,
  selectedNoise,
  onButtonClick,
  onLeftArrowClick,
  onRightArrowClick,
}) {
  const recorder = document.querySelector('[data-id=recorder]');
  const recorderTitle = recorder.querySelector('[data-id=title]');
  const recorderDescription = recorder.querySelector('[data-id=description');
  const recorderPreview = recorder.querySelector('[data-id=preview');
  const recorderPreviewLabel = recorder.querySelector('[data-id=preview-label');

  recorderTitle.innerText = noise.name;
  recorderDescription.innerText = noise.desc;
  recorderPreviewLabel.innerHTML = `${noise.preview.title}:`;
  recorderPreview.innerHTML = `
    <source src="${noise.preview.path}" type="audio/mpeg"/>
  `;
  recorderPreview.load();
  recorderPreview.style.display = 'block';

  renderRecordingControls({
    recorderState,
    recording,
    disabled,
    onButtonClick,
  });
  renderArrows(
    arrowsDisabled,
    noiseList,
    selectedNoise,
    onLeftArrowClick,
    onRightArrowClick,
  );
}

function renderRecordingControls({
  recorderState,
  recording,
  disabled,
  onButtonClick,
}) {
  renderTime({
    time: recorderState.elapsed,
    disabled,
  });
  renderButton({ recording, disabled, onButtonClick });
  renderStatus({ status: recorderState.status.description, disabled });
}

function renderTime({ time = 0, disabled = false }) {
  /* UI */
  const recorderTime = document.querySelector('[data-id=recorderTime]');

  if (!disabled) {
    // TODO: put this code in utilities as a formatter
    const timeInS = time / 1000;
    const minutes = ('' + Math.floor(timeInS / 60)).padStart(2, '0');
    const seconds = ('' + Math.floor(timeInS % 60)).padStart(2, '0');
    recorderTime.innerText = `${minutes}:${seconds}`;
    recorderTime.classList.remove('Recorder-time--disabled');
  } else {
    recorderTime.innerText = `--:--`;
    recorderTime.classList.add('Recorder-time--disabled');
  }
}

function renderStatus({ status = '', disabled = false }) {
  const recorderStatus = document.querySelector('[data-id=recorderStatus]');

  recorderStatus.innerText = `${status}`;
  if (!disabled) {
    recorderStatus.classList.remove('Recorder-status--disabled');
  } else {
    recorderStatus.classList.add('Recorder-status--disabled');
  }
}

// TODO: move this out to its own file (since it is not technically part of the recorder)
function renderArrows(
  disabled,
  noiseList,
  selectedNoise,
  onLeftArrowClick,
  onRightArrowClick,
) {
  /* UI */
  // TODO: consider passing in an array that represents what kind of arrows to draw instead
  const goBack = document.querySelector('[data-id=goBack]');
  const goForward = document.querySelector('[data-id=goForward]');

  if (disabled) {
    goBack.classList.add('Arrow--disabled');
    goForward.classList.add('Arrow--disabled');
    goBack.removeEventListener('click', onLeftArrowClick);
    goForward.removeEventListener('click', onRightArrowClick);
  } else {
    if (selectedNoise > 0) {
      goBack.classList.remove('Arrow--disabled');
      goBack.addEventListener('click', onLeftArrowClick);
    } else {
      goBack.classList.add('Arrow--disabled');
      goBack.removeEventListener('click', onLeftArrowClick);
    }
    if (selectedNoise < noiseList.length - 1) {
      goForward.classList.remove('Arrow--disabled');
      goForward.addEventListener('click', onRightArrowClick);
    } else {
      goForward.classList.add('Arrow--disabled');
      goForward.removeEventListener('click', onRightArrowClick);
    }
  }
}

function renderButton({
  recording = false,
  disabled = false,
  onButtonClick = () => {},
}) {
  /* UI */

  // get rid of original event handler by replacing button element
  // TODO: look into other ways of doing this, including using the original reference to the handler
  const recordButton = document.querySelector('[data-id=recordButton]');
  const recordButtonClone = recordButton.cloneNode(true);

  if (disabled) {
    recordButtonClone.classList.add('Recorder-recordButton--disabled');
  } else {
    recordButtonClone.classList.remove('Recorder-recordButton--disabled');
    recordButtonClone.addEventListener('click', onButtonClick);
  }
  recordButtonClone.disabled = disabled;

  if (recording) {
    recordButtonClone.classList.add('Recorder-recordButton--recording');
  } else {
    recordButtonClone.classList.remove('Recorder-recordButton--recording');
  }

  recordButton.parentNode.replaceChild(recordButtonClone, recordButton);
}

export {
  renderTime,
  renderButton,
  renderStatus,
  renderRecorder,
  renderRecordingControls,
  renderArrows,
};
