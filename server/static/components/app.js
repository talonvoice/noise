import { renderNoiseList } from './list.js';
import {
  renderRecorder,
  renderRecordingControls,
  renderArrows,
} from './recorder.js';

// TODO: simplify and investigate if direct DOM manipulation is needed for any of this UI (e.g., rerendering players or recorders may wipe out local stae)
// TODO: merge enable/disable fns
function disableSamplePlayer() {
  const player = document.querySelector('[data-id=player]');
  player.setAttribute('disabled', 'disabled');
  player.src = null;
}

function enableSamplePlayer({ url }) {
  // hook up player
  const player = document.querySelector('[data-id=player]');

  player.src = url;
  player.removeAttribute('disabled');
}

function disableDownloadLink() {
  const downloadLink = document.querySelector('[data-id=download]');
  downloadLink.classList.add('DownloadLink--disabled');
  downloadLink.href = null;
}

function enableDownloadLink({ url, filename }) {
  // hook up download link
  const downloadLink = document.querySelector('[data-id=download]');

  downloadLink.href = url;
  downloadLink.download = filename;
  downloadLink.classList.remove('DownloadLink--disabled');
}

// TODO: merge with renderRecorder()
function updateRecordButton(onRecordClick) {
  const recordButton = document.querySelector('[data-id=recordButton]');
  const recordButtonClone = recordButton.cloneNode(true);

  // get rid of original event handler by replacing button element
  // TODO: look into other ways of doing this, including using the original reference to the handler
  recordButton.parentNode.replaceChild(recordButtonClone, recordButton);
  recordButtonClone.addEventListener('click', onRecordClick);
}

export {
  disableSamplePlayer,
  enableSamplePlayer,
  disableDownloadLink,
  enableDownloadLink,
  updateRecordButton,
  renderNoiseList,
  renderRecorder,
  renderRecordingControls,
  renderArrows,
};
