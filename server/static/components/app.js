import { renderNoiseList } from './list.js';
import {
  renderRecorder,
  renderRecordingControls,
  renderArrows,
} from './recorder.js';

// TODO: simplify and investigate if direct DOM manipulation is needed for any of this UI (e.g., rerendering players or recorders may wipe out local stae)
// TODO: merge with render() functions if possible

function updateSamplePlayer({ url = null, disabled = false }) {
  // hook up player
  const player = document.querySelector('[data-id=player]');

  player.src = url;
  if (disabled) {
    player.setAttribute('disabled', 'disabled');
  } else {
    player.removeAttribute('disabled');
  }
}

function updateDownloadLink({ url = null, filename = null, disabled = false }) {
  // hook up download link
  const downloadLink = document.querySelector('[data-id=download]');

  downloadLink.href = url;
  downloadLink.download = filename;

  if (disabled) {
    downloadLink.classList.add('DownloadLink--disabled');
  } else {
    downloadLink.classList.remove('DownloadLink--disabled');
  }
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
  updateSamplePlayer,
  updateDownloadLink,
  updateRecordButton,
  renderNoiseList,
  renderRecorder,
  renderRecordingControls,
  renderArrows,
};
