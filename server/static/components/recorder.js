import {
  WAITING,
  RECORDING,
  UPLOADING,
  UPLOADED,
  statuses,
} from '../constants.js';

function renderRecorder(
  noise,
  recorderState, // TODO: divorce state shape of recorder
  noiseList,
  selectedNoise,
  onLeftArrowClick,
  onRightArrowClick,
) {
  const recorder = document.querySelector('[data-id=recorder]');
  const recorderTitle = recorder.querySelector('[data-id=title]');
  const recorderDescription = recorder.querySelector('[data-id=description');
  const recorderPreview = recorder.querySelector('[data-id=preview');

  recorderTitle.innerText = noise.name;
  recorderDescription.innerText = noise.desc;
  recorderPreview.innerHTML = `
    <source src="${noise.preview}" type="audio/mpeg"/>    
  `;
  recorderPreview.load();
  recorderPreview.style.display = 'block';

  renderRecordingControls(recorderState);
  renderArrows(
    recorderState.status,
    noiseList,
    selectedNoise,
    onLeftArrowClick,
    onRightArrowClick,
  );
}

function renderRecordingControls(recorderState) {
  renderTime(recorderState.elapsed);
  renderButton(recorderState.status);
  renderStatus(recorderState.status);
}

function renderTime(time) {
  /* UI */
  const recorderTime = document.querySelector('[data-id=recorderTime]');

  const timeInS = time / 1000;
  const minutes = ('' + Math.floor(timeInS / 60)).padStart(2, '0');
  const seconds = ('' + Math.floor(timeInS % 60)).padStart(2, '0');
  recorderTime.innerText = `${minutes}:${seconds}`;
}

function renderStatus(status) {
  // TODO: add statuses as argument?
  /* UI */
  const recorderStatus = document.querySelector('[data-id=recorderStatus]');

  recorderStatus.innerText = `${statuses[status].description}`;
}

function renderArrows(
  status,
  noiseList,
  selectedNoise,
  onLeftArrowClick,
  onRightArrowClick,
) {
  /* UI */
  // TODO: consider passing in an array that represents what kind of arrows to draw instead
  const goBack = document.querySelector('[data-id=goBack]');
  const goForward = document.querySelector('[data-id=goForward]');

  if (status !== WAITING && status !== UPLOADED) {
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

function renderButton(status) {
  /* UI */
  const recordButton = document.querySelector('[data-id=recordButton]');

  let actions = {
    [WAITING]: () => (
      recordButton.classList.remove('Recorder-recordButton--recording'),
      recordButton.classList.remove('Recorder-recordButton--disabled'),
      (recordButton.disabled = false)
    ),
    [RECORDING]: () => (
      recordButton.classList.add('Recorder-recordButton--recording'),
      recordButton.classList.remove('Recorder-recordButton--disabled'),
      (recordButton.disabled = false)
    ),
    [UPLOADING]: () => (
      recordButton.classList.remove('Recorder-recordButton--recording'),
      recordButton.classList.add('Recorder-recordButton--disabled'),
      (recordButton.disabled = true)
    ),
    [UPLOADED]: () => (
      recordButton.classList.remove('Recorder-recordButton--recording'),
      recordButton.classList.add('Recorder-recordButton--disabled'),
      (recordButton.disabled = true)
    ),
  };

  actions[status]();
}

export {
  renderTime,
  renderStatus,
  renderRecorder,
  renderRecordingControls,
  renderArrows,
};
