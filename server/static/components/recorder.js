import {
  WAITING,
  RECORDING,
  UPLOADING,
  UPLOADED,
  statuses,
} from '../constants.js';

function renderRecorder(noise, recorderState) {
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

export { renderTime, renderStatus, renderRecorder, renderRecordingControls };
